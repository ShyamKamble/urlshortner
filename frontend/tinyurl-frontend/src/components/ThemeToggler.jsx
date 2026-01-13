import { useState, useEffect } from 'react'

const ThemeToggler = () => {
  const [isDark, setIsDark] = useState(false)

  // Check for saved theme preference or default to light
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-20 items-center justify-center rounded-full border-2 border-gray-300 bg-white p-1 transition-all duration-300 ease-in-out hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {/* Track */}
      <div className="absolute inset-1 rounded-full bg-gray-100 transition-colors duration-300 dark:bg-gray-700" />
      
      {/* Sliding circle */}
      <div
        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 ease-in-out dark:bg-gray-900 ${
          isDark ? 'translate-x-5' : '-translate-x-5'
        }`}
      >
        {/* Sun icon for light mode */}
        <svg
          className={`h-4 w-4 text-yellow-500 transition-all duration-300 ${
            isDark ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
        
        {/* Moon icon for dark mode */}
        <svg
          className={`absolute h-4 w-4 text-blue-400 transition-all duration-300 ${
            isDark ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </div>
    </button>
  )
}

export default ThemeToggler