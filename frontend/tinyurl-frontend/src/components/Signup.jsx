import { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Link2, Eye, EyeOff } from 'lucide-react'
import ThemeToggler from './ThemeToggler'
import { API_ENDPOINTS } from '../config/api'

function Signup({ onSignup, onSwitchToLogin, onBackToLanding }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) return

    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post(API_ENDPOINTS.SIGNUP, formData)
      
      if (response.data.success) {
        // Store both user and token
        localStorage.setItem('authToken', response.data.token)
        onSignup(response.data.user)
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Signup failed')
    }
    setLoading(false)
  }

  const isFormValid = formData.first_name.trim() && formData.last_name.trim() && 
                     formData.email.trim() && formData.password.trim()

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Navigation - Responsive */}
      <nav className="flex items-center justify-between p-4 md:px-8 md:py-6">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-black dark:text-white" strokeWidth={2} />
          <span className="text-base font-medium text-black dark:text-white">snip</span>
        </div>
        <ThemeToggler />
      </nav>

      {/* Main Content - Responsive */}
      <div className="flex items-center justify-center p-4 md:px-8 py-12 md:py-20">
        <div className="w-full max-w-sm">
          {/* Header - Responsive Text */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight mb-2 dark:text-white">
              Create account
            </h1>
            <p className="text-gray-500 font-normal dark:text-gray-400">
              Join snip today
            </p>
          </div>

          {/* Signup Form - Touch-Friendly */}
          <Card className="border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-700">
            <CardContent className="p-4 md:p-6 space-y-6">
              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                    <p className="text-sm text-red-600 font-medium dark:text-red-400">{error}</p>
                  </div>
                )}
                
                {/* Name Fields - Stack on Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      First name
                    </Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="John"
                      className="h-12 border-gray-200 focus:border-gray-400 focus:ring-0 font-normal dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Last name
                    </Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="h-12 border-gray-200 focus:border-gray-400 focus:ring-0 font-normal dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="h-12 border-gray-200 focus:border-gray-400 focus:ring-0 font-normal dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className="h-12 border-gray-200 focus:border-gray-400 focus:ring-0 font-normal pr-12 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" strokeWidth={2} />
                      ) : (
                        <Eye className="w-4 h-4" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !isFormValid}
                  className="w-full h-12 font-medium !bg-black !text-white hover:!bg-gray-800 dark:!bg-white dark:!text-black dark:hover:!bg-gray-100 disabled:!bg-gray-300 disabled:!text-gray-600"
                  size="lg"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>

              <div className="space-y-4">
                <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 font-normal dark:text-gray-400">
                    Already have an account?{' '}
                    <button
                      onClick={onSwitchToLogin}
                      className="text-black font-medium hover:underline dark:text-white"
                    >
                      Sign in
                    </button>
                  </p>
                </div>

                <div className="text-center">
                  <Button
                    onClick={onBackToLanding}
                    variant="ghost"
                    className="text-gray-500 hover:text-black font-normal text-sm dark:text-gray-400 dark:hover:text-white"
                  >
                    Continue as Guest
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Signup