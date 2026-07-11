'use client'

import dynamic from 'next/dynamic'
import LoadingScreen from '../../src/components/LoadingScreen'
import DarkModeToggle from '../../src/toggleButton'
import { useColorScheme } from '../../src/useColorScheme'
import { useMediaQuery } from 'react-responsive'
import { useEffect, useState } from 'react'

// Dynamic import to avoid SSR issues with Three.js
const ThreeCanvas = dynamic(() => import('../../src/components/3D/Canvas'), {
  loading: () => <LoadingScreen />,
  ssr: false,
})

export default function PortfolioPage() {
  const { isDark } = useColorScheme()
  const isMobileQuery = useMediaQuery({ maxWidth: 768 })
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const isMobile = hasMounted ? isMobileQuery : false

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <ThreeCanvas isDark={isDark} />
      {!isMobile && (
        <div
          style={{
            position: 'absolute',
            top: 'clamp(12px, 2vh, 24px)',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'flex-start',
            paddingInline: 'clamp(14px, 3vw, 28px)',
            zIndex: 200,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              padding: '8px 10px',
              borderRadius: '12px',
              border: isDark ? '1px solid rgba(188, 157, 255, 0.62)' : '1px solid rgba(27, 44, 28, 0.58)',
              background: isDark
                ? 'linear-gradient(180deg, rgba(78, 64, 138, 0.88), rgba(40, 30, 84, 0.88))'
                : 'linear-gradient(180deg, rgba(138, 170, 132, 0.84), rgba(73, 95, 72, 0.88))',
              boxShadow: isDark
                ? '0 12px 28px rgba(12, 7, 30, 0.48)'
                : '0 12px 28px rgba(10, 18, 10, 0.34)',
              backdropFilter: 'blur(8px)',
              pointerEvents: 'auto',
            }}
          >
            <DarkModeToggle floating={false} />
          </div>
        </div>
      )}
    </div>
  )
}
