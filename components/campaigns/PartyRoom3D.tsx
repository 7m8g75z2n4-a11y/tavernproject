"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

type PartyMember = {
  id: string;
  name: string;
  hp?: number;
  maxHp?: number;
};

type PartyRoom3DProps = {
  members: PartyMember[];
};

function PartyMemberAvatar({
  angle,
  radius,
  name,
}: {
  angle: number;
  radius: number;
  name: string;
}) {
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  return (
    <group position={[x, 0, z]}>
      {/* pedestal */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 24]} />
        <meshStandardMaterial color="#3b2a18" />
      </mesh>

      {/* glowing sigil */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.39, 0]}>
        <circleGeometry args={[0.7, 32]} />
        <meshBasicMaterial color="#f5d278" transparent opacity={0.5} />
      </mesh>

      {/* hero placeholder */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#c58bff" />
      </mesh>
    </group>
  );
}

function CentralTable() {
  return (
    <group>
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.2, 32]} />
        <meshStandardMaterial color="#4b3322" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <ringGeometry args={[0.6, 0.9, 32]} />
        <meshBasicMaterial color="#f9d27a" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

export function PartyRoom3D({ members }: PartyRoom3DProps) {
  const count = members.length || 1;
  const radius = 3;

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-amber-800/60 bg-gradient-to-b from-[#120b16] to-[#1a111f]">
      <Canvas camera={{ position: [0, 3.5, 7], fov: 50 }}>
        <color attach="background" args={["#120b16"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 4]} intensity={1.2} />
        <directionalLight position={[-4, 4, -4]} intensity={0.5} color="#8092ff" />

        <Suspense fallback={null}>
          <CentralTable />
          {members.map((m, index) => {
            const angle = (index / count) * Math.PI * 2;
            return (
              <PartyMemberAvatar
                key={m.id}
                angle={angle}
                radius={radius}
                name={m.name}
              />
            );
          })}
        </Suspense>

        <OrbitControls
          target={[0, -0.2, 0]}
          minDistance={4}
          maxDistance={9}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}
