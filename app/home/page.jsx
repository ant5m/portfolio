'use client'

import dynamic from 'next/dynamic'
import LoadingScreen from '../../src/components/LoadingScreen'
import { useColorScheme } from '../../src/useColorScheme'

// Dynamic import to avoid SSR issues with Three.js
const ThreeCanvas = dynamic(() => import('../../src/components/3D/Canvas'), {
  loading: () => <LoadingScreen />,
  ssr: false,
})

export default function PortfolioPage() {
  const { isDark } = useColorScheme()

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <ThreeCanvas isDark={isDark} />
    </div>
  )
}
