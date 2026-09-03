import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useThemeStore } from "../store/themeStore";

function HoverCrystal({ hover, color }: { hover: boolean; color: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * (hover ? 1.4 : 0.35);
    mesh.current.rotation.x += delta * 0.15;
    const t = hover ? 1.15 : 1;
    mesh.current.scale.lerp(new THREE.Vector3(t, t, t), 0.12);
  });
  return (
    <mesh ref={mesh}>
      <octahedronGeometry args={[0.85, 0]} />
      <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  );
}

export function CardScene({ hover, gender }: { hover: boolean; gender: "Boy" | "Girl" }) {
  const theme = useThemeStore((s) => s.theme);
  const color = useMemo(
    () => (gender === "Girl" ? "#c084fc" : theme === "dark" ? "#2dd4bf" : "#0f766e"),
    [gender, theme],
  );
  return (
    <Canvas camera={{ position: [0, 0, 3.2], fov: 40 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[2, 2, 3]} intensity={12} color="#f3e6b4" />
      <HoverCrystal hover={hover} color={color} />
    </Canvas>
  );
}
