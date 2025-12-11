"use client";

import React, { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, SoftShadows, Text } from "@react-three/drei";

export type PartySeat = {
  id: string;
  name: string;
  className?: string | null;
  hp?: number | null;
  maxHp?: number | null;
  seatIndex: number;
};

export type PartyRoom3DProps = {
  seats: PartySeat[];
  onSeatClick?: (id: string) => void;
};

function SeatPawn({
  seat,
  position,
  onClick,
}: {
  seat: PartySeat;
  position: [number, number, number];
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const hpPercent =
    seat.hp != null && seat.maxHp
      ? Math.max(0, Math.min(100, Math.round((seat.hp / seat.maxHp) * 100)))
      : null;
  const hpColor =
    hpPercent == null
      ? "#fef08a"
      : hpPercent > 60
      ? "#22c55e"
      : hpPercent > 25
      ? "#eab308"
      : "#ef4444";

  return (
    <group
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.08 : 1}
    >
      {/* hover ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshStandardMaterial
          color={hovered ? "#fbbf24" : "#78350f"}
          emissive={hovered ? "#fbbf24" : "#0f172a"}
          emissiveIntensity={hovered ? 0.9 : 0.2}
          transparent
          opacity={hovered ? 0.9 : 0.6}
        />
      </mesh>

      {/* pawn body */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.28, 0.8, 24]} />
        <meshStandardMaterial color="#f4a259" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#fde68a" roughness={0.8} />
      </mesh>

      {/* hp hint bar behind */}
      <group position={[-0.5, 0.1, -0.1]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {hpPercent != null && (
          <mesh position={[0, (hpPercent / 100) * 0.45, 0]}>
            <boxGeometry args={[0.06, (hpPercent / 100) * 0.9, 0.06]} />
            <meshStandardMaterial
              color={hpColor}
              emissive={hpColor}
              emissiveIntensity={0.4}
            />
          </mesh>
        )}
      </group>

      {/* floating labels */}
      <Text
        position={[0, 1.6, 0]}
        fontSize={0.18}
        color="#fef3c7"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.005}
        outlineColor="#0f172a"
      >
        {seat.name}
      </Text>
      <Text
        position={[0, 1.35, 0]}
        fontSize={0.14}
        color="#fbbf24"
        anchorX="center"
        anchorY="bottom"
      >
        {hpPercent != null && seat.maxHp != null
          ? `${seat.hp ?? 0}/${seat.maxHp} HP`
          : seat.className ?? ""}
      </Text>
    </group>
  );
}

function TavernRoom({
  seats,
  onSeatClick,
}: {
  seats: PartySeat[];
  onSeatClick?: (id: string) => void;
}) {
  const radius = 1.4;
  const positions = useMemo(() => {
    return seats.map((seat) => {
      const angle = seats.length ? (seat.seatIndex / seats.length) * Math.PI * 2 : 0;
      return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [
        number,
        number,
        number
      ];
    });
  }, [seats]);

  return (
    <>
      <SoftShadows size={25} samples={16} focus={0.9} />
      <color attach="background" args={["#05030a"]} />
      <ambientLight intensity={0.3} />
      <spotLight
        position={[0, 4, 0]}
        angle={0.6}
        penumbra={0.4}
        intensity={2}
        color="#ffb566"
        castShadow
      />
      <pointLight position={[-3, 2.5, -3]} intensity={0.5} color="#f97316" />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#0b1021" roughness={0.95} />
      </mesh>

      <group position={[0, 0.55, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[1.4, 1.4, 0.2, 32]} />
          <meshStandardMaterial color="#3b2a1a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.02, 32]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>

      {seats.map((seat, idx) => (
        <SeatPawn
          key={seat.id}
          seat={seat}
          position={positions[idx]}
          onClick={() => onSeatClick?.(seat.id)}
        />
      ))}
    </>
  );
}

export default function PartyRoom3D({ seats, onSeatClick }: PartyRoom3DProps) {
  return (
    <div className="relative w-full h-80 md:h-96 rounded-2xl border border-amber-700/40 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/60 via-black/10 to-transparent text-xs md:text-sm text-amber-100">
        <div className="font-semibold tracking-wide uppercase">Party Room</div>
        <div className="flex gap-2">
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-[10px] md:text-xs">
            {seats.length} member{seats.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 md:p-4 space-y-2">
        <p className="text-xs md:text-sm text-slate-300">
          Tap a pawn to inspect a character.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-[10px] md:text-xs text-slate-300">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Full HP
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            Wounded
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Down
          </span>
        </div>
      </div>

      <Canvas shadows camera={{ position: [0, 3, 5], fov: 45 }} className="w-full h-full">
        <Suspense fallback={null}>
          <TavernRoom seats={seats} onSeatClick={onSeatClick} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxDistance={10}
          minDistance={4}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(3 * Math.PI) / 5}
        />
      </Canvas>
    </div>
  );
}
