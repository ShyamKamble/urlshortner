import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Signup from './components/Signup'
import TinyURL from './components/TinyURL'

function App() {
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('landing') // Start with landing page

  // Check for saved user session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('tinyurl_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setCurrentView('app')
      } catch (error) {
        localStorage.removeItem('tinyurl_user')
      }
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('tinyurl_user', JSON.stringify(userData))
    // Clear anonymous usage count when user logs in
    localStorage.removeItem('anonymous_url_count')
    setCurrentView('app')
  }

  const handleSignup = (userData) => {
    setUser(userData)
    localStorage.setItem('tinyurl_user', JSON.stringify(userData))
    // Clear anonymous usage count when user signs up
    localStorage.removeItem('anonymous_url_count')
    setCurrentView('app')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('tinyurl_user')
    localStorage.removeItem('authToken') // Clear JWT token
    localStorage.removeItem('pending_url') // Clear any pending URL
    localStorage.removeItem('anonymous_url_count') // Clear anonymous count
    setCurrentView('landing') // Go back to landing instead of login
  }

  const switchToLogin = () => {
    setCurrentView('login')
  }

  const switchToSignup = () => {
    setCurrentView('signup')
  }

  const switchToLanding = () => {
    setCurrentView('landing')
  }

  // Render based on current view
  if (currentView === 'app' && user) {
    return <TinyURL user={user} onLogout={handleLogout} />
  }

  if (currentView === 'signup') {
    return (
      <Signup
        onSignup={handleSignup}
        onSwitchToLogin={switchToLogin}
        onBackToLanding={switchToLanding}
      />
    )
  }

  if (currentView === 'landing') {
    return (
      <LandingPage
        onSwitchToLogin={switchToLogin}
        onSwitchToSignup={switchToSignup}
      />
    )
  }

  // Default to login page
  return (
    <Login
      onLogin={handleLogin}
      onSwitchToSignup={switchToSignup}
      onBackToLanding={switchToLanding}
    />
  )
}

export default App