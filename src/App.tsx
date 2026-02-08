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
  const cameraProgressRef = useRef<{ p: number }>({ p: 0 });

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
          target: ".scrollContainer",
          axis: "y",
          enter: "top 150px",
          leave: "bottom bottom",
          sync: "play reverse",
          debug: true,
        }),
      });

      const innerBar = progressBarContainer.querySelector(cls(progressBar))!;
      animate(innerBar, {
        width: ["0%", "100%"],
        easing: "linear",
        autoplay: onScroll({
          target: ".scrollContainer",
          axis: "y",
          enter: "top top",
          leave: "bottom bottom",
          sync: 0.5,
        }),
      });

      // ---- Camera progress on scroll (NEW) ----
      // This ties p:0 -> p:1 to scroll progress.
      animate(cameraProgressRef.current, {
        p: [0, 1],
        easing: "linear",
        autoplay: onScroll({
          target: ".scrollContainer",
          axis: "y",
          enter: "top top",
          leave: "bottom bottom",
          sync: 1, // 1:1 with scroll
          // debug: true,
        }),
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
        <Canti cameraProgressRef={cameraProgressRef} />
      </div>
    </div>
  );
}

export default App;
