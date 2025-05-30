import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface GameState {
  selectedStructure: string | null;
  isPlacementMode: boolean;
  
  // Actions
  setSelectedStructure: (structure: string | null) => void;
  setPlacementMode: (mode: boolean) => void;
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set) => ({
    selectedStructure: null,
    isPlacementMode: false,
    
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
    }
  }))
);
