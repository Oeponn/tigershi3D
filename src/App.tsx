import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { extend, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";

import styles from "./App.module.scss";
import ProgressBar from "./components/ProgressBar";

extend({ LineSegments2, LineMaterial, LineSegmentsGeometry });

function FillWithEdges({
  obj,
  // fill = "#fff",
  // stroke = "#333",
  // fill = "#1d1b1a",
  fill = "#222120",
  stroke = "#fff",
  lineWidth = 3, // pixels
  threshold = 2,
  spin = true,
  spinSpeed = 0.5,
  lit = false,
}: {
  obj: THREE.Object3D;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  threshold?: number;
  spin?: boolean;
  spinSpeed?: number;
  lit?: boolean;
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
      // depthTest: true,
      depthTest: true,
      depthWrite: false,
    });
    // Pixel-sized lines consistently
    m.worldUnits = false;
    return m;
  }, [stroke, lineWidth]);

  // LineMaterial resolution
  const { size } = useThree();

  useEffect(() => {
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
        {lit ? (
          <meshStandardMaterial
            color={fill}
            roughness={0.9}
            metalness={0}
            polygonOffset
            polygonOffsetFactor={lineWidth}
            polygonOffsetUnits={lineWidth}
          />
        ) : (
          <meshBasicMaterial
            color={fill}
            polygonOffset
            polygonOffsetFactor={lineWidth}
            polygonOffsetUnits={lineWidth}
          />
        )}
      </mesh>

      {/* Thick edges (fat lines) */}
      <lineSegments2 geometry={lineGeom} material={lineMat} />
    </group>
  );
}

function Model() {
  const LINE_WIDTH = 1;
  const { nodes } = useGLTF("/tigershi-test-3d.glb");

  return (
    <group>
      <FillWithEdges
        obj={nodes.Plus}
        lineWidth={LINE_WIDTH}
        spin={false}
        // lit
      />
      <FillWithEdges
        obj={nodes.Square}
        lineWidth={LINE_WIDTH}
        // lit
      />
      <FillWithEdges
        obj={nodes.Hexagon}
        lineWidth={LINE_WIDTH}
        spin={false}
        // lit
      />
      <FillWithEdges
        obj={nodes.Cover}
        lineWidth={LINE_WIDTH}
        spin={false}
        // lit
      />
    </group>
  );
}

function App() {
  return (
    <div className={styles.canvasWrapper}>
      <ProgressBar />
      <Canvas
        camera={{ position: [5, 5, 5], fov: 35 }}
        // camera={{ position: [0, 0, 250], fov: 1 }}
        style={{ width: "100vw", height: "100vh" }}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
      >
        {/* Basic lighting so you can see things */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={10} />

        <Model />

        {/* Temporary: lets you orbit and verify geometry */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
