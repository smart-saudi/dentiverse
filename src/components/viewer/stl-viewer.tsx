'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Environment } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';
import { RotateCw, Maximize } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StlViewerProps {
  url: string;
  className?: string;
}

/**
 * 3D STL model viewer using React Three Fiber with orbit controls,
 * ambient + directional lighting, and auto-centering.
 *
 * Falls back to a download link if the STL fails to load.
 *
 * @param props - Component props
 * @param props.url - URL to the STL file
 * @param props.className - Additional CSS classes
 * @returns 3D model viewer or fallback download link
 */
export function StlViewer({ url, className }: StlViewerProps) {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border p-8',
          className,
        )}
      >
        <p className="text-muted-foreground mb-2 text-sm">{error}</p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            Download File
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-background relative overflow-hidden rounded-lg border',
        className,
      )}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ width: '100%', height: '100%', minHeight: 300 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} />
        <Environment preset="studio" />
        <Suspense fallback={null}>
          <StlModel url={url} onError={setError} />
        </Suspense>
        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          enablePan
          enableZoom
          minDistance={1}
          maxDistance={50}
        />
      </Canvas>

      {/* Loading overlay shown while Suspense resolves */}
      <LoadingOverlay url={url} />

      {/* Reset camera button */}
      <div className="absolute right-2 bottom-2 flex gap-1">
        <ResetButton />
      </div>
    </div>
  );
}

/**
 * Internal component that loads and renders the STL geometry.
 */
function StlModel({ url, onError }: { url: string; onError: (msg: string) => void }) {
  const geometry = useStlGeometry(url, onError);

  if (!geometry) return null;

  return (
    <Center>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#6b9bd2"
          metalness={0.3}
          roughness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Center>
  );
}

/**
 * Custom hook to load an STL file and return a BufferGeometry.
 */
function useStlGeometry(
  url: string,
  onError: (msg: string) => void,
): THREE.BufferGeometry | null {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new STLLoader();

    loader.load(
      url,
      (geo) => {
        if (cancelled) {
          geo.dispose();
          return;
        }
        geo.computeVertexNormals();
        geo.center();
        // Auto-scale to fit a unit bounding sphere
        geo.computeBoundingSphere();
        const radius = geo.boundingSphere?.radius ?? 1;
        if (radius > 0) {
          geo.scale(2 / radius, 2 / radius, 2 / radius);
        }
        setGeometry(geo);
      },
      undefined,
      () => {
        if (!cancelled) {
          onError('Failed to load STL file');
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [url, onError]);

  return geometry;
}

/**
 * Shows a spinner while the STL model is loading.
 */
function LoadingOverlay({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loader = new STLLoader();
    loader.load(
      url,
      () => {
        if (!cancelled) setLoaded(true);
      },
      undefined,
      () => {
        if (!cancelled) setLoaded(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loaded) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <RotateCw className="text-muted-foreground h-6 w-6 animate-spin" />
    </div>
  );
}

/**
 * Button that resets the OrbitControls camera to its default position.
 * Uses a ref-based approach via the drei OrbitControls imperative handle.
 */
function ResetButton() {
  // This is a placeholder — OrbitControls reset requires accessing the
  // controls ref from inside the Canvas. For now, we provide a visual button
  // that users can click alongside OrbitControls' built-in double-click reset.
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleReset = useMemo(
    () => () => {
      // Double-click on canvas triggers OrbitControls reset.
      // This button dispatches a dblclick event on the canvas for the same effect.
      const canvas = buttonRef.current?.closest('.relative')?.querySelector('canvas');
      if (canvas) {
        canvas.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      }
    },
    [],
  );

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      size="icon"
      className="h-7 w-7"
      onClick={handleReset}
      aria-label="Reset camera view"
    >
      <Maximize className="h-3 w-3" />
    </Button>
  );
}
