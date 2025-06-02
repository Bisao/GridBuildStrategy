import { useState, useCallback } from "react";
import * as THREE from "three";

export interface PlacedStructure {
  id: string;
  type: string;
  x: number;
  z: number;
  rotation: number;
}

export const useGridPlacement = () => {
  const [placedStructures, setPlacedStructures] = useState<PlacedStructure[]>([]);
  const [hoveredTile, setHoveredTile] = useState<{ x: number; z: number } | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; z: number } | null>(null);
  const [previewRotation, setPreviewRotation] = useState<number>(0);

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
      // Snap to grid - floor to get tile coordinates, then add 0.5 to center on tile
      const tileX = Math.floor(intersectionPoint.x);
      const tileZ = Math.floor(intersectionPoint.z);
      const gridX = tileX + 0.5;
      const gridZ = tileZ + 0.5;

      // Constrain to grid bounds
      const GRID_SIZE = 20;
      const halfGrid = GRID_SIZE / 2;

      if (tileX >= -halfGrid && tileX < halfGrid && tileZ >= -halfGrid && tileZ < halfGrid) {
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
        x: x,
        z: z,
        rotation: previewRotation
      };

      const updatedStructures = [...placedStructures, newStructure];
      setPlacedStructures(updatedStructures);
      console.log(`Placed ${structureType} at (${x}, ${z}) with rotation ${previewRotation}`);

      // Auto-save after placing structure
      setTimeout(() => {
        autoSave(updatedStructures).catch(error => {
          console.error('Erro no auto-save:', error);
        });
      }, 500);

      return true;
    } else {
      console.log(`Cannot place structure at (${x}, ${z}) - position occupied`);
      return false;
    }
  }, [previewPosition, canPlaceStructure, previewRotation, placedStructures]);

  const rotatePreview = useCallback(() => {
    setPreviewRotation(prev => (prev + 90) % 360);
  }, []);

  // Dummy autoSave function - replace with your actual implementation
  const autoSave = async (structures: PlacedStructure[]) => {
    console.log('Auto-saving structures:', structures);
    // Here you would make an API call to save the structures to your backend
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
    console.log('Auto-save complete.');
  };

  return {
    placedStructures,
    hoveredTile,
    previewPosition,
    previewRotation,
    handleGridClick,
    handleGridHover,
    canPlaceStructure,
    rotatePreview
  };
};