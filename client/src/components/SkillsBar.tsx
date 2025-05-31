
import { useEffect, useRef } from "react";
import { useSkills } from "../lib/stores/useSkills";
import { useGameState } from "../lib/stores/useGameState";
import * as THREE from "three";

export default function SkillsBar() {
  const { 
    skills, 
    activeSkillId, 
    setActiveSkill, 
    useSkill, 
    updateCooldowns, 
    initializeSkills 
  } = useSkills();
  
  const { 
    controlledNPCId, 
    createdNPCs, 
    enemies, 
    removeEnemy 
  } = useGameState();
  
  const lastUpdateTime = useRef(performance.now());

  // Initialize skills on mount
  useEffect(() => {
    initializeSkills();
  }, [initializeSkills]);

  // Update cooldowns
  useEffect(() => {
    const updateLoop = () => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = currentTime;
      
      updateCooldowns(deltaTime);
      requestAnimationFrame(updateLoop);
    };
    
    const animationId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animationId);
  }, [updateCooldowns]);

  // Handle skill activation
  const handleSkillClick = (skillId: string) => {
    if (!controlledNPCId) {
      console.log("Nenhum NPC controlado!");
      return;
    }

    const skill = skills.find(s => s.id === skillId);
    if (!skill || skill.currentCooldown > 0) {
      return;
    }

    // Ativar skill imediatamente
    executeActiveSkill(skillId);
  };

  // Handle skill usage on world click
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const keyMap: { [key: string]: string } = {
        '1': 'basic_attack',
        '2': 'heavy_strike', 
        '3': 'heal',
        '4': 'dash',
        '5': 'shield_bash'
      };

      const skillId = keyMap[event.key];
      if (skillId) {
        handleSkillClick(skillId);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeSkillId, controlledNPCId]);

  // Execute skill when active skill is used
  const executeActiveSkill = (skillId: string, targetPosition?: THREE.Vector3) => {
    if (!controlledNPCId) return;

    const skill = skills.find(s => s.id === skillId);
    const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
    
    if (!skill || !controlledNPC || !useSkill(skillId)) {
      return;
    }

    console.log(`Executando skill: ${skill.name}`);

    switch (skill.type) {
      case 'attack':
        executeAttackSkill(skill, controlledNPC, targetPosition);
        break;
      case 'heal':
        executeHealSkill(skill, controlledNPC);
        break;
      case 'utility':
        executeUtilitySkill(skill, controlledNPC, targetPosition);
        break;
      case 'defense':
        executeDefenseSkill(skill, controlledNPC, targetPosition);
        break;
    }
  };

  const executeAttackSkill = (skill: any, npc: any, targetPosition?: THREE.Vector3) => {
    // Find enemies in range
    const npcPos = new THREE.Vector3(npc.position.x, 0, npc.position.z);
    
    enemies.forEach(enemy => {
      const enemyPos = new THREE.Vector3(enemy.position.x, 0, enemy.position.z);
      const distance = npcPos.distanceTo(enemyPos);
      
      if (distance <= skill.range) {
        const damage = skill.damage || 25;
        const takeDamageFunc = (window as any)[`enemy_${enemy.id}_takeDamage`];
        
        if (takeDamageFunc) {
          takeDamageFunc(damage);
          console.log(`${npc.name} usou ${skill.name} e causou ${damage} de dano!`);
        }
      }
    });
  };

  const executeHealSkill = (skill: any, npc: any) => {
    const healAmount = skill.healAmount || 40;
    console.log(`${npc.name} se curou em ${healAmount} pontos de vida!`);
    // Aqui você implementaria a lógica de cura no NPC
  };

  const executeUtilitySkill = (skill: any, npc: any, targetPosition?: THREE.Vector3) => {
    if (skill.id === 'dash' && targetPosition) {
      console.log(`${npc.name} fez uma investida!`);
      // Implementar movimento rápido
    }
  };

  const executeDefenseSkill = (skill: any, npc: any, targetPosition?: THREE.Vector3) => {
    console.log(`${npc.name} usou ${skill.name} defensivamente!`);
    // Implementar efeitos defensivos
  };

  // Function to execute skill on specific enemy
  const executeSkillOnEnemy = (enemyId: string) => {
    if (!controlledNPCId) return;

    const enemy = enemies.find(e => e.id === enemyId);
    const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
    
    if (!enemy || !controlledNPC) return;

    // Check distance to enemy
    const npcPos = new THREE.Vector3(controlledNPC.position.x, 0, controlledNPC.position.z);
    const enemyPos = new THREE.Vector3(enemy.position.x, 0, enemy.position.z);
    const distance = npcPos.distanceTo(enemyPos);

    // Use basic attack skill
    const basicAttack = skills.find(s => s.id === 'basic_attack');
    if (!basicAttack || basicAttack.currentCooldown > 0) {
      console.log("Ataque básico em cooldown!");
      return;
    }

    if (distance <= basicAttack.range) {
      if (useSkill('basic_attack')) {
        const damage = basicAttack.damage || 25;
        const takeDamageFunc = (window as any)[`enemy_${enemy.id}_takeDamage`];
        
        if (takeDamageFunc) {
          takeDamageFunc(damage);
          console.log(`${controlledNPC.name} atacou o inimigo com ${basicAttack.name}!`);
        }
      }
    } else {
      console.log("Inimigo muito longe para atacar!");
    }
  };

  // Expose functions globally for world interaction
  useEffect(() => {
    (window as any).executeActiveSkill = executeActiveSkill;
    (window as any).executeSkillOnEnemy = executeSkillOnEnemy;
    (window as any).enemies = enemies;
    return () => {
      delete (window as any).executeActiveSkill;
      delete (window as any).executeSkillOnEnemy;
      delete (window as any).enemies;
    };
  }, [activeSkillId, controlledNPCId, skills, enemies]);

  if (!controlledNPCId) {
    return null;
  }

  const getCooldownPercentage = (skill: any) => {
    return skill.cooldown > 0 ? (skill.currentCooldown / skill.cooldown) * 100 : 0;
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
      <div className="bg-gray-800/95 border-2 border-gray-600 rounded-lg p-3">
        <div className="flex gap-2 items-center">
          <div className="text-xs text-gray-300 mr-2">Skills:</div>
          {skills.map((skill, index) => (
            <div
              key={skill.id}
              className="relative group"
            >
              <button
                onClick={() => handleSkillClick(skill.id)}
                className={`
                  w-12 h-12 rounded-lg border-2 transition-all duration-200 relative overflow-hidden
                  border-gray-500 bg-gray-700 hover:border-gray-400
                  ${skill.currentCooldown > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                disabled={skill.currentCooldown > 0}
                title={`${skill.name} (${index + 1}) - ${skill.description}`}
              >
                <div className="text-lg">{skill.icon}</div>
                
                {/* Cooldown overlay */}
                {skill.currentCooldown > 0 && (
                  <div
                    className="absolute inset-0 bg-gray-900/70 flex items-center justify-center text-xs text-white font-bold"
                    style={{
                      background: `conic-gradient(from 0deg, transparent ${100 - getCooldownPercentage(skill)}%, rgba(0,0,0,0.8) ${100 - getCooldownPercentage(skill)}%)`
                    }}
                  >
                    {Math.ceil(skill.currentCooldown)}
                  </div>
                )}
                
                {/* Key indicator */}
                <div className="absolute -bottom-1 -right-1 bg-gray-600 text-white text-xs rounded w-4 h-4 flex items-center justify-center">
                  {index + 1}
                </div>
              </button>

              {/* Tooltip */}
              <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                <div className="font-semibold">{skill.name}</div>
                <div>{skill.description}</div>
                <div className="text-gray-400">Tecla: {index + 1}</div>
                {skill.damage && <div className="text-red-400">Dano: {skill.damage}</div>}
                {skill.healAmount && <div className="text-green-400">Cura: {skill.healAmount}</div>}
                <div className="text-blue-400">Alcance: {skill.range}m</div>
                <div className="text-yellow-400">Cooldown: {skill.cooldown}s</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-400 mt-2 text-center">
          Pressione os números (1-5) para usar skills
          <br />
          <span className="text-yellow-400">Skills de ataque: clique no inimigo para focar</span>
        </div>
      </div>
    </div>
  );
}
