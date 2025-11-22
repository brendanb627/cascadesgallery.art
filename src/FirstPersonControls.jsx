// ...existing code...
import { useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three"

export default function FirstPersonControls() {
    const { camera } = useThree();

    const keys = useRef({
      w: false,
      a: false,
      s: false,
      d: false,
    });

    camera.position.set(60, 5, -190);
    console.log(camera.position);

    useEffect(() => {
      const down = (e) => (keys.current[e.key.toLowerCase()] = true);
      const up = (e) => (keys.current[e.key.toLowerCase()] = false);
      console.log(camera.position);

      window.addEventListener("keydown", down);
      window.addEventListener("keyup", up);
      return () => {
        window.removeEventListener("keydown", down);
        window.removeEventListener("keyup", up);
      };
    }, []);

    useEffect(() => {
      const speed = 200;
      const clock = new THREE.Clock();
      let rafId;

      const forward = new THREE.Vector3();
      const right = new THREE.Vector3();
      const move = new THREE.Vector3();

      function update() {
        const delta = clock.getDelta();

        camera.getWorldDirection(forward);
        right.copy(forward).cross(camera.up).normalize();

        const moveZ = (keys.current.w ? 1 : 0) - (keys.current.s ? 1 : 0);
        const moveX = (keys.current.d ? 1 : 0) - (keys.current.a ? 1 : 0);

        move.set(0, 0, 0);
        if (moveZ !== 0) move.addScaledVector(forward, moveZ);
        if (moveX !== 0) move.addScaledVector(right, moveX);

        move.y = 0;

        if (move.lengthSq() > 0) {
          move.normalize();
          camera.position.addScaledVector(move, delta * speed);
        }

        rafId = requestAnimationFrame(update);
      }

      rafId = requestAnimationFrame(update);

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
      };
    }, [camera]);

    return <PointerLockControls />;
}