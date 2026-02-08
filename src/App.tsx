import "./App.css";

import {
  animate,
  createDraggable,
  createLayout,
  createScope,
  onScroll,
  // steps,
  // utils,
  type Scope,
  spring,
  stagger,
} from "animejs";
import { useEffect, useRef, useState } from "react";

import styles from "./App.module.scss";
import Canti from "./components/Canti";
import ProgressBar from "./components/ProgressBar";
import { progressBar } from "./components/ProgressBar.module.scss";

console.log("Progress bar class name:", progressBar);

function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const $scope = useRef<Scope | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    $scope.current = createScope({ root: rootRef }).add((_self) => {
      if (!progressBarRef.current) return;

      animate(progressBarRef.current, {
        opacity: [0, 1],
        y: [100, 0],
        duration: 300,
        easing: "linear",
        autoplay: onScroll({
          target: ".scrollContainer",
          axis: "y",
          enter: "top 150px",
          leave: "bottom bottom",
          // sync: "play reverse play reverse",
          sync: "play reverse",
          debug: true,
        }),
      });

      animate(`.${progressBar}`, {
        width: ["0%", "100%"],
        easing: "linear",
        autoplay: onScroll({
          target: ".scrollContainer",
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
    });

    return () => {
      $scope.current?.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="scrollContainer"
      style={{ border: "2px solid red" }}
    >
      <ProgressBar progressBarRef={progressBarRef} />
      <div style={{ height: "8000px" }}></div>
      <div className={styles.canvasWrapper}>
        <Canti />
      </div>
    </div>
  );
}

export default App;
