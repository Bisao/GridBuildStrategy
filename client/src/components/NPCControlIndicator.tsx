import React from 'react';

interface NPCControlIndicatorProps {
  npcName: string;
  onStopControl: () => void;
}

export default function NPCControlIndicator({ npcName, onStopControl }: NPCControlIndicatorProps) {
  // Component disabled - return null to hide the dialog
  return null;
}