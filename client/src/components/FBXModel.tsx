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
  const [loadError, setLoadError] = useState(false);

  let fbx;
  let texture = null;

  try {
    fbx = useLoader(FBXLoader, modelPath);
    if (texturePath) {
      texture = useLoader(THREE.TextureLoader, texturePath);
    }
  } catch (error) {
    console.error(`Failed to load FBX model: ${modelPath}`, error);
    // Error will be handled by the conditional rendering below
  }

  useEffect(() => {
    if (!fbx) return;

    // Clone the model to avoid sharing between instances
    const clonedFBX = fbx.clone();
});

  // Render fallback if FBX failed to load
  if (!fbx) {
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
      <primitive object={fbx} />
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