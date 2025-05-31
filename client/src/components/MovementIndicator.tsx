
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface MovementIndicatorProps {
  targetPosition: THREE.Vector3 | null;
  isVisible: boolean;
}

const MovementIndicator = ({ targetPosition, isVisible }: MovementIndicatorProps) => {
  const [opacity, setOpacity] = useState(1);

  useFrame(() => {
    if (isVisible && opacity > 0) {
      setOpacity(prev => Math.max(0, prev - 0.02));
    } else if (!isVisible) {
      setOpacity(1);
    }
  });

  if (!targetPosition || !isVisible) return null;

  return (
    <group position={[targetPosition.x, 0.1, targetPosition.z]}>
      {/* Outer circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.0, 16]} />
        <meshBasicMaterial 
          color="#00ff00" 
          transparent 
          opacity={opacity * 0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Inner circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.4, 16]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={opacity * 0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Center dot */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 8]} />
        <meshBasicMaterial 
          color="#00ff00" 
          transparent 
          opacity={opacity}
        />
      </mesh>
    </group>
  );
};

export default MovementIndicator;
