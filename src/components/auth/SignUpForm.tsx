"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [srMessage, setSrMessage] = useState("")
  
  const { signUp } = useAuth()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setFieldErrors({})

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields")
      const errs: Record<string, string> = {}
      if (!formData.username) errs.username = 'Username is required'
      if (!formData.email) errs.email = 'Email is required'
      if (!formData.password) errs.password = 'Password is required'
      if (!formData.confirmPassword) errs.confirmPassword = 'Confirm your password'
      setFieldErrors(errs)
      const first = Object.keys(errs)[0]
      if (first) document.getElementById(first)?.focus()
      setIsLoading(false)
      return
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address")
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }))
      document.getElementById('email')?.focus()
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setFieldErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }))
      document.getElementById('password')?.focus()
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
      document.getElementById('confirmPassword')?.focus()
      setIsLoading(false)
      return
    }

    try {
      setSrMessage('Creating your account…')
      await signUp(formData.email, formData.password, {
        display_name: formData.username,
        full_name: formData.username
      })
      
      setSuccess("Account created successfully! Please check your email to confirm your account before signing in.")
      setSrMessage('Account created successfully. Check your email to confirm your account.')
      
      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
      })
    } catch (err: any) {
      console.error("Sign up error:", err)
      
      // Handle specific Supabase auth errors
      if (err.message?.includes("User already registered")) {
        setError("An account with this email already exists. Please sign in instead.")
      } else if (err.message?.includes("Password should be at least")) {
        setError("Password must be at least 6 characters long.")
      } else if (err.message?.includes("Invalid email")) {
        setError("Please enter a valid email address.")
      } else if (err.message?.includes("Signup is disabled")) {
        setError("Account creation is currently disabled. Please try again later.")
      } else {
        setError("Failed to create account. Please try again.")
      }
      setSrMessage('Failed to create account.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Join AquaDex</CardTitle>
        <CardDescription className="text-center">
          Create your account to start managing your aquariums
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isLoading || undefined} noValidate>
          <p className="sr-only" aria-live="polite" role="status">{srMessage}</p>
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert role="status">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleInputChange}
              required
              aria-invalid={!!fieldErrors.username || undefined}
              aria-describedby={fieldErrors.username ? 'username-error' : undefined}
            />
            {fieldErrors.username && <p id="username-error" className="text-sm text-red-600">{fieldErrors.username}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
              aria-invalid={!!fieldErrors.email || undefined}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && <p id="email-error" className="text-sm text-red-600">{fieldErrors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
              required
              aria-invalid={!!fieldErrors.password || undefined}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password && <p id="password-error" className="text-sm text-red-600">{fieldErrors.password}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              aria-invalid={!!fieldErrors.confirmPassword || undefined}
              aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
            {fieldErrors.confirmPassword && <p id="confirmPassword-error" className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>}
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
          
          <div className="text-center">
            <div className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}