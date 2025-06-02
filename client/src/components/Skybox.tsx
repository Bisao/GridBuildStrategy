
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

const Skybox = () => {
  const skyboxRef = useRef<THREE.Mesh>(null);
  
  // Load the sky texture
  const skyTexture = useTexture('/textures/sky-clouds.png');
  
  // Configure texture settings
  skyTexture.wrapS = THREE.RepeatWrapping;
  skyTexture.wrapT = THREE.ClampToEdgeWrapping;
  skyTexture.repeat.set(4, 1); // Repeat horizontally for seamless sky
  
  const skyMaterial = new THREE.MeshBasicMaterial({
    map: skyTexture,
    side: THREE.BackSide,
    fog: false
  });

  // Slowly rotate the sky for dynamic effect
  useFrame((state) => {
    if (skyboxRef.current) {
      skyboxRef.current.rotation.y += 0.0002; // Very slow rotation
    }
  });

  return (
    <mesh ref={skyboxRef} material={skyMaterial}>
      <sphereGeometry args={[100, 32, 16]} />
    </mesh>
  );
};

export default Skybox;
