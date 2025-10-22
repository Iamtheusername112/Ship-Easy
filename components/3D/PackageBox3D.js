'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function PackageBox3D({ position = [0, 0, 0], delay = 0 }) {
  const boxRef = useRef();

  useFrame((state) => {
    if (boxRef.current) {
      // Floating and rotating animation
      boxRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.3;
      boxRef.current.rotation.x = state.clock.elapsedTime * 0.3 + delay;
      boxRef.current.rotation.y = state.clock.elapsedTime * 0.4 + delay;
    }
  });

  return (
    <mesh ref={boxRef} position={position} castShadow>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial 
        color="#8b5cf6" 
        metalness={0.3} 
        roughness={0.6}
      />
    </mesh>
  );
}

