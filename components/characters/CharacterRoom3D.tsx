"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import { Suspense } from "react";
import { CharacterVisualConfig } from "@/lib/mappers/characterVisual";

type CharacterRoom3DProps = {
  name: string;
  visual?: CharacterVisualConfig;
};

function PlaceholderHero() {
  return (
    <group>
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.3, 24]} />
        <meshStandardMaterial color="#5b3b24" />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#b27cfb" />
      </mesh>
    </group>
  );
}

export function CharacterRoom3D({ name }: CharacterRoom3DProps) {
  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-amber-800/60 bg-gradient-to-b from-[#120b16] to-[#1a111f]">
      <Canvas camera={{ position: [0, 1.2, 3] }}>
        <color attach="background" args={["#120b16"]} />
        <ambientLight intensity={0.4} />
        <directionalLight intensity={1} position={[2, 4, 3]} />
        <directionalLight intensity={0.4} position={[-2, 3, -3]} color="#7f9cff" />

        <Suspense fallback={null}>
          <Stage
            adjustCamera={false}
            intensity={0.8}
            environment={null}
            shadows="accumulative"
          >
            <PlaceholderHero />
          </Stage>
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={4}
          target={[0, 0, 0]}
        />
      </Canvas>
      <div className="px-3 py-1 text-xs text-amber-100/80 bg-black/40">
        Sitting in the chair: <span className="font-semibold">{name}</span>
      </div>
    </div>
  );
}
