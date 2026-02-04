import "./App.css";

import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { extend, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";

import styles from "./App.module.scss";
import reactLogo from "./assets/react.svg";

extend({ LineSegments2, LineMaterial, LineSegmentsGeometry });

function FillWithEdges({
  obj,
  fill = "#fff",
  stroke = "#333",
  lineWidth = 3, // pixels
  threshold = 20,
  spin = true,
  spinSpeed = 0.5,
}: {
  obj: THREE.Object3D;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  threshold?: number;
  spin?: boolean;
  spinSpeed?: number;
}) {
  const groupRef = useRef<THREE.Group | null>(null);

  const mesh = obj as THREE.Mesh;
  const geom = mesh.geometry as THREE.BufferGeometry;

  // 1) Build edges (thin geometry)
  const edgesGeom = useMemo(
    () => new THREE.EdgesGeometry(geom, threshold),
    [geom, threshold],
  );

  // 2) Convert EdgesGeometry -> LineSegmentsGeometry positions
  const lineGeom = useMemo(() => {
    const g = new LineSegmentsGeometry();
    const pos = edgesGeom.attributes.position.array as ArrayLike<number>;
    // type error
    // g.setPositions(pos);
    g.setPositions(new Float32Array(pos));
    return g;
  }, [edgesGeom]);

  // 3) Create fat-line material
  const lineMat = useMemo(() => {
    const m = new LineMaterial({
      color: new THREE.Color(stroke),
      linewidth: lineWidth, // pixels (when worldUnits = false)
      transparent: true,
      depthTest: true,
      depthWrite: false,
    });
    // Pixel-sized lines consistently
    m.worldUnits = false;
    return m;
  }, [stroke, lineWidth]);

  // LineMaterial resolution
  const { size } = useThree();
  useMemo(() => {
    // size is in CSS pixels; LineMaterial expects renderer resolution
    lineMat.resolution.set(size.width, size.height);
  }, [lineMat, size.width, size.height]);

  useFrame((_, delta) => {
    if (!spin || !groupRef.current) return;
    groupRef.current.rotation.z += delta * spinSpeed;
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
        <meshBasicMaterial color={fill} />
      </mesh>

      {/* Thick edges (fat lines) */}
      {/* @ts-expect-error - JSX intrinsic types added via .d.ts (see below) */}
      <lineSegments2 geometry={lineGeom} material={lineMat} />
    </group>
  );
}

function Model() {
  const { nodes } = useGLTF("/tigershi-test-3d.glb");

  return (
    <group>
      <primitive object={nodes.Plus} />
      {/* <FillWithEdges obj={nodes.Plus} lineWidth={4} /> */}
      <FillWithEdges obj={nodes.Square} lineWidth={4} />
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
