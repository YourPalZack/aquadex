'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, X, ImageIcon } from 'lucide-react'
import { uploadAquariumPhotos, deleteAquariumPhoto } from '@/lib/actions/aquarium-supabase'
import type { Database } from '@/lib/supabase'

type Aquarium = Database['public']['Tables']['aquariums']['Row']

interface PhotoUploadProps {
  aquariumId: string
  existingPhotos?: string[]
  onPhotosUpdated?: (photos: string[]) => void
}

export default function AquariumPhotoUpload({ 
  aquariumId, 
  existingPhotos = [],
  onPhotosUpdated 
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length + photos.length + photoFiles.length > 10) {
      setError('Maximum 10 photos allowed')
      return
    }
    
    const oversized = files.find(f => f.size > 5 * 1024 * 1024)
    if (oversized) {
      setError('Each photo must be less than 5MB')
      return
    }
    
    setError(null)
    setPhotoFiles(prev => [...prev, ...files])
    
    // Generate previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleUpload = async () => {
    if (photoFiles.length === 0) return

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      setUploadProgress(25)
      const result = await uploadAquariumPhotos(photoFiles, aquariumId)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload photos')
      }

      setUploadProgress(75)

      const newPhotos = [...photos, ...(result.urls?.filter((url): url is string => !!url) || [])]
      setPhotos(newPhotos)
      setPhotoFiles([])
      setPhotoPreviews([])
      setUploadProgress(100)

      if (onPhotosUpdated) {
        onPhotosUpdated(newPhotos)
      }

      setTimeout(() => setUploadProgress(0), 1000)
    } catch (err: any) {
      console.error('Error uploading photos:', err)
      setError(err.message || 'Failed to upload photos')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveExisting = async (photoUrl: string, index: number) => {
    try {
      const result = await deleteAquariumPhoto(photoUrl)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete photo')
      }

      const newPhotos = photos.filter((_, i) => i !== index)
      setPhotos(newPhotos)

      if (onPhotosUpdated) {
        onPhotosUpdated(newPhotos)
      }
    } catch (err: any) {
      console.error('Error deleting photo:', err)
      setError(err.message || 'Failed to delete photo')
    }
  }

  const handleRemovePreview = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aquarium Photos</CardTitle>
        <CardDescription>
          Upload up to 10 photos of your aquarium (max 5MB each)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Existing Photos */}
        {photos.length > 0 && (
          <div>
            <Label className="mb-2 block">Current Photos</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Aquarium photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => handleRemoveExisting(photo, index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Photo Previews */}
        {photoPreviews.length > 0 && (
          <div>
            <Label className="mb-2 block">New Photos (not uploaded yet)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`New photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-primary"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => handleRemovePreview(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload New Photos */}
        {photos.length + photoFiles.length < 10 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <span className="text-sm text-muted-foreground">
                  Click to upload photos or drag and drop
                </span>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoChange}
                  disabled={isUploading}
                />
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 5MB each
              </p>
            </div>

            {photoFiles.length > 0 && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading {photoFiles.length} photo{photoFiles.length > 1 ? 's' : ''}...
                  </>
                ) : (
                  `Upload ${photoFiles.length} photo${photoFiles.length > 1 ? 's' : ''}`
                )}
              </Button>
            )}
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {photos.length + photoFiles.length}/10 photos
        </p>
      </CardContent>
    </Card>
  )
}