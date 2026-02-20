import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import CylinderLayout from "./CylinderLayout";

export default function App() {
  const [activeId, setActiveId] = useState(null);
  const teamData = Array.from({ length: 204 }).map((_, i) => ({
    id: i,
    full: `/lorcana_images/${String(i + 1).padStart(3, "0")}.jpg`,
    thumb: `/lorcana_images/thumbs/${String(i + 1).padStart(3, "0")}.jpg`,
  }));

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(0deg, #111 0%, #666 100%)",
        // background: "red",
      }}
    >
      <Canvas
        dpr={[2, 2]} // Device pixel ratio range (min/max)
        // shadows // Enable shadow map rendering
        // frameloop="always" // Render mode: always | demand | never
        // gl={{ antialias: true }} // GL renderer options
        onPointerMissed={() => setActiveId(null)}
        onCreated={({ gl }) => {
          if (gl?.xr) {
            gl.xr.enabled = false;
          }
        }} // Hook after GL init
      >
        {/* CAMERA: Located at center (0,0,0) looking out */}
        <PerspectiveCamera
          makeDefault // Use this camera as the default
          position={[0, 0, 0.1]} // Camera position in world space
          fov={28} // Field of view in degrees
          // near={0.1} // Near clipping plane
          // far={1000} // Far clipping plane
          // zoom={1} // Zoom factor (affects fov)
        />

        {/* CONTROLS:
            - enableZoom={false}: Locks you in the center
            - rotateSpeed={-0.5}: Inverted control feels like looking around
            - autoRotate: Slowly spins the room to hint at 3D
        */}
        <OrbitControls
          enableZoom={false} // Allow mouse wheel / pinch zoom
          enablePan={false} // Allow right-drag / two-finger pan
          rotateSpeed={-0.5} // Rotation speed (negative flips direction)
          autoRotate={false} // Auto-rotate around target
          autoRotateSpeed={0.5} // Auto-rotate speed
          minPolarAngle={Math.PI / 2} // Min vertical angle (radians)
          maxPolarAngle={Math.PI / 2} // Max vertical angle (radians)
          target={[0, 0, 0]} // Orbit target position
          // enableDamping // Smooth inertia
          // dampingFactor={0.05} // Damping strength
          // minDistance={1} // Min zoom distance
          // maxDistance={20} // Max zoom distance
          // minAzimuthAngle={-Math.PI / 2} // Min horizontal angle
          // maxAzimuthAngle={Math.PI / 2} // Max horizontal angle
        />

        {/* LIGHTING */}
        <ambientLight
          intensity={0.5} // Global light intensity
          // color="#ffffff" // Light color
        />
        <Suspense fallback={null}>
          <Environment
            preset="forest" // HDRI preset name
            // background // Use environment as scene background
            // blur={0.2} // Background blur amount
            // intensity={1} // Env light intensity
            // environmentIntensity={1} // Alias for intensity (drei)
          />
        </Suspense>

        {/* CONTENT */}
        <CylinderLayout
          data={teamData} // Cards to render
          activeId={activeId}
          setActiveId={setActiveId}
          // radius={50} // Circle radius
        />
      </Canvas>
    </div>
  );
}
