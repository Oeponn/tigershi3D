import { animate, createScope, onScroll, type Scope } from "animejs";
import { useEffect, useRef } from "react";

import styles from "./App.module.scss";
import Canti from "./components/Canti";
import ProgressBar from "./components/ProgressBar";
import { progressBar } from "./components/ProgressBar.module.scss";
import { cls } from "./utils/domReferenceHelpers";

function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const $scope = useRef<Scope | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // This is what animejs will mutate (no rerenders)
  const cameraStateRef = useRef({
    x: 0,
    y: 0,
    z: 6, // camera position
    tx: 0,
    ty: 0,
    tz: 0, // look-at target / OrbitControls target
    fov: 55,
  });

  useEffect(() => {
    $scope.current = createScope({ root: rootRef }).add(() => {
      // ---- Progress bar (your existing stuff) ----
      const progressBarContainer = progressBarRef.current!;
      animate(progressBarContainer, {
        opacity: [0, 1],
        y: [100, 0],
        duration: 300,
        easing: "linear",
        autoplay: onScroll({
          target: cls(styles.scrollContainer),
          axis: "y",
          enter: "top 150px",
          leave: "bottom bottom",
          sync: "play reverse",
          // debug: true,
        }),
      });

      const innerBar = progressBarContainer.querySelector(cls(progressBar))!;
      animate(innerBar, {
        width: ["0%", "100%"],
        easing: "linear",
        autoplay: onScroll({
          target: cls(styles.scrollContainer),
          axis: "y",
          enter: "top top",
          leave: "bottom bottom",
          sync: 0.5,
        }),
      });

      const cam = cameraStateRef.current;

      // ---- Camera progress on scroll (NEW) ----
      // This ties p:0 -> p:1 to scroll progress.
      animate(cam, {
        // keyframes define the path
        keyframes: [
          { x: 0, y: 0, z: 5, tx: 0, ty: 0, tz: 0, fov: 65 },
          { x: 0, y: 0, z: 5, tx: 0, ty: 0, tz: 0, fov: 65 },
        ],
        easing: "linear",
        // autoplay: onScroll({
        //   target: cls(styles.scrollContainer),
        //   axis: "y",
        //   enter: "top top",
        //   leave: "bottom bottom",
        //   sync: 0.5,
        //   debug: true,
        // }),
        autoplay: true,
        loop: true,
        alternate: true,
        duration: 5000,
      });
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
