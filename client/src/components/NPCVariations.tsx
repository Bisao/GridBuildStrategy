
import NPC from "./NPC";

interface NPCVariationProps {
  position: [number, number, number];
  type: "villager" | "guard" | "merchant" | "farmer";
  animation?: "idle" | "walk";
}

export default function NPCVariation({ position, type, animation = "idle" }: NPCVariationProps) {
  const npcConfigs = {
    villager: {
      color: "#8B4513", // Brown clothes
      hairColor: "#654321",
      skinColor: "#FDBCB4"
    },
    guard: {
      color: "#2F4F4F", // Dark slate gray armor
      hairColor: "#000000",
      skinColor: "#FDBCB4"
    },
    merchant: {
      color: "#800080", // Purple robes
      hairColor: "#FFD700",
      skinColor: "#FDBCB4"
    },
    farmer: {
      color: "#228B22", // Green overalls
      hairColor: "#8B4513",
      skinColor: "#D2691E"
    }
  };

  const config = npcConfigs[type];

  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.4, 0.8, 0.2]} />
        <meshStandardMaterial color={config.color} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={config.skinColor} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.08, 1.65, 0.12]}>
        <boxGeometry args={[0.04, 0.04, 0.04]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.08, 1.65, 0.12]}>
        <boxGeometry args={[0.04, 0.04, 0.04]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[0.32, 0.15, 0.32]} />
        <meshStandardMaterial color={config.hairColor} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.3, 1.2, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={config.skinColor} />
      </mesh>
      <mesh position={[0.3, 1.2, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color={config.skinColor} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.1, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>
      <mesh position={[0.1, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>

      {/* Type-specific accessories */}
      {type === "guard" && (
        <>
          {/* Helmet */}
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[0.35, 0.12, 0.35]} />
            <meshStandardMaterial color="#708090" />
          </mesh>
          {/* Sword */}
          <mesh position={[0.4, 1.4, 0]}>
            <boxGeometry args={[0.05, 0.4, 0.05]} />
            <meshStandardMaterial color="#C0C0C0" />
          </mesh>
        </>
      )}

      {type === "merchant" && (
        <>
          {/* Hat */}
          <mesh position={[0, 1.85, 0]}>
            <coneGeometry args={[0.2, 0.3, 6]} />
            <meshStandardMaterial color="#800080" />
          </mesh>
          {/* Bag */}
          <mesh position={[-0.4, 1.0, 0]}>
            <boxGeometry args={[0.15, 0.2, 0.1]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        </>
      )}

      {type === "farmer" && (
        <>
          {/* Straw hat */}
          <mesh position={[0, 1.82, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.05, 8]} />
            <meshStandardMaterial color="#DAA520" />
          </mesh>
          {/* Tool */}
          <mesh position={[0.4, 1.2, 0]}>
            <boxGeometry args={[0.05, 0.5, 0.05]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        </>
      )}

      {/* Shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 8]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}
