'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, X } from 'lucide-react'
import { createWaterTestAction, uploadWaterTestImage } from '@/lib/actions/water-test-supabase'
import type { Database } from '@/lib/supabase'

type Aquarium = Database['public']['Tables']['aquariums']['Row']

const waterTestSchema = z.object({
  aquarium_id: z.string().min(1, 'Please select an aquarium'),
  test_date: z.string().optional(),
  temperature: z.coerce.number().optional().nullable(),
  ph: z.coerce.number().min(0).max(14).optional().nullable(),
  ammonia: z.coerce.number().min(0).optional().nullable(),
  nitrite: z.coerce.number().min(0).optional().nullable(),
  nitrate: z.coerce.number().min(0).optional().nullable(),
  gh: z.coerce.number().min(0).optional().nullable(),
  kh: z.coerce.number().min(0).optional().nullable(),
  tds: z.coerce.number().min(0).optional().nullable(),
  salinity: z.coerce.number().min(0).max(50).optional().nullable(),
  alkalinity: z.coerce.number().min(0).optional().nullable(),
  phosphate: z.coerce.number().min(0).optional().nullable(),
  chlorine: z.coerce.number().min(0).optional().nullable(),
  copper: z.coerce.number().min(0).optional().nullable(),
  iron: z.coerce.number().min(0).optional().nullable(),
  calcium: z.coerce.number().min(0).optional().nullable(),
  magnesium: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional(),
  test_kit_used: z.string().optional(),
})

type WaterTestFormData = z.infer<typeof waterTestSchema>

interface WaterTestFormProps {
  aquariums: Aquarium[]
  defaultAquariumId?: string
}

export default function WaterTestForm({ aquariums, defaultAquariumId }: WaterTestFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<WaterTestFormData>({
    resolver: zodResolver(waterTestSchema),
    defaultValues: {
      aquarium_id: defaultAquariumId || '',
      test_date: new Date().toISOString().split('T')[0],
    },
  })

  const selectedAquariumId = watch('aquarium_id')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image must be less than 5MB')
        return
      }
      
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const onSubmit = async (data: WaterTestFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Create water test
      const result = await createWaterTestAction(data)

      if (!result.success) {
        throw new Error(result.error || 'Failed to create water test')
      }

      // Upload image if provided
      if (imageFile && result.data) {
        const uploadResult = await uploadWaterTestImage(imageFile, result.data.id)
        
        if (!uploadResult.success) {
          console.error('Failed to upload image:', uploadResult.error)
          // Continue anyway, test was created
        }
      }

      // Redirect to water tests page
      router.push('/water-tests')
      router.refresh()
    } catch (err: any) {
      console.error('Error creating water test:', err)
      setError(err.message || 'Failed to create water test')
      setIsSubmitting(false)
    }
  }

  if (aquariums.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Aquariums Found</CardTitle>
          <CardDescription>
            You need to create an aquarium before recording water tests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/aquariums')}>
            Create Aquarium
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Water Test</CardTitle>
        <CardDescription>
          Enter your water test parameters. All fields are optional except aquarium selection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Aquarium Selection */}
          <div className="space-y-2">
            <Label htmlFor="aquarium_id">Aquarium *</Label>
            <Select
              value={selectedAquariumId}
              onValueChange={(value) => setValue('aquarium_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an aquarium" />
              </SelectTrigger>
              <SelectContent>
                {aquariums.map((aquarium) => (
                  <SelectItem key={aquarium.id} value={aquarium.id}>
                    {aquarium.name} ({aquarium.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.aquarium_id && (
              <p className="text-sm text-destructive">{errors.aquarium_id.message}</p>
            )}
          </div>

          {/* Test Date */}
          <div className="space-y-2">
            <Label htmlFor="test_date">Test Date</Label>
            <Input
              id="test_date"
              type="date"
              {...register('test_date')}
            />
          </div>

          {/* Basic Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="25.5"
                {...register('temperature')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ph">pH</Label>
              <Input
                id="ph"
                type="number"
                step="0.1"
                placeholder="7.0"
                {...register('ph')}
              />
              {errors.ph && (
                <p className="text-sm text-destructive">{errors.ph.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ammonia">Ammonia (ppm)</Label>
              <Input
                id="ammonia"
                type="number"
                step="0.01"
                placeholder="0.0"
                {...register('ammonia')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nitrite">Nitrite (ppm)</Label>
              <Input
                id="nitrite"
                type="number"
                step="0.01"
                placeholder="0.0"
                {...register('nitrite')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nitrate">Nitrate (ppm)</Label>
              <Input
                id="nitrate"
                type="number"
                step="0.1"
                placeholder="10.0"
                {...register('nitrate')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gh">GH (dGH)</Label>
              <Input
                id="gh"
                type="number"
                placeholder="8"
                {...register('gh')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kh">KH (dKH)</Label>
              <Input
                id="kh"
                type="number"
                placeholder="6"
                {...register('kh')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tds">TDS (ppm)</Label>
              <Input
                id="tds"
                type="number"
                placeholder="200"
                {...register('tds')}
              />
            </div>
          </div>

          {/* Additional Parameters */}
          <details className="space-y-4">
            <summary className="cursor-pointer font-medium text-sm">
              Additional Parameters (Optional)
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="salinity">Salinity (ppt)</Label>
                <Input
                  id="salinity"
                  type="number"
                  step="0.1"
                  placeholder="35.0"
                  {...register('salinity')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alkalinity">Alkalinity</Label>
                <Input
                  id="alkalinity"
                  type="number"
                  placeholder="120"
                  {...register('alkalinity')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phosphate">Phosphate (ppm)</Label>
                <Input
                  id="phosphate"
                  type="number"
                  step="0.01"
                  placeholder="0.05"
                  {...register('phosphate')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chlorine">Chlorine (ppm)</Label>
                <Input
                  id="chlorine"
                  type="number"
                  step="0.01"
                  placeholder="0.0"
                  {...register('chlorine')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="copper">Copper (ppm)</Label>
                <Input
                  id="copper"
                  type="number"
                  step="0.001"
                  placeholder="0.0"
                  {...register('copper')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iron">Iron (ppm)</Label>
                <Input
                  id="iron"
                  type="number"
                  step="0.001"
                  placeholder="0.1"
                  {...register('iron')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calcium">Calcium (ppm)</Label>
                <Input
                  id="calcium"
                  type="number"
                  placeholder="400"
                  {...register('calcium')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="magnesium">Magnesium (ppm)</Label>
                <Input
                  id="magnesium"
                  type="number"
                  placeholder="1300"
                  {...register('magnesium')}
                />
              </div>
            </div>
          </details>

          {/* Test Kit */}
          <div className="space-y-2">
            <Label htmlFor="test_kit_used">Test Kit Used</Label>
            <Input
              id="test_kit_used"
              placeholder="API Master Test Kit"
              {...register('test_kit_used')}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any observations or notes about this test..."
              rows={3}
              {...register('notes')}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Test Strip Photo (Optional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Test strip preview"
                  className="w-full max-w-md rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <span className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </span>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Test'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}