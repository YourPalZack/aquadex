"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ResetPasswordFormProps {
  token?: string
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

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

    // Validation
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      // TODO: Implement Firebase password reset with token
      console.log("Password reset attempt:", { 
        token,
        password: "***"
      })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess(true)
    } catch (err) {
      setError("Failed to reset password. The link may have expired.")
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
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
            />
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
            />
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