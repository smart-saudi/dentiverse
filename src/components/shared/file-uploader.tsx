'use client';

import { useEffect, useRef, useState } from 'react';
import Uppy, { type UppyFile } from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import Tus from '@uppy/tus';
import XHRUpload from '@uppy/xhr-upload';
import { LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

interface UppyMeta extends Record<string, string> {
  bucket: string;
}

type UppyBody = Record<string, never>;

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
  path?: string;
  bucket?: string;
}

interface FileUploaderProps {
  bucket?: string;
  accept?: string;
  maxFiles?: number;
  onFilesUploaded: (files: UploadedFile[]) => void;
  className?: string;
}

interface UploadResponseBody {
  data: UploadedFile;
}

const DEFAULT_ACCEPT = '.stl,.obj,.ply,.png,.jpg,.jpeg,.pdf,.zip';
const DEFAULT_NOTE = 'STL, OBJ, PLY, PNG, JPG, PDF, ZIP (max 100MB each)';

/**
 * Convert an accept string into Uppy-compatible file type restrictions.
 *
 * @param accept - Comma-separated accept string
 * @returns Allowed file type list
 */
function getAllowedFileTypes(accept: string): string[] {
  return accept
    .split(',')
    .map((type) => type.trim())
    .filter((type) => type.length > 0);
}

/**
 * Check whether a value matches the uploader response payload shape.
 *
 * @param value - Unknown response body
 * @returns Whether the value is a valid upload response
 */
function isUploadResponseBody(value: unknown): value is UploadResponseBody {
  if (typeof value !== 'object' || value === null || !('data' in value)) {
    return false;
  }

  const data = value.data;
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  return (
    'url' in data &&
    typeof data.url === 'string' &&
    'name' in data &&
    typeof data.name === 'string' &&
    'size' in data &&
    typeof data.size === 'number' &&
    'type' in data &&
    typeof data.type === 'string'
  );
}

/**
 * Uppy-powered file uploader with inline dashboard, progress, and validation.
 *
 * @param props - Component props
 * @param props.bucket - Supabase storage bucket name
 * @param props.accept - Accepted file types (for example ".stl,.obj,.png")
 * @param props.maxFiles - Maximum number of files
 * @param props.onFilesUploaded - Callback when files are successfully uploaded
 * @param props.className - Additional CSS classes
 * @returns Inline Uppy dashboard with upload feedback
 */
export function FileUploader({
  bucket = 'design-files',
  accept = DEFAULT_ACCEPT,
  maxFiles = 10,
  onFilesUploaded,
  className,
}: FileUploaderProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    const dashboardTarget = dashboardRef.current;
    if (!dashboardTarget) {
      return;
    }

    const uploadedById = new Map<string, UploadedFile>();
    const tusEndpoint = process.env.NEXT_PUBLIC_UPPY_TUS_ENDPOINT;
    const uppy = new Uppy<UppyMeta, UppyBody>({
      autoProceed: true,
      restrictions: {
        allowedFileTypes: getAllowedFileTypes(accept),
        maxNumberOfFiles: maxFiles,
        maxFileSize: 100 * 1024 * 1024,
      },
      meta: { bucket },
    });

    const syncUploadedFiles = () => {
      const nextFiles = Array.from(uploadedById.values());
      setUploadedFiles(nextFiles);
      onFilesUploaded(nextFiles);
    };

    setError(null);
    setIsUploading(false);
    setUploadedFiles([]);
    onFilesUploaded([]);

    uppy.use(Dashboard, {
      inline: true,
      target: dashboardTarget,
      theme: 'light',
      note: DEFAULT_NOTE,
      height: 320,
      proudlyDisplayPoweredByUppy: false,
      hideUploadButton: true,
      disableStatusBar: false,
    });

    if (tusEndpoint) {
      uppy.use(Tus, {
        endpoint: tusEndpoint,
        allowedMetaFields: ['bucket'],
      });
    } else {
      uppy.use(XHRUpload, {
        endpoint: '/api/v1/files',
        method: 'post',
        fieldName: 'file',
        formData: true,
        allowedMetaFields: ['bucket'],
        bundle: false,
      });
    }

    const handleFileAdded = (file: UppyFile<UppyMeta, UppyBody>) => {
      uppy.setFileMeta(file.id, { bucket });
      setError(null);
    };

    const handleUpload = () => {
      setError(null);
      setIsUploading(true);
    };

    const handleComplete = () => {
      setIsUploading(false);
    };

    const handleRestrictionFailed = (
      _file: UppyFile<UppyMeta, UppyBody> | undefined,
      restrictionError: Error,
    ) => {
      setError(restrictionError.message);
    };

    const handleUploadError = (
      _file: UppyFile<UppyMeta, UppyBody> | undefined,
      uploadError: { message: string },
    ) => {
      setError(uploadError.message);
      setIsUploading(false);
    };

    const handleUploadSuccess = (
      file: UppyFile<UppyMeta, UppyBody> | undefined,
      response?: { body?: unknown },
    ) => {
      if (!file) {
        return;
      }

      if (!isUploadResponseBody(response?.body)) {
        setError('Upload succeeded but the server response was malformed');
        return;
      }

      uploadedById.set(file.id, response.body.data);
      syncUploadedFiles();
    };

    const handleFileRemoved = (file: UppyFile<UppyMeta, UppyBody>) => {
      uploadedById.delete(file.id);
      syncUploadedFiles();
    };

    uppy.on('file-added', handleFileAdded);
    uppy.on('upload', handleUpload);
    uppy.on('complete', handleComplete);
    uppy.on('restriction-failed', handleRestrictionFailed);
    uppy.on('upload-error', handleUploadError);
    uppy.on('upload-success', handleUploadSuccess);
    uppy.on('file-removed', handleFileRemoved);

    return () => {
      uppy.cancelAll();
      uppy.destroy();
    };
  }, [accept, bucket, maxFiles, onFilesUploaded]);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="overflow-hidden rounded-xl border">
        <div ref={dashboardRef} />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-muted-foreground">
          Uploaded files: {uploadedFiles.length}/{maxFiles}
        </span>
        {isUploading && (
          <span className="text-muted-foreground inline-flex items-center gap-1.5">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            Uploading files...
          </span>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}
    </div>
  );
}
