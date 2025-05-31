
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Game state routes
  app.post("/api/game-states", async (req, res) => {
    try {
      const { userId, name, data } = req.body;
      const gameState = await storage.saveGameState({ userId, name, data });
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to save game state" });
    }
  });

  app.get("/api/game-states/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const gameStates = await storage.getGameStates(userId);
      res.json(gameStates);
    } catch (error) {
      res.status(500).json({ error: "Failed to get game states" });
    }
  });

  app.get("/api/game-state/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const gameState = await storage.getGameState(id);
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to get game state" });
    }
  });

  app.put("/api/game-state/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { data } = req.body;
      const gameState = await storage.updateGameState(id, data);
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to update game state" });
    }
  });

  app.delete("/api/game-state/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGameState(id);
      if (!success) {
        return res.status(404).json({ error: "Game state not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete game state" });
    }
  });

  // Structure routes
  app.post("/api/structures", async (req, res) => {
    try {
      const structureData = req.body;
      const structure = await storage.saveStructure(structureData);
      res.json(structure);
    } catch (error) {
      res.status(500).json({ error: "Failed to save structure" });
    }
  });

  app.get("/api/structures/:gameStateId", async (req, res) => {
    try {
      const gameStateId = parseInt(req.params.gameStateId);
      const structures = await storage.getStructures(gameStateId);
      res.json(structures);
    } catch (error) {
      res.status(500).json({ error: "Failed to get structures" });
    }
  });

  // NPC routes
  app.post("/api/npcs", async (req, res) => {
    try {
      const npcData = req.body;
      const npc = await storage.saveNPC(npcData);
      res.json(npc);
    } catch (error) {
      res.status(500).json({ error: "Failed to save NPC" });
    }
  });

  app.get("/api/npcs/:gameStateId", async (req, res) => {
    try {
      const gameStateId = parseInt(req.params.gameStateId);
      const npcs = await storage.getNPCs(gameStateId);
      res.json(npcs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get NPCs" });
    }
  });

  // Complete game data save/load
  app.post("/api/save-game", async (req, res) => {
    try {
      const { userId, name, structures, npcs, gameState } = req.body;
      
      // Save game state
      const savedGameState = await storage.saveGameState({
        userId,
        name,
        data: JSON.stringify(gameState)
      });

      // Save structures
      const savedStructures = await Promise.all(
        structures.map((structure: any) =>
          storage.saveStructure({
            gameStateId: savedGameState.id,
            structureId: structure.id,
            type: structure.type,
            x: structure.x,
            z: structure.z,
            rotation: structure.rotation
          })
        )
      );

      // Save NPCs
      const savedNPCs = await Promise.all(
        npcs.map((npc: any) =>
          storage.saveNPC({
            gameStateId: savedGameState.id,
            npcId: npc.id,
            name: npc.name,
            structureId: npc.structureId,
            type: npc.type,
            x: npc.position.x,
            z: npc.position.z,
            rotation: npc.rotation || 0,
            animation: npc.animation || "idle"
          })
        )
      );

      res.json({
        gameState: savedGameState,
        structures: savedStructures,
        npcs: savedNPCs
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to save complete game" });
    }
  });

  app.get("/api/load-game/:gameStateId", async (req, res) => {
    try {
      const gameStateId = parseInt(req.params.gameStateId);
      
      const gameState = await storage.getGameState(gameStateId);
      if (!gameState) {
        return res.status(404).json({ error: "Game state not found" });
      }

      const structures = await storage.getStructures(gameStateId);
      const npcs = await storage.getNPCs(gameStateId);

      res.json({
        gameState: {
          ...gameState,
          parsedData: JSON.parse(gameState.data)
        },
        structures,
        npcs
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to load game" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
