import type { Object3DNode } from "@react-three/fiber";
import type { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import type { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import type { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";

declare module "@react-three/fiber" {
  interface ThreeElements {
    lineSegments2: Object3DNode<LineSegments2, typeof LineSegments2>;
    lineMaterial: Object3DNode<LineMaterial, typeof LineMaterial>;
    lineSegmentsGeometry: Object3DNode<
      LineSegmentsGeometry,
      typeof LineSegmentsGeometry
    >;
  }
}

export {};
