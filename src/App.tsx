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
import { cls } from "./utils/domReferenceHelpers";

function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const $scope = useRef<Scope | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    $scope.current = createScope({ root: rootRef }).add((_self) => {
      const progressBarContainer = progressBarRef.current;
      animate(progressBarContainer!, {
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

      const innerBar = progressBarContainer!.querySelector(cls(progressBar));

      animate(innerBar!, {
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
    });

    return () => {
      $scope.current?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.scrollContainer}>
      <ProgressBar progressBarRef={progressBarRef} />
      <div style={{ height: "8000px" }}></div>
      <div className={styles.canvasWrapper}>
        <Canti />
      </div>
    </div>
  );
}

export default App;
