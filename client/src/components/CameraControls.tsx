import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const CameraControls = () => {
  const controlsRef = useRef<any>();
  const { camera } = useThree();
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false
  });

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: true }));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
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
