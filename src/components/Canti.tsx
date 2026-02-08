import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { extend, useThree } from "@react-three/fiber";
// import { animate, createScope, onScroll, type Scope } from "animejs";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";

extend({ LineSegments2, LineMaterial, LineSegmentsGeometry });

const LINE_WIDTH = 1;

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
  reverse = false,
  spinSpeed = 0.5,
  lit = false,
}: {
  obj: THREE.Object3D;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  threshold?: number;
  spin?: boolean;
  reverse?: boolean;
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
    groupRef.current.rotation.z += delta * spinSpeed * (reverse ? -1 : 1);
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

// function Model() {
//   const { nodes } = useGLTF("/tigershi-test-3d.glb");

//   return (
//     <group>
//       <FillWithEdges
//         obj={nodes.Plus}
//         lineWidth={LINE_WIDTH}
//         spin={false}
//         // lit
//       />
//       <FillWithEdges
//         obj={nodes.Square}
//         lineWidth={LINE_WIDTH}
//         // lit
//       />
//       <FillWithEdges
//         obj={nodes.Hexagon}
//         lineWidth={LINE_WIDTH}
//         spin={false}
//         // lit
//       />
//       <FillWithEdges
//         obj={nodes.Cover}
//         lineWidth={LINE_WIDTH}
//         reverse={true}
//         // spin={false}
//         // lit
//       />
//     </group>
//   );
// }

function CantiModel() {
  const { nodes } = useGLTF("/canti-draft.glb");
  console.log("cantiNodes:", nodes);

  return (
    <group>
      <FillWithEdges
        obj={nodes.A_Frame}
        lineWidth={LINE_WIDTH}
        spin={false}
        // lit
      />
      <FillWithEdges
        obj={nodes.A_Screen}
        lineWidth={LINE_WIDTH}
        spin={false}
        threshold={20}
      />
      <FillWithEdges obj={nodes.B_Sides} lineWidth={LINE_WIDTH} spin={false} />
      <FillWithEdges
        obj={nodes.C_Cover}
        lineWidth={LINE_WIDTH}
        reverse={true}
        spin={false}
      />
      <FillWithEdges
        obj={nodes.E_NodeCover}
        lineWidth={LINE_WIDTH}
        reverse={true}
        spin={false}
      />
      <FillWithEdges
        obj={nodes.F_Node}
        lineWidth={LINE_WIDTH}
        reverse={true}
        spin={false}
      />
      <FillWithEdges
        obj={nodes.G_Cover_Inner}
        lineWidth={LINE_WIDTH}
        reverse={true}
        spin={false}
        threshold={4}
      />
      <FillWithEdges
        obj={nodes.H_Tube_Connector}
        lineWidth={LINE_WIDTH}
        reverse={true}
        spin={false}
      />
      <FillWithEdges
        obj={nodes.I_Tube}
        lineWidth={LINE_WIDTH}
        // reverse={true}
        // spin={false}
      />
      <FillWithEdges
        obj={nodes.J_Cap}
        lineWidth={LINE_WIDTH}
        reverse={true}
        // spin={false}
      />
    </group>
  );
}

function Canti() {
  return (
    <Canvas
      camera={{ position: [5, -5, 5], fov: 35 }}
      // camera={{ position: [0, 0, 5], fov: 70 }}
      // camera={{ position: [0, 0, 250], fov: 1 }}
      style={{ width: "100vw", height: "100vh" }}
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={10} />

      {/* <Model /> */}
      <CantiModel />

      <OrbitControls
        // autoRotate={true}
        // autoRotateSpeed={0.5}
        maxDistance={20}
        minDistance={3}
        enableZoom={false}
      />
    </Canvas>
  );
}

export default Canti;
