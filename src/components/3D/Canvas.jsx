'use client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Model from './Model'
import DayEnvironment from './DayEnvironment'
import NightEnvironment from './NightEnvironment'
import SpotifyWidget from './SpotifyWidget'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

function SceneContent({ isDark }) {
  const modelRef = useRef(null)
  const controlsRef = useRef(null)

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotateSpeed = 0.5
    }
  })

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <Model ref={modelRef} modelPath="/assets/3D-Models/MatchaShop.glb" />
      {isDark ? <NightEnvironment /> : <DayEnvironment />}
      <OrbitControls
        ref={controlsRef}
        autoRotate
        minPolarAngle={Math.PI * 0.4}
        maxPolarAngle={Math.PI * 0.6}
      />
    </>
  )
}

function ZoomView({ wall, isDark, setIsAnimating }) {
  const modelRef = useRef(null)
  const controlsRef = useRef(null)
  const [isAnimating, setIsAnimatingLocal] = useState(true)
  const fallbackTimerRef = useRef(null)

  const wallConfig = {
    'About Me': { position: [0, 2, 5] },
    'Vending': { position: [5, 2, 0] },
    'Experience & Skills': { position: [0, 2, -5] },
    'Music': { position: [-5, 2, 0] }
  }

  const config = wallConfig[wall] || wallConfig['About Me']
  const { camera } = useThree()

  useEffect(() => {
    setIsAnimatingLocal(true)
    setIsAnimating(true)
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
    }
    fallbackTimerRef.current = setTimeout(() => {
      setIsAnimatingLocal(false)
      setIsAnimating(false)
    }, 1200)
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
      }
    }
  }, [wall, setIsAnimating])

  useFrame(() => {
    if (!camera) return
    const targetPos = new THREE.Vector3(...config.position)
    const distance = camera.position.distanceTo(targetPos)

    if (distance > 0.15) {
      camera.position.lerp(targetPos, 0.06)
    } else if (isAnimating) {
      setIsAnimatingLocal(false)
      setIsAnimating(false)
    }
  })

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <Model ref={modelRef} modelPath="/assets/3D-Models/MatchaShop.glb" />
      {isDark ? <NightEnvironment /> : <DayEnvironment />}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        minPolarAngle={Math.PI * 0.4}
        maxPolarAngle={Math.PI * 0.6}
      />
    </>
  )
}

export default function CanvasComponent({ isDark = false }) {
  const [zoomedWall, setZoomedWall] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleWallClick = (wallName) => {
    setZoomedWall(wallName)
    setIsAnimating(true)
  }

  const handleExitZoom = () => {
    setZoomedWall(null)
    setIsAnimating(false)
  }

  const showZoom = Boolean(zoomedWall)
  const showSpotify = zoomedWall === 'Music' && !isAnimating

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {showZoom ? (
        <Canvas 
          camera={{ position: [0, 2, 5], fov: 75 }} 
          style={{ background: isDark ? '#0a0e27' : '#87CEEB' }}
        >
          <ZoomView wall={zoomedWall} isDark={isDark} setIsAnimating={setIsAnimating} />
        </Canvas>
      ) : (
        <Canvas 
          camera={{ position: [0, 2, 8], fov: 75 }} 
          style={{ background: isDark ? '#0a0e27' : '#87CEEB' }}
        >
          <SceneContent isDark={isDark} />
        </Canvas>
      )}

      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '15px',
          zIndex: 50
        }}
      >
        {['About Me', 'Vending', 'Experience & Skills', 'Music'].map((wall) => (
          <button
            key={wall}
            onClick={() => handleWallClick(wall)}
            style={{
              padding: '10px 20px',
              background: 'rgba(100, 100, 100, 0.8)',
              color: 'white',
              border: '2px solid rgba(255, 105, 180, 0.6)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 105, 180, 0.8)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(100, 100, 100, 0.8)'
            }}
          >
            {wall}
          </button>
        ))}
      </div>

      {showZoom && (
        <button
          onClick={handleExitZoom}
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '30px',
            padding: '10px 20px',
            background: 'rgba(100, 100, 100, 0.8)',
            color: 'white',
            border: '2px solid rgba(255, 105, 180, 0.6)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            zIndex: 100
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 105, 180, 0.8)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(100, 100, 100, 0.8)'
          }}
        >
          Exit
        </button>
      )}

      <SpotifyWidget isVisible={showSpotify} />
    </div>
  )
}
