import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Link2, ArrowRight, X, AlertCircle } from 'lucide-react'
import ThemeToggler from './ThemeToggler'
import { API_ENDPOINTS } from '../config/api'
import { decodeUrl, formatUrlForDisplay } from '../utils/urlUtils'

function LandingPage({ onSwitchToLogin, onSwitchToSignup }) {
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [showLimitReached, setShowLimitReached] = useState(false)
<<<<<<< HEAD
  const [anonymousCount, setAnonymousCount] = useState(0)

  // Check anonymous usage count on component mount
  useEffect(() => {
    const count = parseInt(localStorage.getItem('anonymous_url_count') || '0')
    // Use a state initialization callback to avoid setting state in effect
    if (count > 0) {
      setAnonymousCount(count)
    }
  }, [])
=======
  const [anonymousCount, setAnonymousCount] = useState(() => {
    // Initialize from localStorage
    return parseInt(localStorage.getItem('anonymous_url_count') || '0')
  })
>>>>>>> d45492e (solving the lint errors)

  const handleShortenUrl = async (e) => {
    e.preventDefault()
    if (!url) return

    // Check if anonymous limit is reached
    if (anonymousCount >= 3) {
      setShowLimitReached(true)
      return
    }

    // Show authentication prompt for first-time users
    if (anonymousCount === 0) {
      setShowAuthPrompt(true)
    } else {
      // Direct shortening for users who already chose to continue as guest
      handleAnonymousShorten()
    }
  }

  const handleAnonymousShorten = async () => {
    setLoading(true)
    try {
      const response = await axios.post(API_ENDPOINTS.SHORTEN, {
        originalUrl: url
        // No userId - anonymous shortening
      })
      setShortUrl(response.data.shortUrl)
      setShowAuthPrompt(false)

      // Increment anonymous count
      const newCount = anonymousCount + 1
      setAnonymousCount(newCount)
      localStorage.setItem('anonymous_url_count', newCount.toString())

    } catch (error) {
      console.error('Error shortening URL:', error)
    }
    setLoading(false)
  }

  const handleLoginWithUrl = () => {
    // Store URL in localStorage to use after login
    localStorage.setItem('pending_url', url)
    onSwitchToLogin()
  }

  const handleSignupWithUrl = () => {
    // Store URL in localStorage to use after signup
    localStorage.setItem('pending_url', url)
    onSwitchToSignup()
  }

  const getRemainingUrls = () => {
    return Math.max(0, 3 - anonymousCount)
  }

  return (
    <div className="min-h-screen bg-white relative dark:bg-black transition-colors duration-300">
      {/* Apple-style Navigation - Translucent glass effect */}
      <nav className="flex items-center justify-between p-4 md:px-8 md:py-6 backdrop-blur-xl bg-white/80 dark:bg-black/80 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
          <span className="text-lg font-semibold text-black dark:text-white tracking-tight">snip</span>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <button className="hidden sm:block text-gray-600 hover:text-black text-sm font-normal dark:text-gray-400 dark:hover:text-white transition-colors">About</button>
          <button className="hidden sm:block text-gray-600 hover:text-black text-sm font-normal dark:text-gray-400 dark:hover:text-white transition-colors">API</button>

          {/* Theme Toggler */}
          <ThemeToggler />

          {/* Guest mode indicator */}
          {anonymousCount > 0 && anonymousCount < 3 && (
            <span className="hidden sm:inline text-xs text-gray-600 font-normal px-3 py-1.5 bg-gray-100 rounded-full dark:text-gray-400 dark:bg-gray-800">
              Guest: {getRemainingUrls()} left
            </span>
          )}

          <Button
            onClick={onSwitchToLogin}
            className="h-9 px-4 bg-transparent border border-gray-300 text-black hover:bg-gray-50 font-normal text-sm rounded-full dark:border-gray-600 dark:text-white dark:hover:bg-gray-900 tran[...]
          >
            Sign in
          </Button>
        </div>
      </nav>

      {/* Main Content - Apple-style Hero */}
      <div className="flex flex-col items-center justify-center p-4 md:px-8 pt-16 md:pt-32 pb-20 md:pb-40">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section - Apple Display Typography */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-black mb-6 tracking-tight leading-none dark:text-white" style={{ letterSpacing: '-0.28px', lineHeight: '1.07' }}>
            Shorten your links.
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-6 font-normal max-w-2xl mx-auto dark:text-gray-400" style={{ letterSpacing: '0.231px', lineHeight: '1.19' }}>
            Create short, memorable links in seconds. No signup required.
          </p>

          {/* Anonymous usage counter with progress */}
          {anonymousCount > 0 && anonymousCount < 3 && (
            <div className="mb-10 md:mb-14">
              <p className="text-sm text-gray-500 mb-3 font-normal" style={{ letterSpacing: '-0.224px' }}>
                {getRemainingUrls()} free links remaining as guest
              </p>
              <div className="w-40 mx-auto bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(anonymousCount / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* URL Shortener Form - Apple-style */}
          {!shortUrl ? (
            <div className="max-w-3xl mx-auto mb-20 md:mb-32">
              <form onSubmit={handleShortenUrl} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste your long URL here..."
                  className="flex-1 h-14 px-5 text-base border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white font-normal dark:bg-gray-900 dark:border-gray[...]
                  style={{ letterSpacing: '-0.374px' }}
                  required
                />
                <Button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="h-14 px-8 text-base font-normal rounded-xl transition-all bg-blue-600 text-white hover:bg-blue-700 border-0 shadow-sm disabled:bg-gray-300 disabled:text-gray-500 dark[...]
                  style={{ letterSpacing: '-0.374px' }}
                >
                  {loading ? 'Shortening...' : (
                    <>
                      Shorten
                      <ArrowRight className="w-5 h-5 ml-2" strokeWidth={2} />
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto mb-20 md:mb-32">
              <div className="p-6 md:p-8 bg-gray-50 border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 shadow-sm">
                <p className="text-base text-gray-600 mb-4 font-normal dark:text-gray-400" style={{ letterSpacing: '-0.374px' }}>Your shortened link:</p>
                
                {/* Original URL Display */}
                <div className="mb-5 p-4 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700">
                  <p className="text-xs text-gray-500 mb-2 dark:text-gray-400" style={{ letterSpacing: '-0.12px' }}>Original:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 break-all" title={decodeUrl(url)} style={{ letterSpacing: '-0.224px' }}>
                    {formatUrlForDisplay(decodeUrl(url), 60)}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Input
                    value={shortUrl}
                    readOnly
                    className="flex-1 font-mono text-base bg-white border-gray-200 h-12 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                  <Button
                    onClick={() => navigator.clipboard.writeText(shortUrl)}
                    className="h-12 px-6 border border-gray-300 bg-white hover:bg-gray-50 text-black font-normal text-base rounded-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 [...]
                  >
                    Copy
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    setUrl('')
                    setShortUrl('')
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-normal text-base bg-transparent border-0 dark:text-blue-400 dark:hover:text-blue-300"
                  style={{ letterSpacing: '-0.374px' }}
                >
                  Shorten another link
                </Button>
              </div>
            </div>
          )}

          {/* Statistics - Apple-style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 md:gap-20 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-semibold text-black mb-2 dark:text-white" style={{ letterSpacing: '-0.28px', lineHeight: '1.07' }}>1M+</div>
              <div className="text-base text-gray-600 font-normal dark:text-gray-400" style={{ letterSpacing: '-0.374px' }}>Links created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-semibold text-black mb-2 dark:text-white" style={{ letterSpacing: '-0.28px', lineHeight: '1.07' }}>99.9%</div>
              <div className="text-base text-gray-600 font-normal dark:text-gray-400" style={{ letterSpacing: '-0.374px' }}>Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-semibold text-black mb-2 dark:text-white" style={{ letterSpacing: '-0.28px', lineHeight: '1.07' }}>&lt;50ms</div>
              <div className="text-base text-gray-600 font-normal dark:text-gray-400" style={{ letterSpacing: '-0.374px' }}>Redirect time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Apple-style */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 md:px-8 md:py-8 border-t border-gray-100 dark:border-gray-900">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm font-normal dark:text-gray-500 text-center sm:text-left" style={{ letterSpacing: '-0.224px' }}>
            © 2025 snip. Shorten links, share faster.
          </p>
          <div className="flex items-center gap-6 md:gap-8">
            <button className="text-gray-500 hover:text-black text-sm font-normal dark:hover:text-white transition-colors" style={{ letterSpacing: '-0.224px' }}>Privacy</button>
            <button className="text-gray-500 hover:text-black text-sm font-normal dark:hover:text-white transition-colors" style={{ letterSpacing: '-0.224px' }}>Terms</button>
            <button className="text-gray-500 hover:text-black text-sm font-normal dark:hover:text-white transition-colors" style={{ letterSpacing: '-0.224px' }}>GitHub</button>
          </div>
        </div>
      </footer>

      {/* Authentication Prompt Modal - Apple-style */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-black dark:text-white" style={{ letterSpacing: '-0.28px' }}>Choose an option</h2>
                <button
                  onClick={() => setShowAuthPrompt(false)}
                  className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" strokeWidth={1.5} />
                </button>
              </div>

              <p className="text-gray-600 mb-8 font-normal text-base dark:text-gray-400" style={{ letterSpacing: '-0.374px' }}>
                Sign up to save your links to your account, or continue as guest.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleSignupWithUrl}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-normal rounded-xl text-base dark:bg-blue-500 dark:hover:bg-blue-600 transition-all shadow-sm"
                  style={{ letterSpacing: '-0.374px' }}
                >
                  Sign up & Save Link
                </Button>

                <Button
                  onClick={handleLoginWithUrl}
                  className="w-full h-12 border border-gray-300 bg-white hover:bg-gray-50 text-black font-normal rounded-xl text-base dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 [...]
                  style={{ letterSpacing: '-0.374px' }}
                >
                  Sign in & Save Link
                </Button>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-3 text-gray-500 font-normal dark:bg-gray-900 dark:text-gray-400" style={{ letterSpacing: '-0.224px' }}>or</span>
                  </div>
                </div>

                <Button
                  onClick={handleAnonymousShorten}
                  disabled={loading}
                  className="w-full h-12 text-gray-600 hover:text-black font-normal bg-transparent border-0 text-base dark:text-gray-400 dark:hover:text-white"
                  style={{ letterSpacing: '-0.374px' }}
                >
                  {loading ? 'Shortening...' : 'Continue as Guest (3 free links)'}
                </Button>
              </div>

              <p className="text-sm text-gray-500 mt-5 text-center font-normal dark:text-gray-400" style={{ letterSpacing: '-0.224px' }}>
                Guest links are not saved and cannot be managed later.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Limit Reached Modal - Apple-style */}
      {showLimitReached && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-500" strokeWidth={1.5} />
                  <h2 className="text-2xl font-semibold text-black dark:text-white" style={{ letterSpacing: '-0.28px' }}>Limit Reached</h2>
                </div>
                <button
                  onClick={() => setShowLimitReached(false)}
                  className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" strokeWidth={1.5} />
                </button>
              </div>

              <p className="text-gray-600 mb-8 font-normal text-base dark:text-gray-400" style={{ letterSpacing: '-0.374px' }}>
                You've used all 3 free guest links. Create an account to get <strong>unlimited</strong> URL shortening, link management, and analytics.
              </p>

              <div className="bg-gray-50 p-5 rounded-xl mb-8 dark:bg-gray-800">
                <h3 className="text-base font-semibold text-black mb-3 dark:text-white" style={{ letterSpacing: '-0.374px' }}>With an account you get:</h3>
                <ul className="text-sm text-gray-600 space-y-2 dark:text-gray-400" style={{ letterSpacing: '-0.224px' }}>
                  <li>• Unlimited URL shortening</li>
                  <li>• Save and manage all your links</li>
                  <li>• Custom short URLs (coming soon)</li>
                  <li>• Link analytics (coming soon)</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleSignupWithUrl}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-normal rounded-xl text-base dark:bg-blue-500 dark:hover:bg-blue-600 transition-all shadow-sm"
                  style={{ letterSpacing: '-0.374px' }}
                >
                  Sign up & Continue
                </Button>

                <Button
                  onClick={handleLoginWithUrl}
                  className="w-full h-12 border border-gray-300 bg-white hover:bg-gray-50 text-black font-normal rounded-xl text-base dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 [...]
                  style={{ letterSpacing: '-0.374px' }}
                >
                  Sign in & Continue
                </Button>
              </div>

              <p className="text-sm text-gray-500 mt-5 text-center font-normal dark:text-gray-400" style={{ letterSpacing: '-0.224px' }}>
                Accounts are free and give you unlimited URL shortening.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default LandingPage
