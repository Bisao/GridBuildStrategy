
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WindmillProps {
  isPreview?: boolean;
  canPlace?: boolean;
  position?: { x: number; z: number };
  onStructureClick?: (position: { x: number; z: number }) => void;
}

const Windmill = ({ isPreview = false, canPlace = true, position, onStructureClick }: WindmillProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const bladesRef = useRef<THREE.Group>(null);

  const opacity = isPreview ? 0.7 : 1.0;
  const baseColor = isPreview ? (canPlace ? "#8B4513" : "#FF4444") : "#8B4513";
  const roofColor = isPreview ? (canPlace ? "#4682B4" : "#AA2222") : "#4682B4";

  // Rotate windmill blades
  useFrame((state) => {
    if (bladesRef.current && !isPreview) {
      bladesRef.current.rotation.z += 0.02;
    }
  });

  const handleClick = (event: any) => {
    if (!isPreview && position && onStructureClick) {
      event.stopPropagation();
      onStructureClick(position);
    }
  };

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Base tower */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 1.6, 8]} />
        <meshLambertMaterial 
          color={baseColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Top section */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.4, 8]} />
        <meshLambertMaterial 
          color={baseColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <coneGeometry args={[0.35, 0.4, 8]} />
        <meshLambertMaterial 
          color={roofColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Window */}
      <mesh position={[0, 1.2, 0.41]} castShadow>
        <boxGeometry args={[0.15, 0.2, 0.02]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.3, 0.41]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.02]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Windmill blades */}
      <group ref={bladesRef} position={[0, 1.6, 0.35]}>
        {/* Blade 1 */}
        <mesh position={[0, 0.6, 0]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.05, 1.2, 0.02]} />
          <meshLambertMaterial 
            color="#D2691E"
            transparent={isPreview}
            opacity={opacity}
          />
        </mesh>
        {/* Blade 2 */}
        <mesh position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <boxGeometry args={[0.05, 1.2, 0.02]} />
          <meshLambertMaterial 
            color="#D2691E"
            transparent={isPreview}
            opacity={opacity}
          />
        </mesh>
        {/* Blade 3 */}
        <mesh position={[0, -0.6, 0]} rotation={[0, 0, Math.PI]} castShadow>
          <boxGeometry args={[0.05, 1.2, 0.02]} />
          <meshLambertMaterial 
            color="#D2691E"
            transparent={isPreview}
            opacity={opacity}
          />
        </mesh>
        {/* Blade 4 */}
        <mesh position={[-0.6, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <boxGeometry args={[0.05, 1.2, 0.02]} />
          <meshLambertMaterial 
            color="#D2691E"
            transparent={isPreview}
            opacity={opacity}
          />
        </mesh>
        {/* Center hub */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 8]} />
          <meshLambertMaterial 
            color="#654321"
            transparent={isPreview}
            opacity={opacity}
          />
        </mesh>
      </group>
    </group>
  );
};

export default Windmill;
