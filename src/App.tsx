import "./App.css";

import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

import styles from "./App.module.scss";
import reactLogo from "./assets/react.svg";

function FillWithEdges({ obj }: { obj: THREE.Object3D }) {
  const groupRef = useRef<THREE.Group | null>(null);

  const mesh = obj as THREE.Mesh;
  const geom = mesh.geometry as THREE.BufferGeometry;

  const edges = useMemo(() => new THREE.EdgesGeometry(geom, 20), [geom]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += delta;
  });

  return (
    <group
      ref={groupRef}
      position={mesh.position}
      rotation={mesh.rotation}
      scale={mesh.scale}
    >
      {/* Fill (unlit) */}
      <mesh geometry={geom}>
        <meshBasicMaterial color="#fff" />
      </mesh>

      {/* Edges overlay */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#333" />
      </lineSegments>
    </group>
  );
}

function Model() {
  const { nodes } = useGLTF("/tigershi-test-3d.glb");

  return (
    <group>
      <primitive object={nodes.Plus} />
      <FillWithEdges obj={nodes.Square} />
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
