import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import type { SkylineSign } from '../lib/supabase';

const TONE_COLOR: Record<string, string> = {
  neon: '#ff9a3c',
  siren: '#ff3b6e',
  ember: '#e7b766',
  cyan: '#5ec8d8',
};

type BuildingDatum = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  tint: number;
  windowSeed: number;
};

function useBuildings(count: number): BuildingDatum[] {
  return useMemo(() => {
    const rand = mulberry32(2049);
    const out: BuildingDatum[] = [];
    for (let i = 0; i < count; i++) {
      const ring = Math.floor(i / 20);
      const spread = 18 + ring * 8;
      const x = (rand() - 0.5) * spread * 2;
      const z = (rand() - 0.5) * spread * 2 - ring * 4;
      if (Math.abs(x) < 3 && Math.abs(z) < 3) continue;
      out.push({
        x,
        z,
        w: 1 + rand() * 2.6,
        d: 1 + rand() * 2.6,
        h: 3 + rand() * 22 + (ring === 0 ? 6 : 0),
        tint: 0.04 + rand() * 0.05,
        windowSeed: rand(),
      });
    }
    return out;
  }, [count]);
}

function City({ data }: { data: BuildingDatum[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const emissive = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useMemo(() => {
    if (!ref.current || !emissive.current) return;
    data.forEach((b, i) => {
      tmp.position.set(b.x, b.h / 2, b.z);
      tmp.scale.set(b.w, b.h, b.d);
      tmp.updateMatrix();
      ref.current!.setMatrixAt(i, tmp.matrix);
      color.setRGB(b.tint, b.tint * 0.9, b.tint * 0.75);
      ref.current!.setColorAt(i, color);

      tmp.position.set(b.x, b.h - 0.2, b.z + b.d / 2 + 0.001);
      tmp.scale.set(b.w * 0.85, 0.25, 0.02);
      tmp.updateMatrix();
      emissive.current!.setMatrixAt(i, tmp.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
    emissive.current!.instanceMatrix.needsUpdate = true;
  }, [data, tmp, color]);

  const flicker = useRef(0);
  useFrame((_, dt) => {
    flicker.current += dt;
    const mat = emissive.current?.material as THREE.MeshStandardMaterial | undefined;
    if (mat) mat.emissiveIntensity = 1.6 + Math.sin(flicker.current * 3.1) * 0.3;
  });

  return (
    <>
      <instancedMesh ref={ref} args={[undefined, undefined, data.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.92} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={emissive} args={[undefined, undefined, data.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ff9a3c"
          emissive="#ff7a2c"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </instancedMesh>
    </>
  );
}

function Rain({ count = 420 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const drops = useMemo(() => {
    const rand = mulberry32(17);
    return new Array(count).fill(0).map(() => ({
      x: (rand() - 0.5) * 80,
      y: rand() * 40,
      z: (rand() - 0.5) * 60 - 4,
      v: 18 + rand() * 22,
    }));
  }, [count]);
  const tmp = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      d.y -= d.v * dt;
      if (d.y < -2) d.y = 35 + Math.random() * 8;
      tmp.position.set(d.x, d.y, d.z);
      tmp.scale.set(0.02, 0.9, 0.02);
      tmp.updateMatrix();
      ref.current.setMatrixAt(i, tmp.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#7ac8d8" transparent opacity={0.35} toneMapped={false} />
    </instancedMesh>
  );
}

function Spinner() {
  const group = useRef<THREE.Group>(null);
  const lightL = useRef<THREE.PointLight>(null);
  const lightR = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime() * 0.22;
    const r = 18;
    const x = Math.cos(t) * r;
    const z = Math.sin(t) * r - 4;
    group.current.position.set(x, 14 + Math.sin(t * 1.4) * 0.4, z);
    group.current.rotation.y = -t - Math.PI / 2;
    const pulse = 2 + Math.sin(clock.getElapsedTime() * 8) * 0.6;
    if (lightL.current) lightL.current.intensity = pulse;
    if (lightR.current) lightR.current.intensity = pulse;
  });

  return (
    <group ref={group}>
      <mesh castShadow>
        <boxGeometry args={[1.4, 0.35, 0.55]} />
        <meshStandardMaterial color="#181612" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.7, 0.22, 0.48]} />
        <meshStandardMaterial
          color="#222"
          emissive="#5ec8d8"
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-0.7, 0, 0.28]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ff3b6e" toneMapped={false} />
      </mesh>
      <mesh position={[-0.7, 0, -0.28]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ff3b6e" toneMapped={false} />
      </mesh>
      <pointLight ref={lightL} position={[-0.7, 0, 0.28]} color="#ff3b6e" intensity={2} distance={8} />
      <pointLight ref={lightR} position={[-0.7, 0, -0.28]} color="#ff3b6e" intensity={2} distance={8} />
      <pointLight position={[0.7, 0.1, 0]} color="#5ec8d8" intensity={1.4} distance={6} />
    </group>
  );
}

function Billboards({ signs }: { signs: SkylineSign[] }) {
  if (!signs.length) return null;
  const ring = signs.map((s, i) => {
    const a = (i / signs.length) * Math.PI * 2 + 0.4;
    const r = 11 + ((i % 3) * 1.4);
    return {
      sign: s,
      pos: [Math.cos(a) * r, 8 + ((i * 1.7) % 10), Math.sin(a) * r - 3] as [number, number, number],
      rot: -a - Math.PI / 2,
    };
  });
  return (
    <>
      {ring.map(({ sign, pos, rot }) => (
        <Float key={sign.id} speed={1.2} floatIntensity={0.6} rotationIntensity={0.1}>
          <group position={pos} rotation={[0, rot, 0]}>
            <Text
              fontSize={0.9}
              color={TONE_COLOR[sign.tone] ?? '#ff9a3c'}
              anchorX="center"
              anchorY="middle"
              maxWidth={10}
              outlineWidth={0.015}
              outlineColor="#000"
            >
              {sign.text}
            </Text>
          </group>
        </Float>
      ))}
    </>
  );
}

function CameraRig() {
  useFrame(({ camera, pointer, clock }) => {
    const targetX = pointer.x * 1.8;
    const targetY = 7.5 + pointer.y * 1.2 + Math.sin(clock.getElapsedTime() * 0.25) * 0.15;
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.lookAt(0, 6, -4);
  });
  return null;
}

export default function Skyline2049({ signs }: { signs: SkylineSign[] }) {
  const buildings = useBuildings(110);

  return (
    <section id="skyline" className="relative bg-black">
      <div className="absolute inset-x-0 top-0 z-10 flex items-end justify-between px-6 md:px-10 pt-10 pointer-events-none">
        <div>
          <div className="text-[10px] tracking-[0.5em] uppercase text-[#ff9a3c]/80 mb-2">
            — los angeles · november · 2049
          </div>
          <h2 className="text-4xl md:text-5xl font-mono font-light tracking-tight">
            spinner over the <span className="br-sign">grid</span>
          </h2>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-[10px] tracking-[0.4em] uppercase text-[#5ec8d8]/70">
            webgl · instanced · real-time
          </div>
          <div className="text-[10px] tracking-[0.4em] uppercase text-[#7a6e62] mt-1">
            move cursor · the camera follows
          </div>
        </div>
      </div>

      <div
        className="relative h-[72vh] min-h-[520px] w-full"
        onPointerMove={() => window.dispatchEvent(new CustomEvent('intel:skyline'))}
      >
        <Canvas
          dpr={[1, 1.6]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 8, 22], fov: 42, near: 0.1, far: 120 }}
          shadows={false}
        >
          <color attach="background" args={['#05060a']} />
          <fogExp2 attach="fog" args={['#1a0d06', 0.036]} />

          <ambientLight intensity={0.12} color="#3a2a1e" />
          <hemisphereLight args={['#ff9a3c', '#050406', 0.35]} />
          <directionalLight position={[-20, 30, -10]} intensity={0.55} color="#ff9a3c" />
          <pointLight position={[0, 12, 0]} color="#e7b766" intensity={2.2} distance={40} />
          <pointLight position={[-18, 6, -10]} color="#ff3b6e" intensity={1.3} distance={24} />

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#080606" roughness={0.55} metalness={0.5} />
          </mesh>

          <Suspense fallback={null}>
            <City data={buildings} />
            <Billboards signs={signs} />
            <Spinner />
            <Rain />
            <Sparkles count={60} size={2} scale={[40, 20, 40]} speed={0.3} color="#e7b766" />
          </Suspense>

          <CameraRig />
        </Canvas>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 20%, transparent 40%, rgba(5,6,10,0.55) 100%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.22) 2px 3px)',
            mixBlendMode: 'multiply',
            opacity: 0.4,
          }}
        />

        <div className="absolute bottom-4 left-6 md:left-10 right-6 md:right-10 flex items-center justify-between text-[10px] tracking-[0.4em] uppercase text-[#c9b8a6]/70 pointer-events-none">
          <span>unit · spinner-{String(Math.floor(Math.random() * 899 + 100))}</span>
          <span className="text-[#ff9a3c]/80">quiet storm · 14°c · wet</span>
        </div>
      </div>
    </section>
  );
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
