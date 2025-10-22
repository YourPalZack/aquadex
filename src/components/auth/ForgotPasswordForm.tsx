"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [srMessage, setSrMessage] = useState("")
  
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setEmailError(null)

    // Basic validation
    if (!email) {
      setError("Please enter your email address")
      setEmailError('Email is required')
      document.getElementById('email')?.focus()
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
      setSrMessage('Sending password reset link…')
      await resetPassword(email)
      setSuccess(true)
    } catch (err: any) {
      console.error("Password reset error:", err)
      
      // Handle specific Supabase errors
      if (err.message?.includes("Invalid email")) {
        setError("Please enter a valid email address.")
      } else if (err.message?.includes("Rate limit")) {
        setError("Too many requests. Please wait a moment before trying again.")
      } else {
        setError("Failed to send reset email. Please try again.")
      }
      setSrMessage('Failed to send reset email.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a password reset link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <Alert>
              <AlertDescription>
                If an account with that email exists, you will receive a password reset link shortly.
              </AlertDescription>
            </Alert>
            
            <div className="text-sm text-gray-600">
              Didn't receive the email? Check your spam folder or{" "}
              <button 
                onClick={() => setSuccess(false)}
                className="text-blue-600 hover:underline"
              >
                try again
              </button>
            </div>
            
            <Link href="/auth/signin">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you a link to reset your password
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
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={!!emailError || undefined}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && <p id="email-error" className="text-sm text-red-600">{emailError}</p>}
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
          
          <div className="text-center">
            <Link 
              href="/auth/signin" 
              className="text-sm text-blue-600 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}