import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Environment, ContactShadows } from "@react-three/drei";

function GlassNucleus() {
  const meshRef = useRef();

  // Subtle, high-end breathing movement
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(t / 4) * 0.2;
    meshRef.current.rotation.y = Math.cos(t / 4) * 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 128, 128]} scale={2.2}>
        <MeshDistortMaterial
          color="#ffffff"      // Pure white core
          speed={1.5}          // Slow, elegant movement
          distort={0.3}        // Gentle distortion
          radius={1}
          roughness={0}        // Highly reflective
          metalness={0.2}      // Soft metallic sheen
          transparent={true}
          opacity={0.4}        // Glass-like transparency
        />
      </Sphere>
    </Float>
  );
}

export default function AppleBackground() {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: -1,
      background: "radial-gradient(circle at center, #1e293b 0%, #020617 100%)", // Deep Slate to Black
    }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        {/* Realistic Studio Lighting */}
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={1} />
        
        {/* This provides the realistic reflections seen in Apple renders */}
        <Environment preset="city" /> 

        <GlassNucleus />

        {/* Soft shadow on the 'floor' to ground the object */}
        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
      </Canvas>
    </div>
  );
}