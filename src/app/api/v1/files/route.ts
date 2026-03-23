import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

const ALLOWED_TYPES = new Set([
  'application/octet-stream',         // STL binary
  'model/stl',                         // STL
  'model/obj',                         // OBJ
  'application/x-ply',                // PLY
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'application/zip',
]);

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

/**
 * POST /api/v1/files — Upload a file to Supabase Storage.
 *
 * Accepts multipart form data with a `file` field and optional `bucket` field.
 * Returns the public URL of the uploaded file.
 *
 * @param req - Next.js request with multipart form data
 * @returns The file URL and metadata
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Not authenticated' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const bucket = (formData.get('bucket') as string) ?? 'design-files';

  if (!file) {
    return NextResponse.json({ code: 'VALIDATION_ERROR', message: 'No file provided' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: `File too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.has(file.type) && !file.name.endsWith('.stl') && !file.name.endsWith('.obj')) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'File type not allowed' },
      { status: 400 },
    );
  }

  const ext = file.name.split('.').pop() ?? 'bin';
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({
      data: {
        url: urlData.publicUrl,
        path,
        bucket,
        name: file.name,
        size: file.size,
        type: file.type,
      },
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 },
    );
  }
}
