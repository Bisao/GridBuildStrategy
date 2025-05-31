import { useRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

interface GridProps {
  onPointerMove: (event: any) => void;
  onClick: (event: any) => void;
  hoveredTile: { x: number; z: number } | null;
}

const Grid = ({ onPointerMove, onClick, hoveredTile }: GridProps) => {
  const gridRef = useRef<THREE.Group>(null);
  const grassTexture = useTexture("/textures/grass.png");
  
  // Configure grass texture
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(1, 1);

  const GRID_SIZE = 20;
  const TILE_SIZE = 1;

  // Create grid tiles
  const tiles = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      // Position tiles so they're centered on integer coordinates
      const worldX = x - GRID_SIZE / 2 + 0.5;
      const worldZ = z - GRID_SIZE / 2 + 0.5;
      
      const isHovered = hoveredTile && hoveredTile.x === worldX && hoveredTile.z === worldZ;
      
      tiles.push(
        <group key={`tile-${x}-${z}`} position={[worldX, 0, worldZ]}>
          {/* Base tile */}
          <mesh 
            receiveShadow
            userData={{ gridX: worldX, gridZ: worldZ, isGridTile: true }}
            onPointerMove={onPointerMove}
            onClick={onClick}
          >
            <boxGeometry args={[TILE_SIZE, 0.1, TILE_SIZE]} />
            <meshLambertMaterial 
              map={grassTexture} 
              color={isHovered ? "#90EE90" : "#228B22"}
            />
          </mesh>
          
          {/* Tile border */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[TILE_SIZE + 0.02, 0.02, TILE_SIZE + 0.02]} />
            <meshBasicMaterial 
              color={isHovered ? "#FFFF00" : "#333333"} 
              transparent 
              opacity={0.5}
            />
          </mesh>
        </group>
      );
    }
  }

  return (
    <group ref={gridRef}>
      {tiles}
      
      
    </group>
  );
};

export default Grid;
