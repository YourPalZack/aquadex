"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"

export default function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [srMessage, setSrMessage] = useState("")
  
  const { updatePassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if we have the necessary tokens from the URL
  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setError("Invalid reset link. Please request a new password reset.")
    }
  }, [searchParams])

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
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields")
      const errs: Record<string, string> = {}
      if (!formData.password) errs.password = 'New password is required'
      if (!formData.confirmPassword) errs.confirmPassword = 'Please confirm your new password'
      setFieldErrors(errs)
      const first = Object.keys(errs)[0]
      if (first) document.getElementById(first)?.focus()
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
      setSrMessage('Resetting your password…')
      await updatePassword(formData.password)
      setSuccess(true)
      
      // Redirect to sign in page after successful password reset
      setTimeout(() => {
        router.push('/auth/signin')
      }, 3000)
    } catch (err: any) {
      console.error("Password reset error:", err)
      
      // Handle specific Supabase errors
      if (err.message?.includes("New password should be different")) {
        setError("Please choose a different password from your current one.")
      } else if (err.message?.includes("Password should be at least")) {
        setError("Password must be at least 6 characters long.")
      } else if (err.message?.includes("Invalid or expired")) {
        setError("Reset link has expired. Please request a new password reset.")
      } else {
        setError("Failed to reset password. Please try again or request a new reset link.")
      }
      setSrMessage('Failed to reset password.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Password Reset Successful</CardTitle>
          <CardDescription className="text-center">
            Your password has been successfully updated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <Alert>
              <AlertDescription>
                You can now sign in with your new password.
              </AlertDescription>
            </Alert>
            
            <Link href="/auth/signin">
              <Button className="w-full">
                Sign In
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
        <CardTitle className="text-2xl text-center">Set New Password</CardTitle>
        <CardDescription className="text-center">
          Enter your new password below
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
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your new password"
              value={formData.password}
              onChange={handleInputChange}
              required
              aria-invalid={!!fieldErrors.password || undefined}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password && <p id="password-error" className="text-sm text-red-600">{fieldErrors.password}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              aria-invalid={!!fieldErrors.confirmPassword || undefined}
              aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
            {fieldErrors.confirmPassword && <p id="confirmPassword-error" className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>}
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting Password..." : "Reset Password"}
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