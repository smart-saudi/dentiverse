import type { Database } from '@/lib/database.types';
import type { AppSupabaseClient } from '@/lib/supabase/types';
import type {
  CreateDesignVersionInput,
  ReviewDesignVersionInput,
  DesignVersionListQuery,
} from '@/lib/validations/design-version';
import { NotFoundError } from '@/lib/errors';

type Client = AppSupabaseClient;
type DesignVersionRow = Database['public']['Tables']['design_versions']['Row'];

interface StoredDesignVersionFile {
  bucket: string;
  path: string;
  name: string;
  size: number;
  type: string;
}

interface ResolvedDesignVersionFile extends StoredDesignVersionFile {
  expires_at: string | null;
  url: string;
}

export interface DesignVersionListItem extends Omit<DesignVersionRow, 'file_urls'> {
  file_urls: string[];
  files: ResolvedDesignVersionFile[];
}

/**
 * Check whether a JSON value matches the stored file reference shape.
 *
 * @param value - Unknown JSON value
 * @returns Whether the value is a stored design-version file reference
 */
function isStoredDesignVersionFile(value: unknown): value is StoredDesignVersionFile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'bucket' in value &&
    typeof value.bucket === 'string' &&
    'path' in value &&
    typeof value.path === 'string' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'size' in value &&
    typeof value.size === 'number' &&
    'type' in value &&
    typeof value.type === 'string'
  );
}

/**
 * Extract a readable filename from a storage path.
 *
 * @param path - Storage path
 * @returns The decoded filename
 */
function getFileNameFromPath(path: string): string {
  const segments = path.split('/');
  return decodeURIComponent(segments[segments.length - 1] ?? path);
}

/**
 * Extract a readable filename from a URL.
 *
 * @param url - File URL
 * @returns The decoded filename
 */
function getFileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return getFileNameFromPath(pathname);
  } catch {
    return url;
  }
}

/**
 * Service for design version operations (submit, review, list).
 */
export class DesignVersionService {
  /**
   * Create a new design version submission.
   *
   * @param client - Supabase client
   * @param caseId - Case ID
   * @param designerId - Designer's user ID
   * @param versionNumber - Sequential version number
   * @param input - Version data (files, notes)
   * @returns The created design version
   */
  async createVersion(
    client: Client,
    caseId: string,
    designerId: string,
    versionNumber: number,
    input: CreateDesignVersionInput,
  ): Promise<DesignVersionRow> {
    const { data, error } = await client
      .from('design_versions')
      .insert({
        case_id: caseId,
        designer_id: designerId,
        version_number: versionNumber,
        file_urls: input.files,
        thumbnail_url: input.thumbnail_url ?? null,
        preview_model_url: input.preview_model_url ?? null,
        notes: input.notes ?? null,
        status: 'SUBMITTED',
      })
      .select()
      .single();

    if (error || !data)
      throw new Error(error?.message ?? 'Failed to create design version');
    return data;
  }

  /**
   * Fetch a design version by ID.
   *
   * @param client - Supabase client
   * @param versionId - Design version ID
   * @returns The design version row
   * @throws NotFoundError if not found
   */
  async getVersion(client: Client, versionId: string): Promise<DesignVersionRow> {
    const { data, error } = await client
      .from('design_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (error || !data) throw new NotFoundError('Design version not found');
    return data;
  }

  /**
   * List design versions for a case, ordered by version number descending.
   *
   * @param client - Supabase client
   * @param caseId - Case ID
   * @param query - Pagination params
   * @returns Paginated list of design versions
   */
  async listVersionsForCase(
    client: Client,
    caseId: string,
    query: DesignVersionListQuery,
  ): Promise<{
    data: DesignVersionRow[];
    meta: { page: number; per_page: number; total: number; total_pages: number };
  }> {
    const offset = (query.page - 1) * query.per_page;

    const { data, error, count } = await client
      .from('design_versions')
      .select('*', { count: 'exact' })
      .eq('case_id', caseId)
      .order('version_number', { ascending: false })
      .range(offset, offset + query.per_page - 1);

    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return {
      data: data ?? [],
      meta: {
        page: query.page,
        per_page: query.per_page,
        total,
        total_pages: Math.ceil(total / query.per_page),
      },
    };
  }

  /**
   * Resolve stored file references into fresh signed URLs for API responses.
   *
   * Supports both the new stored `{ bucket, path, ... }` format and legacy rows
   * that still contain raw URLs.
   *
   * @param client - Supabase client
   * @param version - Stored design version row
   * @param expiresIn - Signed URL lifetime in seconds
   * @returns Design version response with resolved file URLs
   */
  async resolveVersionFiles(
    client: Client,
    version: DesignVersionRow,
    expiresIn = 3600,
  ): Promise<DesignVersionListItem> {
    const rawFiles = Array.isArray(version.file_urls) ? version.file_urls : [];

    const files = await Promise.all(
      rawFiles.map(async (rawFile) => {
        if (typeof rawFile === 'string') {
          return {
            bucket: 'legacy',
            path: rawFile,
            name: getFileNameFromUrl(rawFile),
            size: 0,
            type: 'application/octet-stream',
            expires_at: null,
            url: rawFile,
          } satisfies ResolvedDesignVersionFile;
        }

        if (!isStoredDesignVersionFile(rawFile)) {
          return null;
        }

        const { data, error } = await client.storage
          .from(rawFile.bucket)
          .createSignedUrl(rawFile.path, expiresIn);

        if (error || !data?.signedUrl) {
          return null;
        }

        return {
          bucket: rawFile.bucket,
          path: rawFile.path,
          name: rawFile.name || getFileNameFromPath(rawFile.path),
          size: rawFile.size,
          type: rawFile.type,
          expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
          url: data.signedUrl,
        } satisfies ResolvedDesignVersionFile;
      }),
    );

    const resolvedFiles = files.filter(
      (file: ResolvedDesignVersionFile | null): file is ResolvedDesignVersionFile =>
        file !== null,
    );

    return {
      ...version,
      file_urls: resolvedFiles.map((file) => file.url),
      files: resolvedFiles,
    };
  }

  /**
   * Review a design version (approve or request revision).
   *
   * @param client - Supabase client
   * @param versionId - Design version ID
   * @param input - Review status and optional feedback
   * @returns The updated design version
   */
  async reviewVersion(
    client: Client,
    versionId: string,
    input: ReviewDesignVersionInput,
  ): Promise<DesignVersionRow> {
    const { data, error } = await client
      .from('design_versions')
      .update({
        status: input.status,
        revision_feedback: input.revision_feedback ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', versionId)
      .select()
      .single();

    if (error || !data)
      throw new Error(error?.message ?? 'Failed to review design version');
    return data;
  }

  /**
   * Get the latest design version for a case.
   *
   * @param client - Supabase client
   * @param caseId - Case ID
   * @returns The latest design version or null
   */
  async getLatestVersion(
    client: Client,
    caseId: string,
  ): Promise<DesignVersionRow | null> {
    const { data, error } = await client
      .from('design_versions')
      .select('*')
      .eq('case_id', caseId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data;
  }
}
