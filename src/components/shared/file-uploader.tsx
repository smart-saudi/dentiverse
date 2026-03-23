'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, FileIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

interface FileUploaderProps {
  bucket?: string;
  accept?: string;
  maxFiles?: number;
  onFilesUploaded: (files: UploadedFile[]) => void;
  className?: string;
}

/**
 * Drag-and-drop file uploader with progress indication.
 *
 * @param props - Component props
 * @param props.bucket - Supabase storage bucket name
 * @param props.accept - Accepted file types (e.g. ".stl,.obj,.png")
 * @param props.maxFiles - Maximum number of files
 * @param props.onFilesUploaded - Callback when files are successfully uploaded
 * @param props.className - Additional CSS classes
 * @returns File upload dropzone with progress
 */
export function FileUploader({
  bucket = 'design-files',
  accept = '.stl,.obj,.ply,.png,.jpg,.jpeg,.pdf,.zip',
  maxFiles = 10,
  onFilesUploaded,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList) => {
      setError(null);
      setIsUploading(true);

      const newFiles: UploadedFile[] = [];

      try {
        for (const file of Array.from(files).slice(0, maxFiles - uploadedFiles.length)) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('bucket', bucket);

          const res = await fetch('/api/v1/files', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const json = await res.json();
            throw new Error(json.message ?? `Failed to upload ${file.name}`);
          }

          const json = await res.json();
          newFiles.push({
            url: json.data.url,
            name: json.data.name,
            size: json.data.size,
            type: json.data.type,
          });
        }

        const updated = [...uploadedFiles, ...newFiles];
        setUploadedFiles(updated);
        onFilesUploaded(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    },
    [bucket, maxFiles, uploadedFiles, onFilesUploaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const updated = uploadedFiles.filter((_, i) => i !== index);
      setUploadedFiles(updated);
      onFilesUploaded(updated);
    },
    [uploadedFiles, onFilesUploaded],
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
          isUploading && 'pointer-events-none opacity-50',
        )}
      >
        <Upload className="text-muted-foreground mb-2 h-8 w-8" />
        <p className="text-sm font-medium">
          {isUploading ? 'Uploading...' : 'Drop files here or click to browse'}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          STL, OBJ, PLY, PNG, JPG, PDF, ZIP (max 100MB each)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md border px-3 py-2">
              <FileIcon className="text-muted-foreground h-4 w-4" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-muted-foreground text-xs">{formatSize(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(i);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
