import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameState } from "../lib/stores/useGameState";

const CameraControls = () => {
  const controlsRef = useRef<any>();
  const { camera } = useThree();
  const { controlledNPCId, viewingNPCId, createdNPCs } = useGameState();
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false
  });

  // Handle keyboard input - disabled when controlling NPC
  useEffect(() => {
    if (controlledNPCId) {
      // Reset camera keys when NPC control starts
      setKeys({ w: false, a: false, s: false, d: false });
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: true }));
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: false }));
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controlledNPCId]);

  useFrame(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      
      // Handle NPC viewing mode with isometric view
      if (viewingNPCId) {
        const viewedNPC = createdNPCs.find(npc => npc.id === viewingNPCId);
        if (viewedNPC) {
          const npcPosition = new THREE.Vector3(viewedNPC.position.x, 0, viewedNPC.position.z);
          const isometricOffset = new THREE.Vector3(-8, 12, -8); // Same isometric angle as control mode
          const targetPosition = npcPosition.clone().add(isometricOffset);
          
          // Smoothly move camera to follow NPC
          camera.position.lerp(targetPosition, 0.05);
          controls.target.lerp(npcPosition, 0.05);
          controls.update();
          return;
        }
      }
      
      // Skip WASD movement if controlling NPC
      if (controlledNPCId) {
        controls.update();
        return;
      }
      
      const speed = 0.3;
      
      // Get camera direction vectors
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      direction.y = 0; // Keep movement on horizontal plane
      direction.normalize();
      
      const right = new THREE.Vector3();
      right.crossVectors(direction, camera.up).normalize();
      
      // Calculate movement
      const movement = new THREE.Vector3();
      
      if (keys.w) {
        movement.add(direction.clone().multiplyScalar(speed));
      }
      if (keys.s) {
        movement.add(direction.clone().multiplyScalar(-speed));
      }
      if (keys.a) {
        movement.add(right.clone().multiplyScalar(-speed));
      }
      if (keys.d) {
        movement.add(right.clone().multiplyScalar(speed));
      }
      
      // Apply movement to camera and target
      if (movement.length() > 0) {
        camera.position.add(movement);
        controls.target.add(movement);
      }
      
      controls.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera]}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={5}
      maxDistance={30}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.2}
      target={[0, 0, 0]}
      dampingFactor={0.1}
      enableDamping
    />
  );
};

export default CameraControls;
