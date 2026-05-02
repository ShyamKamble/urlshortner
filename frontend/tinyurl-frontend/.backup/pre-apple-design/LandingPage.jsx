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
  const [anonymousCount, setAnonymousCount] = useState(0)

  // Check anonymous usage count on component mount
  useEffect(() => {
    const count = parseInt(localStorage.getItem('anonymous_url_count') || '0')
    setAnonymousCount(count)
  }, [])

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
      {/* Navigation - Responsive */}
      <nav className="flex items-center justify-between p-4 md:px-8 md:py-6">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-black dark:text-white" strokeWidth={2} />
          <span className="text-base font-medium text-black dark:text-white">snip</span>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <button className="hidden sm:block text-gray-500 hover:text-black text-sm font-normal dark:text-gray-400 dark:hover:text-white">About</button>
          <button className="hidden sm:block text-gray-500 hover:text-black text-sm font-normal dark:text-gray-400 dark:hover:text-white">API</button>

          {/* Theme Toggler */}
          <ThemeToggler />

          {/* Guest mode indicator */}
          {anonymousCount > 0 && anonymousCount < 3 && (
            <span className="hidden sm:inline text-xs text-gray-500 font-normal px-2 py-1 bg-gray-100 rounded dark:text-gray-400 dark:bg-gray-800">
              Guest: {getRemainingUrls()} left
            </span>
          )}

          <Button
            onClick={onSwitchToLogin}
            variant="outline"
            className="border-gray-200 hover:bg-gray-50 font-medium text-sm dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white"
          >
            Sign in
          </Button>
        </div>
      </nav>

      {/* Main Content - Responsive Container */}
      <div className="flex flex-col items-center justify-center p-4 md:px-8 pt-12 md:pt-24 pb-16 md:pb-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Hero Section - Responsive Typography */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-black mb-4 tracking-tight leading-tight dark:text-white">
            Shorten your links.
          </h1>
          <p className="text-base md:text-lg text-gray-500 mb-4 font-normal max-w-md mx-auto dark:text-gray-400">
            Create short, memorable links in seconds. No signup required.
          </p>

          {/* Anonymous usage counter with progress */}
          {anonymousCount > 0 && anonymousCount < 3 && (
            <div className="mb-8 md:mb-12">
              <p className="text-sm text-gray-400 mb-2 font-normal">
                {getRemainingUrls()} free links remaining as guest
              </p>
              <div className="w-32 mx-auto bg-gray-200 rounded-full h-1">
                <div
                  className="bg-gray-400 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(anonymousCount / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* URL Shortener Form - Mobile-First Stack */}
          {!shortUrl ? (
            <div className="max-w-2xl mx-auto mb-16 md:mb-32">
              <form onSubmit={handleShortenUrl} className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste your long URL here..."
                  className="flex-1 h-12 px-4 text-sm border-gray-300 rounded-md focus:border-gray-400 focus:ring-0 bg-white font-normal dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  required
                />
                <Button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="!inline-flex !items-center !justify-center !gap-2 !whitespace-nowrap !shrink-0 !h-12 !px-6 !py-2 !text-sm !font-medium !rounded-md !transition-all !outline-none !bg-gray-900 !text-white hover:!bg-gray-800 !border !border-gray-300 !shadow-sm disabled:!pointer-events-none disabled:!opacity-100 disabled:!bg-gray-300 disabled:!text-gray-600 focus-visible:!ring-2 focus-visible:!ring-offset-2 focus-visible:!ring-gray-900"
                >
                  {loading ? 'Shortening...' : (
                    <>
                      Shorten
                      <ArrowRight className="w-4 h-4 ml-1" strokeWidth={2} />
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto mb-16 md:mb-32">
              <div className="p-4 md:p-6 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700">
                <p className="text-sm text-gray-600 mb-3 font-normal dark:text-gray-400">Your shortened link:</p>
                
                {/* Original URL Display */}
                <div className="mb-4 p-3 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:border-gray-600">
                  <p className="text-xs text-gray-500 mb-1 dark:text-gray-400">Original:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 break-all" title={decodeUrl(url)}>
                    {formatUrlForDisplay(decodeUrl(url), 60)}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Input
                    value={shortUrl}
                    readOnly
                    className="flex-1 font-mono text-sm bg-white border-gray-200 h-10 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <Button
                    onClick={() => navigator.clipboard.writeText(shortUrl)}
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 font-medium text-sm h-10 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-white"
                  >
                    Copy
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    setUrl('')
                    setShortUrl('')
                  }}
                  variant="ghost"
                  className="mt-3 text-gray-500 hover:text-black font-normal text-sm dark:text-gray-400 dark:hover:text-white"
                >
                  Shorten another link
                </Button>
              </div>
            </div>
          )}

          {/* Statistics - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-black mb-1 dark:text-white">1M+</div>
              <div className="text-sm text-gray-500 font-normal dark:text-gray-400">Links created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-black mb-1 dark:text-white">99.9%</div>
              <div className="text-sm text-gray-500 font-normal dark:text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-black mb-1 dark:text-white">&lt;50ms</div>
              <div className="text-sm text-gray-500 font-normal dark:text-gray-400">Redirect time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Responsive */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 md:px-8 md:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-xs font-normal dark:text-gray-500 text-center sm:text-left">
            © 2025 snip. Shorten links, share faster.
          </p>
          <div className="flex items-center gap-4 md:gap-6">
            <button className="text-gray-400 hover:text-black text-xs font-normal dark:hover:text-white">Privacy</button>
            <button className="text-gray-400 hover:text-black text-xs font-normal dark:hover:text-white">Terms</button>
            <button className="text-gray-400 hover:text-black text-xs font-normal dark:hover:text-white">GitHub</button>
          </div>
        </div>
      </footer>

      {/* Authentication Prompt Modal (for first-time users) */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white dark:bg-gray-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black dark:text-white">Choose an option</h2>
                <button
                  onClick={() => setShowAuthPrompt(false)}
                  className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>

              <p className="text-gray-600 mb-6 font-normal dark:text-gray-400">
                Sign up to save your links to your account, or continue as guest.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleSignupWithUrl}
                  className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium dark:bg-white dark:hover:bg-gray-100 dark:text-black"
                >
                  Sign up & Save Link
                </Button>

                <Button
                  onClick={handleLoginWithUrl}
                  variant="outline"
                  className="w-full h-11 border-gray-300 hover:bg-gray-50 font-medium dark:border-gray-600 dark:hover:bg-gray-800 dark:text-white"
                >
                  Sign in & Save Link
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-gray-500 font-normal dark:bg-gray-900 dark:text-gray-400">or</span>
                  </div>
                </div>

                <Button
                  onClick={handleAnonymousShorten}
                  disabled={loading}
                  variant="ghost"
                  className="w-full h-11 text-gray-600 hover:text-black font-normal dark:text-gray-400 dark:hover:text-white"
                >
                  {loading ? 'Shortening...' : 'Continue as Guest (3 free links)'}
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center font-normal dark:text-gray-400">
                Guest links are not saved and cannot be managed later.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Limit Reached Modal */}
      {showLimitReached && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white dark:bg-gray-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" strokeWidth={2} />
                  <h2 className="text-xl font-bold text-black dark:text-white">Limit Reached</h2>
                </div>
                <button
                  onClick={() => setShowLimitReached(false)}
                  className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>

              <p className="text-gray-600 mb-6 font-normal dark:text-gray-400">
                You've used all 3 free guest links. Create an account to get <strong>unlimited</strong> URL shortening, link management, and analytics.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-6 dark:bg-gray-800">
                <h3 className="text-sm font-medium text-black mb-2 dark:text-white">With an account you get:</h3>
                <ul className="text-xs text-gray-600 space-y-1 dark:text-gray-400">
                  <li>• Unlimited URL shortening</li>
                  <li>• Save and manage all your links</li>
                  <li>• Custom short URLs (coming soon)</li>
                  <li>• Link analytics (coming soon)</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleSignupWithUrl}
                  className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium dark:bg-white dark:hover:bg-gray-100 dark:text-black"
                >
                  Sign up & Continue
                </Button>

                <Button
                  onClick={handleLoginWithUrl}
                  variant="outline"
                  className="w-full h-11 border-gray-300 hover:bg-gray-50 font-medium dark:border-gray-600 dark:hover:bg-gray-800 dark:text-white"
                >
                  Sign in & Continue
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center font-normal dark:text-gray-400">
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