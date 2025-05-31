
import { create } from 'zustand';

export interface Skill {
  id: string;
  name: string;
  icon: string;
  cooldown: number;
  currentCooldown: number;
  damage?: number;
  healAmount?: number;
  range: number;
  description: string;
  type: 'attack' | 'defense' | 'heal' | 'utility';
}

interface SkillsState {
  skills: Skill[];
  activeSkillId: string | null;
  
  // Actions
  setActiveSkill: (skillId: string | null) => void;
  useSkill: (skillId: string) => boolean;
  updateCooldowns: (deltaTime: number) => void;
  initializeSkills: () => void;
}

const defaultSkills: Skill[] = [
  {
    id: 'basic_attack',
    name: 'Ataque Básico',
    icon: '⚔️',
    cooldown: 1.0,
    currentCooldown: 0,
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
    damage: 15,
    range: 1.5,
    description: 'Ataque defensivo que atordoa',
    type: 'defense'
  }
];

export const useSkills = create<SkillsState>((set, get) => ({
  skills: [],
  activeSkillId: null,

  setActiveSkill: (skillId) => set({ activeSkillId: skillId }),

  useSkill: (skillId) => {
    const { skills } = get();
    const skill = skills.find(s => s.id === skillId);
    
    if (!skill || skill.currentCooldown > 0) {
      return false;
    }

    // Start cooldown
    set(state => ({
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

  initializeSkills: () => {
    set({ skills: [...defaultSkills] });
  }
}));
