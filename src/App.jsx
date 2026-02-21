import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import CenteredLogo from "./CenteredLogo";
import CylinderLayout from "./CylinderLayout";
import { HoverProvider } from "./HoverContext";
import LavaLampBackground from "./LavaLamp";

function Scrim({ active, distance = 40, onClose }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const { camera, viewport } = useThree();
  const camPosRef = useRef(new THREE.Vector3());
  const camDirRef = useRef(new THREE.Vector3());
  const targetRef = useRef(new THREE.Vector3());
  const opacityRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current || !materialRef.current) {
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

    const targetOpacity = active ? 0.5 : 0;
    opacityRef.current = THREE.MathUtils.damp(
      opacityRef.current,
      targetOpacity,
      6,
      delta,
    );
    materialRef.current.opacity = opacityRef.current;
    meshRef.current.visible = opacityRef.current > 0.01;
  });

  return (
    <mesh
      ref={meshRef}
      renderOrder={5}
      frustumCulled={false}
      onPointerDown={(event) => {
        if (!active) {
          return;
        }
        event.stopPropagation();
        onClose?.();
      }}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={materialRef}
        color="black"
        transparent
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
  const baseLampColors = [0x111111, 0x444444];
  const inkColors = [
    0xf5b202, 0x81377b, 0x2a8934, 0xd3082f, 0x0189c4, 0x9fa8b4,
  ];
  const teamData = useMemo(
    () =>
      Array.from({ length: 204 }).map((_, i) => ({
        id: i,
        thumb: `/lorcana_images/${String(i + 1).padStart(3, "0")}.jpg`,
        inkColor: inkColors[Math.floor(i / 34)],
      })),
    [],
  );
  const activeInkColor = teamData[activeId]?.inkColor ?? null;

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "linear-gradient(0deg, #111 0%, #666 100%)",
      }}
    >
      <LavaLampBackground
        colors={baseLampColors}
        activeColor={activeInkColor}
        transitionSeconds={1}
      />
      <HoverProvider>
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
          <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={28} />

          <OrbitControls
            enabled={activeId === null}
            enableZoom={false}
            enablePan={false}
            rotateSpeed={-0.5}
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
      </HoverProvider>
      <CenteredLogo
        src="/lorcana_logo.png"
        alt="Lorcana Logo"
        position="top"
        maxWidth={240}
      />
      <CenteredLogo
        src="/first_chapter_logo.png"
        alt="The First Chapter"
        position="bottom"
        maxWidth={360}
      />
    </main>
  );
}
