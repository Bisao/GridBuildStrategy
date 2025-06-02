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
  health?: number;
  maxHealth?: number;
  mana?: number;
  maxMana?: number;
}

interface Enemy {
  id: string;
  position: { x: number; z: number };
  health: number;
}

interface WolfSpawn {
  id: string;
  position: { x: number; z: number };
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
  enemies: Enemy[];
  wolfSpawns: WolfSpawn[];
  currentGameStateId: number | null;
  currentGameStateName: string | null;
  isSaving: boolean;
  isLoading: boolean;
  autoSaveEnabled: boolean;
  lastSaveTime: string | null;

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

  addEnemy: (enemy: Enemy) => void;
  removeEnemy: (id: string) => void;
  spawnTestEnemy: () => void;

  addWolfSpawn: (position: { x: number; z: number }) => void;
  removeWolfSpawn: (spawnId: string) => void;
  spawnWolfAtSpawn: (spawnId: string) => void;

  // Persistence actions
  saveGame: (name: string, structures: any[]) => Promise<void>;
  updateCurrentSave: (structures: any[]) => Promise<void>;
  autoSave: (structures: any[]) => Promise<void>;
  loadGame: (gameStateId: number) => Promise<void>;
  getGameStates: () => Promise<any[]>;
  setCurrentGameStateId: (id: number | null) => void;
  setCurrentGameStateName: (name: string | null) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
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
    enemies: [],
    wolfSpawns: [],
    currentGameStateId: null,
    currentGameStateName: null,
    isSaving: false,
    isLoading: false,
    autoSaveEnabled: true,
    lastSaveTime: null,

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
      const npcWithStats = {
        ...npc,
        animation: npc.animation || "idle",
        health: npc.health || 100,
        maxHealth: npc.maxHealth || 100,
        mana: npc.mana || 100,
        maxMana: npc.maxMana || 100
      };
      set((state) => ({
        createdNPCs: [...state.createdNPCs, npcWithStats]
      }));
      console.log(`NPC "${npc.name}" criado com sucesso na estrutura ${npc.structureId}`);
    },

    updateNPC: (npcId, updates) => {
      set((state) => {
        const { controlledNPCId, setControlledNPCId } = get();

        return {
          createdNPCs: state.createdNPCs.map(npc => {
            if (npc.id === npcId) {
              const updatedNPC = { ...npc, ...updates };

              // Check if NPC died (HP reached 0)
              if (updatedNPC.health <= 0 && npc.health > 0) {
                console.log(`${npc.name} morreu! Teleportando para casa...`);

                // If this was the controlled NPC, release control
                if (controlledNPCId === npcId) {
                  setControlledNPCId(null);
                  console.log(`Controle do NPC ${npc.name} perdido devido à morte`);
                }

                // Get home position based on structure type - spawn exactly on the house grid position
                const getHomePosition = (structureId: string) => {
                  const coords = structureId.split('-').slice(1).map(Number);
                  const baseX = coords[0] || 0;
                  const baseZ = coords[1] || 0;

                  // Return exact house position on the grid
                  return { x: baseX, z: baseZ };
                };

                const homePosition = getHomePosition(npc.structureId);

                // Teleport to home with full health and mana
                return {
                  ...updatedNPC,
                  position: homePosition,
                  health: updatedNPC.maxHealth || 100,
                  mana: updatedNPC.maxMana || 100,
                  animation: "idle",
                  rotation: 0 // Reset rotation
                };
              }

              return updatedNPC;
            }
            return npc;
          })
        };
      });
    },

    removeNPC: (npcId) => {
      set((state) => ({
        createdNPCs: state.createdNPCs.filter(npc => npc.id !== npcId)
      }));
    },

    getNPCsByStructure: (structureId) => {
      return get().createdNPCs.filter(npc => npc.structureId === structureId);
    },

    addEnemy: (enemy: Enemy) => {
      set((state) => ({
        enemies: [...state.enemies, enemy]
      }));
    },

    removeEnemy: (id: string) => {
      set((state) => ({
        enemies: state.enemies.filter(enemy => enemy.id !== id)
      }));
    },

    spawnTestEnemy: () => {
      const { controlledNPCId, createdNPCs } = get();
      const controlledNPC = controlledNPCId ? createdNPCs.find(npc => npc.id === controlledNPCId) : null;

      if (controlledNPC) {
        // Spawn enemy near controlled NPC
        const angle = Math.random() * Math.PI * 2;
        const distance = 3 + Math.random() * 2;
        const enemy: Enemy = {
          id: `enemy-${Date.now()}-${Math.random()}`,
          position: {
            x: controlledNPC.position.x + Math.cos(angle) * distance,
            z: controlledNPC.position.z + Math.sin(angle) * distance
          },
          health: 100
        };

        set((state) => ({
          enemies: [...state.enemies, enemy]
        }));
      } else {
        // Spawn at random location if no controlled NPC
        const enemy: Enemy = {
          id: `enemy-${Date.now()}-${Math.random()}`,
          position: {
            x: (Math.random() - 0.5) * 10,
            z: (Math.random() - 0.5) * 10
          },
          health: 100
        };

        set((state) => ({
          enemies: [...state.enemies, enemy]
        }));
      }
    },

    addWolfSpawn: (position) => {
      const newSpawn = {
        id: `wolfSpawn-${Date.now()}-${Math.random()}`,
        position: position,
      };
      set((state) => ({
        wolfSpawns: [...state.wolfSpawns, newSpawn],
      }));
      get().spawnWolfAtSpawn(newSpawn.id); // Spawn immediately after creation
    },

    removeWolfSpawn: (spawnId) => {
      set((state) => ({
        wolfSpawns: state.wolfSpawns.filter((spawn) => spawn.id !== spawnId),
      }));
    },

    spawnWolfAtSpawn: (spawnId) => {
      const spawn = get().wolfSpawns.find((s) => s.id === spawnId);
      if (spawn) {
        const enemy: Enemy = {
          id: `wolf-${Date.now()}-${Math.random()}`,
          position: { ...spawn.position },
          health: 50,
        };
        set((state) => ({
          enemies: [...state.enemies, enemy],
        }));

        // Set timeout to respawn wolf after 30 seconds (30000 ms)
        setTimeout(() => {
          const wolfIsAlive = get().enemies.some((enemy) => enemy.id === enemy.id);
          if(!wolfIsAlive){
            get().spawnWolfAtSpawn(spawnId)
          }
        }, 30000);
      }
    },

    setCurrentGameStateId: (id) => {
      set({ currentGameStateId: id });
    },

    setCurrentGameStateName: (name) => {
      set({ currentGameStateName: name });
    },

    setAutoSaveEnabled: (enabled) => {
      set({ autoSaveEnabled: enabled });
    },

    updateCurrentSave: async (structures) => {
      const state = get();
      if (!state.currentGameStateId || !state.currentGameStateName) {
        console.warn('Nenhum save atual para atualizar');
        return;
      }

      set({ isSaving: true });
      try {
        const gameData = {
          userId: 1,
          name: state.currentGameStateName,
          structures,
          npcs: state.createdNPCs,
          gameState: {
            selectedStructure: state.selectedStructure,
            createdNPCs: state.createdNPCs
          }
        };

        const response = await fetch(`/api/update-game/${state.currentGameStateId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gameData),
        });

        if (!response.ok) {
          throw new Error('Failed to update game');
        }

        set({ lastSaveTime: new Date().toISOString() });
        console.log('Save atualizado automaticamente!');
      } catch (error) {
        console.error('Erro ao atualizar save:', error);
        throw error;
      } finally {
        set({ isSaving: false });
      }
    },

    autoSave: async (structures) => {
      const state = get();
      if (!state.autoSaveEnabled) return;

      if (state.currentGameStateId && state.currentGameStateName) {
        await state.updateCurrentSave(structures);
      } else {
        // Se não há save atual, criar um novo com nome automático
        const autoSaveName = `AutoSave_${new Date().toLocaleString('pt-BR').replace(/[\/,:]/g, '-')}`;
        await state.saveGame(autoSaveName, structures);
      }
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
        set({ 
          currentGameStateId: result.gameState.id,
          currentGameStateName: name,
          lastSaveTime: new Date().toISOString()
        });
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
          currentGameStateName: result.gameState.name,
          selectedStructure: null,
          isPlacementMode: false,
          lastSaveTime: result.gameState.updatedAt
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