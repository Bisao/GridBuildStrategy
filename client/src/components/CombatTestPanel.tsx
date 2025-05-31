
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useGameState } from "../lib/stores/useGameState";
import { useCombatState } from "../lib/stores/useCombatState";
import { Sword, Target, Shield, Zap, Heart } from "lucide-react";

interface CombatTestPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CombatTestPanel({ isOpen, onClose }: CombatTestPanelProps) {
  const { enemies, spawnTestEnemy, removeEnemy, controlledNPCId, createdNPCs } = useGameState();
  const { 
    combatLog, 
    playerStats, 
    takeDamage, 
    heal, 
    updatePlayerStats, 
    resetCooldowns,
    addToCombatLog 
  } = useCombatState();

  const handleSpawnEnemy = () => {
    spawnTestEnemy();
    addToCombatLog("Inimigo spawnou!");
  };

  const handleSpawnMultipleEnemies = () => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => spawnTestEnemy(), i * 200);
    }
    addToCombatLog("3 inimigos spawnaram!");
  };

  const handleClearAllEnemies = () => {
    enemies.forEach(enemy => removeEnemy(enemy.id));
    addToCombatLog("Todos os inimigos foram removidos!");
  };

  const handleTestDamage = () => {
    takeDamage(20);
  };

  const handleTestHeal = () => {
    heal(30);
  };

  const handleResetCooldowns = () => {
    resetCooldowns();
    addToCombatLog("Todos os cooldowns foram resetados!");
  };

  const handleRestoreResources = () => {
    updatePlayerStats({
      health: playerStats.maxHealth,
      mana: playerStats.maxMana
    });
    addToCombatLog("Vida e mana restauradas!");
  };

  const handleBoostStats = () => {
    updatePlayerStats({
      attack: playerStats.attack + 10,
      defense: playerStats.defense + 5,
      speed: playerStats.speed + 2
    });
    addToCombatLog("Atributos aumentados temporariamente!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 left-4 z-20">
      <Card className="w-80 bg-gray-800/95 border-gray-600 text-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sword size={20} className="text-red-500" />
            Sistema de Combate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-300">
            Teste o sistema de combate avançado com skills, cooldowns e stats
          </div>

          {/* Enemy Controls */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-yellow-400">Inimigos:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleSpawnEnemy}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <Target size={14} className="mr-1" />
                Spawn 1
              </Button>
              <Button
                onClick={handleSpawnMultipleEnemies}
                className="bg-red-700 hover:bg-red-800 text-white"
                size="sm"
              >
                <Target size={14} className="mr-1" />
                Spawn 3
              </Button>
            </div>
            <Button
              onClick={handleClearAllEnemies}
              className="bg-gray-600 hover:bg-gray-700 text-white w-full"
              size="sm"
            >
              <Shield size={14} className="mr-1" />
              Limpar Todos
            </Button>
          </div>

          {/* Player Stats */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-yellow-400">Stats do Jogador:</h3>
            <div className="text-xs space-y-1 bg-gray-900/50 p-2 rounded">
              <div className="flex justify-between">
                <span>❤️ Vida:</span>
                <span className="text-red-400">{playerStats.health}/{playerStats.maxHealth}</span>
              </div>
              <div className="flex justify-between">
                <span>💙 Mana:</span>
                <span className="text-blue-400">{playerStats.mana}/{playerStats.maxMana}</span>
              </div>
              <div className="flex justify-between">
                <span>⚔️ Ataque:</span>
                <span className="text-orange-400">{playerStats.attack}</span>
              </div>
              <div className="flex justify-between">
                <span>🛡️ Defesa:</span>
                <span className="text-green-400">{playerStats.defense}</span>
              </div>
              <div className="flex justify-between">
                <span>⚡ Velocidade:</span>
                <span className="text-purple-400">{playerStats.speed}</span>
              </div>
            </div>
          </div>

          {/* Combat Testing */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-yellow-400">Testes de Combate:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleTestDamage}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <Sword size={14} className="mr-1" />
                Dano -20
              </Button>
              <Button
                onClick={handleTestHeal}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Heart size={14} className="mr-1" />
                Cura +30
              </Button>
            </div>
          </div>

          {/* Utility Functions */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-yellow-400">Utilitários:</h3>
            <div className="space-y-1">
              <Button
                onClick={handleRestoreResources}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                size="sm"
              >
                <Heart size={14} className="mr-1" />
                Restaurar Vida/Mana
              </Button>
              <Button
                onClick={handleResetCooldowns}
                className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                size="sm"
              >
                <Zap size={14} className="mr-1" />
                Reset Cooldowns
              </Button>
              <Button
                onClick={handleBoostStats}
                className="bg-yellow-600 hover:bg-yellow-700 text-white w-full"
                size="sm"
              >
                <Sword size={14} className="mr-1" />
                Boost Stats
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-yellow-400">Status:</h3>
            <div className="text-xs space-y-1">
              <div>Inimigos ativos: {enemies.length}</div>
              <div>NPC controlado: {controlledNPCId ? '✓' : '✗'}</div>
            </div>
          </div>

          {/* Combat Log */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-yellow-400">Log de Combate:</h3>
            <div className="bg-gray-900/50 p-2 rounded text-xs max-h-24 overflow-y-auto">
              {combatLog.length === 0 ? (
                <div className="text-gray-500">Nenhuma ação ainda...</div>
              ) : (
                combatLog.slice(-5).map((log, index) => (
                  <div key={index} className="text-gray-300">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-400 border-t border-gray-600 pt-2">
            <div>• Use as teclas Q-P para habilidades</div>
            <div>• Diferentes tipos: Dano, Cura, Buff, Debuff</div>
            <div>• Sistema de cooldown e mana</div>
            <div>• Alcance das habilidades varia</div>
          </div>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            size="sm"
          >
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
