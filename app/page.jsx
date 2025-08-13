'use client'

import { useRouter } from 'next/navigation'
import DarkModeToggle from '../src/toggleButton'
import ParticlesBackground from '../src/particles'
import { useColorScheme } from '../src/useColorScheme'

export default function HomePage() {
  const { isDark } = useColorScheme()
  const router = useRouter()
  // Use powder blue for particles in dark mode
  const particlesColor = isDark ? "#B0E0E6" : "#44624a"
  
  return (
    <div className="landing">
      <ParticlesBackground color={particlesColor} />
      <div className="content">
        <h1>Ant&apos;s World</h1>
        <button className="button" onClick={() => router.push('/home')}>HOME</button>
        <DarkModeToggle />
      </div>
    </div>
  )
} 