import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Suspense } from 'react';

function SkyboxInner() {
  let texture = null;
  
  try {
    texture = useLoader(THREE.TextureLoader, '/textures/sky-clouds.png');
  } catch (error) {
    console.warn('Failed to load skybox texture, using fallback color');
  }

  return (
    <mesh scale={[100, 100, 100]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial 
        map={texture} 
        color={texture ? "#ffffff" : "#87CEEB"} 
        side={THREE.BackSide} 
      />
    </mesh>
  );
}

export default function Skybox() {
  return (
    <Suspense fallback={
      <mesh scale={[100, 100, 100]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
      </mesh>
    }>
      <SkyboxInner />
    </Suspense>
  );
}