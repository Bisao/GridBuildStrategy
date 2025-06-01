
import React from 'react';
import { useGameState } from '../lib/stores/useGameState';

interface HUDIconsProps {
  onOpenCombatPanel: () => void;
  onOpenStructurePanel: () => void;
}

export default function HUDIcons({ onOpenCombatPanel, onOpenStructurePanel }: HUDIconsProps) {
  const { setStructurePanelOpen } = useGameState();

  const handleStructuresClick = () => {
    setStructurePanelOpen(true);
    onOpenStructurePanel();
  };

  return (
    <div className="absolute top-4 right-4 pointer-events-auto">
      <div className="flex gap-1">
        {/* Interface Icons */}
        {[
          { icon: '🏗️', title: 'Estruturas', action: 'structures' },
          { icon: '⚔️', title: 'Combate', action: 'combat' },
          { icon: '🛡️', title: 'Proteção', action: 'shield' }
        ].map((item, index) => (
          <button 
            key={index} 
            className="w-8 h-8 bg-black/70 border border-yellow-600/50 rounded-md flex items-center justify-center hover:bg-black/90 transition-colors"
            title={item.title}
            onClick={() => {
              if (item.action === 'structures') {
                handleStructuresClick();
              } else if (item.action === 'combat') {
                onOpenCombatPanel();
              }
            }}
          >
            <span className="text-sm">{item.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
