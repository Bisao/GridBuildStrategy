
import { pgTable, text, serial, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const gameStates = pgTable("game_states", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  data: text("data").notNull(), // JSON string
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const structures = pgTable("structures", {
  id: serial("id").primaryKey(),
  gameStateId: integer("game_state_id").references(() => gameStates.id),
  structureId: text("structure_id").notNull(),
  type: text("type").notNull(),
  x: real("x").notNull(),
  z: real("z").notNull(),
  rotation: real("rotation").notNull().default(0),
});

export const npcs = pgTable("npcs", {
  id: serial("id").primaryKey(),
  gameStateId: integer("game_state_id").references(() => gameStates.id),
  npcId: text("npc_id").notNull(),
  name: text("name").notNull(),
  structureId: text("structure_id").notNull(),
  type: text("type").notNull(),
  x: real("x").notNull(),
  z: real("z").notNull(),
  rotation: real("rotation").default(0),
  animation: text("animation").default("idle"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameStateSchema = createInsertSchema(gameStates).pick({
  userId: true,
  name: true,
  data: true,
});

export const insertStructureSchema = createInsertSchema(structures).pick({
  gameStateId: true,
  structureId: true,
  type: true,
  x: true,
  z: true,
  rotation: true,
});

export const insertNPCSchema = createInsertSchema(npcs).pick({
  gameStateId: true,
  npcId: true,
  name: true,
  structureId: true,
  type: true,
  x: true,
  z: true,
  rotation: true,
  animation: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameState = typeof gameStates.$inferSelect;
export type Structure = typeof structures.$inferSelect;
export type NPC = typeof npcs.$inferSelect;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type InsertStructure = z.infer<typeof insertStructureSchema>;
export type InsertNPC = z.infer<typeof insertNPCSchema>;
