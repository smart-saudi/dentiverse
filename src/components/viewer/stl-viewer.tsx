'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StlViewerProps {
  url: string;
  className?: string;
}

/**
 * 3D STL model viewer using the native Canvas API with basic rotation and zoom.
 * Falls back to a download link if WebGL is unavailable.
 *
 * For production, this should be replaced with React Three Fiber + STLLoader
 * once @react-three/fiber and three.js are installed.
 *
 * @param props - Component props
 * @param props.url - URL to the STL file
 * @param props.className - Additional CSS classes
 * @returns 3D model viewer or fallback download link
 */
export function StlViewer({ url, className }: StlViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const rotationRef = useRef({ x: -Math.PI / 6, y: Math.PI / 4 });
  const zoomRef = useRef(1);
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const verticesRef = useRef<Float32Array | null>(null);
  const animRef = useRef<number>(0);

  const parseStlBinary = useCallback((buffer: ArrayBuffer): Float32Array | null => {
    const view = new DataView(buffer);
    // Skip 80-byte header
    const numTriangles = view.getUint32(80, true);
    if (numTriangles === 0 || numTriangles > 10_000_000) return null;

    const vertices = new Float32Array(numTriangles * 9);
    let offset = 84;

    for (let i = 0; i < numTriangles; i++) {
      offset += 12; // skip normal
      for (let j = 0; j < 9; j++) {
        vertices[i * 9 + j] = view.getFloat32(offset, true);
        offset += 4;
      }
      offset += 2; // skip attribute byte count
    }

    return vertices;
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const vertices = verticesRef.current;
    if (!canvas || !vertices) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const { x: rx, y: ry } = rotationRef.current;
    const zoom = zoomRef.current;
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const cosY = Math.cos(ry), sinY = Math.sin(ry);

    // Find bounding box for auto-centering
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const projected: number[] = [];

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i], y = vertices[i + 1], z = vertices[i + 2];
      // Rotate Y then X
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const y1 = y * cosX - z1 * sinX;

      projected.push(x1, y1);
      minX = Math.min(minX, x1);
      maxX = Math.max(maxX, x1);
      minY = Math.min(minY, y1);
      maxY = Math.max(maxY, y1);
    }

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const scale = zoom * Math.min(w * 0.8 / rangeX, h * 0.8 / rangeY);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    // Draw wireframe triangles
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();

    for (let i = 0; i < projected.length; i += 6) {
      const x0 = w / 2 + (projected[i] - cx) * scale;
      const y0 = h / 2 - (projected[i + 1] - cy) * scale;
      const x1 = w / 2 + (projected[i + 2] - cx) * scale;
      const y1 = h / 2 - (projected[i + 3] - cy) * scale;
      const x2 = w / 2 + (projected[i + 4] - cx) * scale;
      const y2 = h / 2 - (projected[i + 5] - cy) * scale;

      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x0, y0);
    }

    ctx.stroke();
    ctx.globalAlpha = 1;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch STL file');
        const buffer = await res.arrayBuffer();
        if (cancelled) return;

        const verts = parseStlBinary(buffer);
        if (!verts) throw new Error('Invalid or empty STL file');

        verticesRef.current = verts;
        setIsLoading(false);
        render();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load model');
          setIsLoading(false);
        }
      }
    }

    load();
    const animId = animRef.current;
    return () => { cancelled = true; cancelAnimationFrame(animId); };
  }, [url, parseStlBinary, render]);

  // Mouse interaction handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    rotationRef.current.y += dx * 0.01;
    rotationRef.current.x += dy * 0.01;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    render();
  }, [render]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    zoomRef.current = Math.max(0.1, Math.min(10, zoomRef.current * (e.deltaY > 0 ? 0.9 : 1.1)));
    render();
  }, [render]);

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center rounded-lg border p-8', className)}>
        <p className="mb-2 text-sm text-muted-foreground">{error}</p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">Download File</Button>
        </a>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-lg border bg-background', className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <RotateCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      {/* Controls */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => { zoomRef.current = Math.min(10, zoomRef.current * 1.2); render(); }}
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => { zoomRef.current = Math.max(0.1, zoomRef.current * 0.8); render(); }}
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => { rotationRef.current = { x: -Math.PI / 6, y: Math.PI / 4 }; zoomRef.current = 1; render(); }}
        >
          <Maximize className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
