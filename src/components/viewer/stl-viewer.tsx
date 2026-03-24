'use client';

import { useEffect, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Maximize, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { Box3, BufferGeometry, Vector3 } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StlViewerProps {
  url: string;
  className?: string;
}

interface LoadedModel {
  geometry: BufferGeometry;
  scale: number;
}

const DEFAULT_CAMERA_POSITION = new Vector3(2.6, 1.8, 4.8);
const DEFAULT_CAMERA_DISTANCE = DEFAULT_CAMERA_POSITION.length();
const MIN_CAMERA_DISTANCE = 2.5;
const MAX_CAMERA_DISTANCE = 9;

/**
 * Sync the camera distance while preserving the current viewing angle.
 *
 * @param props - Camera sync props
 * @param props.distance - Desired camera distance from the origin
 * @returns Nothing; updates the active scene camera
 */
function CameraDistanceSync({ distance }: { distance: number }) {
  const { camera } = useThree();

  useEffect(() => {
    const currentPosition = camera.position.clone();
    const direction =
      currentPosition.lengthSq() > 0
        ? currentPosition.normalize()
        : DEFAULT_CAMERA_POSITION.clone().normalize();

    camera.position.copy(direction.multiplyScalar(distance));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, distance]);

  return null;
}

/**
 * Convert STLLoader errors into user-friendly strings.
 *
 * @param error - Loader error value
 * @returns Human-readable error message
 */
function getLoadErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Failed to load model';
}

/**
 * 3D STL model viewer backed by React Three Fiber and STLLoader.
 *
 * @param props - Component props
 * @param props.url - URL to the STL file
 * @param props.className - Additional CSS classes
 * @returns Interactive 3D model viewer or fallback download UI
 */
export function StlViewer({ url, className }: StlViewerProps) {
  const [model, setModel] = useState<LoadedModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraDistance, setCameraDistance] = useState(DEFAULT_CAMERA_DISTANCE);
  const [sceneVersion, setSceneVersion] = useState(0);
  const [isAutoRotate, setIsAutoRotate] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let loadedGeometry: BufferGeometry | null = null;

    setModel(null);
    setError(null);
    setIsLoading(true);
    setCameraDistance(DEFAULT_CAMERA_DISTANCE);
    setIsAutoRotate(false);
    setSceneVersion((current) => current + 1);

    const loader = new STLLoader();
    loader.load(
      url,
      (geometry) => {
        if (isCancelled) {
          geometry.dispose();
          return;
        }

        geometry.computeVertexNormals();
        geometry.center();
        geometry.computeBoundingBox();

        const bounds = geometry.boundingBox ?? new Box3();
        const size = new Vector3();
        bounds.getSize(size);

        const largestDimension = Math.max(size.x, size.y, size.z) || 1;
        const scale = 2.4 / largestDimension;

        loadedGeometry = geometry;
        setModel({ geometry, scale });
        setIsLoading(false);
      },
      undefined,
      (loaderError) => {
        if (isCancelled) {
          return;
        }

        setError(getLoadErrorMessage(loaderError));
        setIsLoading(false);
      },
    );

    return () => {
      isCancelled = true;
      loadedGeometry?.dispose();
    };
  }, [url]);

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
      {model ? (
        <Canvas
          key={sceneVersion}
          camera={{
            position: DEFAULT_CAMERA_POSITION.toArray() as [number, number, number],
            fov: 42,
          }}
          className="h-full w-full"
        >
          <color attach="background" args={['#f8fafc']} />
          <fog attach="fog" args={['#f8fafc', 8, 16]} />
          <ambientLight intensity={0.7} />
          <hemisphereLight args={['#ffffff', '#cbd5e1', 0.7]} />
          <directionalLight position={[4, 6, 5]} intensity={1.2} />
          <directionalLight position={[-4, -3, -4]} intensity={0.55} />
          <CameraDistanceSync distance={cameraDistance} />
          <mesh geometry={model.geometry} scale={model.scale} castShadow receiveShadow>
            <meshStandardMaterial color="#2563eb" metalness={0.18} roughness={0.42} />
          </mesh>
          <mesh geometry={model.geometry} scale={model.scale * 1.002}>
            <meshBasicMaterial color="#bfdbfe" wireframe transparent opacity={0.18} />
          </mesh>
          <gridHelper args={[8, 16, '#cbd5e1', '#e2e8f0']} position={[0, -1.7, 0]} />
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            autoRotate={isAutoRotate}
            autoRotateSpeed={1.2}
            minDistance={MIN_CAMERA_DISTANCE}
            maxDistance={MAX_CAMERA_DISTANCE}
          />
        </Canvas>
      ) : (
        <div className="h-full w-full bg-slate-50" />
      )}

      {isLoading && (
        <div className="bg-background/80 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-medium">
            <RotateCw className="text-muted-foreground h-5 w-5 animate-spin" />
            Loading model...
          </div>
        </div>
      )}

      <div className="absolute right-2 bottom-2 flex gap-1">
        <Button
          variant={isAutoRotate ? 'default' : 'outline'}
          size="icon"
          className="h-8 w-8"
          aria-label={isAutoRotate ? 'Stop auto rotate' : 'Start auto rotate'}
          onClick={() => setIsAutoRotate((current) => !current)}
          disabled={!model || isLoading}
        >
          <RotateCw className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label="Zoom in"
          onClick={() =>
            setCameraDistance((current) => Math.max(MIN_CAMERA_DISTANCE, current * 0.85))
          }
          disabled={!model || isLoading}
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label="Zoom out"
          onClick={() =>
            setCameraDistance((current) => Math.min(MAX_CAMERA_DISTANCE, current * 1.15))
          }
          disabled={!model || isLoading}
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label="Reset view"
          onClick={() => {
            setCameraDistance(DEFAULT_CAMERA_DISTANCE);
            setIsAutoRotate(false);
            setSceneVersion((current) => current + 1);
          }}
          disabled={!model || isLoading}
        >
          <Maximize className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
