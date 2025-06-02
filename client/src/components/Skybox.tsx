
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

const Skybox = () => {
  const { scene } = useThree();
  const skyboxRef = useRef<THREE.Mesh>(null);

  // Create fantasy sky gradient material
  const createSkyMaterial = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d')!;

    // Create gradient from top to bottom
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    
    // Fantasy sky colors - magical purple to orange sunset
    gradient.addColorStop(0, '#2D1B69'); // Deep magical purple at top
    gradient.addColorStop(0.3, '#5A3A8B'); // Purple-blue
    gradient.addColorStop(0.6, '#8B4A9C'); // Purple-pink
    gradient.addColorStop(0.8, '#E67E22'); // Orange
    gradient.addColorStop(1, '#F39C12'); // Golden yellow at horizon

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Add some mystical clouds
    context.globalAlpha = 0.3;
    context.fillStyle = '#FFE4E1';
    
    // Draw wispy clouds
    for (let i = 0; i < 8; i++) {
      const x = (canvas.width / 8) * i + Math.random() * 60;
      const y = canvas.height * 0.3 + Math.random() * 200;
      const width = 80 + Math.random() * 40;
      const height = 20 + Math.random() * 15;
      
      context.beginPath();
      context.ellipse(x, y, width, height, 0, 0, 2 * Math.PI);
      context.fill();
    }

    // Add stars
    context.globalAlpha = 0.8;
    context.fillStyle = '#FFFFFF';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.5; // Stars only in upper half
      const size = Math.random() * 2 + 1;
      
      context.beginPath();
      context.arc(x, y, size, 0, 2 * Math.PI);
      context.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(4, 1); // Repeat horizontally for seamless sky

    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      fog: false
    });
  };

  const skyMaterial = createSkyMaterial();

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
