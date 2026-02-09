import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { extend } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";

extend({ LineSegments2, LineMaterial, LineSegmentsGeometry });

const LINE_WIDTH = 1;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function ApplyCameraState({
  cameraRef,
  cameraStateRef,
  controlsRef,
  smoothing = 0.15,
}: {
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  cameraStateRef: React.RefObject<{
    x: number;
    y: number;
    z: number;
    tx: number;
    ty: number;
    tz: number;
    fov: number;
  }>;
  controlsRef: React.RefObject<any>;
  smoothing?: number;
}) {
  const desiredPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());

  useFrame(() => {
    const cam = cameraRef.current;
    const s = cameraStateRef.current;
    if (!cam || !s) return;

    desiredPos.current.set(s.x, s.y, s.z);
    desiredTarget.current.set(s.tx, s.ty, s.tz);

    cam.position.lerp(desiredPos.current, smoothing);
    // cam.position.copy(desiredPos.current);

    // fov (PerspectiveCamera only)
    if (cam.fov !== s.fov) {
      cam.fov = s.fov;
      cam.updateProjectionMatrix();
    }

    const controls = controlsRef.current;
    controls.target.copy(desiredTarget.current);
    if (controls) {
      controls.target.lerp(desiredTarget.current, smoothing);
      // controls.target.copy(desiredTarget.current);
      controls.update();
    } else {
      cam.lookAt(desiredTarget.current);
    }
  });

  return null;
}

function FillWithEdges({
  obj,
  fill = "#222120",
  stroke = "#fff",
  lineWidth = 3,
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

  const edgesGeom = useMemo(
    () => new THREE.EdgesGeometry(geom, threshold),
    [geom, threshold],
  );

  const lineGeom = useMemo(() => {
    const g = new LineSegmentsGeometry();
    const pos = edgesGeom.attributes.position.array as ArrayLike<number>;
    g.setPositions(new Float32Array(pos));
    return g;
  }, [edgesGeom]);

  const lineMat = useMemo(() => {
    const m = new LineMaterial({
      color: new THREE.Color(stroke),
      linewidth: lineWidth,
      transparent: true,
      depthTest: true,
      depthWrite: false,
    });
    m.worldUnits = false;
    return m;
  }, [stroke, lineWidth]);

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

      <lineSegments2 geometry={lineGeom} material={lineMat} />
    </group>
  );
}

function CantiModel() {
  const { nodes } = useGLTF("/canti-draft.glb");

  return (
    <group>
      <FillWithEdges obj={nodes.A_Frame} lineWidth={LINE_WIDTH} spin={false} />
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
        reverse
        spin={false}
      />
      <FillWithEdges
        obj={nodes.E_NodeCover}
        lineWidth={LINE_WIDTH}
        reverse
        spin={false}
      />
      <FillWithEdges
        obj={nodes.F_Node}
        lineWidth={LINE_WIDTH}
        reverse
        spin={false}
      />
      <FillWithEdges
        obj={nodes.G_Cover_Inner}
        lineWidth={LINE_WIDTH}
        reverse
        spin={false}
        threshold={4}
      />
      <FillWithEdges
        obj={nodes.H_Tube_Connector}
        lineWidth={LINE_WIDTH}
        reverse
        spin={false}
      />
      <FillWithEdges obj={nodes.I_Tube} lineWidth={LINE_WIDTH} />
      <FillWithEdges obj={nodes.J_Cap} lineWidth={LINE_WIDTH} reverse />
    </group>
  );
}

function Canti({
  cameraStateRef,
}: {
  cameraStateRef: React.RefObject<{
    x: number;
    y: number;
    z: number;
    tx: number;
    ty: number;
    tz: number;
    fov: number;
  }>;
}) {
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
    >
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        // position={[0, 0, 6]}
        // fov={55}
        near={0.1}
        far={1000}
        rotateY={Math.PI / 2}
      />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={10} />

      <CantiModel />

      <ApplyCameraState
        cameraRef={cameraRef}
        cameraStateRef={cameraStateRef}
        controlsRef={controlsRef}
      />

      <OrbitControls
        ref={controlsRef}
        // dampingFactor={1}
        enableRotate={false}
        enablePan={false}
        enableZoom={false}
      />
    </Canvas>
  );
}

export default Canti;
