'use client'
import { useGLTF } from '@react-three/drei'
import { forwardRef } from 'react'

const Model = forwardRef(function Model({ modelPath }, ref) {
  try {
    const gltf = useGLTF(modelPath)
    return (
      <group ref={ref}>
        <primitive object={gltf.scene} scale={1} />
      </group>
    )
  } catch (err) {
    console.error('Failed to load model:', err)
    return (
      <mesh ref={ref}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#ff69b4" wireframe />
      </mesh>
    )
  }
})

useGLTF.preload('/assets/3D-Models/MatchaShop.glb')
export default Model
