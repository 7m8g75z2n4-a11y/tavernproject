"use client";

import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";

export function CharacterOrb3D() {
  return (
    <div className="character-orb-canvas">
      <Canvas camera={{ position: [0, 0.6, 2.2], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[2, 3, 3]} intensity={1.4} />
        <pointLight position={[-2, -3, -2]} intensity={0.5} color="#ffb347" />

        <Float speed={1.2} rotationIntensity={0.8} floatIntensity={0.8} floatingRange={[0.1, 0.35]}>
          <mesh castShadow>
            <icosahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial
              color="#f5e0bc"
              metalness={0.2}
              roughness={0.25}
              emissive="#f0b35b"
              emissiveIntensity={0.25}
            />
          </mesh>
        </Float>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]} receiveShadow>
          <circleGeometry args={[3, 32]} />
          <meshStandardMaterial color="#201014" roughness={0.9} metalness={0} />
        </mesh>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={(2 * Math.PI) / 3}
        />
      </Canvas>
    </div>
  );
}
