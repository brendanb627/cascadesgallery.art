import './App.css';
import { Canvas, useLoader, useThree } from "@react-three/fiber"
import FirstPersonControls from './FirstPersonControls';
import { useGLTF } from "@react-three/drei";
import { CubeTextureLoader, TextureLoader } from 'three';
import { useEffect } from 'react';
import * as THREE from "three";

function App() {
  return (
    <div className="App">
    <Canvas>
      <SkyBox />

      <FirstPersonControls />
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 10, 5]} />

      <RoomModel />
      <TexturedCube/>
    </Canvas>
    </div>
  );
}

function RoomModel() {
  const { scene } = useGLTF("/city_pack_3.glb");
  scene.scale.set(0.01, 0.01, 0.01);
  return <primitive object={scene} />;
}

function SkyBox() {
  const { scene } = useThree();
    useEffect(() => {
    const loader = new CubeTextureLoader();
    loader.setPath('/');

    const texture = loader.load(
      [
        'clouds1_east.jpg',   // px
        'clouds1_west.jpg',   // nx
        'clouds1_up.jpg',    // py
        'clouds1_bottom.jpg', // ny
        'clouds1_south.jpg',  // pz
        'clouds1_north.jpg',  // nz
      ],
      () => console.log("Skybox loaded!")  // so we know it’s working
    );

    scene.background = texture;
  }, [scene]);

  return null;
}

function TexturedCube() {
  const textures = useLoader(TextureLoader, [
    "/clouds1_east.jpg",   // right (+X)
    "/clouds1_west.jpg",   // left (-X)
    "/clouds1_up.jpg",    // top (+Y)
    "/clouds1_down.jpg", // bottom (-Y)
    "/clouds1_north.jpg",  // front (+Z)
    "/clouds1_south.jpg",  // back (-Z)
  ]);

  return (
    <mesh scale={[1000, 1000, 1000]}> {/* huge cube */}
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial side={THREE.BackSide} map={textures[0]} attach="material-0" />
      <meshBasicMaterial side={THREE.BackSide} map={textures[1]} attach="material-1" />
      <meshBasicMaterial side={THREE.BackSide} map={textures[2]} attach="material-2" />
      <meshBasicMaterial side={THREE.BackSide} map={textures[3]} attach="material-3" />
      <meshBasicMaterial side={THREE.BackSide} map={textures[4]} attach="material-4" />
      <meshBasicMaterial side={THREE.BackSide} map={textures[5]} attach="material-5" />
    </mesh>
  );
}

export default App;
