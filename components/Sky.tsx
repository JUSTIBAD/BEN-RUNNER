
import React from 'react';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

export const Sky: React.FC = () => {
  return (
    <>
      {/* Enhanced Star field */}
      <Stars 
        radius={150} 
        depth={60} 
        count={7000} 
        factor={5} 
        saturation={0.5} 
        fade 
        speed={0.5} 
      />
      
      {/* The Moon - placed far in the background */}
      <group position={[40, 50, -120]}>
        <mesh>
          <sphereGeometry args={[10, 32, 32]} />
          <meshStandardMaterial 
            color="#fffbe6" 
            emissive="#fffbe6" 
            emissiveIntensity={1.2} 
            roughness={1}
          />
        </mesh>
        {/* Soft moonlight illumination */}
        <pointLight color="#fffbe6" intensity={1500} distance={400} />
        
        {/* Visual moon halo/glow effect */}
        <mesh scale={1.2}>
          <sphereGeometry args={[10, 32, 32]} />
          <meshBasicMaterial color="#fffbe6" transparent opacity={0.1} />
        </mesh>
      </group>
      
      {/* Distant atmospheric glow */}
      <pointLight position={[-80, 20, -150]} color="#00ff00" intensity={200} distance={500} />
    </>
  );
};
