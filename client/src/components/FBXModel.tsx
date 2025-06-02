
import { useRef, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three-stdlib';
import * as THREE from 'three';

interface FBXModelProps {
  modelPath: string;
  texturePath?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  animation?: string;
}

export default function FBXModel({ 
  modelPath, 
  texturePath, 
  position, 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1],
  animation 
}: FBXModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [actions, setActions] = useState<{ [key: string]: THREE.AnimationAction }>({});
  const [loadError, setLoadError] = useState<boolean>(false);

  // Load FBX model with error handling
  let fbx = null;
  try {
    fbx = useLoader(FBXLoader, modelPath);
  } catch (error) {
    console.error(`Failed to load FBX model: ${modelPath}`, error);
    setLoadError(true);
  }

  // Load texture if provided
  const texture = texturePath ? useLoader(THREE.TextureLoader, texturePath) : null;

  useEffect(() => {
    if (!fbx) return;

    // Clone the model to avoid sharing between instances
    const clonedFBX = fbx.clone();
    
    // Apply texture if provided
    if (texture) {
      clonedFBX.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({ 
            map: texture,
            transparent: true
          });
        }
      });
    }

    // Setup animations
    if (clonedFBX.animations && clonedFBX.animations.length > 0) {
      const newMixer = new THREE.AnimationMixer(clonedFBX);
      const newActions: { [key: string]: THREE.AnimationAction } = {};

      clonedFBX.animations.forEach((clip) => {
        const action = newMixer.clipAction(clip);
        newActions[clip.name] = action;
      });

      setMixer(newMixer);
      setActions(newActions);

      // Play default animation
      if (animation && newActions[animation]) {
        newActions[animation].play();
      } else if (Object.keys(newActions).length > 0) {
        Object.values(newActions)[0].play();
      }
    }

    // Add model to group
    if (groupRef.current) {
      groupRef.current.clear();
      groupRef.current.add(clonedFBX);
    }
  }, [fbx, texture, animation]);

  // Animation loop
  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
  });

  // Render fallback if FBX failed to load
  if (loadError || !fbx) {
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
    <group 
      ref={groupRef} 
      position={position} 
      rotation={rotation} 
      scale={scale}
    />
  );
}
