import "./App.css";
import DarkModeToggle from "./toggleButton"; // Your toggle component
import ParticlesBackground from "./particles";
import gsap from "gsap";
import { ReactLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import { useColorScheme } from "./useColorScheme"; // Your hook

function App() {
  const { isDark } = useColorScheme();
  // Use powder blue for particles in dark mode
  const particlesColor = isDark ? "#B0E0E6" : "#44624a";
  return (
    <div className="landing">
      <ParticlesBackground color={particlesColor} />
      <div className="content">
        <h1>Ant's World</h1>
        <button className="button" onClick={() => (window.location.href = "/")}>HOME</button>
        <DarkModeToggle />
      </div>
    </div>
  );
}

export default App;
