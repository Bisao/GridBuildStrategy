import { useRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

interface HouseProps {
  isPreview?: boolean;
  canPlace?: boolean;
  position?: { x: number; z: number };
  onHouseClick?: (position: { x: number; z: number }) => void;
}

const House = ({ isPreview = false, canPlace = true, position, onHouseClick }: HouseProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const woodTexture = useTexture("/textures/wood.jpg");
  
  // Configure wood texture
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(2, 2);

  const opacity = isPreview ? 0.7 : 1.0;
  const wallColor = isPreview ? (canPlace ? "#8B4513" : "#FF4444") : "#8B4513";
  const roofColor = isPreview ? (canPlace ? "#654321" : "#AA2222") : "#654321";

  const handleClick = (event: any) => {
    if (!isPreview && position && onHouseClick) {
      event.stopPropagation();
      onHouseClick(position);
    }
  };

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* House Base */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.8]} />
        <meshLambertMaterial 
          map={woodTexture}
          color={wallColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <coneGeometry args={[0.6, 0.4, 4]} />
        <meshLambertMaterial 
          color={roofColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.15, 0.41]} castShadow>
        <boxGeometry args={[0.15, 0.3, 0.02]} />
        <meshLambertMaterial 
          color={isPreview ? (canPlace ? "#8B4513" : "#CC3333") : "#8B4513"}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Windows */}
      <mesh position={[-0.25, 0.25, 0.41]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshLambertMaterial 
          color={isPreview ? (canPlace ? "#87CEEB" : "#6699CC") : "#87CEEB"}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>
      
      <mesh position={[0.25, 0.25, 0.41]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshLambertMaterial 
          color={isPreview ? (canPlace ? "#87CEEB" : "#6699CC") : "#87CEEB"}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>
    </group>
  );
};

export default House;
