import { useState, useEffect } from 'react'

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('isDarkMode')
    if (saved !== null) {
      setIsDarkMode(JSON.parse(saved))
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newValue = !prev
      localStorage.setItem('isDarkMode', JSON.stringify(newValue))
      return newValue
    })
  }

  return { isDarkMode, toggleTheme, mounted }
}
