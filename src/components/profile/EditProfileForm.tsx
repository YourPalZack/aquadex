"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateUserProfile, uploadProfilePhoto } from "@/lib/actions/profile-supabase"
import { Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProfileData {
  displayName: string
  email: string
  bio: string
  location: string
  experienceLevel: string
  photoURL?: string
}

interface EditProfileFormProps {
  initialData?: ProfileData
  onSave?: (data: ProfileData) => void
  onCancel?: () => void
}

export default function EditProfileForm({ 
  initialData,
  onSave,
  onCancel 
}: EditProfileFormProps) {
  const [formData, setFormData] = useState<ProfileData>({
    displayName: initialData?.displayName || "",
    email: initialData?.email || "",
    bio: initialData?.bio || "",
    location: initialData?.location || "",
    experienceLevel: initialData?.experienceLevel || "",
    photoURL: initialData?.photoURL || ""
  })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Basic validation
    if (!formData.displayName || !formData.email) {
      setError("Display name and email are required")
      return
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    startTransition(async () => {
      try {
        const formDataToSend = new FormData()
        formDataToSend.append('display_name', formData.displayName)
        formDataToSend.append('full_name', formData.displayName)
        formDataToSend.append('bio', formData.bio)
        formDataToSend.append('location', formData.location)
        formDataToSend.append('experience_level', formData.experienceLevel)
        
        const result = await updateUserProfile(formDataToSend)
        
        if (result.success) {
          setSuccess(true)
          toast({
            title: "Profile Updated",
            description: result.message,
          })
          onSave?.(formData)
        } else {
          setError(result.error || result.message)
          toast({
            title: "Error",
            description: result.error || result.message,
            variant: "destructive"
          })
        }
      } catch (err) {
        setError("Failed to update profile. Please try again.")
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive"
        })
      }
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploadingPhoto(true)
      
      try {
        const formData = new FormData()
        formData.append('photo', file)
        
        const result = await uploadProfilePhoto(formData)
        
        if (result.success && result.url) {
          setFormData(prev => ({
            ...prev,
            photoURL: result.url
          }))
          toast({
            title: "Photo Uploaded",
            description: result.message,
          })
        } else {
          toast({
            title: "Upload Failed",
            description: result.error || result.message,
            variant: "destructive"
          })
        }
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Failed to upload photo. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsUploadingPhoto(false)
      }
      
      // For now, create a preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          photoURL: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your personal information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}
          
          {/* Profile Photo Section */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={formData.photoURL} />
              <AvatarFallback>
                {formData.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <Label htmlFor="photo" className="cursor-pointer">
                <Button type="button" variant="outline" asChild>
                  <span>Change Photo</span>
                </Button>
              </Label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <p className="text-sm text-gray-500 mt-1">
                JPG, PNG or GIF. Max 5MB.
              </p>
            </div>
          </div>
          
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Your display name"
                value={formData.displayName}
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
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself and your aquarium journey..."
              value={formData.bio}
              onChange={handleInputChange}
              className="min-h-24"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="City, State/Country"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select 
                value={formData.experienceLevel} 
                onValueChange={(value) => handleSelectChange("experienceLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (Less than 1 year)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                  <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                  <SelectItem value="expert">Expert (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isPending || isUploadingPhoto}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
            
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}