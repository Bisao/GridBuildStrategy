
import React from 'react';
import { useGameState } from '../lib/stores/useGameState';

interface Skill {
  id: string;
  key: string;
  icon: string;
  name: string;
  cooldown?: number;
  isActive?: boolean;
}

const SkillsBar: React.FC = () => {
  const { controlledNPCId } = useGameState();

  // Skills padrão (pode ser expandido para diferentes tipos de NPC)
  const skills: Skill[] = [
    { id: 'attack1', key: 'Q', icon: '⚔️', name: 'Ataque Básico' },
    { id: 'attack2', key: 'W', icon: '🗡️', name: 'Ataque Especial' },
    { id: 'attack3', key: 'E', icon: '⚡', name: 'Ataque Rápido' },
    { id: 'defend', key: 'R', icon: '🛡️', name: 'Defender' },
    { id: 'heal', key: 'T', icon: '❤️', name: 'Curar' },
    { id: 'special1', key: 'Y', icon: '🌟', name: 'Habilidade 1' },
    { id: 'special2', key: 'U', icon: '🔥', name: 'Habilidade 2' },
    { id: 'utility1', key: 'I', icon: '🏃', name: 'Velocidade' },
    { id: 'utility2', key: 'O', icon: '👁️', name: 'Visão' },
    { id: 'ultimate', key: 'P', icon: '💥', name: 'Ultimate' },
  ];

  const handleSkillClick = (skill: Skill) => {
    if (!controlledNPCId) return;
    console.log(`Usando habilidade: ${skill.name} (${skill.key})`);
    // Aqui você pode implementar a lógica da habilidade
  };

  // Só mostra a barra se um NPC estiver sendo controlado
  if (!controlledNPCId) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-600/50 shadow-2xl">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="relative group"
          >
            <button
              onClick={() => handleSkillClick(skill)}
              className="w-12 h-12 bg-gray-700/80 hover:bg-gray-600/80 border-2 border-gray-500/50 hover:border-gray-400/70 rounded-lg flex flex-col items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95"
              title={skill.name}
            >
              {/* Ícone da habilidade */}
              <span className="text-lg mb-0.5">{skill.icon}</span>
              
              {/* Tecla de atalho */}
              <span className="text-xs text-gray-300 font-bold leading-none">
                {skill.key}
              </span>
              
              {/* Indicador de cooldown (se houver) */}
              {skill.cooldown && (
                <div className="absolute inset-0 bg-gray-900/60 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{skill.cooldown}</span>
                </div>
              )}
              
              {/* Indicador de ativo */}
              {skill.isActive && (
                <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg animate-pulse"></div>
              )}
            </button>
            
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {skill.name} ({skill.key})
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Indicador de mana/energia (opcional) */}
      <div className="mt-2 flex justify-center">
        <div className="bg-blue-600/80 h-2 w-48 rounded-full overflow-hidden border border-blue-400/50">
          <div className="bg-blue-400 h-full w-full transition-all duration-300"></div>
        </div>
      </div>
    </div>
  );
};

export default SkillsBar;
