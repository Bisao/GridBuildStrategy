

import { useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import { useEffect, useState, Suspense } from 'react';

interface FBXModelProps {
  modelPath: string;
  texturePath?: string;
  position: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  animation?: "idle" | "walk";
}

function FBXModelInner({ 
  modelPath, 
  texturePath, 
  position, 
  scale = [1, 1, 1], 
  rotation = [0, 0, 0],
  animation = "idle" 
}: FBXModelProps) {
  const [modelInstance, setModelInstance] = useState<THREE.Group | null>(null);

  // Load FBX model
  let fbx: THREE.Group | null = null;
  let texture: THREE.Texture | null = null;

  try {
    fbx = useLoader(FBXLoader, modelPath);
    if (texturePath) {
      texture = useLoader(THREE.TextureLoader, texturePath);
    }
  } catch (error) {
    console.error(`Failed to load FBX model: ${modelPath}`, error);
  }

  useEffect(() => {
    if (!fbx) {
      setModelInstance(null);
      return;
    }

    try {
      // Clone the model to avoid sharing between instances
      const clonedFBX = fbx.clone();
      
      // Apply texture if available
      if (texture) {
        clonedFBX.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial) {
                    mat.map = texture;
                    mat.needsUpdate = true;
                  }
                });
              } else if (child.material instanceof THREE.MeshStandardMaterial || child.material instanceof THREE.MeshBasicMaterial) {
                child.material.map = texture;
                child.material.needsUpdate = true;
              }
            }
          }
        });
      }

      setModelInstance(clonedFBX);
    } catch (error) {
      console.error('Error processing FBX model:', error);
    }
  }, [fbx, texture]);

  // Render fallback if there's an error or no model
  if (!modelInstance) {
    return (
      <group position={position} rotation={rotation} scale={scale}>
        {/* Fallback simple character */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.4, 0.8, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#FDBCB4" />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={modelInstance} />
    </group>
  );
}

export default function FBXModel(props: FBXModelProps) {
  return (
    <Suspense fallback={
      <group position={props.position} rotation={props.rotation} scale={props.scale}>
        {/* Loading fallback */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.4, 0.8, 0.2]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#999999" />
        </mesh>
      </group>
    }>
      <FBXModelInner {...props} />
    </Suspense>
  );
}

