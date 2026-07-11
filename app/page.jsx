'use client'

import { useRouter } from 'next/navigation'
import DarkModeToggle from '../src/toggleButton'
import ParticlesBackground from '../src/particles'
import { useColorScheme } from '../src/useColorScheme'

export default function HomePage() {
  const { isDark } = useColorScheme()
  const router = useRouter()
  const particlesColor = isDark ? "#b8a3ff" : "#2f4a2f"
  
  return (
    <div className="landing">
      <ParticlesBackground color={particlesColor} />
      <div
        className="retro-panel"
        style={{
          padding: '22px 24px',
          minWidth: 'min(92vw, 420px)',
          display: 'grid',
          gap: '14px',
          justifyItems: 'center',
          background: isDark
            ? 'linear-gradient(180deg, rgba(78, 64, 138, 0.95), rgba(40, 30, 84, 0.95))'
            : 'linear-gradient(180deg, rgba(138, 170, 132, 0.95), rgba(73, 95, 72, 0.95))',
        }}
      >
        <h1>Ant&apos;s Matcha</h1>
        <button className="button" style={{ width: '100%' }} onClick={() => router.push('/home')}>
          ENTER
        </button>
        <div
          className="retro-panel-soft"
          style={{
            padding: '8px 10px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <DarkModeToggle />
        </div>
      </div>
    </div>
  )
} 