'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function DeliveryTruck3D() {
  const truckRef = useRef();

  useFrame((state) => {
    if (truckRef.current) {
      // Animate truck moving and bouncing
      truckRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 4;
      truckRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
      truckRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={truckRef}>
      {/* Truck Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2, 1, 1]} />
        <meshStandardMaterial color="#2563eb" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Truck Cabin */}
      <mesh position={[-0.8, 0.8, 0]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.9]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
      
      {/* Wheels */}
      {[[-0.7, 0, 0.6], [-0.7, 0, -0.6], [0.7, 0, 0.6], [0.7, 0, -0.6]].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      ))}
      
      {/* Headlights */}
      <mesh position={[-1.1, 0.5, 0.3]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-1.1, 0.5, -0.3]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

