import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface CreatedNPC {
  id: string;
  name: string;
  structureId: string;
  position: { x: number; z: number };
  type: "villager" | "guard" | "merchant" | "farmer";
  rotation?: number;
  animation?: "idle" | "walk";
}

interface GameState {
  selectedStructure: string | null;
  isPlacementMode: boolean;
  selectedHouse: { x: number; z: number; id: string } | null;
  isNPCPanelOpen: boolean;
  isNPCCreationOpen: boolean;
  isStructurePanelOpen: boolean;
  isNPCConfigPanelOpen: boolean;
  selectedNPCId: string | null;
  controlledNPCId: string | null;
  viewingNPCId: string | null;
  createdNPCs: CreatedNPC[];
  currentGameStateId: number | null;
  isSaving: boolean;
  isLoading: boolean;

  // Actions
  setSelectedStructure: (structure: string | null) => void;
  setPlacementMode: (mode: boolean) => void;
  setSelectedHouse: (house: { x: number; z: number; id: string } | null) => void;
  setNPCPanelOpen: (open: boolean) => void;
  setNPCCreationOpen: (open: boolean) => void;
  setStructurePanelOpen: (open: boolean) => void;
  setNPCConfigPanelOpen: (open: boolean) => void;
  setSelectedNPCId: (npcId: string | null) => void;
  setControlledNPCId: (npcId: string | null) => void;
  setViewingNPCId: (npcId: string | null) => void;
  addNPC: (npc: CreatedNPC) => void;
  updateNPC: (npcId: string, updates: Partial<CreatedNPC>) => void;
  removeNPC: (npcId: string) => void;
  getNPCsByStructure: (structureId: string) => CreatedNPC[];
  
  // Persistence actions
  saveGame: (name: string, structures: any[]) => Promise<void>;
  loadGame: (gameStateId: number) => Promise<void>;
  getGameStates: () => Promise<any[]>;
  setCurrentGameStateId: (id: number | null) => void;
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    selectedStructure: null,
    isPlacementMode: false,
    selectedHouse: null,
    isNPCPanelOpen: false,
    isNPCCreationOpen: false,
    isStructurePanelOpen: false,
    isNPCConfigPanelOpen: false,
    selectedNPCId: null,
    controlledNPCId: null,
    viewingNPCId: null,
    createdNPCs: [],
    currentGameStateId: null,
    isSaving: false,
    isLoading: false,

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

    setStructurePanelOpen: (open) => {
      set({ isStructurePanelOpen: open });
    },

    setNPCCreationOpen: (open) => {
      set({ isNPCCreationOpen: open });
    },
    setNPCConfigPanelOpen: (open) => set({ isNPCConfigPanelOpen: open }),
    setSelectedNPCId: (npcId) => set({ selectedNPCId: npcId }),
    setControlledNPCId: (npcId) => {
      set({ controlledNPCId: npcId });
      console.log(`NPC control set to: ${npcId || 'none'}`);
    },

    setViewingNPCId: (npcId) => {
      set({ viewingNPCId: npcId });
      console.log(`NPC viewing set to: ${npcId || 'none'}`);
    },

    addNPC: (npc) => {
      set((state) => ({
        createdNPCs: [...state.createdNPCs, { ...npc, animation: npc.animation || "idle" }]
      }));
      console.log(`NPC "${npc.name}" criado com sucesso na estrutura ${npc.structureId}`);
    },

    updateNPC: (npcId, updates) => {
      set((state) => ({
        createdNPCs: state.createdNPCs.map(npc => 
          npc.id === npcId 
            ? { ...npc, ...updates }
            : npc
        )
      }));
    },

    removeNPC: (npcId) => {
      set((state) => ({
        createdNPCs: state.createdNPCs.filter(npc => npc.id !== npcId)
      }));
    },

    getNPCsByStructure: (structureId) => {
      return get().createdNPCs.filter(npc => npc.structureId === structureId);
    },

    setCurrentGameStateId: (id) => {
      set({ currentGameStateId: id });
    },

    saveGame: async (name, structures) => {
      set({ isSaving: true });
      try {
        const state = get();
        const gameData = {
          userId: 1, // Default user for now
          name,
          structures,
          npcs: state.createdNPCs,
          gameState: {
            selectedStructure: state.selectedStructure,
            createdNPCs: state.createdNPCs
          }
        };

        const response = await fetch('/api/save-game', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gameData),
        });

        if (!response.ok) {
          throw new Error('Failed to save game');
        }

        const result = await response.json();
        set({ currentGameStateId: result.gameState.id });
        console.log('Jogo salvo com sucesso!', result);
      } catch (error) {
        console.error('Erro ao salvar jogo:', error);
        throw error;
      } finally {
        set({ isSaving: false });
      }
    },

    loadGame: async (gameStateId) => {
      set({ isLoading: true });
      try {
        const response = await fetch(`/api/load-game/${gameStateId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load game');
        }

        const result = await response.json();
        
        // Transform loaded NPCs to match current format
        const loadedNPCs = result.npcs.map((npc: any) => ({
          id: npc.npcId,
          name: npc.name,
          structureId: npc.structureId,
          position: { x: npc.x, z: npc.z },
          type: npc.type,
          rotation: npc.rotation,
          animation: npc.animation
        }));

        set({
          createdNPCs: loadedNPCs,
          currentGameStateId: gameStateId,
          selectedStructure: null,
          isPlacementMode: false
        });

        console.log('Jogo carregado com sucesso!', result);
        return result;
      } catch (error) {
        console.error('Erro ao carregar jogo:', error);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    getGameStates: async () => {
      try {
        const response = await fetch('/api/game-states/1'); // Default user
        
        if (!response.ok) {
          throw new Error('Failed to get game states');
        }

        const gameStates = await response.json();
        return gameStates;
      } catch (error) {
        console.error('Erro ao buscar jogos salvos:', error);
        throw error;
      }
    }
  }))
);