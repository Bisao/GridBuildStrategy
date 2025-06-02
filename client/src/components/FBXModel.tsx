
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

  // Load FBX model
  const fbx = useLoader(FBXLoader, modelPath);

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

  return (
    <group 
      ref={groupRef} 
      position={position} 
      rotation={rotation} 
      scale={scale}
    />
  );
}
