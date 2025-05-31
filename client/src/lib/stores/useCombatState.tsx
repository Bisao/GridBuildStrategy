
import { create } from "zustand";

export interface Skill {
  id: string;
  name: string;
  icon: string;
  key: string;
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'utility';
  cooldown: number;
  manaCost: number;
  damage?: number;
  healAmount?: number;
  range: number;
  description: string;
  isActive?: boolean;
  remainingCooldown?: number;
}

export interface CombatStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
}

interface CombatState {
  playerStats: CombatStats;
  skills: Skill[];
  activeSkill: string | null;
  combatLog: string[];
  isInCombat: boolean;
  targetId: string | null;
  
  // Actions
  setActiveSkill: (skillId: string | null) => void;
  useSkill: (skillId: string, targetId?: string) => boolean;
  addToCombatLog: (message: string) => void;
  updatePlayerStats: (stats: Partial<CombatStats>) => void;
  takeDamage: (damage: number) => void;
  heal: (amount: number) => void;
  consumeMana: (amount: number) => boolean;
  setInCombat: (inCombat: boolean) => void;
  setTarget: (targetId: string | null) => void;
  updateSkillCooldowns: () => void;
  resetCooldowns: () => void;
}

const defaultSkills: Skill[] = [
  {
    id: 'basic_attack',
    name: 'Ataque Básico',
    icon: '⚔️',
    key: 'Q',
    type: 'damage',
    cooldown: 1000,
    manaCost: 0,
    damage: 25,
    range: 2,
    description: 'Ataque básico corpo a corpo'
  },
  {
    id: 'power_strike',
    name: 'Golpe Poderoso',
    icon: '💥',
    key: 'W',
    type: 'damage',
    cooldown: 3000,
    manaCost: 15,
    damage: 45,
    range: 2,
    description: 'Ataque mais forte com maior dano'
  },
  {
    id: 'fireball',
    name: 'Bola de Fogo',
    icon: '🔥',
    key: 'E',
    type: 'damage',
    cooldown: 2500,
    manaCost: 20,
    damage: 35,
    range: 5,
    description: 'Projétil de fogo à distância'
  },
  {
    id: 'heal',
    name: 'Cura',
    icon: '❤️',
    key: 'R',
    type: 'heal',
    cooldown: 4000,
    manaCost: 25,
    healAmount: 40,
    range: 0,
    description: 'Restaura vida'
  },
  {
    id: 'dash',
    name: 'Investida',
    icon: '🏃',
    key: 'T',
    type: 'utility',
    cooldown: 5000,
    manaCost: 10,
    range: 4,
    description: 'Move rapidamente para frente'
  },
  {
    id: 'shield',
    name: 'Escudo',
    icon: '🛡️',
    key: 'Y',
    type: 'buff',
    cooldown: 8000,
    manaCost: 20,
    range: 0,
    description: 'Aumenta defesa temporariamente'
  },
  {
    id: 'poison',
    name: 'Veneno',
    icon: '☠️',
    key: 'U',
    type: 'debuff',
    cooldown: 6000,
    manaCost: 15,
    damage: 15,
    range: 3,
    description: 'Aplica veneno no inimigo'
  },
  {
    id: 'lightning',
    name: 'Raio',
    icon: '⚡',
    key: 'I',
    type: 'damage',
    cooldown: 3500,
    manaCost: 18,
    damage: 40,
    range: 6,
    description: 'Raio instantâneo'
  },
  {
    id: 'ice_shard',
    name: 'Estilhaço de Gelo',
    icon: '❄️',
    key: 'O',
    type: 'damage',
    cooldown: 2000,
    manaCost: 12,
    damage: 20,
    range: 4,
    description: 'Reduz velocidade do inimigo'
  },
  {
    id: 'ultimate',
    name: 'Devastação',
    icon: '💀',
    key: 'P',
    type: 'damage',
    cooldown: 15000,
    manaCost: 50,
    damage: 100,
    range: 3,
    description: 'Ataque devastador em área'
  }
];

export const useCombatState = create<CombatState>((set, get) => ({
  playerStats: {
    health: 100,
    maxHealth: 100,
    mana: 100,
    maxMana: 100,
    attack: 20,
    defense: 10,
    speed: 5
  },
  skills: defaultSkills.map(skill => ({ ...skill, remainingCooldown: 0 })),
  activeSkill: null,
  combatLog: [],
  isInCombat: false,
  targetId: null,

  setActiveSkill: (skillId) => set({ activeSkill: skillId }),

  useSkill: (skillId, targetId) => {
    const state = get();
    const skill = state.skills.find(s => s.id === skillId);
    
    if (!skill || skill.remainingCooldown! > 0) {
      state.addToCombatLog(`${skill?.name || 'Habilidade'} em cooldown!`);
      return false;
    }

    if (!state.consumeMana(skill.manaCost)) {
      state.addToCombatLog(`Mana insuficiente para ${skill.name}!`);
      return false;
    }

    // Aplicar cooldown
    set((state) => ({
      skills: state.skills.map(s => 
        s.id === skillId 
          ? { ...s, remainingCooldown: s.cooldown }
          : s
      )
    }));

    state.addToCombatLog(`Usou ${skill.name}!`);
    return true;
  },

  addToCombatLog: (message) => {
    set((state) => ({
      combatLog: [...state.combatLog.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]
    }));
  },

  updatePlayerStats: (stats) => {
    set((state) => ({
      playerStats: { ...state.playerStats, ...stats }
    }));
  },

  takeDamage: (damage) => {
    set((state) => {
      const defense = state.playerStats.defense;
      const actualDamage = Math.max(1, damage - defense);
      const newHealth = Math.max(0, state.playerStats.health - actualDamage);
      
      state.addToCombatLog(`Recebeu ${actualDamage} de dano!`);
      
      return {
        playerStats: { ...state.playerStats, health: newHealth }
      };
    });
  },

  heal: (amount) => {
    set((state) => {
      const newHealth = Math.min(state.playerStats.maxHealth, state.playerStats.health + amount);
      state.addToCombatLog(`Curou ${amount} de vida!`);
      
      return {
        playerStats: { ...state.playerStats, health: newHealth }
      };
    });
  },

  consumeMana: (amount) => {
    const state = get();
    if (state.playerStats.mana < amount) return false;
    
    set((state) => ({
      playerStats: { ...state.playerStats, mana: state.playerStats.mana - amount }
    }));
    return true;
  },

  setInCombat: (inCombat) => set({ isInCombat: inCombat }),
  setTarget: (targetId) => set({ targetId }),

  updateSkillCooldowns: () => {
    set((state) => ({
      skills: state.skills.map(skill => ({
        ...skill,
        remainingCooldown: Math.max(0, (skill.remainingCooldown || 0) - 100)
      }))
    }));
  },

  resetCooldowns: () => {
    set((state) => ({
      skills: state.skills.map(skill => ({ ...skill, remainingCooldown: 0 }))
    }));
  }
}));
