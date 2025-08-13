'use client'

import "./App.css";
import React, { useEffect, useRef } from "react";

function ParticlesBackground({ color }) {
  useEffect(() => {
    const initParticles = () => {
      if (window.particlesJS) {
        window.particlesJS("particles-bg", {
          particles: {
            number: {
              value: 300, // Lowered for performance
              density: { enable: true, value_area: 800 }
            },
            color: { value: color },
            shape: { type: "circle" },
            opacity: { value: 0.5 },
            size: { value: 3, random: true },
            line_linked: {
              enable: true,
              distance: 150,
              color: "#ffffff",
              opacity: 0.4,
              width: 1
            },
            move: { enable: true, speed: 1 }
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: { enable: true, mode: "bubble" },
              onclick: { enable: true, mode: "repulse" },
              resize: true
            },
            modes: {
              bubble: { distance: 100, size: 40, duration: 2, opacity: 8, speed: 3 },
              repulse: { distance: 100, duration: 0.4 }
            }
          },
          retina_detect: true
        });
      } else {
        console.error("particlesJS not found");
      }
    };

    if (window.particlesJS) {
      initParticles();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
      script.onload = initParticles;
      document.head.appendChild(script);
    }
    // Clean up particles on unmount or color change
    return () => {
      const container = document.getElementById("particles-bg");
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
      if (window.pJSDom && window.pJSDom.length) {
        window.pJSDom.forEach(dom => {
          if (dom.fn && dom.fn.vendors && dom.fn.vendors.destroypJS) {
            dom.fn.vendors.destroypJS();
          }
        });
        window.pJSDom = [];
      }
    };
  }, [color]);

  return <div id="particles-bg" style={{ 
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1 
  }} />;
}

export default ParticlesBackground;