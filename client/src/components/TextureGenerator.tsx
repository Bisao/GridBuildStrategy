
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Utility to generate sand texture programmatically
export const generateSandTexture = (): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Create sand base color
  ctx.fillStyle = '#DEB887';
  ctx.fillRect(0, 0, 512, 512);

  // Add sand grain details
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const size = Math.random() * 2 + 1;
    const opacity = Math.random() * 0.3 + 0.1;
    
    ctx.fillStyle = `rgba(139, 69, 19, ${opacity})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

export default generateSandTexture;
