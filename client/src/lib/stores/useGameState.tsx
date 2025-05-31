import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface GameState {
  selectedStructure: string | null;
  isPlacementMode: boolean;
  selectedHouse: { x: number; z: number; id: string } | null;
  isNPCPanelOpen: boolean;
  isNPCCreationOpen: boolean;
  
  // Actions
  setSelectedStructure: (structure: string | null) => void;
  setPlacementMode: (mode: boolean) => void;
  setSelectedHouse: (house: { x: number; z: number; id: string } | null) => void;
  setNPCPanelOpen: (open: boolean) => void;
  setNPCCreationOpen: (open: boolean) => void;
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set) => ({
    selectedStructure: null,
    isPlacementMode: false,
    selectedHouse: null,
    isNPCPanelOpen: false,
    isNPCCreationOpen: false,
    
    setSelectedStructure: (structure) => {
      set({ 
        selectedStructure: structure,
        isPlacementMode: structure !== null 
      });
      console.log(`Selected structure: ${structure || 'none'}`);
    },
    
    setPlacementMode: (mode) => {
      set({ isPlacementMode: mode });
      if (!mode) {
        set({ selectedStructure: null });
      }
    },
    
    setSelectedHouse: (house) => {
      set({ selectedHouse: house });
      console.log(`Selected house: ${house ? `(${house.x}, ${house.z}) ID: ${house.id}` : 'none'}`);
    },
    
    setNPCPanelOpen: (open) => {
      set({ isNPCPanelOpen: open });
      if (!open) {
        set({ selectedHouse: null, isNPCCreationOpen: false });
      }
    },

    setNPCCreationOpen: (open) => {
      set({ isNPCCreationOpen: open });
    }
  }))
);
