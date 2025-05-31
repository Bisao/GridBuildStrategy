import { useState, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import Grid from "./Grid";
import House from "./House";
import CameraControls from "./CameraControls";
import { useGridPlacement } from "../hooks/useGridPlacement";
import { useGameState } from "../lib/stores/useGameState";

const Game = () => {
  const { camera, gl } = useThree();
  const [mousePosition, setMousePosition] = useState(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());
  
  const { 
    selectedStructure, 
    setSelectedStructure, 
    setSelectedHouse, 
    setNPCPanelOpen 
  } = useGameState();
  const { 
    placedStructures, 
    hoveredTile, 
    previewPosition,
    handleGridClick,
    handleGridHover,
    canPlaceStructure
  } = useGridPlacement();

  // Handle mouse movement for preview positioning
  useFrame(() => {
    if (selectedStructure) {
      raycaster.current.setFromCamera(mousePosition, camera);
      handleGridHover(raycaster.current);
    }
  });

  const handlePointerMove = (event: any) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    setMousePosition(new THREE.Vector2(x, y));
  };

  const handleClick = (event: any) => {
    if (selectedStructure) {
      event.stopPropagation();
      raycaster.current.setFromCamera(mousePosition, camera);
      const success = handleGridClick(raycaster.current, selectedStructure);
      if (success) {
        console.log("Structure placed successfully!");
      }
    }
  };

  const handleHouseClick = (position: { x: number; z: number }) => {
    setSelectedHouse(position);
    setNPCPanelOpen(true);
  };

  return (
    <>
      {/* Camera Controls */}
      <CameraControls />
      
      {/* Grid */}
      <Grid 
        onPointerMove={handlePointerMove}
        onClick={handleClick}
        hoveredTile={hoveredTile}
      />

      {/* Placed Structures */}
      {placedStructures.map((structure) => (
        <group key={structure.id} position={[structure.x, 0, structure.z]}>
          {structure.type === 'house' && (
            <House 
              position={{ x: structure.x, z: structure.z }}
              onHouseClick={handleHouseClick}
            />
          )}
        </group>
      ))}

      {/* Preview Structure */}
      {selectedStructure && previewPosition && (
        <group position={[previewPosition.x, 0, previewPosition.z]}>
          <House 
            isPreview={true} 
            canPlace={canPlaceStructure(previewPosition.x, previewPosition.z)}
          />
        </group>
      )}


    </>
  );
};

export default Game;
