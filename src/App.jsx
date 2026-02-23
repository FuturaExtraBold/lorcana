import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useRef, useState } from "react";
import * as THREE from "three";
import Cylinder from "./components/Cylinder/Cylinder";
import Loading from "./components/Loading/Loading";
import Logo from "./components/Logo/Logo";
import { INK_COLORS_ARRAY } from "./constants/colors";
import { CARD_CONFIG } from "./constants/useCardConfig";
import { AppProvider } from "./context/AppContext";
import { useCameraState } from "./hooks/useCameraState";
import { useGradientAnimation } from "./hooks/useGradientAnimation";

function SceneControls({ activeId }) {
  return (
    <OrbitControls
      enabled={true}
      enableZoom={false}
      enablePan={false}
      enableRotate={activeId === null}
      rotateSpeed={-0.25}
      autoRotate={false}
      autoRotateSpeed={0.5}
      minPolarAngle={Math.PI / 2}
      maxPolarAngle={Math.PI / 2}
      target={[0, 0, 0]}
    />
  );
}

function Scrim({ active, distance = 40 }) {
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
      raycast={() => null}
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

function CylinderWithCamera({ data, activeId, setActiveId, onThumbRevealed }) {
  const cameraStateRef = useCameraState();

  return (
    <Cylinder
      data={data}
      activeId={activeId}
      setActiveId={setActiveId}
      onThumbRevealed={onThumbRevealed}
      cameraStateRef={cameraStateRef}
    />
  );
}

export default function App() {
  const mainRef = useRef(null);
  const [activeId, setActiveId] = useState(null);
  const [cardsRevealed, setCardsRevealed] = useState(0);
  const openDistance = CARD_CONFIG.openDistance;
  const baseColors = [0x111111, 0x444444];
  const dpr =
    typeof window !== "undefined"
      ? Math.min(window.devicePixelRatio || 1, 1.5)
      : 1;
  const cardData = Array.from({ length: 204 }).map((_, i) => ({
    id: i,
    thumb: `/thumbs/${String(i + 1).padStart(3, "0")}.jpg`,
    full: `/lorcana_images/${String(i + 1).padStart(3, "0")}.jpg`,
    inkColor: INK_COLORS_ARRAY[Math.floor(i / 34)],
  }));
  const activeInkColor = cardData[activeId]?.inkColor ?? null;
  const cardCount = cardData.length;
  const handleCardRevealed = useCallback(() => {
    setCardsRevealed((count) => Math.min(cardCount, count + 1));
  }, [cardCount]);

  useGradientAnimation(mainRef, activeInkColor, baseColors);

  return (
    <main
      ref={mainRef}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "linear-gradient(0deg, #111 0%, #666 100%)",
      }}
    >
      <Loading loadedCount={cardsRevealed} totalCount={cardCount} />
      <AppProvider>
        <Canvas
          style={{ position: "relative", zIndex: 20 }}
          dpr={dpr}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          onPointerMissed={() => setActiveId(null)}
          onCreated={({ gl }) => {
            if (gl?.xr) {
              gl.xr.enabled = false;
            }
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={28} />

          <SceneControls activeId={activeId} />

          <ambientLight intensity={0.5} />

          <Scrim active={activeId !== null} distance={openDistance} />

          <CylinderWithCamera
            data={cardData}
            activeId={activeId}
            setActiveId={setActiveId}
            onThumbRevealed={handleCardRevealed}
          />
        </Canvas>
      </AppProvider>
      <Logo
        src="/lorcana_logo.png"
        alt="Lorcana Logo"
        position="top"
        isLoaded={cardsRevealed === cardCount}
      />
      <Logo
        src="/first_chapter_logo.png"
        alt="The First Chapter"
        position="bottom"
        isLoaded={cardsRevealed === cardCount}
      />
    </main>
  );
}
