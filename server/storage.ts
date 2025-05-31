
import { users, gameStates, structures, npcs, type User, type InsertUser, type GameState, type Structure, type NPC, type InsertGameState, type InsertStructure, type InsertNPC } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game persistence methods
  saveGameState(gameState: InsertGameState): Promise<GameState>;
  getGameStates(userId: number): Promise<GameState[]>;
  getGameState(id: number): Promise<GameState | undefined>;
  updateGameState(id: number, data: string): Promise<GameState | undefined>;
  deleteGameState(id: number): Promise<boolean>;
  
  saveStructure(structure: InsertStructure): Promise<Structure>;
  getStructures(gameStateId: number): Promise<Structure[]>;
  deleteStructures(gameStateId: number): Promise<boolean>;
  
  saveNPC(npc: InsertNPC): Promise<NPC>;
  getNPCs(gameStateId: number): Promise<NPC[]>;
  deleteNPCs(gameStateId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gameStates: Map<number, GameState>;
  private structures: Map<number, Structure>;
  private npcs: Map<number, NPC>;
  currentUserId: number;
  currentGameStateId: number;
  currentStructureId: number;
  currentNPCId: number;

  constructor() {
    this.users = new Map();
    this.gameStates = new Map();
    this.structures = new Map();
    this.npcs = new Map();
    this.currentUserId = 1;
    this.currentGameStateId = 1;
    this.currentStructureId = 1;
    this.currentNPCId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveGameState(insertGameState: InsertGameState): Promise<GameState> {
    const id = this.currentGameStateId++;
    const now = new Date().toISOString();
    const gameState: GameState = {
      ...insertGameState,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.gameStates.set(id, gameState);
    return gameState;
  }

  async getGameStates(userId: number): Promise<GameState[]> {
    return Array.from(this.gameStates.values()).filter(
      (gameState) => gameState.userId === userId
    );
  }

  async getGameState(id: number): Promise<GameState | undefined> {
    return this.gameStates.get(id);
  }

  async updateGameState(id: number, data: string): Promise<GameState | undefined> {
    const gameState = this.gameStates.get(id);
    if (!gameState) return undefined;
    
    const updated = {
      ...gameState,
      data,
      updatedAt: new Date().toISOString()
    };
    this.gameStates.set(id, updated);
    return updated;
  }

  async deleteGameState(id: number): Promise<boolean> {
    return this.gameStates.delete(id);
  }

  async saveStructure(insertStructure: InsertStructure): Promise<Structure> {
    const id = this.currentStructureId++;
    const structure: Structure = { ...insertStructure, id };
    this.structures.set(id, structure);
    return structure;
  }

  async getStructures(gameStateId: number): Promise<Structure[]> {
    return Array.from(this.structures.values()).filter(
      (structure) => structure.gameStateId === gameStateId
    );
  }

  async deleteStructures(gameStateId: number): Promise<boolean> {
    const toDelete = Array.from(this.structures.entries())
      .filter(([, structure]) => structure.gameStateId === gameStateId)
      .map(([id]) => id);
    
    toDelete.forEach(id => this.structures.delete(id));
    return true;
  }

  async saveNPC(insertNPC: InsertNPC): Promise<NPC> {
    const id = this.currentNPCId++;
    const npc: NPC = { ...insertNPC, id };
    this.npcs.set(id, npc);
    return npc;
  }

  async getNPCs(gameStateId: number): Promise<NPC[]> {
    return Array.from(this.npcs.values()).filter(
      (npc) => npc.gameStateId === gameStateId
    );
  }

  async deleteNPCs(gameStateId: number): Promise<boolean> {
    const toDelete = Array.from(this.npcs.entries())
      .filter(([, npc]) => npc.gameStateId === gameStateId)
      .map(([id]) => id);
    
    toDelete.forEach(id => this.npcs.delete(id));
    return true;
  }
}

export const storage = new MemStorage();
