import { useState, useCallback } from "react";
import * as THREE from "three";

export interface PlacedStructure {
  id: string;
  type: string;
  x: number;
  z: number;
}

export const useGridPlacement = () => {
  const [placedStructures, setPlacedStructures] = useState<PlacedStructure[]>([]);
  const [hoveredTile, setHoveredTile] = useState<{ x: number; z: number } | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; z: number } | null>(null);

  const canPlaceStructure = useCallback((x: number, z: number): boolean => {
    // Check if there's already a structure at this position
    return !placedStructures.some(structure => 
      Math.abs(structure.x - x) < 0.5 && Math.abs(structure.z - z) < 0.5
    );
  }, [placedStructures]);

  const handleGridHover = useCallback((raycaster: THREE.Raycaster) => {
    // Create an invisible plane to detect mouse intersection with the grid
    const gridPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = new THREE.Vector3();
    
    if (raycaster.ray.intersectPlane(gridPlane, intersectionPoint)) {
      // Snap to grid
      const gridX = Math.round(intersectionPoint.x);
      const gridZ = Math.round(intersectionPoint.z);
      
      // Constrain to grid bounds
      const GRID_SIZE = 20;
      const halfGrid = GRID_SIZE / 2;
      
      if (gridX >= -halfGrid && gridX < halfGrid && gridZ >= -halfGrid && gridZ < halfGrid) {
        setHoveredTile({ x: gridX, z: gridZ });
        setPreviewPosition({ x: gridX, z: gridZ });
      } else {
        setHoveredTile(null);
        setPreviewPosition(null);
      }
    }
  }, []);

  const handleGridClick = useCallback((raycaster: THREE.Raycaster, structureType: string): boolean => {
    if (!previewPosition) return false;
    
    const { x, z } = previewPosition;
    
    if (canPlaceStructure(x, z)) {
      const newStructure: PlacedStructure = {
        id: `${structureType}-${Date.now()}-${Math.random()}`,
        type: structureType,
        x,
        z
      };
      
      setPlacedStructures(prev => [...prev, newStructure]);
      console.log(`Placed ${structureType} at (${x}, ${z})`);
      return true;
    } else {
      console.log(`Cannot place structure at (${x}, ${z}) - position occupied`);
      return false;
    }
  }, [previewPosition, canPlaceStructure]);

  return {
    placedStructures,
    hoveredTile,
    previewPosition,
    handleGridClick,
    handleGridHover,
    canPlaceStructure
  };
};
