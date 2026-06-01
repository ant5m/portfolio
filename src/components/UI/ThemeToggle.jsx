'use client'

export default function ThemeToggle({ isDarkMode, onToggle }) {
  return (
    <button 
      className="theme-toggle-btn"
      onClick={onToggle}
      title={isDarkMode ? "Switch to Day Mode" : "Switch to Night Mode"}
    >
      {isDarkMode ? '☀️ Day' : '🌙 Night'}
    </button>
  )
}
