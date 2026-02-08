import "./App3.css";

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

import reactLogo from "./assets/react.svg";
// import DialogueTestApp from "./components/DialogueTestApp";

function App() {
  const root = useRef<HTMLDivElement>(null);
  const $testValue = useRef<HTMLDivElement>(null);
  const flexContainerRef = useRef<HTMLDivElement>(null);
  const $flexLayout = useRef<ReturnType<typeof createLayout> | null>(null);
  const $scope = useRef<Scope | null>(null);
  const testBoxDraggable = useRef<ReturnType<typeof createDraggable> | null>(
    null,
  );
  const [rotations, setRotations] = useState(0);
  const [releases, setReleases] = useState(0);
  const [snapIndex, setSnapIndex] = useState(0);
  const [dragProgress, setDragProgress] = useState({
    x: 0,
    y: 0,
    progressX: 0,
    progressY: 0,
    velocity: 0,
  });

  useEffect(() => {
    $scope.current = createScope({ root }).add((self) => {
      // Every anime.js instance declared here is now scoped to <div ref={root}>

      animate(".progressBar", {
        width: ["0%", "100%"],
        easing: "linear",
        autoplay: onScroll({
          // container: ".scrollContainer",
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

      animate(".progressBarContainer", {
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

      // Created a bounce animation loop
      animate(".logo", {
        scale: [
          { to: 1.25, ease: "inOut(3)", duration: 200 },
          { to: 1, ease: spring({ bounce: 0.7 }) },
        ],
        loop: true,
        delay: stagger(300),
        // loopDelay: 0,
      });

      // Make the logo draggable around its center
      createDraggable(".logo", {
        container: [0, 0, 0, 0],
        releaseEase: spring({ bounce: 0.7 }),
      });

      testBoxDraggable.current = createDraggable(".testBox", {
        container: ".boxContainer",
        containerFriction: 0.5,
        // releaseEase: spring({ bounce: 0.1, stiffness: 1 }),
        // releaseEase: steps(10, true),
        releaseEase: spring({ bounce: 0.2, duration: 100 }),
        onUpdate: (instance) => {
          setDragProgress({
            x: instance.x,
            y: instance.y,
            progressX: instance.progressX,
            progressY: instance.progressY,
            velocity: instance.velocity,
          });
        },
        onSettle: (instance) => {
          const snapPoints = [0, 200, 400, 600];
          const snappedIndex = snapPoints.findIndex(
            (point) => Math.abs(instance.x - point) < 1,
          );
          setSnapIndex(snappedIndex);
        },
        onRelease: () => {
          setReleases((prev) => prev + 1);
        },
        // snap: 100,
        x: { snap: [0, 200, 400, 600] },
        y: { snap: [0] },
      });

      // Register function methods to be used outside the useEffect
      self?.add("rotateLogo", (i) => {
        animate(".logo", {
          rotate: i * 360,
          ease: "out(4)",
          duration: 1500,
          // delay: stagger(300),
        });
      });
    });

    return () => {
      $scope.current?.revert();
    };
  }, []);

  const handleRotateClick = () => {
    setRotations((prev) => {
      const newRotations = prev + 1;
      $scope.current?.methods.rotateLogo(newRotations);
      return newRotations;
    });
  };

  useEffect(() => {
    $flexLayout.current = createLayout(".flexContainer", {
      duration: 1800,
      // ease: spring({ stiffness: 0.5, damping: 0.7 }),
    });

    return () => {
      $flexLayout.current?.revert();
    };
  }, []);

  const handleAnimateLayoutClick = () => {
    if ($flexLayout.current == null) return;

    $flexLayout.current.update(
      ({ root }) => {
        root.classList.toggle("toggle");
      },
      {
        duration: 300,
        delay: stagger(50),
      },
    );
  };

  return (
    <div
      ref={root}
      className="scrollContainer"
      style={{ border: "2px solid red" }}
    >
      <div className="progressBarContainer">
        <div className="progressBar" />
      </div>
      <div className="large centered row">
        <img src={reactLogo} className="logo react" alt="React logo" />
        <img src={reactLogo} className="logo react" alt="React logo" />
        <img src={reactLogo} className="logo react" alt="React logo" />
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>
      <div className="medium row">
        <button onClick={handleRotateClick}>rotations: {rotations}</button>
      </div>
      <br />
      <div
        className="boxContainer"
        style={{
          width: "800px",
          height: "100px",
          border: "2px solid #007acc",
        }}
      >
        <div
          className="testBox"
          style={{
            height: "100px",
            width: "100px",
            background: "#007acc",
            borderRadius: "8px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
          }}
        >
          Hello!
        </div>
      </div>
      <div>
        ProgressX: {dragProgress.progressX.toFixed(2)}, | Coordinates:{" "}
        {dragProgress.x.toFixed(2)}, {dragProgress.y.toFixed(2)} | Velocity:{" "}
        {dragProgress.velocity.toFixed(2)} | Snap Index: {snapIndex}
      </div>
      <div ref={$testValue} className="testValue">
        Releases: {releases}
      </div>
      <br />
      <div className="flexContainer" ref={flexContainerRef}>
        <div className="box box1">Box 1</div>
        <div className="box box2">Box 2</div>
        <div className="box box3">Box 3</div>
        <div className="box box4">Box 4</div>
      </div>
      <button className="animateButton" onClick={handleAnimateLayoutClick}>
        Change Flex Direction
      </button>
      <br />
      {/* <DialogueTestApp /> */}
      <div style={{ height: "8000px" }} />
    </div>
  );
}

export default App;
