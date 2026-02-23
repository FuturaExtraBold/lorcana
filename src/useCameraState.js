import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function useCameraState() {
  const cameraPositionRef = useRef(new THREE.Vector3());
  const cameraDirectionRef = useRef(new THREE.Vector3());
  const lastAzimuthRef = useRef(null);
  const velocityRef = useRef(0);

  useFrame(({ camera }, delta) => {
    camera.getWorldPosition(cameraPositionRef.current);
    camera.getWorldDirection(cameraDirectionRef.current);

    const azimuth = Math.atan2(
      camera.position.x,
      camera.position.z
    );
    let deltaAngle = 0;
    if (lastAzimuthRef.current !== null) {
      const rawDelta = azimuth - lastAzimuthRef.current;
      deltaAngle = Math.atan2(Math.sin(rawDelta), Math.cos(rawDelta));
    }
    lastAzimuthRef.current = azimuth;

    const rawVelocity = deltaAngle / Math.max(delta, 0.0001);
    velocityRef.current = THREE.MathUtils.lerp(
      velocityRef.current,
      rawVelocity,
      0.3
    );
  });

  return {
    cameraPositionRef,
    cameraDirectionRef,
    velocityRef,
  };
}
