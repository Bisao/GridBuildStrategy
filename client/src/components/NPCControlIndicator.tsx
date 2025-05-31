import React from 'react';

interface NPCControlIndicatorProps {
  npcName: string;
  onStopControl: () => void;
}

export const NPCControlIndicator: React.FC<NPCControlIndicatorProps> = ({ npcName, onStopControl }) => {
  // Component disabled - return null to hide the dialog
  return null;
};