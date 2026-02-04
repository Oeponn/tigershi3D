import "./App.css";

import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

import styles from "./App.module.scss";
import reactLogo from "./assets/react.svg";

function Model() {
  const { nodes } = useGLTF("/tigershi-test-3d.glb");

  const squareRef = useRef<THREE.Object3D | null>(null);

  useFrame((_, delta: number) => {
    if (!squareRef.current) return;
    squareRef.current.rotation.z += delta;
  });

  // You WILL see a `Scene` node — that's expected
  // We care about the named meshes
  return (
    <group>
      <primitive object={nodes.Plus} />
      <primitive ref={squareRef} object={nodes.Square} />
      <primitive object={nodes.Hexagon} />
      <primitive object={nodes.Cover} />
    </group>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <div className={styles.canvasWrapper}>
          <Canvas
            camera={{ position: [0, 0, 7], fov: 50 }}
            style={{ width: "100vw", height: "100vh" }}
          >
            {/* Basic lighting so you can see things */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />

            <Model />

            {/* Temporary: lets you orbit and verify geometry */}
            <OrbitControls />
          </Canvas>
        </div>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
