
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleProps {
  position: [number, number, number];
  onComplete: () => void;
}

export const ParticleEffect: React.FC<ParticleProps> = ({ position, onComplete }) => {
  const count = 24;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Initialize particles with random velocities and colors (green/yellow)
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.2) * 0.4, // Slight upward bias
        (Math.random() - 0.5) * 0.4
      );
      const isYellow = Math.random() > 0.5;
      const color = new THREE.Color(isYellow ? '#ffff00' : '#00ff00');
      temp.push({ velocity, color, life: 1.0 });
    }
    return temp;
  }, []);

  const dummy = new THREE.Object3D();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    let allDead = true;
    particles.forEach((p, i) => {
      if (p.life > 0) {
        allDead = false;
        p.life -= delta * 1.8; // Particles last about half a second
        
        // Update position based on velocity and elapsed life
        const age = 1 - p.life;
        dummy.position.set(
          position[0] + p.velocity.x * age * 15,
          position[1] + p.velocity.y * age * 15,
          position[2] + p.velocity.z * age * 15
        );
        
        // Shrink over time
        const scale = p.life * 0.4;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (allDead) onComplete();
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.3, 6, 6]} />
      <meshStandardMaterial emissive="#ffff88" emissiveIntensity={3} />
    </instancedMesh>
  );
};
