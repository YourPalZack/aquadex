"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubjectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subject: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      // TODO: Implement backend contact form submission
      console.log("Contact form submission:", formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess(true)
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (err) {
      setError("Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Contact Us</CardTitle>
        <CardDescription>
          Have questions, feedback, or need support? We'd love to hear from you!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <Alert>
            <AlertDescription>
              Thank you for your message! We'll get back to you within 24 hours.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select onValueChange={handleSubjectChange} value={formData.subject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="support">Technical Support</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us how we can help you..."
                value={formData.message}
                onChange={handleInputChange}
                className="min-h-32"
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Message"}
            </Button>
          </form>
        )}
        
        <div className="mt-8 pt-6 border-t">
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Other Ways to Reach Us</h3>
            <p className="text-sm text-gray-600">
              Email: support@aquadex.com
            </p>
            <p className="text-sm text-gray-600">
              We typically respond within 24 hours
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}