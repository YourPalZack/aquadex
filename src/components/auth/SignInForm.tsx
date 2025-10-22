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

export default function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [srMessage, setSrMessage] = useState("")
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setEmailError(null)
    setPasswordError(null)

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields")
      if (!email) {
        setEmailError('Email is required')
        document.getElementById('email')?.focus()
      } else if (!password) {
        setPasswordError('Password is required')
        document.getElementById('password')?.focus()
      }
      setIsLoading(false)
      return
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      setEmailError('Please enter a valid email address')
      document.getElementById('email')?.focus()
      setIsLoading(false)
      return
    }

    try {
      setSrMessage('Signing in…')
      await signIn(email, password)
      
      // Redirect to dashboard on successful sign in
      setSrMessage('Signed in successfully. Redirecting to dashboard…')
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Sign in error:", err)
      
      // Handle specific Supabase auth errors
      if (err.message?.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.")
      } else if (err.message?.includes("Email not confirmed")) {
        setError("Please check your email and confirm your account before signing in.")
      } else if (err.message?.includes("Too many requests")) {
        setError("Too many sign in attempts. Please wait a moment and try again.")
      } else {
        setError("Failed to sign in. Please check your credentials and try again.")
      }
      
      setSrMessage('Failed to sign in.')
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Sign In to AquaDex</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isLoading || undefined} noValidate>
          {/* Live region for status updates */}
          <p className="sr-only" aria-live="polite" role="status">{srMessage}</p>
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={!!emailError || undefined}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && <p id="email-error" className="text-sm text-red-600">{emailError}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-invalid={!!passwordError || undefined}
              aria-describedby={passwordError ? 'password-error' : undefined}
            />
            {passwordError && <p id="password-error" className="text-sm text-red-600">{passwordError}</p>}
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
          
          <div className="text-center space-y-2">
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot your password?
            </Link>
            <div className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}