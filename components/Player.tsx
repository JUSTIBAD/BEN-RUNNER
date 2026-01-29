
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, MathUtils } from 'three';
import { SETTINGS } from '../constants';

interface PlayerProps {
  lane: number;
  zPos: number;
  yPos: number;
}

export const Player: React.FC<PlayerProps> = ({ lane, zPos, yPos }) => {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  
  const prevY = useRef(yPos);
  const targetX = (lane - Math.floor(SETTINGS.lanes / 2)) * SETTINGS.laneWidth;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.x = MathUtils.lerp(groupRef.current.position.x, targetX, 0.2);
      groupRef.current.position.z = zPos;
      groupRef.current.position.y = yPos;

      const vy = yPos - prevY.current;
      prevY.current = yPos;

      const isJumping = yPos > 0.05;
      const isAscending = vy > 0.001;
      const isDescending = vy < -0.001;
      const time = state.clock.elapsedTime * 15;
      
      if (bodyRef.current) {
        const bob = isJumping ? 0 : Math.abs(Math.sin(time * 2)) * 0.12;
        bodyRef.current.position.y = 1.6 + bob;
        
        const targetTiltZ = (groupRef.current.position.x - targetX) * -0.15;
        bodyRef.current.rotation.z = MathUtils.lerp(bodyRef.current.rotation.z, targetTiltZ, 0.1);

        let targetTiltX = 0.15; 
        if (isJumping) {
          if (isAscending) targetTiltX = -0.35;
          else if (isDescending) targetTiltX = 0.25;
        }
        bodyRef.current.rotation.x = MathUtils.lerp(bodyRef.current.rotation.x, targetTiltX, 0.15);
      }

      const swingAmount = isJumping ? 0.2 : 0.9;
      
      if (isJumping) {
        const legTargetL = isAscending ? -0.8 : 0.3;
        const legTargetR = isAscending ? 0.3 : -0.5;
        const armTargetL = isAscending ? 1.2 : -0.1;
        const armTargetR = isAscending ? 1.2 : -0.1;

        if (leftLegRef.current) leftLegRef.current.rotation.x = MathUtils.lerp(leftLegRef.current.rotation.x, legTargetL, 0.1);
        if (rightLegRef.current) rightLegRef.current.rotation.x = MathUtils.lerp(rightLegRef.current.rotation.x, legTargetR, 0.1);
        if (leftArmRef.current) leftArmRef.current.rotation.x = MathUtils.lerp(leftArmRef.current.rotation.x, armTargetL, 0.1);
        if (rightArmRef.current) rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, armTargetR, 0.1);
      } else {
        if (leftLegRef.current) leftLegRef.current.rotation.x = MathUtils.lerp(leftLegRef.current.rotation.x, Math.sin(time) * swingAmount, 0.2);
        if (rightLegRef.current) rightLegRef.current.rotation.x = MathUtils.lerp(rightLegRef.current.rotation.x, Math.sin(time + Math.PI) * swingAmount, 0.2);
        if (leftArmRef.current) leftArmRef.current.rotation.x = MathUtils.lerp(leftArmRef.current.rotation.x, Math.sin(time + Math.PI) * swingAmount, 0.2);
        if (rightArmRef.current) rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, Math.sin(time) * swingAmount, 0.2);
      }
    }
  });

  const skinMat = <meshStandardMaterial color="#ffdbac" roughness={0.7} />;
  const jacketMat = <meshStandardMaterial color="#22cc22" roughness={0.5} />;
  const shirtMat = <meshStandardMaterial color="#111111" roughness={0.8} />;
  const whiteMat = <meshStandardMaterial color="#ffffff" roughness={0.5} />;
  const pantsMat = <meshStandardMaterial color="#2b3d8c" roughness={0.9} />;
  const hairMat = <meshStandardMaterial color="#4b3621" roughness={1} />;
  const omnitrixMat = <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={5} />;
  const eyeMat = <meshStandardMaterial color="#ffffff" />;
  const pupilMat = <meshStandardMaterial color="#000000" />;

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        {/* Torso - Leaner Profile */}
        <mesh castShadow>
          <boxGeometry args={[0.65, 1.0, 0.4]} />
          {jacketMat}
        </mesh>
        
        {/* Black Undershirt Center Stripe */}
        <mesh position={[0, 0, -0.21]}>
          <planeGeometry args={[0.22, 1.0]} />
          {shirtMat}
        </mesh>

        {/* Detailed "10" Badge */}
        <group position={[-0.18, 0.2, -0.22]} rotation={[0, Math.PI, 0]} scale={0.8}>
          <mesh>
            <circleGeometry args={[0.1, 32]} />
            {whiteMat}
          </mesh>
          <mesh position={[0, 0, 0.01]}>
             <circleGeometry args={[0.08, 32]} />
             {shirtMat}
          </mesh>
          <mesh position={[0, 0, 0.02]}>
             <boxGeometry args={[0.03, 0.08, 0.01]} />
             {whiteMat}
          </mesh>
        </group>

        {/* Improved Head Shape */}
        <group ref={headRef} position={[0, 0.85, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.45, 0.42]} />
            {skinMat}
          </mesh>
          
          {/* Facial Details - Eyes */}
          <group position={[0, 0, -0.21]}>
            {[-0.1, 0.1].map((x, i) => (
              <group key={i} position={[x, 0.05, 0]}>
                <mesh scale={[1.2, 0.8, 1]}>
                  <circleGeometry args={[0.06, 16]} />
                  {eyeMat}
                </mesh>
                <mesh position={[0, 0, 0.01]}>
                  <circleGeometry args={[0.025, 16]} />
                  {pupilMat}
                </mesh>
              </group>
            ))}
          </group>

          {/* Layered Hair */}
          <group position={[0, 0.22, 0]}>
            <mesh>
              <boxGeometry args={[0.48, 0.25, 0.48]} />
              {hairMat}
            </mesh>
            {/* Spiky Tuft */}
            <mesh position={[0, 0.15, -0.1]}>
              <boxGeometry args={[0.3, 0.2, 0.3]} />
              {hairMat}
            </mesh>
            <mesh position={[0, 0.1, 0.15]}>
              <boxGeometry args={[0.45, 0.3, 0.1]} />
              {hairMat}
            </mesh>
          </group>
        </group>

        {/* Left Arm with Detailed Omnitrix */}
        <group ref={leftArmRef} position={[-0.4, 0.35, 0]}>
          <mesh castShadow position={[0, -0.3, 0]}>
            <boxGeometry args={[0.18, 0.7, 0.18]} />
            {jacketMat}
          </mesh>
          {/* OMNITRIX - Multistage Model */}
          <group position={[0, -0.52, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
            {/* Wrist Band */}
            <mesh>
              <cylinderGeometry args={[0.12, 0.12, 0.2, 16]} />
              {shirtMat}
            </mesh>
            {/* Dial Base */}
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.08, 16]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
            {/* Glowing Core */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
              {omnitrixMat}
            </mesh>
          </group>
          {/* Realistic Hand */}
          <mesh position={[0, -0.7, 0]}>
            <boxGeometry args={[0.16, 0.18, 0.16]} />
            {skinMat}
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.4, 0.35, 0]}>
          <mesh castShadow position={[0, -0.3, 0]}>
            <boxGeometry args={[0.18, 0.7, 0.18]} />
            {jacketMat}
          </mesh>
          {/* White Stripes Cuffs */}
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[0.2, 0.08, 0.2]} />
            {whiteMat}
          </mesh>
          <mesh position={[0, -0.32, 0]}>
            <boxGeometry args={[0.2, 0.08, 0.2]} />
            {whiteMat}
          </mesh>
          <mesh position={[0, -0.7, 0]}>
            <boxGeometry args={[0.16, 0.18, 0.16]} />
            {skinMat}
          </mesh>
        </group>

        {/* Legs - Adjusted Proportions */}
        {[-0.2, 0.2].map((xPos, i) => (
          <group key={`leg-${i}`} ref={i === 0 ? leftLegRef : rightLegRef} position={[xPos, -0.5, 0]}>
            <mesh castShadow position={[0, -0.45, 0]}>
              <boxGeometry args={[0.24, 0.9, 0.24]} />
              {pantsMat}
            </mesh>
            {/* Realistic Shoes */}
            <group position={[0, -0.9, 0.05]}>
              <mesh>
                <boxGeometry args={[0.26, 0.15, 0.45]} />
                {shirtMat}
              </mesh>
              <mesh position={[0, -0.08, 0]}>
                <boxGeometry args={[0.28, 0.04, 0.47]} />
                {whiteMat}
              </mesh>
            </group>
          </group>
        ))}
      </group>
      
      <pointLight position={[0, 1.5, 0]} color="#00ff00" intensity={15} distance={8} />
    </group>
  );
};
