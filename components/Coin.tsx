
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { SETTINGS, COLORS } from '../constants';

interface CoinProps {
  lane: number;
  z: number;
}

export const Coin: React.FC<CoinProps> = ({ lane, z }) => {
  const meshRef = useRef<Mesh>(null);
  const x = (lane - Math.floor(SETTINGS.lanes / 2)) * SETTINGS.laneWidth;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.05;
      meshRef.current.position.y = 1.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <group position={[x, 0, z]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[0.5, 0.15, 16, 32]} />
        <meshStandardMaterial 
          color={COLORS.coin} 
          emissive={COLORS.coin} 
          emissiveIntensity={2}
          metalness={1}
          roughness={0}
        />
      </mesh>
      <pointLight color={COLORS.coin} intensity={5} distance={3} />
    </group>
  );
};
