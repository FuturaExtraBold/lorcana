import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import CylinderLayout from "./CylinderLayout";

function Scrim({ active, distance = 40, onClose }) {
  const meshRef = useRef();
  const { camera, viewport } = useThree();
  const camPosRef = useRef(new THREE.Vector3());
  const camDirRef = useRef(new THREE.Vector3());
  const targetRef = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!meshRef.current || !active) {
      return;
    }
    camera.getWorldPosition(camPosRef.current);
    camera.getWorldDirection(camDirRef.current);
    targetRef.current
      .copy(camPosRef.current)
      .addScaledVector(camDirRef.current, distance - 1);
    meshRef.current.position.copy(targetRef.current);
    meshRef.current.quaternion.copy(camera.quaternion);

    const { width, height } = viewport.getCurrentViewport(
      camera,
      targetRef.current,
    );
    const planeWidth = width * 1.1;
    const planeHeight = height * 1.1;
    meshRef.current.scale.set(planeWidth, planeHeight, 1);
  });

  if (!active) {
    return null;
  }

  return (
    <mesh
      ref={meshRef}
      renderOrder={5}
      frustumCulled={false}
      onPointerDown={(event) => {
        event.stopPropagation();
        onClose?.();
      }}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color="black"
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export default function App() {
  const [activeId, setActiveId] = useState(null);
  const openDistance = 40;
  const teamData = Array.from({ length: 204 }).map((_, i) => ({
    id: i,
    full: `/lorcana_images/${String(i + 1).padStart(3, "0")}.jpg`,
    thumb: `/thumbs/${String(i + 1).padStart(3, "0")}.jpg`,
  }));

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "linear-gradient(0deg, #111 0%, #666 100%)",
      }}
    >
      <Canvas
        style={{ position: "relative", zIndex: 20 }}
        dpr={[2, 2]}
        onPointerMissed={() => setActiveId(null)}
        onCreated={({ gl }) => {
          if (gl?.xr) {
            gl.xr.enabled = false;
          }
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 0.1]}
          fov={28}
        />

        <OrbitControls
          enabled={activeId === null}
          enableZoom={false}
          enablePan={false}
          rotateSpeed={-0.5}
          autoRotate={false}
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0, 0]}
        />

        <ambientLight intensity={0.5} />
        <Suspense fallback={null}>
          <Environment preset="forest" />
        </Suspense>

        <Scrim
          active={activeId !== null}
          distance={openDistance}
          onClose={() => setActiveId(null)}
        />

        <CylinderLayout
          data={teamData}
          activeId={activeId}
          setActiveId={setActiveId}
          openDistance={openDistance}
        />
      </Canvas>
    </div>
  );
}
