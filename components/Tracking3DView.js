'use client';

import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';

// 3D Package Component
function Package3D({ position = [0, 0, 0], color = '#3b82f6' }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
    </mesh>
  );
}

// 3D Vehicle Component
function Vehicle3D({ position = [0, 0, 0], moving = false }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current && moving) {
      meshRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 3;
      meshRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 3;
      meshRef.current.rotation.y = -state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Vehicle body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.6, 2]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      {/* Vehicle cabin */}
      <mesh position={[0, 0.8, -0.3]}>
        <boxGeometry args={[1, 0.6, 1]} />
        <meshStandardMaterial color="#059669" />
      </mesh>
      {/* Wheels */}
      {[-0.6, 0.6].map((x, i) =>
        [-0.7, 0.7].map((z, j) => (
          <mesh key={`wheel-${i}-${j}`} position={[x, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        ))
      )}
    </group>
  );
}

// 3D Scene Component
function Scene3D({ trackingEvents, latestPosition }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[8, 8, 8]} />
      <OrbitControls enableDamping dampingFactor={0.05} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      
      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      {/* Grid */}
      <gridHelper args={[20, 20, '#334155', '#1e293b']} position={[0, -0.49, 0]} />
      
      {/* Package */}
      <Package3D position={[0, 1, 0]} />
      
      {/* Vehicle (moving if tracking is active) */}
      <Vehicle3D position={[3, 0, 3]} moving={!!latestPosition} />
      
      {/* Route markers */}
      {trackingEvents?.slice(0, 5).map((event, index) => (
        event.lat && event.lng && (
          <mesh key={event.id} position={[index * 2 - 4, 0.2, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial 
              color={index === 0 ? '#3b82f6' : '#64748b'} 
              emissive={index === 0 ? '#3b82f6' : '#000000'}
              emissiveIntensity={index === 0 ? 0.5 : 0}
            />
          </mesh>
        )
      ))}
    </>
  );
}

export default function Tracking3DView({ shipment, trackingEvents, latestPosition }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-[500px]'} bg-slate-950 rounded-lg overflow-hidden`}>
      {/* 3D Canvas */}
      <Canvas shadows>
        <Suspense fallback={null}>
          <Scene3D trackingEvents={trackingEvents} latestPosition={latestPosition} />
        </Suspense>
      </Canvas>

      {/* Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button
          onClick={() => setIsFullscreen(!isFullscreen)}
          size="icon"
          className="bg-slate-800/90 backdrop-blur hover:bg-slate-700"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur p-4 rounded-lg max-w-xs">
        <h3 className="text-white font-semibold mb-2">3D Tracking View</h3>
        <p className="text-sm text-slate-300 mb-2">
          Visualizing shipment {shipment?.tracking_code}
        </p>
        <div className="space-y-1 text-xs text-slate-400">
          <p>• Blue sphere: Current/latest position</p>
          <p>• Green vehicle: Delivery vehicle</p>
          <p>• Gray spheres: Historical waypoints</p>
        </div>
        {latestPosition && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-xs text-slate-400">
              Last update: {new Date(latestPosition.recorded_at).toLocaleTimeString()}
            </p>
            {latestPosition.speed_kmh && (
              <p className="text-xs text-slate-400">
                Speed: {latestPosition.speed_kmh.toFixed(1)} km/h
              </p>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-blue-600/20 backdrop-blur border border-blue-500/30 p-3 rounded-lg">
        <p className="text-xs text-blue-200">
          🖱️ Drag to rotate • Scroll to zoom • Right-click to pan
        </p>
      </div>
    </div>
  );
}

