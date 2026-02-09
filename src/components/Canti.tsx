import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { extend } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";

import type { CameraState } from "../types/camera";

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
  cameraStateRef: React.RefObject<CameraState>;
  controlsRef: React.RefObject<any>;
  smoothing?: number;
}) {
  const desiredPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());
  const baseQuaternion = useRef(new THREE.Quaternion());
  const rotationQuaternion = useRef(new THREE.Quaternion());
  const finalQuaternion = useRef(new THREE.Quaternion());
  const euler = useRef(new THREE.Euler());

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
    if (controls) {
      controls.target.lerp(desiredTarget.current, smoothing);
    }

    // Calculate base rotation from lookAt direction
    // Temporarily set camera to look at target to get the base quaternion
    cam.lookAt(desiredTarget.current);
    baseQuaternion.current.copy(cam.quaternion); // Apply relative rotations if provided
    if (s.rx !== undefined || s.ry !== undefined || s.rz !== undefined) {
      // Create a quaternion from the euler angles (rx, ry, rz)
      euler.current.set(s.rx || 0, s.ry || 0, s.rz || 0, "YXZ");
      rotationQuaternion.current.setFromEuler(euler.current);

      // Combine: base rotation first, then apply relative rotation
      // This applies the rotation in camera's local space
      finalQuaternion.current
        .copy(baseQuaternion.current)
        .multiply(rotationQuaternion.current);
      cam.quaternion.copy(finalQuaternion.current);

      // Debug: log rz transitions
      if (s.rz !== undefined) {
        // console.log(
        //   `rz: ${(s.rz * (180 / Math.PI)).toFixed(1)}° | pos: (${s.x.toFixed(1)}, ${s.y.toFixed(1)}, ${s.z.toFixed(1)}) | target: (${s.tx}, ${s.ty}, ${s.tz})`,
        // );
        // console.log(
        //   `baseQuat: (${baseQuaternion.current.x.toFixed(3)}, ${baseQuaternion.current.y.toFixed(3)}, ${baseQuaternion.current.z.toFixed(3)}, ${baseQuaternion.current.w.toFixed(3)})`,
        // );
        // console.log(
        //   `camera.z rotation: ${(cam.rotation.z * (180 / Math.PI)).toFixed(2)}° | camera.y rotation: ${(cam.rotation.y * (180 / Math.PI)).toFixed(2)}°`,
        // );
      }
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
  cameraStateRef: React.RefObject<CameraState>;
}) {
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  // Simple camera rotation on z-axis
  // const CameraRotator = () => {
  //   useFrame(({ clock }) => {
  //     if (cameraRef.current) {
  //       cameraRef.current.rotation.z =
  //         Math.sin(clock.elapsedTime * 0.5) * (Math.PI / 4);
  //     }
  //   });
  //   return null;
  // };

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

      {/* <CameraRotator /> */}

      <OrbitControls
        ref={controlsRef}
        // enableRotate={false}
        enablePan={false}
        enableZoom={false}
      />
    </Canvas>
  );
}

export default Canti;
