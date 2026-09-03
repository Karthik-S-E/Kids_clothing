import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useThemeStore } from "../store/themeStore";

function PeacockOrb({ dark }: { dark: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.18;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.12;
    // Tie rotation slightly to mouse movement
    mesh.current.rotation.y += state.pointer.x * 0.05;
    mesh.current.rotation.x += state.pointer.y * 0.05;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={mesh} scale={1.35}>
        <icosahedronGeometry args={[1.15, 24]} />
        <meshPhysicalMaterial
          color={dark ? "#14b8a6" : "#0f766e"}
          emissive={dark ? "#042f2e" : "#134e4a"}
          roughness={0.1}
          metalness={0.72}
          transmission={0.9}
          thickness={2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          ior={1.5}
        />
      </mesh>
    </Float>
  );
}

function GoldRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.z += d * 0.35;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2.4, 0.2, 0]}>
      <torusGeometry args={[2.05, 0.035, 16, 120]} />
      <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.18} emissive="#7a5a10" />
    </mesh>
  );
}

function FeatherRibbons({ dark }: { dark: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mats = useMemo(
    () =>
      [dark ? "#2dd4bf" : "#0d9488", "#d4af37", dark ? "#818cf8" : "#c084fc"].map(
        (color) =>
          new THREE.MeshStandardMaterial({
            color,
            metalness: 0.55,
            roughness: 0.28,
            emissive: color,
            emissiveIntensity: dark ? 0.18 : 0.08,
          }),
      ),
    [dark],
  );

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.pointer.x * 0.35;
    group.current.rotation.x = -state.pointer.y * 0.2;
  });

  return (
    <group ref={group}>
      {mats.map((mat, i) => (
        <mesh key={i} material={mat} position={[Math.sin(i) * 0.2, i * 0.05, 0]} rotation={[0.4, i, 0.2]}>
          <torusKnotGeometry args={[0.85 + i * 0.12, 0.028, 180, 16, 2, 3 + i]} />
        </mesh>
      ))}
    </group>
  );
}

export function HeroScene() {
  const theme = useThemeStore((s) => s.theme);
  const dark = theme === "dark";

  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={[dark ? "#0a0f0d" : "#f6efe4"]} />
      <fog attach="fog" args={[dark ? "#0a0f0d" : "#f6efe4", 8, 16]} />
      <ambientLight intensity={dark ? 0.35 : 0.7} />
      <spotLight position={[6, 8, 4]} intensity={dark ? 80 : 40} color="#f3e6b4" />
      <pointLight position={[-4, -2, 3]} intensity={dark ? 18 : 10} color={dark ? "#2dd4bf" : "#0f766e"} />
      <PeacockOrb dark={dark} />
      <GoldRing />
      <FeatherRibbons dark={dark} />
      <Sparkles count={80} scale={8} size={dark ? 3 : 2} color={dark ? "#f3e6b4" : "#d4af37"} speed={0.4} />
      <Environment preset={dark ? "night" : "sunset"} />
    </Canvas>
  );
}
