import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";

import App from "../App";

export default function Landing() {
  const sceneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Placeholder for animejs / camera logic
    // You’ll replace this with scroll-driven timelines
    if (!sceneRef.current) return;

    // Example: console.log("Scene mounted")
  }, []);

  return (
    <>
      <Helmet>
        <title>Tiger Shi — Interactive Portfolio</title>
        <meta
          name="description"
          content="Tiger Shi — interactive portfolio exploring motion, 3D, and creative engineering."
        />
        <link rel="canonical" href="https://tigershi.com/" />
      </Helmet>

      <main>
        <section
          ref={sceneRef}
          style={{
            height: "100vh",
            // display: "flex",
            // alignItems: "center",
            // justifyContent: "center",
          }}
        >
          <h1>Tiger Shi</h1>
          <App />
        </section>
      </main>
    </>
  );
}
