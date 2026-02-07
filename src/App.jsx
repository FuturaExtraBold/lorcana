import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import CylinderLayout from "./CylinderLayout";

export default function App() {
  const teamData = Array.from({ length: 204 }).map((_, i) => ({
    id: i,
    image: `/lorcana_images/${String(i + 1).padStart(3, "0")}.jpg`,
  }));

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(0deg, #222 0%, #666 100%)",
      }}
    >
      <Canvas dpr={[2, 2]}>
        <Suspense fallback={null}>
          {/* CAMERA: Located at center (0,0,0) looking out */}
          <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={25} />

          {/* CONTROLS:
              - enableZoom={false}: Locks you in the center
              - rotateSpeed={-0.5}: Inverted control feels like looking around
              - autoRotate: Slowly spins the room to hint at 3D
          */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={-0.5}
            autoRotate={false}
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0, 0]} // Orbit around yourself
          />

          {/* LIGHTING */}
          <ambientLight intensity={0.5} />
          <Environment preset="forest" />

          {/* CONTENT */}
          <CylinderLayout data={teamData} radius={12} />
        </Suspense>
      </Canvas>
    </div>
  );
}
