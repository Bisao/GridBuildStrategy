
import React from 'react';
import { useGameState } from '../lib/stores/useGameState';

interface CircularBarProps {
  value: number;
  maxValue: number;
  color: string;
  size: number;
  strokeWidth: number;
  label: string;
}

const CircularBar: React.FC<CircularBarProps> = ({ 
  value, 
  maxValue, 
  color, 
  size, 
  strokeWidth, 
  label 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`
          }}
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <div className="text-lg font-bold">{Math.ceil(value)}</div>
        <div className="text-xs opacity-75">{maxValue}</div>
      </div>
      
      {/* Label */}
      <div className="mt-2 text-xs text-white font-medium opacity-80">
        {label}
      </div>
    </div>
  );
};

export default function PlayerHUD() {
  const { controlledNPCId } = useGameState();
  
  // Mock player stats - você pode integrar com o sistema de combate depois
  const playerStats = {
    health: 85,
    maxHealth: 100,
    mana: 60,
    maxMana: 100
  };

  // Só mostra o HUD se há um NPC controlado
  if (!controlledNPCId) {
    return null;
  }

  return (
    <>
      {/* Health Circle - Left side */}
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-20">
        <CircularBar
          value={playerStats.health}
          maxValue={playerStats.maxHealth}
          color="#ef4444" // red-500
          size={80}
          strokeWidth={6}
          label="VIDA"
        />
      </div>

      {/* Mana Circle - Right side */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-20">
        <CircularBar
          value={playerStats.mana}
          maxValue={playerStats.maxMana}
          color="#3b82f6" // blue-500
          size={80}
          strokeWidth={6}
          label="MANA"
        />
      </div>
    </>
  );
}
