import FBXNPCModel from "./FBXNPCModel";

interface NPCVariationProps {
  position: [number, number, number];
  type: "villager" | "guard" | "merchant" | "farmer";
  animation?: "idle" | "walk";
  rotation?: number;
}

export default function NPCVariation({ position, type, animation = "idle", rotation = 0 }: NPCVariationProps) {
  // Map NPC types to FBX model types
  const typeMapping = {
    villager: "rogue" as const,
    guard: "knight" as const,
    merchant: "mage" as const,
    farmer: "barbarian" as const
  };

  const fbxType = typeMapping[type];

  return (
    <FBXNPCModel
      position={position}
      type={fbxType}
      animation={animation}
      rotation={rotation}
    />
  );
}