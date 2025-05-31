import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X, Plus, User, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useGameState } from "../lib/stores/useGameState";

interface NPCPanelProps {
  isOpen: boolean;
  housePosition: { x: number; z: number; id: string } | null;
  onClose: () => void;
  onCreateNPC: (name: string, structureId: string) => void;
  onConfigureNPC: (npcId: string) => void;
}

export default function NPCPanel({ 
  isOpen, 
  housePosition, 
  onClose, 
  onCreateNPC,
  onConfigureNPC 
}: NPCPanelProps) {
  const { isNPCCreationOpen, setNPCCreationOpen, getNPCsByStructure } = useGameState();
  const [npcName, setNpcName] = useState("");
  const [npcSurname, setNpcSurname] = useState("");

  // Arrays para geração aleatória de nomes
  const firstNames = [
    "Ana", "Bruno", "Carlos", "Diana", "Eduardo", "Fernanda", "Gabriel", "Helena",
    "Igor", "Julia", "Lucas", "Maria", "Nicolas", "Olivia", "Pedro", "Raquel",
    "Sofia", "Thiago", "Valentina", "William", "Dudu", "Lya", "Toby", "Papai",
    "João", "Beatriz", "Rafael", "Camila", "Diego", "Larissa", "Felipe", "Natalia"
  ];

  const surnames = [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira",
    "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes",
    "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha", "Dias", "Monteiro", "Cardoso",
    "Reis", "Araújo", "Castro", "Andrade", "Nascimento", "Correia", "Teixeira", "Moreira"
  ];

  const capitalizeFirst = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const generateRandomName = () => {
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];
    setNpcName(randomFirstName);
    setNpcSurname(randomSurname);
  };

  // Obter NPCs da estrutura atual
  const structureNPCs = housePosition ? getNPCsByStructure(housePosition.id) : [];

  // Determinar tipo de estrutura baseado no ID
  const getStructureInfo = (id: string) => {
    const type = id.split('-')[0];
    const structureTypes = {
      house: { name: "Casa", description: "Uma casa simples para aldeões" },
      largehouse: { name: "Casa Grande", description: "Uma casa maior para famílias" },
      windmill: { name: "Moinho", description: "Moinho para processar grãos" },
      tower: { name: "Torre", description: "Torre de vigilância defensiva" },
      blacksmith: { name: "Ferraria", description: "Oficina para forjar equipamentos" },
      market: { name: "Mercado", description: "Local de comércio e trocas" }
    };
    return structureTypes[type as keyof typeof structureTypes] || { name: "Estrutura", description: "Estrutura genérica" };
  };

  const structureInfo = housePosition ? getStructureInfo(housePosition.id) : null;

  // Get family name based on first NPC's surname
  const getFamilyName = () => {
    if (structureNPCs.length > 0) {
      const firstNPC = structureNPCs[0];
      const nameParts = firstNPC.name.split(' ');
      const surname = nameParts.slice(1).join(' ') || nameParts[0];
      return `Família ${surname}`;
    }
    return structureInfo?.name || 'Estrutura';
  };

  // Handle ESC key to close panel
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        if (isNPCCreationOpen) {
          setNPCCreationOpen(false);
          setNpcName("");
          setNpcSurname("");
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, isNPCCreationOpen, onClose, setNPCCreationOpen]);

  const handleCreateNPC = () => {
    const firstName = capitalizeFirst(npcName.trim());
    const lastName = capitalizeFirst(npcSurname.trim());
    const fullName = `${firstName} ${lastName}`;

    if (firstName && lastName && housePosition) {
      onCreateNPC(fullName, housePosition.id);
      setNpcName("");
      setNpcSurname("");
      setNPCCreationOpen(false);
    }
  };

  const handleOpenCreation = () => {
    setNPCCreationOpen(true);
  };

  const handleCancelCreation = () => {
    setNPCCreationOpen(false);
    setNpcName("");
    setNpcSurname("");
  };

  if (!isOpen || !housePosition) return null;

  return (
    <div className="absolute top-4 right-4 z-20">
      <Card className="w-80 bg-gray-800/90 border-gray-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">
            {getFamilyName()}
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
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-300">
            Gerencie esta estrutura e seus NPCs
          </div>

          {!isNPCCreationOpen ? (
            <>
              <div className="flex justify-center">
                <Button
                  className="h-16 w-40 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                  onClick={handleOpenCreation}
                  disabled={structureNPCs.length >= 4}
                >
                  <Plus size={24} />
                  <span>{structureNPCs.length >= 4 ? 'Estrutura Cheia' : 'Criar NPC'}</span>
                </Button>
              </div>

              <div className="p-3 bg-gray-700/50 rounded text-sm text-gray-300">
                <div className="font-medium mb-1">Informações da Estrutura:</div>
                <div>• Tipo: {structureInfo?.name}</div>
                <div>• Posição: ({housePosition.x}, {housePosition.z})</div>
                <div>• Descrição: {structureInfo?.description}</div>
                <div>• ID: {housePosition.id}</div>
                <div>• NPCs: {structureNPCs.length}/4</div>
                <div>• Status: {structureNPCs.length > 0 ? 'Ocupada' : 'Vazia'}</div>

                {structureNPCs.length > 0 && (
                  <div className="mt-2">
                    <div className="font-medium mb-1">NPCs na estrutura:</div>
                    {structureNPCs.map((npc) => (
                      <div key={npc.id} className="flex items-center justify-between gap-2 ml-2 p-2 rounded hover:bg-gray-600/30 border border-gray-600/50">
                        <div className="flex items-center gap-2">
                          <User size={12} />
                          <span className="text-sm">{npc.name} ({npc.type})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onConfigureNPC(npc.id)}
                            className="h-7 w-7 p-0 text-lg hover:bg-gray-600/50"
                            title="Configurações"
                          >
                            ⚙️
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              console.log(`Controle de IA para NPC ${npc.id}`);
                              // TODO: Implementar painel de controle de IA
                            }}
                            className="h-7 w-7 p-0 text-lg hover:bg-gray-600/50"
                            title="Controle de IA"
                          >
                            🤖
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              console.log(`Visualizar NPC ${npc.id}`);
                              // TODO: Implementar visualização do NPC
                            }}
                            className="h-7 w-7 p-0 text-lg hover:bg-gray-600/50"
                            title="Visualizar NPC"
                          >
                            👁️
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              console.log(`Controles de jogabilidade para NPC ${npc.id}`);
                              // TODO: Implementar painel de jogabilidade
                            }}
                            className="h-7 w-7 p-0 text-lg hover:bg-gray-600/50"
                            title="Controles de Jogabilidade"
                          >
                            🕹️
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-300 font-medium">
                  Criar Novo NPC
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateRandomName}
                  className="text-lg hover:bg-gray-600/50"
                  title="Gerar nome aleatório"
                >
                  🎲
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Nome:</label>
                  <Input
                    type="text"
                    value={npcName}
                    onChange={(e) => setNpcName(e.target.value)}
                    placeholder="Digite o nome..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Sobrenome:</label>
                  <Input
                    type="text"
                    value={npcSurname}
                    onChange={(e) => setNpcSurname(e.target.value)}
                    placeholder="Digite o sobrenome..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleCreateNPC}
                  disabled={!npcName.trim() || !npcSurname.trim()}
                >
                  <User size={16} className="mr-2" />
                  Criar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={handleCancelCreation}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};