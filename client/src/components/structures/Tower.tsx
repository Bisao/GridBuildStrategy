
import { useRef } from "react";
import * as THREE from "three";

interface TowerProps {
  isPreview?: boolean;
  canPlace?: boolean;
  position?: { x: number; z: number };
  onStructureClick?: (position: { x: number; z: number }) => void;
}

const Tower = ({ isPreview = false, canPlace = true, position, onStructureClick }: TowerProps) => {
  const groupRef = useRef<THREE.Group>(null);

  const opacity = isPreview ? 0.7 : 1.0;
  const stoneColor = isPreview ? (canPlace ? "#696969" : "#FF4444") : "#696969";
  const roofColor = isPreview ? (canPlace ? "#4682B4" : "#AA2222") : "#4682B4";

  const handleClick = (event: any) => {
    if (!isPreview && position && onStructureClick) {
      event.stopPropagation();
      onStructureClick(position);
    }
  };

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Main tower base */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.45, 2.0, 8]} />
        <meshLambertMaterial 
          color={stoneColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Tower top section */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.4, 0.4, 8]} />
        <meshLambertMaterial 
          color={stoneColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Battlements */}
      {[0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, 5*Math.PI/4, 3*Math.PI/2, 7*Math.PI/4].map((angle, i) => (
        <mesh 
          key={i}
          position={[Math.sin(angle) * 0.42, 2.5, Math.cos(angle) * 0.42]} 
          castShadow
        >
          <boxGeometry args={[0.08, 0.2, 0.08]} />
          <meshLambertMaterial 
            color={stoneColor}
            transparent={isPreview}
            opacity={opacity}
          />
        </mesh>
      ))}

      {/* Conical roof */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <coneGeometry args={[0.5, 0.6, 8]} />
        <meshLambertMaterial 
          color={roofColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Windows */}
      <mesh position={[0, 1.8, 0.46]} castShadow>
        <boxGeometry args={[0.12, 0.15, 0.02]} />
        <meshLambertMaterial 
          color="#000000"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0, 1.2, 0.46]} castShadow>
        <boxGeometry args={[0.12, 0.15, 0.02]} />
        <meshLambertMaterial 
          color="#000000"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.3, 0.46]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.02]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Flag pole */}
      <mesh position={[0, 3.4, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
        <meshLambertMaterial 
          color="#8B4513"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Flag */}
      <mesh position={[0.15, 3.5, 0]} castShadow>
        <planeGeometry args={[0.3, 0.2]} />
        <meshLambertMaterial 
          color="#DC143C"
          transparent={isPreview}
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export default Tower;
