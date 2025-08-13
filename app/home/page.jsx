'use client'

import { useColorScheme } from '../../src/useColorScheme'

export default function HomePage() {
  const { isDark } = useColorScheme()
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-8">Welcome Home!</h1>
        <p className="text-xl mb-6">This is your new home page</p>
        <button 
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
      </div>
    </div>
  )
} 