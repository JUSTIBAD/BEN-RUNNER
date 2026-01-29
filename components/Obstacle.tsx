
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { SETTINGS, COLORS } from '../constants';

interface ObstacleProps {
  lane: number;
  z: number;
}

export const Obstacle: React.FC<ObstacleProps> = ({ lane, z }) => {
  const groupRef = useRef<Group>(null);
  const x = (lane - Math.floor(SETTINGS.lanes / 2)) * SETTINGS.laneWidth;

  useFrame((state) => {
    if (groupRef.current) {
        groupRef.current.rotation.y += 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      {/* Sharp Central Thorn */}
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[0.4, 2.5, 3]} />
        <meshStandardMaterial color={COLORS.obstacle} emissive={COLORS.obstacle} emissiveIntensity={4} />
      </mesh>
      
      {/* Side Thorns */}
      {[0, Math.PI * 0.66, Math.PI * 1.33].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
            <mesh position={[0.7, 0.6, 0]} rotation={[0, 0, -0.8]}>
                <coneGeometry args={[0.2, 1.2, 3]} />
                <meshStandardMaterial color={COLORS.obstacle} emissive={COLORS.obstacle} emissiveIntensity={2} />
            </mesh>
        </group>
      ))}

      {/* Ground Pulse */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshStandardMaterial color={COLORS.obstacle} emissive={COLORS.obstacle} emissiveIntensity={5} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};
