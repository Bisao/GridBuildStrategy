
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Save, FolderOpen, Trash2 } from 'lucide-react';
import { useGameState } from '../lib/stores/useGameState';

interface SaveLoadPanelProps {
  isOpen: boolean;
  onClose: () => void;
  structures: any[];
}

export default function SaveLoadPanel({ isOpen, onClose, structures }: SaveLoadPanelProps) {
  const { 
    saveGame, 
    updateCurrentSave, 
    loadGame, 
    getGameStates, 
    isSaving, 
    isLoading, 
    currentGameStateId, 
    currentGameStateName,
    autoSaveEnabled,
    setAutoSaveEnabled,
    lastSaveTime
  } = useGameState();
  const [saveName, setSaveName] = useState('');
  const [gameStates, setGameStates] = useState<any[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadGameStates();
    }
  }, [isOpen]);

  const loadGameStates = async () => {
    setIsLoadingStates(true);
    try {
      const states = await getGameStates();
      setGameStates(states);
    } catch (error) {
      console.error('Erro ao carregar lista de saves:', error);
    } finally {
      setIsLoadingStates(false);
    }
  };

  const handleSave = async () => {
    if (!saveName.trim()) {
      alert('Por favor, digite um nome para o save');
      return;
    }

    try {
      await saveGame(saveName.trim(), structures);
      setSaveName('');
      await loadGameStates(); // Reload the list
      alert('Jogo salvo com sucesso!');
    } catch (error) {
      alert('Erro ao salvar o jogo');
    }
  };

  const handleUpdateCurrentSave = async () => {
    if (!currentGameStateId || !currentGameStateName) {
      alert('Nenhum save atual para atualizar');
      return;
    }

    if (confirm(`Atualizar o save "${currentGameStateName}"?`)) {
      try {
        await updateCurrentSave(structures);
        await loadGameStates(); // Reload the list
        alert('Save atualizado com sucesso!');
      } catch (error) {
        alert('Erro ao atualizar o save');
      }
    }
  };

  const handleLoad = async (gameStateId: number) => {
    if (confirm('Carregar este save? O progresso atual será perdido.')) {
      try {
        await loadGame(gameStateId);
        onClose();
        alert('Jogo carregado com sucesso!');
        // Reload page to reflect loaded structures
        window.location.reload();
      } catch (error) {
        alert('Erro ao carregar o jogo');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 max-h-[80vh] overflow-hidden bg-gray-800/95 border-gray-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">
            Salvar / Carregar Jogo
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={16} />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Save Section */}
          <div className="space-y-3">
            <h3 className="font-medium text-green-400">Salvar Jogo</h3>
            
            {/* Update Current Save */}
            {currentGameStateId && currentGameStateName && (
              <div className="p-3 bg-blue-900/20 border border-blue-600 rounded">
                <div className="text-sm font-medium text-blue-300 mb-2">
                  Save Atual: {currentGameStateName}
                </div>
                <Button
                  onClick={handleUpdateCurrentSave}
                  disabled={isSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  {isSaving ? 'Salvando...' : 'Atualizar Save Atual'}
                </Button>
                {lastSaveTime && (
                  <div className="text-xs text-gray-400 mt-1">
                    Último save: {new Date(lastSaveTime).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            )}

            {/* Create New Save */}
            <div className="flex gap-2">
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Nome do novo save..."
                className="bg-gray-700 border-gray-600 text-white"
                maxLength={50}
              />
              <Button
                onClick={handleSave}
                disabled={isSaving || !saveName.trim()}
                className="bg-green-600 hover:bg-green-700 text-white px-3"
              >
                {isSaving ? '...' : <Save size={16} />}
              </Button>
            </div>

            {/* Auto-save Settings */}
            <div className="p-2 bg-gray-700/30 rounded text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="rounded"
                />
                <span className="text-gray-300">Auto-save ativo</span>
              </label>
              <div className="text-gray-400 mt-1">
                Salva automaticamente ao posicionar estruturas
              </div>
            </div>

            <div className="text-xs text-gray-400">
              Estruturas: {structures.length} | NPCs: {useGameState.getState().createdNPCs.length}
            </div>
          </div>

          {/* Load Section */}
          <div className="space-y-3">
            <h3 className="font-medium text-blue-400">Carregar Jogo</h3>
            
            {isLoadingStates ? (
              <div className="text-center text-gray-400 py-4">
                Carregando saves...
              </div>
            ) : gameStates.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                Nenhum save encontrado
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {gameStates.map((gameState) => (
                  <div
                    key={gameState.id}
                    className={`p-3 rounded border ${
                      currentGameStateId === gameState.id
                        ? 'border-green-500 bg-green-900/20'
                        : 'border-gray-600 bg-gray-700/50'
                    } hover:bg-gray-600/50 transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{gameState.name}</div>
                        <div className="text-xs text-gray-400">
                          {formatDate(gameState.updatedAt)}
                        </div>
                        {currentGameStateId === gameState.id && (
                          <div className="text-xs text-green-400 font-medium">
                            ● Save Atual
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoad(gameState.id)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          title="Carregar"
                        >
                          <FolderOpen size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 p-2 bg-gray-700/30 rounded">
            💡 Dica: Os saves incluem todas as estruturas e NPCs do seu mundo atual.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
