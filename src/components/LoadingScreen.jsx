'use client'
import { useEffect, useRef } from 'react'
import { useColorScheme } from '../useColorScheme'

export default function LoadingScreen({ isDark: isDarkProp }) {
  const colorScheme = useColorScheme()
  const isDark = typeof isDarkProp === 'boolean' ? isDarkProp : !!colorScheme?.isDark
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Initialize particles.js
    const particlesJS = window.particlesJS

    if (particlesJS) {
      const particleColor = isDark ? '#ceb8ff' : '#44624a'
      
      particlesJS('particles-js', {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: particleColor },
          shape: { type: 'circle' },
          opacity: { value: 0.5 },
          size: { value: 3, random: true },
          line_linked: {
            enable: true,
            distance: 150,
            color: particleColor,
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: { enable: false },
            onclick: { enable: false }
          }
        },
        retina_detect: true
      })
    }
  }, [isDark])

  const bgGradient = isDark
    ? 'linear-gradient(135deg, #5b4aa3 0%, #392b76 52%, #271b57 100%)'
    : 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)'

  const textColor = isDark ? '#efe8ff' : '#44624a'
  const spinnerBorder = isDark ? 'rgba(206, 184, 255, 0.3)' : 'rgba(68, 98, 74, 0.3)'
  const spinnerTop = isDark ? '#ceb8ff' : '#44624a'

  return (
    <div
      ref={containerRef}
      id="particles-js"
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bgGradient,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          color: textColor
        }}
      >
        <h1 style={{ fontSize: '48px', marginBottom: '20px', fontWeight: 'bold' }}>
          Loading Portfolio...
        </h1>
        <div
          style={{
            width: '60px',
            height: '60px',
            border: `4px solid ${spinnerBorder}`,
            borderTop: `4px solid ${spinnerTop}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}
        />
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
