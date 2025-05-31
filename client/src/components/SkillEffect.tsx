
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SkillEffectProps {
  position: THREE.Vector3;
  skillType: string;
  startTime: number;
  duration: number;
  onComplete: () => void;
}

export default function SkillEffect({ position, skillType, startTime, duration, onComplete }: SkillEffectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particles = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (!groupRef.current) return;

    // Create particle effects based on skill type
    const particleCount = skillType === 'basic_attack' ? 8 : 15;
    const particleMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 4, 4);
      let material;
      
      switch (skillType) {
        case 'basic_attack':
          material = new THREE.MeshBasicMaterial({ 
            color: '#FFD700', 
            transparent: true, 
            opacity: 0.8 
          });
          break;
        case 'heavy_strike':
          material = new THREE.MeshBasicMaterial({ 
            color: '#FF4444', 
            transparent: true, 
            opacity: 0.9 
          });
          break;
        case 'heal':
          material = new THREE.MeshBasicMaterial({ 
            color: '#00FF00', 
            transparent: true, 
            opacity: 0.7 
          });
          break;
        case 'dash':
          material = new THREE.MeshBasicMaterial({ 
            color: '#00FFFF', 
            transparent: true, 
            opacity: 0.6 
          });
          break;
        case 'shield_bash':
          material = new THREE.MeshBasicMaterial({ 
            color: '#SILVER', 
            transparent: true, 
            opacity: 0.8 
          });
          break;
        default:
          material = new THREE.MeshBasicMaterial({ 
            color: '#FFFFFF', 
            transparent: true, 
            opacity: 0.5 
          });
      }

      const particle = new THREE.Mesh(geometry, material);
      
      // Random starting position around the target
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = Math.random() * 0.5;
      particle.position.set(
        position.x + Math.cos(angle) * radius,
        position.y + Math.random() * 0.5,
        position.z + Math.sin(angle) * radius
      );

      groupRef.current.add(particle);
      particleMeshes.push(particle);
    }

    particles.current = particleMeshes;

    // Cleanup function
    return () => {
      particleMeshes.forEach(particle => {
        if (groupRef.current) {
          groupRef.current.remove(particle);
        }
        particle.geometry.dispose();
        (particle.material as THREE.Material).dispose();
      });
    };
  }, [position, skillType]);

  useFrame(() => {
    if (!groupRef.current || particles.current.length === 0) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const duration = skillType === 'heal' ? 2.0 : 1.0;

    if (elapsed >= duration) {
      onComplete();
      return;
    }

    // Animate particles
    particles.current.forEach((particle, index) => {
      const progress = elapsed / duration;
      
      switch (skillType) {
        case 'basic_attack':
        case 'heavy_strike':
        case 'shield_bash':
          // Explosion effect - particles fly outward
          const angle = (index / particles.current.length) * Math.PI * 2;
          const speed = skillType === 'heavy_strike' ? 2 : 1;
          particle.position.x = position.x + Math.cos(angle) * progress * speed;
          particle.position.z = position.z + Math.sin(angle) * progress * speed;
          particle.position.y = position.y + progress * 0.5 - progress * progress * 0.5; // Arc
          break;
          
        case 'heal':
          // Spiral upward effect
          const spiralAngle = progress * Math.PI * 4 + (index / particles.current.length) * Math.PI * 2;
          const spiralRadius = 0.3 * (1 - progress);
          particle.position.x = position.x + Math.cos(spiralAngle) * spiralRadius;
          particle.position.z = position.z + Math.sin(spiralAngle) * spiralRadius;
          particle.position.y = position.y + progress * 2;
          break;
          
        case 'dash':
          // Linear movement effect
          particle.position.y = position.y + Math.sin(progress * Math.PI) * 0.5;
          break;
      }

      // Fade out over time
      const material = particle.material as THREE.MeshBasicMaterial;
      material.opacity = (1 - progress) * 0.8;
      
      // Scale effect
      const scale = skillType === 'heavy_strike' ? 1 + progress : 1 - progress * 0.5;
      particle.scale.setScalar(scale);
    });
  });

  return <group ref={groupRef} />;
}
