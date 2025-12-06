// src/FirstPersonControls.jsx
import { useThree, useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function FirstPersonControls() {
  const { camera } = useThree();

  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    arrowup: false,
    arrowdown: false,
    arrowleft: false,
    arrowright: false,
  });

  // Toggle to true while tuning to print debug logs
  const DEBUG = false;

  // Hardcoded room bounding box — adjust these values to match your room extents
  // The camera will be prevented from leaving these bounds (X and Z).
  const bounds = useRef({
    minX: -38, // left wall
    maxX: 38, // right wall
    minZ: -20, // back wall
    maxZ: 21, // front wall
  });

  // small clearance so the camera doesn't sit exactly on the wall
  const clearance = 0.6;

  // Initialize camera position only once
  useEffect(() => {
    camera.position.set(-33, 1, 0); // keep your intended start
    camera.rotation.set(0, -Math.PI / 2, 0);
  }, [camera]);

  // keyboard handlers
  useEffect(() => {
    const down = (e) => {
      const key = e.key?.toLowerCase();
      if (key && key in keys.current) keys.current[key] = true;
    };
    const up = (e) => {
      const key = e.key?.toLowerCase();
      if (key && key in keys.current) keys.current[key] = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Movement — useFrame keeps everything on the R3F render loop
  useFrame((state, delta) => {
    // speed in units per second
    const speed = 7;

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const move = new THREE.Vector3();

    camera.getWorldDirection(forward);
    right.copy(forward).cross(camera.up).normalize();

    // WASD
    const moveZ =
      (keys.current.w || keys.current.arrowup ? 1 : 0) -
      (keys.current.s || keys.current.arrowdown ? 1 : 0);
    const moveX =
      (keys.current.d || keys.current.arrowright ? 1 : 0) -
      (keys.current.a || keys.current.arrowleft ? 1 : 0);

    if (moveZ === 0 && moveX === 0) return;

    move.set(0, 0, 0);
    if (moveZ !== 0) move.addScaledVector(forward, moveZ);
    if (moveX !== 0) move.addScaledVector(right, moveX);
    move.y = 0;

    // normalize + scale
    move.normalize();
    const distance = speed * delta;
    const proposed = camera.position.clone().addScaledVector(move, distance);

    // clamp helper
    const clampPos = (v) => {
      v.x = Math.max(
        bounds.current.minX + clearance,
        Math.min(bounds.current.maxX - clearance, v.x)
      );
      v.z = Math.max(
        bounds.current.minZ + clearance,
        Math.min(bounds.current.maxZ - clearance, v.z)
      );
      return v;
    };

    // naive clamped position
    const clamped = clampPos(proposed.clone());

    if (DEBUG) {
      console.debug(
        "camera",
        camera.position.toArray().map((n) => n.toFixed(2))
      );
      console.debug(
        "proposed",
        proposed.toArray().map((n) => n.toFixed(2))
      );
      console.debug(
        "clamped",
        clamped.toArray().map((n) => n.toFixed(2))
      );
    }

    // if proposed is allowed (no clamp), just apply
    if (proposed.x === clamped.x && proposed.z === clamped.z) {
      camera.position.copy(proposed);
      return;
    }

    // Otherwise try axis-wise sliding:
    // attempt X-only move
    const attemptX = camera.position.clone().setX(proposed.x);
    attemptX.z = camera.position.z;
    clampPos(attemptX); // keep X clamped only via helper
    if (attemptX.x !== camera.position.x) {
      // ensure new X doesn't leave room in Z to avoid corner clipping
      if (
        attemptX.x >= bounds.current.minX + clearance &&
        attemptX.x <= bounds.current.maxX - clearance
      ) {
        camera.position.x = attemptX.x;
        return;
      }
    }

    // attempt Z-only move
    const attemptZ = camera.position.clone().setZ(proposed.z);
    attemptZ.x = camera.position.x;
    clampPos(attemptZ);
    if (attemptZ.z !== camera.position.z) {
      if (
        attemptZ.z >= bounds.current.minZ + clearance &&
        attemptZ.z <= bounds.current.maxZ - clearance
      ) {
        camera.position.z = attemptZ.z;
        return;
      }
    }

    // if neither axis can move (corner / blocked) do nothing
    return;
  });

  return <PointerLockControls />;
}
