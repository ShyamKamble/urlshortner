import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Link2, Check, LogOut, User, ArrowRight, ExternalLink, History, Globe } from 'lucide-react'
import ThemeToggler from './ThemeToggler'
import { API_ENDPOINTS } from '../config/api'
import { CompactUrlDisplay } from '@/components/ui/url-display'

function TinyURL({ user, onLogout }) {
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')
  const [userUrls, setUserUrls] = useState([])
  const [loadingUrls, setLoadingUrls] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Check for pending URL when component mounts
  useEffect(() => {
    const pendingUrl = localStorage.getItem('pending_url')
    if (pendingUrl) {
      setUrl(pendingUrl)
      localStorage.removeItem('pending_url')
      // Auto-shorten the pending URL
      handleShortenUrl(null, pendingUrl)
    }
    
    // Fetch user's URL history
    fetchUserUrls()
  }, [])

  const fetchUserUrls = async () => {
    try {
      setLoadingUrls(true)
      console.log('Fetching URLs for user ID:', user.id)
      
      // Get token from localStorage
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.error('No auth token found')
        return
      }
      
      const response = await axios.get(API_ENDPOINTS.USER_URLS(user.id), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('URL fetch response:', response.data)
      if (response.data.success) {
        // Sort URLs by creation date (newest first)
        const sortedUrls = response.data.urls.sort((a, b) => 
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        )
        console.log('Sorted URLs:', sortedUrls)
        setUserUrls(sortedUrls)
      }
    } catch (error) {
      console.error('Error fetching user URLs:', error)
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('authToken')
        localStorage.removeItem('tinyurl_user')
        onLogout()
      }
    } finally {
      setLoadingUrls(false)
    }
  }

  const handleShortenUrl = async (e, pendingUrlParam = null) => {
    if (e) e.preventDefault()
    const urlToShorten = pendingUrlParam || url
    if (!urlToShorten) return

    setLoading(true)
    try {
      // Get token from localStorage for authenticated requests
      const token = localStorage.getItem('authToken')
      const config = token ? {
        headers: { 'Authorization': `Bearer ${token}` }
      } : {}

      const response = await axios.post(API_ENDPOINTS.SHORTEN, {
        originalUrl: urlToShorten
        // Remove userId - backend gets it from JWT token
      }, config)
      
      setShortUrl(response.data.shortUrl)
      // Refresh the URL list after creating a new one
      fetchUserUrls()
    } catch (error) {
      console.error('Error shortening URL:', error)
    }
    setLoading(false)
  }

  const handleCopy = async (textToCopy, id = 'main') => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(id)
      setTimeout(() => setCopied(''), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleReset = () => {
    setUrl('')
    setShortUrl('')
    setCopied('')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filteredUrls = userUrls.filter(urlItem =>
    urlItem.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    urlItem.compeleturl.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Navigation - Responsive */}
      <nav className="flex items-center justify-between p-4 md:px-8 md:py-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-black dark:text-white" strokeWidth={2} />
          <span className="text-base font-medium text-black dark:text-white">snip</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggler />
          <div className="hidden sm:flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <User className="w-4 h-4" strokeWidth={2} />
            <span className="text-sm font-normal">
              {user.first_name} {user.last_name}
            </span>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="border-gray-300 hover:bg-gray-50 font-medium text-sm dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </nav>

      {/* Main Content - Responsive Container */}
      <div className="p-4 md:px-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section - Responsive Text */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-black mb-4 tracking-tight leading-tight dark:text-white">
              Shorten your links.
            </h1>
            <p className="text-base md:text-lg text-gray-500 font-normal dark:text-gray-400">
              Create short, memorable links. Your URLs are saved to your account.
            </p>
          </div>

          {/* URL Shortener Form - Mobile-First Stack */}
          {!shortUrl ? (
            <div className="max-w-2xl mx-auto mb-8 md:mb-12">
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
            <div className="max-w-2xl mx-auto mb-8 md:mb-12">
              <div className="p-4 md:p-6 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-900 dark:border-gray-700">
                <p className="text-sm text-gray-600 mb-3 font-normal dark:text-gray-400">Your shortened link:</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Input
                    value={shortUrl}
                    readOnly
                    className="flex-1 font-mono text-sm bg-white border-gray-200 h-10 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <Button
                    onClick={() => handleCopy(shortUrl)}
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 font-medium text-sm h-10 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-white"
                  >
                    {copied === 'main' ? (
                      <>
                        <Check className="w-4 h-4 mr-2" strokeWidth={2} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" strokeWidth={2} />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-3">
                  <a 
                    href={shortUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-black font-normal underline underline-offset-2 flex items-center gap-1 dark:text-gray-400 dark:hover:text-white"
                  >
                    Test your link
                    <ExternalLink className="w-3 h-3" strokeWidth={2} />
                  </a>
                  <Button
                    onClick={handleReset}
                    variant="ghost"
                    className="text-gray-500 hover:text-black font-normal text-sm dark:text-gray-400 dark:hover:text-white"
                  >
                    Shorten another link
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* URL History Section - Always Visible */}
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <History className="w-5 h-5" strokeWidth={2} />
                  Your Shortened URLs
                  {userUrls.length > 0 && (
                    <span className="text-sm font-normal text-gray-500">
                      ({userUrls.length} total)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingUrls ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 font-normal">Loading your URLs...</p>
                  </div>
                ) : userUrls.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 font-normal">No URLs shortened yet.</p>
                    <p className="text-sm text-gray-400 font-normal mt-1">
                      Start by shortening your first URL above!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Search Input */}
                    <Input
                      placeholder="Search your URLs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                    
                    {/* Mobile: Card Layout, Desktop: Table */}
                    <div className="block md:hidden">
                      <ScrollArea className="h-96">
                        <div className="space-y-3">
                          {filteredUrls.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              No URLs match your search.
                            </div>
                          ) : (
                            filteredUrls.map((urlItem, index) => (
                              <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1 dark:text-gray-400">Original:</p>
                                    <CompactUrlDisplay url={urlItem.originalUrl} />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1 dark:text-gray-400">Short URL:</p>
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={urlItem.compeleturl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono text-sm text-gray-700 hover:text-black flex-1 truncate dark:text-gray-300 dark:hover:text-white"
                                      >
                                        {urlItem.compeleturl}
                                      </a>
                                      <Button
                                        onClick={() => handleCopy(urlItem.compeleturl, `url-${index}`)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 shrink-0"
                                      >
                                        {copied === `url-${index}` ? (
                                          <Check className="w-4 h-4 text-green-600" strokeWidth={2} />
                                        ) : (
                                          <Copy className="w-4 h-4" strokeWidth={2} />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Created: {formatDate(urlItem.createdAt)}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Desktop: Table Layout */}
                    <div className="hidden md:block">
                      <ScrollArea className="h-96">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-medium">Original URL</TableHead>
                              <TableHead className="font-medium">Short URL</TableHead>
                              <TableHead className="font-medium">Created</TableHead>
                              <TableHead className="font-medium w-24">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredUrls.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                  No URLs match your search.
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredUrls.map((urlItem, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-normal">
                                    <CompactUrlDisplay url={urlItem.originalUrl} />
                                  </TableCell>
                                  <TableCell className="font-mono text-sm">
                                    <a
                                      href={urlItem.compeleturl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
                                    >
                                      {urlItem.compeleturl}
                                    </a>
                                  </TableCell>
                                  <TableCell className="text-gray-500 font-normal text-sm">
                                    {formatDate(urlItem.createdAt)}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      onClick={() => handleCopy(urlItem.compeleturl, `url-${index}`)}
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                    >
                                      {copied === `url-${index}` ? (
                                        <Check className="w-4 h-4 text-green-600" strokeWidth={2} />
                                      ) : (
                                        <Copy className="w-4 h-4" strokeWidth={2} />
                                      )}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer - Responsive */}
      <footer className="border-t border-gray-100 p-4 md:px-8 md:py-6 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-4xl mx-auto gap-4">
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
    </div>
  )
}

export default TinyURL