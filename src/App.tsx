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
import Canti from "./components/Canti";
// import ProgressBar from "./components/ProgressBar";
// import progressBarClassNames from "./components/ProgressBar.module.scss";

function App() {
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
    <div className={styles.appWrapper}>
      {/* <div className={"scrollContainer"}> */}
      {/* <div className={styles.filler}>
      </div> */}
      {/* <div className="progressBarContainer">
        <div className="progressBar" />
      </div> */}
      {/* <div className={styles.canvasWrapper}> */}
      <Canti />
      {/* </div> */}
    </div>
  );
}

export default App;
