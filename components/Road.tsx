
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, RepeatWrapping, TextureLoader } from 'three';
import { SETTINGS, COLORS } from '../constants';

export const Road: React.FC<{ zOffset: number }> = ({ zOffset }) => {
  const meshRef = useRef<Mesh>(null);
  const width = SETTINGS.lanes * SETTINGS.laneWidth + 2;

  return (
    <group>
      {/* Main track */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, zOffset - 500]}>
        <planeGeometry args={[width + 10, 2000]} />
        <meshStandardMaterial color="#050a14" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Lane markers */}
      {[-1, 0, 1].map((l) => (
        <mesh 
          key={l}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[l * SETTINGS.laneWidth, 0.01, zOffset - 500]}
        >
          <planeGeometry args={[0.15, 2000]} />
          <meshStandardMaterial color={COLORS.primary} emissive={COLORS.primary} emissiveIntensity={8} />
        </mesh>
      ))}
      
      {/* Grid Lines for Speed feel - adjusted for more "cool" factor */}
      <gridHelper 
        args={[width + 4, 150, "#112211", "#000"]} 
        position={[0, 0.02, zOffset - 500]} 
        rotation={[0, 0, 0]}
      />
      
      {/* Side Glow rails */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(width / 2 + 1), 0.05, zOffset - 500]}>
        <planeGeometry args={[0.2, 2000]} />
        <meshStandardMaterial color="#22ff22" emissive="#22ff22" emissiveIntensity={3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(width / 2 + 1), 0.05, zOffset - 500]}>
        <planeGeometry args={[0.2, 2000]} />
        <meshStandardMaterial color="#22ff22" emissive="#22ff22" emissiveIntensity={3} />
      </mesh>
    </group>
  );
};
