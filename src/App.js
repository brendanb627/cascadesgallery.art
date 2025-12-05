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
      "Ilya Repin, They Did Not Expect Him, 1884-1888. Oil on canvas, 160.5 by 167.5 cm. State Tretyakov Gallery, Moscow.",
  },
  "barge-haulers-on-the-volga.glb": {
    name: "Barge Haulers on the Volga",
    artist: "Ilya Repin",
    year: "1870-1873",
    excerpt:
      "Ilya Repin, Barge Haulers on the Volga, 1870-1873. Oil on canvas, 131.5 by 281 cm. State Russian Museum, St. Petersburg.",
  },
  "arrest-of-a-propogandist.glb": {
    name: "Arrest of a Propagandist",
    artist: "Ilya Repin",
    year: "1892",
    excerpt:
      "Ilya Repin, Arrest of a Propagandist, 1892. Oil on canvas. State Tretyakov Gallery, Moscow.",
  },
  "portrait-of-modest.glb": {
    name: "Portrait of Modest Mussorgsky",
    artist: "Ilya Repin",
    year: "1881",
    excerpt:
      "Ilya Repin, Portrait of Modest Mussorgsky, 1881. Oil on canvas, 71.8 by 58.5 cm. State Tretyakov Gallery, Moscow.",
  },
  "the-prisoner.glb": {
    name: "The Prisoner",
    artist: "Nikolai Yaroshenko",
    year: "1874",
    excerpt:
      "Nikolai Yaroshenko, The Prisoner, 1878. Oil on canvas, 55 by 48.5 cm. State Russian Museum, St. Petersburg.",
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
  const [displayOverlay, setDisplayOverlay] = useState(true);
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
        <InitialOverlay visible={displayOverlay} onClose={() => setDisplayOverlay(false)} />
      </ArtworkContext.Provider>
    </div>
  );
}

function InitialOverlay({ visible, onClose }) {
   useEffect(() => {
    if (visible) console.log("InitialOverlay mounted (visible)");
  }, [visible]);
  if (!visible) return null;
  return (
    <div className="initial-overlay" onClick={onClose}>
      <div className="initial-content">
        <p>Cascades Gallery Presents:</p>
        <h1>The Room Holds Its Breath</h1>
        <p>An exhibition with art from 19th Cenutry Russian artists that depict the human emotions and tension 
          between the citizens and the outcasts.</p>
        <p className="artist">Curated by Brendan Bessman for ART 101</p>
        <p>Click to enter</p>
      </div>
    </div>
  );
}

function ProximityDetector() {
  const { camera } = useThree();
  const { setNearbyArtwork } = React.useContext(ArtworkContext);
  const lastArtworkRef = useRef(null);
  const proximityDistance = 9;

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