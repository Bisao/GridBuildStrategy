import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import Grid from "./Grid";
import House from "./House";
import CameraControls from "./CameraControls";
import NPC from "./NPC";
import Windmill from "./structures/Windmill";
import Tower from "./structures/Tower";
import LargeHouse from "./structures/LargeHouse";
import Blacksmith from "./structures/Blacksmith";
import Market from "./structures/Market";
import { useGridPlacement } from "../hooks/useGridPlacement";
import { useGameState } from "../lib/stores/useGameState";
import { useNPCControl } from "../hooks/useNPCControl";
import MovementIndicator from "./MovementIndicator";

const Game = () => {
  const { camera, gl } = useThree();
  const [mousePosition, setMousePosition] = useState(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());

  const { 
    selectedStructure, 
    setSelectedStructure, 
    setSelectedHouse, 
    setNPCPanelOpen,
    createdNPCs,
    controlledNPCId,
    setControlledNPCId,
    viewingNPCId,
    setViewingNPCId
  } = useGameState();
  const { isControlling, isMovingToTarget, targetPosition } = useNPCControl();
  const { 
    placedStructures, 
    hoveredTile, 
    previewPosition,
    previewRotation,
    handleGridClick,
    handleGridHover,
    canPlaceStructure,
    rotatePreview
  } = useGridPlacement();

  // Handle keyboard input for rotation and escape
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Stop NPC control first
        if (controlledNPCId) {
          setControlledNPCId(null);
        }
        // Stop NPC viewing
        else if (viewingNPCId) {
          setViewingNPCId(null);
        }
        // Cancel structure selection
        else if (selectedStructure) {
          setSelectedStructure(null);
        }
        // Close NPC panel
        else {
          setNPCPanelOpen(false);
        }
      } else if (selectedStructure && event.key.toLowerCase() === 'r') {
        rotatePreview();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedStructure, rotatePreview, setSelectedStructure, setNPCPanelOpen, controlledNPCId, viewingNPCId, setControlledNPCId, setViewingNPCId]);

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

  const handleStructureClick = (position: { x: number; z: number }) => {
    // Encontrar a estrutura nas estruturas colocadas para obter o ID
    const structureClicked = placedStructures.find(
      structure => 
        structure.x === position.x && 
        structure.z === position.z
    );

    if (structureClicked) {
      setSelectedHouse({ x: position.x, z: position.z, id: structureClicked.id });
      setNPCPanelOpen(true);
    }
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
        <group 
          key={structure.id}
          position={[structure.x, 0, structure.z]}
          rotation={[0, (structure.rotation * Math.PI) / 180, 0]}
        >
          {structure.type === 'house' && (
            <House 
              position={{ x: structure.x, z: structure.z }}
              onStructureClick={handleStructureClick}
            />
          )}
          {structure.type === 'windmill' && (
            <Windmill 
              position={{ x: structure.x, z: structure.z }}
              onStructureClick={handleStructureClick}
            />
          )}
          {structure.type === 'tower' && (
            <Tower 
              position={{ x: structure.x, z: structure.z }}
              onStructureClick={handleStructureClick}
            />
          )}
          {structure.type === 'largehouse' && (
            <LargeHouse 
              position={{ x: structure.x, z: structure.z }}
              onStructureClick={handleStructureClick}
            />
          )}
          {structure.type === 'blacksmith' && (
            <Blacksmith 
              position={{ x: structure.x, z: structure.z }}
              onStructureClick={handleStructureClick}
            />
          )}
          {structure.type === 'market' && (
            <Market 
              position={{ x: structure.x, z: structure.z }}
              onStructureClick={handleStructureClick}
            />
          )}
        </group>
      ))}

      {/* Preview Structure */}
      {selectedStructure && previewPosition && (
        <group 
          position={[previewPosition.x, 0, previewPosition.z]}
          rotation={[0, (previewRotation * Math.PI) / 180, 0]}
        >

          {selectedStructure === 'windmill' && (
            <Windmill 
              isPreview={true} 
              canPlace={canPlaceStructure(previewPosition.x, previewPosition.z)}
            />
          )}
          {selectedStructure === 'tower' && (
            <Tower 
              isPreview={true} 
              canPlace={canPlaceStructure(previewPosition.x, previewPosition.z)}
            />
          )}
          {selectedStructure === 'largehouse' && (
            <LargeHouse 
              isPreview={true} 
              canPlace={canPlaceStructure(previewPosition.x, previewPosition.z)}
            />
          )}
          {selectedStructure === 'blacksmith' && (
            <Blacksmith 
              isPreview={true} 
              canPlace={canPlaceStructure(previewPosition.x, previewPosition.z)}
            />
          )}
          {selectedStructure === 'market' && (
            <Market 
              isPreview={true} 
              canPlace={canPlaceStructure(previewPosition.x, previewPosition.z)}
            />
          )}
        </group>
      )}

      {/* Render created NPCs */}
      {createdNPCs.map((npc) => (
        <NPC
          key={npc.id}
          position={[npc.position.x, 0, npc.position.z]}
          color={npc.id === controlledNPCId ? "#FF6B6B" : "#8B4513"}
          animation={npc.animation || "idle"}
          rotation={npc.rotation || 0}
        />
      ))}

      {/* Movement indicator for controlled NPC */}
      <MovementIndicator 
        targetPosition={targetPosition}
        isVisible={isMovingToTarget}
      />

    </>
  );
};

export default Game;