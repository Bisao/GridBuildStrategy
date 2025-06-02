
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Suspense, useState, useEffect } from 'react';

function SkyboxInner() {
  const [hasTextureError, setHasTextureError] = useState(false);
  
  let texture = null;
  
  if (!hasTextureError) {
    try {
      texture = useLoader(THREE.TextureLoader, '/textures/sky-clouds.png');
    } catch (error) {
      console.warn('Failed to load skybox texture, using fallback color');
      setHasTextureError(true);
    }
  }

  return (
    <mesh scale={[100, 100, 100]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial 
        map={hasTextureError ? null : texture} 
        color={hasTextureError || !texture ? "#87CEEB" : "#ffffff"} 
        side={THREE.BackSide} 
      />
    </mesh>
  );
}

function SkyboxFallback() {
  return (
    <mesh scale={[100, 100, 100]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
    </mesh>
  );
}

export default function Skybox() {
  return (
    <Suspense fallback={<SkyboxFallback />}>
      <SkyboxInner />
    </Suspense>
  );
}
