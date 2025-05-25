"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

interface NotificationSettings {
  email: {
    testReminders: boolean
    maintenanceAlerts: boolean
    marketplaceUpdates: boolean
    communityDigest: boolean
    promotions: boolean
  }
  push: {
    enabled: boolean
    testReminders: boolean
    urgentAlerts: boolean
  }
  frequency: {
    testReminders: 'daily' | 'weekly' | 'monthly' | 'never'
    communityDigest: 'daily' | 'weekly' | 'never'
  }
}

interface NotificationSettingsFormProps {
  initialSettings?: NotificationSettings
  onSave?: (settings: NotificationSettings) => void
}

export default function NotificationSettingsForm({ 
  initialSettings,
  onSave 
}: NotificationSettingsFormProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      testReminders: initialSettings?.email?.testReminders ?? true,
      maintenanceAlerts: initialSettings?.email?.maintenanceAlerts ?? true,
      marketplaceUpdates: initialSettings?.email?.marketplaceUpdates ?? false,
      communityDigest: initialSettings?.email?.communityDigest ?? true,
      promotions: initialSettings?.email?.promotions ?? false
    },
    push: {
      enabled: initialSettings?.push?.enabled ?? false,
      testReminders: initialSettings?.push?.testReminders ?? false,
      urgentAlerts: initialSettings?.push?.urgentAlerts ?? false
    },
    frequency: {
      testReminders: initialSettings?.frequency?.testReminders ?? 'weekly',
      communityDigest: initialSettings?.frequency?.communityDigest ?? 'weekly'
    }
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const updateEmailSetting = (key: keyof typeof settings.email, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [key]: value
      }
    }))
  }

  const updatePushSetting = (key: keyof typeof settings.push, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      push: {
        ...prev.push,
        [key]: value
      }
    }))
  }

  const updateFrequency = (key: keyof typeof settings.frequency, value: string) => {
    setSettings(prev => ({
      ...prev,
      frequency: {
        ...prev.frequency,
        [key]: value as any
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      // TODO: Implement Firebase settings update
      console.log("Notification settings update:", settings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess(true)
      onSave?.(settings)
    } catch (err) {
      setError("Failed to update notification settings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription>Notification settings updated successfully!</AlertDescription>
        </Alert>
      )}

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Email Notifications</CardTitle>
          <CardDescription>
            Choose which email notifications you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="test-reminders">Water Test Reminders</Label>
              <p className="text-sm text-gray-500">
                Get reminded when it's time to test your water parameters
              </p>
            </div>
            <Switch
              id="test-reminders"
              checked={settings.email.testReminders}
              onCheckedChange={(checked) => updateEmailSetting('testReminders', checked)}
            />
          </div>
          
          {settings.email.testReminders && (
            <div className="ml-4 space-y-2">
              <Label htmlFor="test-frequency">Reminder Frequency</Label>
              <Select 
                value={settings.frequency.testReminders} 
                onValueChange={(value) => updateFrequency('testReminders', value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-alerts">Maintenance Alerts</Label>
              <p className="text-sm text-gray-500">
                Critical alerts for water changes and equipment maintenance
              </p>
            </div>
            <Switch
              id="maintenance-alerts"
              checked={settings.email.maintenanceAlerts}
              onCheckedChange={(checked) => updateEmailSetting('maintenanceAlerts', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketplace-updates">Marketplace Updates</Label>
              <p className="text-sm text-gray-500">
                New listings, price alerts, and marketplace activity
              </p>
            </div>
            <Switch
              id="marketplace-updates"
              checked={settings.email.marketplaceUpdates}
              onCheckedChange={(checked) => updateEmailSetting('marketplaceUpdates', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="community-digest">Community Digest</Label>
              <p className="text-sm text-gray-500">
                Weekly summary of Q&A activity and community highlights
              </p>
            </div>
            <Switch
              id="community-digest"
              checked={settings.email.communityDigest}
              onCheckedChange={(checked) => updateEmailSetting('communityDigest', checked)}
            />
          </div>
          
          {settings.email.communityDigest && (
            <div className="ml-4 space-y-2">
              <Label htmlFor="digest-frequency">Digest Frequency</Label>
              <Select 
                value={settings.frequency.communityDigest} 
                onValueChange={(value) => updateFrequency('communityDigest', value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="promotions">Promotions & Deals</Label>
              <p className="text-sm text-gray-500">
                Special offers, discounts, and product recommendations
              </p>
            </div>
            <Switch
              id="promotions"
              checked={settings.email.promotions}
              onCheckedChange={(checked) => updateEmailSetting('promotions', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Push Notifications</CardTitle>
          <CardDescription>
            Instant notifications for time-sensitive alerts (browser/mobile)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-enabled">Enable Push Notifications</Label>
              <p className="text-sm text-gray-500">
                Allow AquaDex to send push notifications to this device
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={settings.push.enabled}
              onCheckedChange={(checked) => updatePushSetting('enabled', checked)}
            />
          </div>
          
          {settings.push.enabled && (
            <>
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-test-reminders">Test Reminders</Label>
                  <p className="text-sm text-gray-500">
                    Push notifications for water testing reminders
                  </p>
                </div>
                <Switch
                  id="push-test-reminders"
                  checked={settings.push.testReminders}
                  onCheckedChange={(checked) => updatePushSetting('testReminders', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-urgent-alerts">Urgent Alerts</Label>
                  <p className="text-sm text-gray-500">
                    Critical water parameter alerts and emergency notifications
                  </p>
                </div>
                <Switch
                  id="push-urgent-alerts"
                  checked={settings.push.urgentAlerts}
                  onCheckedChange={(checked) => updatePushSetting('urgentAlerts', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </form>
  )
}