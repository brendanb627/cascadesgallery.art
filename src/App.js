import "./App.css";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import FirstPersonControls from "./FirstPersonControls";
import { useGLTF } from "@react-three/drei";
import { CubeTextureLoader } from "three";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export const ArtworkContext = React.createContext(null);

const artworkMetadata = {
  "they-did-not-expect-him.glb": {
    name: "They Did Not Expect Him",
    artist: "Ilya Repin",
    year: "1884-1888",
    excerpt:
      "A revolutionary returns to his family unannounced. This powerful painting captures the tension and emotion of the moment, with family members frozen in shock and recognition.",
  },
  "barge-haulers-on-the-volga.glb": {
    name: "Barge Haulers on the Volga",
    artist: "Ilya Repin",
    year: "1870-1873",
    excerpt:
      "Depicting the harsh reality of laborers hauling boats along the Volga River. A monumental work that critiques social inequality and celebrates human endurance.",
  },
  "arrest-of-a-propogandist.glb": {
    name: "Arrest of a Propagandist",
    artist: "Ilya Repin",
    year: "1892",
    excerpt:
      "A revolutionary is arrested for spreading anti-government propaganda. The composition conveys drama and the conflict between authority and idealism.",
  },
  "portrait-of-modest.glb": {
    name: "Portrait of Modest Mussorgsky",
    artist: "Ilya Repin",
    year: "1881",
    excerpt:
      "An intimate portrait of the renowned Russian composer. Repin captures both the subject's vulnerability and artistic genius in this striking work.",
  },
  "the-prisoner.glb": {
    name: "The Prisoner",
    artist: "Ilya Repin",
    year: "1874",
    excerpt:
      "A poignant depiction of a political prisoner. The work explores themes of confinement, suffering, and the human spirit under oppression.",
  },
};

const artworkLocations = [
  { filePath: "they-did-not-expect-him.glb", location: [2.7, 1.7, 0.5] },
  { filePath: "barge-haulers-on-the-volga.glb", location: [-10.6, 1.7, 21] },
  { filePath: "arrest-of-a-propogandist.glb", location: [-15, 1.7, -21] },
  { filePath: "portrait-of-modest.glb", location: [13, 0.5, 21] },
  { filePath: "the-prisoner.glb", location: [13.8, 1.7, -21] },
];

function App() {
  const [nearbyArtwork, setNearbyArtwork] = useState(null);

  return (
    <div className="App">
      <ArtworkContext.Provider value={{ nearbyArtwork, setNearbyArtwork }}>
        <Canvas>
          <SkyBox />
          <FirstPersonControls />
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 4, 0]} intensity={1} distance={100} decay={0} />
          <ProximityDetector />
          <ArtModel filePath="they-did-not-expect-him.glb" location={[2.7, 1.7, 0.5]} rotation={[0, Math.PI, 0]} scale={[1, 1, 1]} />
          <ArtModel filePath="barge-haulers-on-the-volga.glb" location={[-10.6, 1.7, 21]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1, 1]} />
          <ArtModel filePath="arrest-of-a-propogandist.glb" location={[-15, 1.7, -21]} rotation={[0, -Math.PI / 2, 0]} scale={[1, 1, 1]} />
          <ArtModel filePath="portrait-of-modest.glb" location={[13, 0.5, 21]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1, 1]} />
          <ArtModel filePath="the-prisoner.glb" location={[13.8, 1.7, -21]} rotation={[0, -Math.PI / 2, 0]} scale={[1, 1, 1]} />
          <RoomModel />
        </Canvas>
        <ArtworkOverlay artwork={nearbyArtwork} />
      </ArtworkContext.Provider>
    </div>
  );
}

function ProximityDetector() {
  const { camera } = useThree();
  const { setNearbyArtwork } = React.useContext(ArtworkContext);
  const lastArtworkRef = useRef(null);
  const proximityDistance = 8;

  useFrame(() => {
    let found = null;

    for (const art of artworkLocations) {
      const distance = camera.position.distanceTo(new THREE.Vector3(...art.location));
      if (distance < proximityDistance) {
        found = {
          filePath: art.filePath,
          ...artworkMetadata[art.filePath],
          distance,
        };
        break;
      }
    }

    if (found?.filePath !== lastArtworkRef.current?.filePath) {
      setNearbyArtwork(found);
      lastArtworkRef.current = found;
    }
  });

  return null;
}

function RoomModel() {
  const { scene } = useGLTF("new_artroom3.glb");

  useEffect(() => {
    scene.scale.set(2.5, 2.7, 2.5);
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
  }, [scene]);

  return <primitive object={scene} />;
}

function ArtModel({ filePath, location, rotation, scale }) {
  const { scene } = useGLTF(filePath);

  useEffect(() => {
    scene.scale.set(scale[0], scale[1], scale[2]);
    scene.position.set(location[0], location[1], location[2]);
    scene.rotation.set(rotation[0], rotation[1], rotation[2]);
  }, [scene, filePath]);

  return <primitive object={scene} />;
}

function ArtworkOverlay({ artwork }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!!artwork);
  }, [artwork]);

  return (
    <div className={`artwork-overlay ${isVisible ? "visible" : ""}`}>
      {artwork && (
        <div className="artwork-content">
          <h2>{artwork.name}</h2>
          <p className="artist">{artwork.artist} • {artwork.year}</p>
          <p className="excerpt">{artwork.excerpt}</p>
        </div>
      )}
    </div>
  );
}

function SkyBox() {
  const { scene } = useThree();

  useEffect(() => {
    const loader = new CubeTextureLoader();
    loader.setPath("/");

    const texture = loader.load([
      "clouds1_east.jpg",
      "clouds1_west.jpg",
      "clouds1_up.jpg",
      "clouds1_bottom.jpg",
      "clouds1_south.jpg",
      "clouds1_north.jpg",
    ]);

    scene.background = texture;
  }, [scene]);

  return null;
}

export default App;