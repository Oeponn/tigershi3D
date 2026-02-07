import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { extend, useThree } from "@react-three/fiber";
import { animate, createScope, onScroll, type Scope } from "animejs";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";

import styles from "./App.module.scss";
import ProgressBar from "./components/ProgressBar";
import progressBarClassNames from "./components/ProgressBar.module.scss";

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
  const root = useRef<HTMLDivElement>(null);
  const $scope = useRef<Scope | null>(null);
  useEffect(() => {
    $scope.current = createScope({ root }).add((self) => {
      // Every anime.js instance declared here is now scoped to <div ref={root}>

      animate(".progressBar", {
        width: ["0%", "100%"],
        easing: "linear",
        autoplay: onScroll({
          // container: ".scrollContainer",
          // target: ".scrollContainer",
          target: `.${styles.filler}`,
          axis: "y",
          enter: "top top",
          leave: "bottom bottom",
          // sync: true,
          sync: 0.8,
          // debug: true,
          onEnter: () => {
            console.log("Entered progress bar animation");
          },
          onLeave: () => {
            console.log("Left progress bar animation");
          },
        }),
      });

      // animate(".progressBarContainer", {
      //   opacity: [0, 1],
      //   y: [100, 0],
      //   duration: 300,
      //   easing: "linear",
      //   autoplay: onScroll({
      //     target: `.${styles.filler}`,
      //     axis: "y",
      //     enter: "top 150px",
      //     leave: "bottom bottom",
      //     // sync: "play reverse play reverse",
      //     sync: "play reverse",
      //     debug: true,
      //   }),
      // });

      return () => {
        $scope.current?.revert();
      };
    }, []);

    // useEffect(() => {
    //   animate(".progressBar", {
    //     width: ["0%", "100%"],
    //     easing: "linear",
    //     autoplay: onScroll({
    //       // container: ".scrollContainer",
    //       // target: ".scrollContainer",
    //       target: `.${styles.filler}`,
    //       axis: "y",
    //       enter: "top top",
    //       leave: "bottom bottom",
    //       sync: true,
    //       // sync: 0.8,
    //       debug: true,
    //       onEnter: () => console.log("Entered scroll area"),
    //       onLeave: () => console.log("Left scroll area"),
    //     }),
    //   });
    // animate(".progressBarContainer", {
    //   // opacity: [0, 1],
    //   y: [100, 0],
    //   duration: 300,
    //   easing: "linear",
    //   autoplay: onScroll({
    //     // target: ".scrollContainer",
    //     target: `.${styles.appWrapper}`,
    //     axis: "y",
    //     enter: "top 150px",
    //     leave: "bottom bottom",
    //     // sync: "play reverse play reverse",
    //     sync: "play reverse",
    //     debug: true,
    //   }),
    // });
  }, []);
  // const progressBarRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const progressBarContainer = progressBarRef.current;
  //   if (!progressBarContainer) return;

  //   const { progressBar } = progressBarClassNames;

  //   const $bar = progressBarContainer.querySelector<HTMLDivElement>(
  //     `.${progressBar}`,
  //   );

  //   animate(progressBarContainer, {
  //     scale: [{ to: 1.05, ease: "inOut(3)", duration: 200 }, { to: 1 }],
  //     loop: true,
  //     loopDelay: 1000,
  //   });

  //   // animate(progressBarContainer, {
  //   animate($bar!, {
  //     // width: ["0%", "100%"],
  //     width: ["0px", "500px"],
  //     // height: ["0px", "500px"],
  //     // loop: true,
  //     autoplay: onScroll({
  //       // container: `#root`,
  //       // target: `.${styles.appWrapper}`,
  //       target: `.${styles.innerContainer}`,
  //       // enter: "top 100px",
  //       // leave: "bottom 90%",
  //       debug: true,
  //       // sync: "play reverse",
  //       // sync: 1,
  //       onEnter: () => console.log("Entered scroll area"),
  //       onLeave: () => console.log("Left scroll area"),
  //     }),
  //   });
  // }, []);

  return (
    <div className={styles.appWrapper} ref={root}>
      {/* <div className={"scrollContainer"}> */}
      <div className={styles.filler}>
        {/* <ProgressBar progressBarRef={progressBarRef} /> */}
        <div className="progressBarContainer">
          <div className="progressBar" />
        </div>
      </div>
      <div className={styles.canvasWrapper}>
        {/* <Canvas
          camera={{ position: [5, 5, 5], fov: 35 }}
          // camera={{ position: [0, 0, 250], fov: 1 }}
          style={{ width: "100vw", height: "100vh" }}
          gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={10} />

          <Model />

          <OrbitControls />
        </Canvas> */}
      </div>
    </div>
  );
}

export default App;
