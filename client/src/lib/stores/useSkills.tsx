
import { create } from 'zustand';

export interface Skill {
  id: string;
  name: string;
  icon: string;
  cooldown: number;
  currentCooldown: number;
  manaCost: number;
  damage?: number;
  healAmount?: number;
  range: number;
  description: string;
  type: 'attack' | 'defense' | 'heal' | 'utility';
}

interface SkillsState {
  skills: Skill[];
  activeSkillId: string | null;
  mana: number;
  maxMana: number;
  
  // Actions
  setActiveSkill: (skillId: string | null) => void;
  useSkill: (skillId: string) => boolean;
  updateCooldowns: (deltaTime: number) => void;
  updateMana: (deltaTime: number) => void;
  consumeMana: (amount: number) => boolean;
  initializeSkills: () => void;
}

const defaultSkills: Skill[] = [
  {
    id: 'basic_attack',
    name: 'Ataque Básico',
    icon: '⚔️',
    cooldown: 1.0,
    currentCooldown: 0,
    manaCost: 10,
    damage: 25,
    range: 2,
    description: 'Ataque corpo a corpo básico',
    type: 'attack'
  },
  {
    id: 'heavy_strike',
    name: 'Golpe Pesado',
    icon: '💥',
    cooldown: 3.0,
    currentCooldown: 0,
    manaCost: 25,
    damage: 50,
    range: 2,
    description: 'Ataque poderoso com dano aumentado',
    type: 'attack'
  },
  {
    id: 'heal',
    name: 'Cura',
    icon: '💚',
    cooldown: 5.0,
    currentCooldown: 0,
    manaCost: 30,
    healAmount: 40,
    range: 0,
    description: 'Restaura vida',
    type: 'heal'
  },
  {
    id: 'dash',
    name: 'Investida',
    icon: '💨',
    cooldown: 4.0,
    currentCooldown: 0,
    manaCost: 20,
    range: 5,
    description: 'Move rapidamente em direção ao alvo',
    type: 'utility'
  },
  {
    id: 'shield_bash',
    name: 'Escudo',
    icon: '🛡️',
    cooldown: 6.0,
    currentCooldown: 0,
    manaCost: 15,
    damage: 15,
    range: 1.5,
    description: 'Ataque defensivo que atordoa',
    type: 'defense'
  }
];

export const useSkills = create<SkillsState>((set, get) => ({
  skills: [],
  activeSkillId: null,
  mana: 100,
  maxMana: 100,

  setActiveSkill: (skillId) => set({ activeSkillId: skillId }),

  useSkill: (skillId) => {
    const { skills, mana } = get();
    const skill = skills.find(s => s.id === skillId);
    
    if (!skill || skill.currentCooldown > 0 || mana < skill.manaCost) {
      return false;
    }

    // Consume mana and start cooldown
    set(state => ({
      mana: Math.max(0, state.mana - skill.manaCost),
      skills: state.skills.map(s => 
        s.id === skillId 
          ? { ...s, currentCooldown: s.cooldown }
          : s
      )
    }));

    return true;
  },

  updateCooldowns: (deltaTime) => {
    set(state => ({
      skills: state.skills.map(skill => ({
        ...skill,
        currentCooldown: Math.max(0, skill.currentCooldown - deltaTime)
      }))
    }));
  },

  updateMana: (deltaTime) => {
    set(state => ({
      mana: Math.min(state.maxMana, state.mana + (deltaTime * 10)) // Regenera 10 mana por segundo
    }));
  },

  consumeMana: (amount) => {
    const { mana } = get();
    if (mana >= amount) {
      set(state => ({ mana: state.mana - amount }));
      return true;
    }
    return false;
  },

  initializeSkills: () => {
    set({ 
      skills: [...defaultSkills],
      mana: 100,
      maxMana: 100
    });
  }
}));
