import { OrbitControls, useGLTF } from "@react-three/drei";
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

/**
 * Reads progressRef.current.p (0..1) and moves the camera around the model.
 * Works well with OrbitControls if we update controls.target + call update().
 */
function CameraRig({
  progressRef,
  controlsRef,
  target = new THREE.Vector3(0, 0, 0),
}: {
  progressRef: React.RefObject<{ p: number }>;
  controlsRef: React.RefObject<any>;
  target?: THREE.Vector3;
}) {
  const { camera } = useThree();

  // Re-used vectors to avoid allocations every frame
  const desiredPos = useRef(new THREE.Vector3());
  const tmpTarget = useRef(target.clone());

  useFrame((_, delta) => {
    const p = clamp01(progressRef.current?.p ?? 0);

    // --- You can tune these ---
    const radius = lerp(6, 3.75, p); // zoom-in slightly as you scroll
    const theta = lerp(0, Math.PI * 1.15, p); // orbit around Y
    const phi = lerp(Math.PI * 0.48, Math.PI * 0.32, p); // tilt (lower phi = higher camera)

    // Spherical -> Cartesian (Y up)
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    desiredPos.current.set(x, y, z);

    // Smooth a bit so it doesn’t feel jittery with scroll
    const smooth = 1 - Math.pow(0.001, delta); // framerate-independent smoothing
    camera.position.lerp(desiredPos.current, smooth);

    // Look at target (or update OrbitControls target)
    tmpTarget.current.copy(target);

    const controls = controlsRef.current;
    if (controls) {
      controls.target.copy(tmpTarget.current);
      controls.update();
    } else {
      camera.lookAt(tmpTarget.current);
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

/**
 * NOTE: In React 19, `ref` is just a normal prop, but you don’t even need it here.
 * We pass in a progressRef (a stable object) that animejs mutates.
 */
function Canti({
  cameraProgressRef,
}: {
  cameraProgressRef: React.RefObject<{ p: number }>;
}) {
  const controlsRef = useRef<any>(null);

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 55 }}
      style={{ width: "100vw", height: "100vh" }}
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={10} />

      <CantiModel />

      {/* Camera animation driven by animejs progress */}
      <CameraRig
        progressRef={cameraProgressRef}
        controlsRef={controlsRef}
        target={new THREE.Vector3(0, 0, 0)}
      />

      <OrbitControls
        ref={controlsRef}
        maxDistance={20}
        minDistance={3}
        enableZoom={false}
        // Optional: prevent user fighting the scroll-driven camera
        // enableRotate={false}
      />
    </Canvas>
  );
}

export default Canti;
