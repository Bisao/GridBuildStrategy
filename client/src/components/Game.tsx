import { useState, useRef, useEffect } from "react";
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
        // Cancel structure selection
        if (selectedStructure) {
          setSelectedStructure(null);
        }
        // Close NPC panel
        setNPCPanelOpen(false);
      } else if (selectedStructure && event.key.toLowerCase() === 'r') {
        rotatePreview();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedStructure, rotatePreview, setSelectedStructure, setNPCPanelOpen]);

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
        <group 
          key={structure.id} 
          position={[structure.x, 0, structure.z]}
          rotation={[0, (structure.rotation * Math.PI) / 180, 0]}
        >
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
        <group 
          position={[previewPosition.x, 0, previewPosition.z]}
          rotation={[0, (previewRotation * Math.PI) / 180, 0]}
        >
          <House 
            isPreview={true} 
            canPlace={canPlaceStructure(previewPosition.x, previewPosition.z)}
          />
        </group>
      )}
       {/* Example NPCs */}
       {/*
       <NPC 
        position={[2, 0, 2]} 
        color="#8B4513" 
        animation="idle" 
      />
      <NPC 
        position={[-3, 0, 1]} 
        color="#228B22" 
        animation="walk" 
      />
      <NPC 
        position={[1, 0, -2]} 
        color="#4169E1" 
        animation="idle" 
      />
      */}


    </>
  );
};

export default Game;
```import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const NPC = ({ position, color, animation }) => {
  const meshRef = React.useRef();
  const [isRunning, setIsRunning] = React.useState(animation === 'walk');

  // Basic NPC geometry (low poly example)
  const geometry = new THREE.BoxGeometry(1, 2, 1);
  const material = new THREE.MeshLambertMaterial({ color });

  // Animation setup (very basic example)
  useFrame(() => {
    if (isRunning && meshRef.current) {
      meshRef.current.position.x += 0.01; // Simple walking animation
      if (meshRef.current.position.x > 5) {
        meshRef.current.position.x = -5;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} geometry={geometry} material={material}>
      {/* You can add more complex 3D models here */}
    </mesh>
  );
};

export default NPC;
```

Now I will update the Game component to include example NPCs:

```jsx
import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import Grid from "./Grid";
import House from "./House";
import CameraControls from "./CameraControls";
import { useGridPlacement } from "../hooks/useGridPlacement";
import { useGameState } from "../lib/stores/useGameState";
import NPC from "./NPC"; // Import the NPC component

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
        // Cancel structure selection
        if (selectedStructure) {
          setSelectedStructure(null);
        }
        // Close NPC panel
        setNPCPanelOpen(false);
      } else if (selectedStructure && event.key.toLowerCase() === 'r') {
        rotatePreview();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedStructure, rotatePreview, setSelectedStructure, setNPCPanelOpen]);

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
        <group 
          key={structure.id} 
          position={[structure.x, 0, structure.z]}
          rotation={[0, (structure.rotation * Math.PI) / 180, 0]}
        >
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
        <group 
          position={[previewPosition.x, 0, previewPosition.z]}
          rotation={[0, (previewRotation * Math.PI) / 180, 0]}
        >
          <House 
            isPreview={true} 
            canPlace={canPlaceStructure(previewPosition.x, previewPosition.z)}
          />
        </group>
      )}

      {/* Example NPCs */}
      <NPC 
        position={[2, 0, 2]} 
        color="#8B4513" 
        animation="idle" 
      />
      <NPC 
        position={[-3, 0, 1]} 
        color="#228B22" 
        animation="walk" 
      />
      <NPC 
        position={[1, 0, -2]} 
        color="#4169E1" 
        animation="idle" 
      />
    </>
  );
};

export default Game;