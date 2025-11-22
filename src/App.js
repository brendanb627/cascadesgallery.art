import "./App.css";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import FirstPersonControls from "./FirstPersonControls";
import { SpotLight, useGLTF } from "@react-three/drei";
import { CubeTextureLoader, TextureLoader } from "three";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

function App() {
  const targetRef = useRef();
  return (
    <div className="App">
      <Canvas>
        <SkyBox />
        {/* <object3D ref={targetRef} position={[0, 0, 0]} /> */}

        <FirstPersonControls />
        {/* <PositionDisplay /> */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} />
        <SpotLightComponent position={[60, 5, -170]} />
        <SpotLightComponent position={[60, 5, -170]} />
        <SpotLightComponent position={[60, 5, -170]} />
        <SpotLightComponent position={[60, 5, -170]} />
        <pointLight
          position={[60, 4, -170]}
          intensity={3}
          distance={100}
          decay={0}
        />
        <CityModel />
        <RoomModel />
        <TexturedCube />

      </Canvas>
    </div>
  );
}

function SpotLightComponent({ position }) {
  const spotLightRef = useRef();
  const targetRef = useRef();
  console.log(position);

  useEffect(() => {
    if (spotLightRef.current && targetRef.current) {
      spotLightRef.current.target = targetRef.current;
      spotLightRef.current.target.updateMatrixWorld();
    }
  }, []);

  return (
    <>
      <object3D
        ref={targetRef}
        position={[position[0], position[1] - 5, position[2]]}
      />
      <spotLight
        ref={spotLightRef}
        position={position}
        intensity={100}
        angle={Math.PI / 3}
        penumbra={0.5}
        decay={1.2}
      />
    </>
  );
}


function PositionDisplay() {
  const { camera } = useThree();
  const [pos, setPos] = React.useState([0, 0, 0]);

  useFrame(() => {
    setPos([camera.position.x, camera.position.y, camera.position.z]);
  });

  return (
    <Text position={[0, 5, -10]} fontSize={0.5} color="white">
      {`X: ${pos[0].toFixed(2)} Y: ${pos[1].toFixed(2)} Z: ${pos[2].toFixed(2)}`}
    </Text>
  );
}

function RoomModel() {
  const { scene } = useGLTF("/artroom.glb");
  //scene.scale.set(0.01, 0.01, 0.01);
  scene.scale.set(2, 2, 2);
  scene.position.set(60, 0, -170);
  scene.rotation.set(0, -90, 0);

  return <primitive object={scene} />;
}

function CityModel() {
  const { scene } = useGLTF("/city_pack_3.glb");
  scene.scale.set(0.03, 0.03, 0.03);
  //scene.scale.set(2, 2, 2);
  scene.position.set(10, -160, 10);

  return <primitive object={scene} />;
}

function SkyBox() {
  const { scene } = useThree();
  useEffect(() => {
    const loader = new CubeTextureLoader();
    loader.setPath("/");

    const texture = loader.load(
      [
        "clouds1_east.jpg", // px
        "clouds1_west.jpg", // nx
        "clouds1_up.jpg", // py
        "clouds1_bottom.jpg", // ny
        "clouds1_south.jpg", // pz
        "clouds1_north.jpg", // nz
      ],
      () => console.log("Skybox loaded!") // so we know it’s working
    );

    scene.background = texture;
  }, [scene]);

  return null;
}

function TexturedCube() {
  const textures = useLoader(TextureLoader, [
    "/clouds1_east.jpg", // right (+X)
    "/clouds1_west.jpg", // left (-X)
    "/clouds1_up.jpg", // top (+Y)
    "/clouds1_down.jpg", // bottom (-Y)
    "/clouds1_north.jpg", // front (+Z)
    "/clouds1_south.jpg", // back (-Z)
  ]);

  return (
    <mesh scale={[1000, 1000, 1000]}>
      {" "}
      {/* huge cube */}
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        side={THREE.BackSide}
        map={textures[0]}
        attach="material-0"
      />
      <meshBasicMaterial
        side={THREE.BackSide}
        map={textures[1]}
        attach="material-1"
      />
      <meshBasicMaterial
        side={THREE.BackSide}
        map={textures[2]}
        attach="material-2"
      />
      <meshBasicMaterial
        side={THREE.BackSide}
        map={textures[3]}
        attach="material-3"
      />
      <meshBasicMaterial
        side={THREE.BackSide}
        map={textures[4]}
        attach="material-4"
      />
      <meshBasicMaterial
        side={THREE.BackSide}
        map={textures[5]}
        attach="material-5"
      />
    </mesh>
  );
}

export default App;
