import {
  animate,
  createScope,
  onScroll,
  type Scope,
  // spring,
  // steps,
} from "animejs";
import { useEffect, useRef } from "react";

import styles from "./App.module.scss";
import Canti from "./components/Canti";
import ProgressBar from "./components/ProgressBar";
import { progressBar } from "./components/ProgressBar.module.scss";
import type { CameraState } from "./types/camera";
import { cls } from "./utils/domReferenceHelpers";

const initialCameraState: CameraState = {
  // Camera position
  x: 0,
  y: 0,
  z: 5,
  // Camera points at coordinates
  tx: 0,
  ty: 0,
  tz: 0,
  // Camera rotation
  rx: 0,
  ry: 0,
  rz: 0,
  // Camera field of view
  fov: 65,
};
function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const $scope = useRef<Scope | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // This is what animejs will mutate (no rerenders)
  const cameraStateRef = useRef(initialCameraState);

  useEffect(() => {
    $scope.current = createScope({ root: rootRef }).add(() => {
      // ---- Progress bar (your existing stuff) ----
      const progressBarContainer = progressBarRef.current!;
      animate(progressBarContainer, {
        opacity: [0, 1],
        y: [100, 0],
        duration: 300,
        ease: "linear",
        autoplay: onScroll({
          target: cls(styles.scrollContainer),
          axis: "y",
          enter: "top 150px",
          leave: "bottom bottom",
          sync: "play reverse",
          debug: true,
        }),
      });

      const innerBar = progressBarContainer.querySelector(cls(progressBar))!;
      animate(innerBar, {
        // width: [{ to: "100%", ease: steps(20, false) }],
        width: [{ to: "100%" }],
        ease: "linear",
        // loop: true,
        // autoplay: true,
        autoplay: onScroll({
          target: cls(styles.scrollContainer),
          axis: "y",
          enter: "top top",
          leave: "bottom bottom",
          sync: 0.5,
          // onEnter: () => {
          //   console.log("XXX Entered scroll trigger");
          // },
          // onLeave: () => {
          //   console.log("XXX Left scroll trigger");
          // },
        }),
      });

      const cam = cameraStateRef.current;

      animate(cam, {
        // keyframes: [
        //   initialCameraState,
        //   { x: 0, y: 0, z: 50, tx: 0, ty: 0, tz: 0, fov: 65 },
        //   { x: 0, y: 0, z: 150, tx: 0, ty: 0, tz: 0, fov: 65 },
        // ],
        x: [
          { to: 5, ease: "inOut(2)" },
          { to: 0, ease: "inOut(2)" },
        ],
        y: [
          { to: 5, ease: "inOut(2)" },
          { to: 10, ease: "inOut(2)" },
        ],
        z: [
          { to: 5, ease: "inOut(2)" },
          { to: 0, ease: "inOut(2)" },
        ],
        // tx: [0],
        // ty: [0],
        // tz: [0],
        // fov: [65, 65],
        ease: "linear",
        autoplay: onScroll({
          container: cls(styles.scrollContainer),
          target: cls(styles.scrollContainer),
          axis: "y",
          enter: "top 150px",
          leave: "bottom bottom",
          // sync: 0.5,
          sync: 1,
          debug: true,
          onUpdate: () => {
            // console.log("Camera state updated:", { ...cam });
          },
        }),
        // autoplay: true,
        // loop: true,
        // alternate: true,
        // duration: 1000,
      });

      // Camera rotation animation - 180 degree loop
      // animate(cam, {
      //   rz: [
      //     { to: Math.PI / 10, duration: 3000, easing: "easeInOutQuad" },
      //     { to: 0, duration: 3000, easing: "easeInOutQuad" },
      //   ],
      //   loop: true,
      // });
    });

    return () => {
      $scope.current?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.scrollContainer}>
      <ProgressBar progressBarRef={progressBarRef} />

      <div style={{ height: "8000px" }} />

      <div className={styles.canvasWrapper}>
        <Canti cameraStateRef={cameraStateRef} />
      </div>
    </div>
  );
}

export default App;
