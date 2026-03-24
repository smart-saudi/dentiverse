import { describe, expect, it, vi, beforeEach } from 'vitest';

import type { AppSupabaseClient } from '@/lib/supabase/types';
import { DesignVersionService } from '@/services/design-version.service';

interface MockSupabaseClient {
  from: ReturnType<typeof vi.fn>;
  storage: {
    from: ReturnType<typeof vi.fn>;
  };
}

function createMockClient(): MockSupabaseClient {
  return {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  };
}

describe('DesignVersionService', () => {
  let service: DesignVersionService;

  beforeEach(() => {
    service = new DesignVersionService();
  });

  describe('createVersion', () => {
    it('should create a design version with SUBMITTED status', async () => {
      const input = {
        files: [
          {
            bucket: 'design-files',
            path: 'u-1/file.stl',
            name: 'file.stl',
            size: 2048,
            type: 'model/stl',
          },
        ],
        notes: 'First version',
      };
      const mockVersion = {
        id: 'dv-1',
        case_id: 'c-1',
        designer_id: 'u-1',
        version_number: 1,
        status: 'SUBMITTED',
        ...input,
      };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockVersion, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      client.from.mockReturnValue({ insert });

      const result = await service.createVersion(
        client as unknown as AppSupabaseClient,
        'c-1',
        'u-1',
        1,
        input,
      );
      expect(result.status).toBe('SUBMITTED');
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          case_id: 'c-1',
          version_number: 1,
          status: 'SUBMITTED',
        }),
      );
    });
  });

  describe('getVersion', () => {
    it('should fetch a design version by ID', async () => {
      const mockVersion = { id: 'dv-1', version_number: 1, status: 'SUBMITTED' };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockVersion, error: null });
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      const result = await service.getVersion(
        client as unknown as AppSupabaseClient,
        'dv-1',
      );
      expect(result).toEqual(mockVersion);
    });
  });

  describe('listVersionsForCase', () => {
    it('should return versions ordered by version_number desc', async () => {
      const mockData = [
        { id: 'dv-2', version_number: 2 },
        { id: 'dv-1', version_number: 1 },
      ];
      const client = createMockClient();
      const range = vi.fn().mockResolvedValue({ data: mockData, error: null, count: 2 });
      const order = vi.fn().mockReturnValue({ range });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      const result = await service.listVersionsForCase(
        client as unknown as AppSupabaseClient,
        'c-1',
        {
          page: 1,
          per_page: 20,
        },
      );
      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('reviewVersion', () => {
    it('should approve a design version', async () => {
      const mockVersion = { id: 'dv-1', status: 'APPROVED' };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockVersion, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ update });

      const result = await service.reviewVersion(
        client as unknown as AppSupabaseClient,
        'dv-1',
        {
          status: 'APPROVED',
        },
      );
      expect(result.status).toBe('APPROVED');
    });

    it('should request revision with feedback', async () => {
      const mockVersion = {
        id: 'dv-1',
        status: 'REVISION_REQUESTED',
        revision_feedback: 'Fix contacts',
      };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockVersion, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ update });

      const result = await service.reviewVersion(
        client as unknown as AppSupabaseClient,
        'dv-1',
        {
          status: 'REVISION_REQUESTED',
          revision_feedback: 'Fix contacts',
        },
      );
      expect(result.status).toBe('REVISION_REQUESTED');
    });
  });

  describe('resolveVersionFiles', () => {
    it('should mint fresh signed URLs for stored file references', async () => {
      const client = createMockClient();
      const createSignedUrl = vi.fn().mockResolvedValue({
        data: { signedUrl: 'https://example.com/signed-file.stl?token=123' },
        error: null,
      });
      client.storage.from.mockReturnValue({ createSignedUrl });

      const result = await service.resolveVersionFiles(
        client as unknown as AppSupabaseClient,
        {
          id: 'dv-1',
          case_id: 'c-1',
          designer_id: 'u-1',
          version_number: 1,
          file_urls: [
            {
              bucket: 'design-files',
              path: 'u-1/file.stl',
              name: 'file.stl',
              size: 2048,
              type: 'model/stl',
            },
          ],
          thumbnail_url: null,
          preview_model_url: null,
          notes: null,
          status: 'SUBMITTED',
          revision_feedback: null,
          reviewed_at: null,
          created_at: '2026-03-24T00:00:00.000Z',
        },
      );

      expect(createSignedUrl).toHaveBeenCalledWith('u-1/file.stl', 3600);
      expect(result.file_urls).toEqual(['https://example.com/signed-file.stl?token=123']);
      expect(result.files[0]?.name).toBe('file.stl');
    });

    it('should preserve legacy URL rows without re-signing them', async () => {
      const client = createMockClient();

      const result = await service.resolveVersionFiles(
        client as unknown as AppSupabaseClient,
        {
          id: 'dv-legacy',
          case_id: 'c-1',
          designer_id: 'u-1',
          version_number: 1,
          file_urls: ['https://legacy.example.com/file.stl'],
          thumbnail_url: null,
          preview_model_url: null,
          notes: null,
          status: 'SUBMITTED',
          revision_feedback: null,
          reviewed_at: null,
          created_at: '2026-03-24T00:00:00.000Z',
        },
      );

      expect(client.storage.from).not.toHaveBeenCalled();
      expect(result.file_urls).toEqual(['https://legacy.example.com/file.stl']);
      expect(result.files[0]?.name).toBe('file.stl');
    });
  });

  describe('getLatestVersion', () => {
    it('should return the latest version for a case', async () => {
      const mockVersion = { id: 'dv-3', version_number: 3 };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockVersion, error: null });
      const limit = vi.fn().mockReturnValue({ single });
      const order = vi.fn().mockReturnValue({ limit });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      const result = await service.getLatestVersion(
        client as unknown as AppSupabaseClient,
        'c-1',
      );
      expect(result?.version_number).toBe(3);
    });
  });
});
