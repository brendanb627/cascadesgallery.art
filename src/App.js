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
    chatLabel:
      "In this tense scene, Ilya Repin paints the moment of a political exile returning after being in exile (an incredibly rare event). The artwork was painted during a time of political unrest and uncertainty and the artwork focuses on the emotional struggle that the exiles and their families faced during this time. Repin curates the complex emotions for each character very carefully, creating the blend of shock, fear, and hope. While this artwork has significant historical context, it also represents the universal experience of feeling tension and political transformation.",
    sources: [
      '"The Unexpected Return 1884–1888." Tretyakov Gallery. Accessed December 2, 2025. https://my.tretyakov.ru/app/masterpiece/8415?lang=en.',
      '"Ilya Yefimovich Repin | Biography, Art, & Facts" Britannica. Accessed December 2, 2025. https://www.britannica.com/biography/Ilya-Yefimovich-Repin.',
    ],
  },
  "barge-haulers-on-the-volga.glb": {
    name: "Barge Haulers on the Volga",
    artist: "Ilya Repin",
    year: "1870-1873",
    excerpt:
      "Ilya Repin, Barge Haulers on the Volga, 1870-1873. Oil on canvas, 131.5 by 281 cm. State Russian Museum, St. Petersburg.",
    chatLabel:
      "Widely considered one of Ilya Repin's greatest achievements, this artwork represents the raw emotion and exhaustion of the working class enduring the brutal physical labor involved in being a barge hauler on the Volga river. Instead of depicting the workers as a group or focusing on other details, Repin decides to clearly portray each person individually, each with their own emotion, and level of exhaustion. The artwork is incredibly well created since the scene could be compared to that of a modern day photo, with the reactions and emotions seeming authentic and raw.",
    sources: [
      '"Barge Haulers on the Volga - Ilya Repin." Google Arts & Culture. Accessed December 5, 2025. https://artsandculture.google.com/asset/barge-haulers-on-the-volga/WAG9_bL0sypwYQ?hl=en.',
      '"Ilya Yefimovich Repin | Biography, Art, & Facts" Britannica. Accessed December 2, 2025. https://www.britannica.com/biography/Ilya-Yefimovich-Repin.',
    ],
  },
  "arrest-of-a-propogandist.glb": {
    name: "Arrest of a Propagandist",
    artist: "Ilya Repin",
    year: "1892",
    excerpt:
      "Ilya Repin, Arrest of a Propagandist, 1892. Oil on canvas, State Tretyakov Gallery, Moscow.",
    chatLabel:
      "Arrest of a Propagandist by Ilya Repin creates a dramatic moment where a Russian revolutionary is apprehended for attempting to distribute political papers or materials. The artwork was painted in a time where these actions were met with incredibly severe actions. The scene is further dramatized with shadowy figures, and papers thrown about covering the floor. The figures in the scene range from looking stern and anxious, while the arrested revolutionary looks determined and steadfast. Repin's work on this piece helps it to explore the moral, emotional, and physical risk of the social activism in 19th century Russia.",
    sources: [
      '"Arrest of a Propagandist 1892" Tretyakov Gallery. Accessed December 2, 2025. https://my.tretyakov.ru/app/masterpiece/77858?lang=en.',
    ],
  },
  "portrait-of-modest.glb": {
    name: "Portrait of Modest Mussorgsky",
    artist: "Ilya Repin",
    year: "1881",
    excerpt:
      "Ilya Repin, Portrait of Modest Mussorgsky, 1881. Oil on canvas, 71.8 by 58.5 cm. State Tretyakov Gallery, Moscow.",
    chatLabel:
      "Modest Mussorgsky was a popular composer during Repin's time. The portrait that Repin depicts in Portrait of Modest Mussorgsky is not the common convention of painting significant figures in a way that puts them in their best light. Mussorgsky is instead painted with red cheeks, tired eyes, and a very fragile posture. This reflects Mussorgsky's declining health at the time, and his effort he put forth while he worked part time as a composer while also working as a civil servant. While the painting shows the recently hospitalized Musorgsky, it also radiates the composer's creativity and passion through the gaze and the honest portrait that Repin creates.",
    sources: [
      '"Modest Mussorgsky | Russian Composer & Nationalist." Britannica. Accessed December 6, 2025. https://www.britannica.com/biography/Modest-Mussorgsky.',
      '"Portrait of Modest Mussorgsky 1881" Tretyakov Gallery. Accessed December 2, 2025. https://my.tretyakov.ru/app/masterpiece/20705?lang=en.',
    ],
  },
  "the-prisoner.glb": {
    name: "The Prisoner",
    artist: "Nikolai Yaroshenko",
    year: "1878",
    excerpt:
      "Nikolai Yaroshenko, The Prisoner, 1878. Oil on canvas, 55 by 48.5 cm. State Russian Museum, St. Petersburg.",
    chatLabel:
      "Yaroshenko's The Prisoner is overall a quiet, meditative piece. The artwork was created during a time where political imprisonment was a harsh reality for many. However, there is also a powerful message of inner resilience within the artwork. Yaroshenko presents this prisoner not as a political figure or an outcast but a sympathetic depiction of a human person. The man gazes out the window as the sun from outside is the only thing illuminating his otherwise dark cell. This use of color hints at the suffering and the longingness of the prisoner.",
    sources: [
      '"Nikolai Yaroshenko." Wikipedia, October 28, 2025. https://en.wikipedia.org/wiki/Nikolai_Yaroshenko.',
    ],
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
          <FirstPersonControls />
          <ambientLight intensity={0.2} />
          <pointLight
            position={[0, 4, 0]}
            intensity={1}
            distance={100}
            decay={0}
          />
          <ProximityDetector />
          <ArtModel
            filePath="they-did-not-expect-him.glb"
            location={[2.7, 1.7, 0.5]}
            rotation={[0, Math.PI, 0]}
            scale={[1, 1, 1]}
          />
          <ArtModel
            filePath="barge-haulers-on-the-volga.glb"
            location={[-10.6, 1.7, 21]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[1, 1, 1]}
          />
          <ArtModel
            filePath="arrest-of-a-propogandist.glb"
            location={[-15, 1.7, -21]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={[1, 1, 1]}
          />
          <ArtModel
            filePath="portrait-of-modest.glb"
            location={[13, 0.5, 21]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[1, 1, 1]}
          />
          <ArtModel
            filePath="the-prisoner.glb"
            location={[13.8, 1.7, -21]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={[1, 1, 1]}
          />
          <RoomModel />
        </Canvas>
        <ArtworkOverlay artwork={nearbyArtwork} />
        <InitialOverlay
          visible={displayOverlay}
          onClose={() => setDisplayOverlay(false)}
        />
      </ArtworkContext.Provider>
    </div>
  );
}

function InitialOverlay({ visible, onClose }) {
  if (!visible) return null;
  return (
    <div className="initial-overlay" onClick={onClose}>
      <div className="initial-content">
        <p>Cascades Gallery Presents:</p>
        <h1>The Room Holds Its Breath</h1>
        <p className="intro-text">
          The cost of political conviction and the social struggle that many
          faced in late 19th century Russia was something that Repin and
          Yaroshenko knew well. The artworks selected for this exhibit show not
          the heroism nor the traitorism of the Russian revolutionaries, but the
          social struggle they faced from others. The artworks <em>They Did Not
          Expect Him</em> and <em>Arrest of a Propagandist</em> by Repin highlight the
          emotional fallout as a result of these revolutionaries' activism,
          representing themes of separation and sacrifice. Yaroshenko's <em>The
          Prisoner</em> adds the aspect of endurance and resilience during
          oppression. Repin's <em>Barge Haulers on the Volga</em> shifted the focus to
          the struggle of the working class, a simple reminder to the wealthy
          people who first viewed his work, while the <em>Portrait of Modest
          Mussorgsky</em> reminds the viewer that even significant icons can face
          internal struggle
        </p>
        <p className="artist">Curated by Brendan Bessman for ART 101</p>
        <p>Click to enter</p>
      </div>
      <div className="about-exhibit-panel">
        <h2>About this exhibit</h2>
        <p className="sidebar">
          This exhibit is incredibly unique in the fact that it is a virtual
          museum and allows the user to walk around, creating a similar
          experience to walking into an actual art exhibit. When building this
          virtual room initially, I created it to look like the museums I saw.
          This meant the room had white walls, large windows, etc. I realized
          that I should take advantage of this virtual room and make the room
          look like a 19th century home, similar to the one in Repin’s <em>They Did
          Not Expect Him</em>. I also purposely put the primary artwork in a position
          where it is in the middle of the other works, force the viewer to make
          an awkward movement around the exhibit, create the slightest bit of
          tension; a reminder of the tension in Repin and Yeshenko’s works.
        </p>
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
      const distance = camera.position.distanceTo(
        new THREE.Vector3(...art.location)
      );
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
          <p className="artist">
            {artwork.artist} • {artwork.year}
          </p>
          <p className="excerpt">
            {artwork.excerpt}
            <br />
            <br />
            {artwork.chatLabel}
          </p>
          {artwork.sources && artwork.sources.length > 0 && (
            <div className="sources">
              <h3>Sources:</h3>
              <div className="source">
                {artwork.sources.map((source) => (
                  <div>
                    <p className="source">{source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
