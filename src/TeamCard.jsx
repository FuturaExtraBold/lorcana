import { Image } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

let currentHoverId = null;

export default function TeamCard({
  member,
  index,
  activeId,
  setActiveId,
  openDistance = 40,
  ...props
}) {
  const imageRef = useRef();
  const rootRef = useRef();
  const cardRef = useRef();
  const backMeshRef = useRef();
  const backMaterialRef = useRef();
  const pivotRef = useRef();
  const lastAzimuthRef = useRef(null);
  const textureConfigRef = useRef({ map: null });
  const basePositionRef = useRef(new THREE.Vector3());
  const baseQuaternionRef = useRef(new THREE.Quaternion());
  const openQuaternionRef = useRef(new THREE.Quaternion());
  const tempQuaternionRef = useRef(new THREE.Quaternion());
  const spinQuaternionRef = useRef(new THREE.Quaternion());
  const tiltQuaternionRef = useRef(new THREE.Quaternion());
  const cameraRightRef = useRef(new THREE.Vector3());
  const cameraUpRef = useRef(new THREE.Vector3());
  const openProgressRef = useRef(0);
  const spinProgressRef = useRef(0);
  const [revealed, setRevealed] = useState(false);
  const isOpen = activeId === member.id;
  const spinAxis = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const tempPositionRef = useRef(new THREE.Vector3());
  const cameraPositionRef = useRef(new THREE.Vector3());
  const cameraDirectionRef = useRef(new THREE.Vector3());
  const openTargetPositionRef = useRef(new THREE.Vector3());

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.renderOrder = 1;
    }
  }, []);

  useEffect(() => {
    if (props.position) {
      basePositionRef.current.fromArray(props.position);
    }
    if (props.rotation) {
      baseQuaternionRef.current.setFromEuler(
        new THREE.Euler(...props.rotation),
      );
    } else {
      baseQuaternionRef.current.identity();
    }
    openQuaternionRef.current.identity();
  }, [props.position, props.rotation]);

  useEffect(() => {
    const delay = Math.max(0, index ?? 0) * 50;
    const timer = setTimeout(() => setRevealed(true), delay);
    return () => clearTimeout(timer);
  }, [index]);

  const cardWidth = 3.6;
  const cardHeight = 5.0;
  const backUrl = "/cardback.jpg";
  const pivotOffsetY = cardHeight * 0.4;
  const baseScale = 1.0;
  const activeScale = 1.5;
  const openScale = 2.6;
  const maxTilt = Math.PI / 36;

  const applyRenderState = (isFront, isActive) => {
    if (!imageRef.current?.material) return;

    const configs = {
      front: { imgDepth: false, imgOrder: 10, backDepth: false },
      active: { imgDepth: false, imgOrder: 2, backDepth: true },
      default: { imgDepth: true, imgOrder: 1, backDepth: true },
    };

    const key = isFront ? "front" : isActive ? "active" : "default";
    const cfg = configs[key];

    imageRef.current.material.depthTest = cfg.imgDepth;
    imageRef.current.material.depthWrite = cfg.imgDepth;
    imageRef.current.renderOrder = cfg.imgOrder;
    if (rootRef.current) rootRef.current.renderOrder = cfg.imgOrder;
    if (backMeshRef.current) backMeshRef.current.renderOrder = cfg.imgOrder;
    if (backMaterialRef.current) {
      backMaterialRef.current.depthTest = cfg.backDepth;
      backMaterialRef.current.depthWrite = false;
    }
  };

  useFrame((state, delta) => {
    if (!rootRef.current || !cardRef.current || !pivotRef.current) {
      return;
    }
    const openTarget = isOpen ? 1 : 0;
    const openSpeed = isOpen ? 6 : 12;
    openProgressRef.current = THREE.MathUtils.damp(
      openProgressRef.current,
      openTarget,
      openSpeed,
      delta,
    );
    const openMix = openProgressRef.current;
    const spinSpeed = isOpen ? openSpeed / 1.5 : openSpeed;
    spinProgressRef.current = THREE.MathUtils.damp(
      spinProgressRef.current,
      openTarget,
      spinSpeed,
      delta,
    );
    const spinMix = spinProgressRef.current;

    const isActive = currentHoverId === member.id;
    const isOpeningOrClosing = openMix > 0.001;

    if (!isOpeningOrClosing && imageRef.current) {
      const targetScale = isActive ? activeScale : baseScale;
      const targetZ = isActive ? 0.35 : 0;
      easing.damp3(cardRef.current.scale, targetScale, 0.125, delta);
      easing.damp(imageRef.current.position, "z", targetZ, 0.125, delta);
    } else if (imageRef.current) {
      cardRef.current.scale.setScalar(1);
      imageRef.current.position.z = 0;
    }
    const azimuth = Math.atan2(
      state.camera.position.x,
      state.camera.position.z,
    );
    let deltaAngle = 0;
    if (lastAzimuthRef.current !== null) {
      const rawDelta = azimuth - lastAzimuthRef.current;
      deltaAngle = Math.atan2(Math.sin(rawDelta), Math.cos(rawDelta));
    }
    lastAzimuthRef.current = azimuth;

    const velocity = deltaAngle / Math.max(delta, 0.0001);
    const targetTilt = isOpen
      ? 0
      : Math.max(-maxTilt, Math.min(maxTilt, -velocity * 0.05));
    pivotRef.current.rotation.z = targetTilt;

    const isFront = isOpen || openMix > 0.001;
    applyRenderState(isFront, isActive);

    if (imageRef.current?.material) {
      const targetOpacity = revealed ? 1 : 0;
      easing.damp(
        imageRef.current.material,
        "opacity",
        targetOpacity,
        0.2,
        delta,
      );
    }

    state.camera.getWorldPosition(cameraPositionRef.current);
    state.camera.getWorldDirection(cameraDirectionRef.current);
    cameraRightRef.current
      .copy(cameraDirectionRef.current)
      .cross(state.camera.up)
      .normalize();
    cameraUpRef.current.copy(state.camera.up).normalize();
    openTargetPositionRef.current
      .copy(cameraPositionRef.current)
      .addScaledVector(cameraDirectionRef.current, openDistance);
    tempPositionRef.current.copy(openTargetPositionRef.current);
    rootRef.current.position.lerpVectors(
      basePositionRef.current,
      tempPositionRef.current,
      openMix,
    );
    const scale = THREE.MathUtils.lerp(1, openScale, openMix);
    rootRef.current.scale.setScalar(scale);

    if (openMix > 0) {
      openQuaternionRef.current.copy(state.camera.quaternion);
    }
    tempQuaternionRef.current
      .copy(baseQuaternionRef.current)
      .slerp(openQuaternionRef.current, openMix);
    if (isOpen) {
      const spinAngle = -Math.PI * 2 * spinMix;
      spinQuaternionRef.current.setFromAxisAngle(spinAxis, spinAngle);
      tempQuaternionRef.current.multiply(spinQuaternionRef.current);
      const tiltX = -state.pointer.y * 0.18 * openMix;
      const tiltY = state.pointer.x * 0.18 * openMix;
      tiltQuaternionRef.current.setFromEuler(new THREE.Euler(tiltX, tiltY, 0));
      tempQuaternionRef.current.multiply(tiltQuaternionRef.current);
    }
    rootRef.current.quaternion.copy(tempQuaternionRef.current);

    if (imageRef.current?.material?.map) {
      const map = imageRef.current.material.map;
      if (textureConfigRef.current.map !== map) {
        textureConfigRef.current.map = map;
        map.minFilter = THREE.LinearMipmapLinearFilter;
        map.magFilter = THREE.LinearFilter;
        map.anisotropy = Math.min(4, state.gl.capabilities.getMaxAnisotropy());
        map.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={rootRef} position={props.position} rotation={props.rotation}>
      <group ref={pivotRef} position={[0, pivotOffsetY, 0]}>
        <group ref={cardRef} position={[0, -pivotOffsetY, 0]}>
          <Image
            ref={backMeshRef}
            url={backUrl}
            scale={[cardWidth, cardHeight, 1]}
            radius={0.15}
            transparent
            opacity={1}
            side={THREE.DoubleSide}
            position={[0, 0, -0.01]}
            onUpdate={(self) => {
              backMaterialRef.current = self.material;
              const map = self.material?.map;
              if (map) {
                map.wrapS = THREE.RepeatWrapping;
                map.repeat.x = -1;
                map.offset.x = 1;
                map.needsUpdate = true;
              }
            }}
          />

          <Suspense fallback={null}>
            <Image
              ref={imageRef}
              url={member.thumb}
              transparent
              opacity={0}
              side={THREE.FrontSide}
              radius={0.15}
              scale={[cardWidth, cardHeight, 1]}
              onClick={(event) => {
                event.stopPropagation();
                setActiveId?.(member.id);
              }}
              onPointerOver={() => {
                if (activeId !== null && activeId !== member.id) {
                  return;
                }
                currentHoverId = member.id;
                if (rootRef.current) {
                  rootRef.current.renderOrder = 1;
                }
              }}
              onPointerOut={() => {
                if (activeId !== null && activeId !== member.id) {
                  return;
                }
                if (currentHoverId === member.id) {
                  currentHoverId = null;
                }
                if (rootRef.current) {
                  rootRef.current.renderOrder = 0;
                }
              }}
            />
          </Suspense>
        </group>
      </group>
    </group>
  );
}
