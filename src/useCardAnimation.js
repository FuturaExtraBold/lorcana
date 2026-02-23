import { easing } from "maath";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CARD_CONFIG } from "./useCardConfig";

export function useCardAnimation(
  rootRef,
  cardRef,
  pivotRef,
  imageRef,
  basePositionRef,
  baseQuaternionRef,
  member,
  isOpen,
  currentHoverId,
  revealed,
  cameraStateRef
) {
  const openProgressRef = useRef(0);
  const spinProgressRef = useRef(0);
  const tempPositionRef = useRef(new THREE.Vector3());
  const openTargetPositionRef = useRef(new THREE.Vector3());
  const openQuaternionRef = useRef(new THREE.Quaternion());
  const tempQuaternionRef = useRef(new THREE.Quaternion());
  const spinQuaternionRef = useRef(new THREE.Quaternion());
  const tiltQuaternionRef = useRef(new THREE.Quaternion());
  const spinAxis = useRef(new THREE.Vector3(0, 1, 0));
  const eulerRef = useRef(new THREE.Euler());

  const {
    baseScale,
    activeScale,
    openScale,
    maxTilt,
    openSpeedClosed,
    openSpeedOpen,
    spinSpeedFactor,
    scaleEaseFactor,
    opacityEaseFactor,
    zEaseFactor,
    zActiveOffset,
    tiltSensitivity,
    pointerTiltFactor,
    openingThreshold,
  } = CARD_CONFIG;

  const isActive = currentHoverId === member.id;

  useFrame(({ camera, pointer }, delta) => {
    if (!rootRef.current || !cardRef.current || !pivotRef.current) return;

    const openTarget = isOpen ? 1 : 0;
    const openSpeed = isOpen ? openSpeedOpen : openSpeedClosed;
    openProgressRef.current = THREE.MathUtils.damp(
      openProgressRef.current,
      openTarget,
      openSpeed,
      delta
    );
    const openMix = openProgressRef.current;

    const spinSpeed = isOpen ? openSpeed / spinSpeedFactor : openSpeed;
    spinProgressRef.current = THREE.MathUtils.damp(
      spinProgressRef.current,
      openTarget,
      spinSpeed,
      delta
    );
    const spinMix = spinProgressRef.current;

    const isOpeningOrClosing = openMix > openingThreshold;

    // Update scale and z position
    if (!isOpeningOrClosing && imageRef.current) {
      const targetScale = isActive ? activeScale : baseScale;
      const targetZ = isActive ? zActiveOffset : 0;
      easing.damp3(cardRef.current.scale, targetScale, scaleEaseFactor, delta);
      easing.damp(imageRef.current.position, "z", targetZ, zEaseFactor, delta);
    } else if (imageRef.current) {
      cardRef.current.scale.setScalar(1);
      imageRef.current.position.z = 0;
    }

    const targetTilt = isOpen
      ? 0
      : Math.max(
          -maxTilt,
          Math.min(maxTilt, -cameraStateRef.velocityRef.current * tiltSensitivity)
        );
    pivotRef.current.rotation.z = targetTilt;

    // Update opacity
    if (imageRef.current?.material) {
      const targetOpacity = revealed ? 1 : 0;
      easing.damp(
        imageRef.current.material,
        "opacity",
        targetOpacity,
        opacityEaseFactor,
        delta
      );
    }

    // Update positions and rotations
    openTargetPositionRef.current
      .copy(cameraStateRef.cameraPositionRef.current)
      .addScaledVector(cameraStateRef.cameraDirectionRef.current, 40);

    tempPositionRef.current.copy(openTargetPositionRef.current);
    rootRef.current.position.lerpVectors(
      basePositionRef.current,
      tempPositionRef.current,
      openMix
    );
    const scale = THREE.MathUtils.lerp(1, openScale, openMix);
    rootRef.current.scale.setScalar(scale);

    // Update rotation
    if (openMix > 0) {
      openQuaternionRef.current.copy(camera.quaternion);
    }
    tempQuaternionRef.current
      .copy(baseQuaternionRef.current)
      .slerp(openQuaternionRef.current, openMix);

    if (isOpen) {
      const spinAngle = -Math.PI * 2 * spinMix;
      spinQuaternionRef.current.setFromAxisAngle(spinAxis.current, spinAngle);
      tempQuaternionRef.current.multiply(spinQuaternionRef.current);

      const tiltX = -pointer.y * pointerTiltFactor * openMix;
      const tiltY = pointer.x * pointerTiltFactor * openMix;
      eulerRef.current.set(tiltX, tiltY, 0);
      tiltQuaternionRef.current.setFromEuler(eulerRef.current);
      tempQuaternionRef.current.multiply(tiltQuaternionRef.current);
    }
    rootRef.current.quaternion.copy(tempQuaternionRef.current);

    // Update render state
    const isFront = isOpen || openMix > 0.001;
    updateRenderState(imageRef, rootRef, isFront, isActive);
  });
}

function updateRenderState(imageRef, rootRef, isFront, isActive) {
  if (!imageRef.current?.material) return;

  const states = {
    front: { imgDepth: false, imgOrder: 10, backDepth: false },
    active: { imgDepth: false, imgOrder: 2, backDepth: true },
    default: { imgDepth: true, imgOrder: 1, backDepth: true },
  };

  const state = states[
    isFront ? "front" : isActive ? "active" : "default"
  ];
  imageRef.current.material.depthTest = state.imgDepth;
  imageRef.current.material.depthWrite = state.imgDepth;
  imageRef.current.renderOrder = state.imgOrder;
  if (rootRef.current) rootRef.current.renderOrder = state.imgOrder;
}
