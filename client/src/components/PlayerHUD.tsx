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

// PlayerHUD is now integrated into SkillsBar component
export default function PlayerHUD() {
  return null;
}