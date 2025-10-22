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
  const [srMessage, setSrMessage] = useState("")

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
    setSrMessage("Saving notification preferences…")

    try {
      // TODO: Implement Supabase settings update
      console.log("Notification settings update:", settings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess(true)
      setSrMessage("Notification preferences saved.")
      onSave?.(settings)
    } catch (err) {
      setError("Failed to update notification settings. Please try again.")
      setSrMessage("Failed to save notification preferences.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isLoading || undefined}>
      {/* Live region for screen readers */}
      <p className="sr-only" aria-live="polite" role="status">{srMessage}</p>
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert role="status">
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
              <Label id="lbl-test-reminders" htmlFor="test-reminders">Water Test Reminders</Label>
              <p id="desc-test-reminders" className="text-sm text-gray-500">
                Get reminded when it's time to test your water parameters
              </p>
            </div>
            <Switch
              id="test-reminders"
              checked={settings.email.testReminders}
              onCheckedChange={(checked) => updateEmailSetting('testReminders', checked)}
              aria-labelledby="lbl-test-reminders"
              aria-describedby="desc-test-reminders"
            />
          </div>
          
          {settings.email.testReminders && (
            <div className="ml-4 space-y-2">
              <Label id="lbl-test-frequency" htmlFor="test-frequency">Reminder Frequency</Label>
              <Select 
                value={settings.frequency.testReminders} 
                onValueChange={(value) => updateFrequency('testReminders', value)}
              >
                <SelectTrigger id="test-frequency" className="w-48" aria-labelledby="lbl-test-frequency">
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
              <Label id="lbl-maintenance-alerts" htmlFor="maintenance-alerts">Maintenance Alerts</Label>
              <p id="desc-maintenance-alerts" className="text-sm text-gray-500">
                Critical alerts for water changes and equipment maintenance
              </p>
            </div>
            <Switch
              id="maintenance-alerts"
              checked={settings.email.maintenanceAlerts}
              onCheckedChange={(checked) => updateEmailSetting('maintenanceAlerts', checked)}
              aria-labelledby="lbl-maintenance-alerts"
              aria-describedby="desc-maintenance-alerts"
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label id="lbl-marketplace-updates" htmlFor="marketplace-updates">Marketplace Updates</Label>
              <p id="desc-marketplace-updates" className="text-sm text-gray-500">
                New listings, price alerts, and marketplace activity
              </p>
            </div>
            <Switch
              id="marketplace-updates"
              checked={settings.email.marketplaceUpdates}
              onCheckedChange={(checked) => updateEmailSetting('marketplaceUpdates', checked)}
              aria-labelledby="lbl-marketplace-updates"
              aria-describedby="desc-marketplace-updates"
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label id="lbl-community-digest" htmlFor="community-digest">Community Digest</Label>
              <p id="desc-community-digest" className="text-sm text-gray-500">
                Weekly summary of Q&A activity and community highlights
              </p>
            </div>
            <Switch
              id="community-digest"
              checked={settings.email.communityDigest}
              onCheckedChange={(checked) => updateEmailSetting('communityDigest', checked)}
              aria-labelledby="lbl-community-digest"
              aria-describedby="desc-community-digest"
            />
          </div>
          
          {settings.email.communityDigest && (
            <div className="ml-4 space-y-2">
              <Label id="lbl-digest-frequency" htmlFor="digest-frequency">Digest Frequency</Label>
              <Select 
                value={settings.frequency.communityDigest} 
                onValueChange={(value) => updateFrequency('communityDigest', value)}
              >
                <SelectTrigger id="digest-frequency" className="w-48" aria-labelledby="lbl-digest-frequency">
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
              <Label id="lbl-promotions" htmlFor="promotions">Promotions & Deals</Label>
              <p id="desc-promotions" className="text-sm text-gray-500">
                Special offers, discounts, and product recommendations
              </p>
            </div>
            <Switch
              id="promotions"
              checked={settings.email.promotions}
              onCheckedChange={(checked) => updateEmailSetting('promotions', checked)}
              aria-labelledby="lbl-promotions"
              aria-describedby="desc-promotions"
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
              <Label id="lbl-push-enabled" htmlFor="push-enabled">Enable Push Notifications</Label>
              <p id="desc-push-enabled" className="text-sm text-gray-500">
                Allow AquaDex to send push notifications to this device
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={settings.push.enabled}
              onCheckedChange={(checked) => updatePushSetting('enabled', checked)}
              aria-labelledby="lbl-push-enabled"
              aria-describedby="desc-push-enabled"
            />
          </div>
          
          {settings.push.enabled && (
            <>
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label id="lbl-push-test-reminders" htmlFor="push-test-reminders">Test Reminders</Label>
                  <p id="desc-push-test-reminders" className="text-sm text-gray-500">
                    Push notifications for water testing reminders
                  </p>
                </div>
                <Switch
                  id="push-test-reminders"
                  checked={settings.push.testReminders}
                  onCheckedChange={(checked) => updatePushSetting('testReminders', checked)}
                  aria-labelledby="lbl-push-test-reminders"
                  aria-describedby="desc-push-test-reminders"
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label id="lbl-push-urgent-alerts" htmlFor="push-urgent-alerts">Urgent Alerts</Label>
                  <p id="desc-push-urgent-alerts" className="text-sm text-gray-500">
                    Critical water parameter alerts and emergency notifications
                  </p>
                </div>
                <Switch
                  id="push-urgent-alerts"
                  checked={settings.push.urgentAlerts}
                  onCheckedChange={(checked) => updatePushSetting('urgentAlerts', checked)}
                  aria-labelledby="lbl-push-urgent-alerts"
                  aria-describedby="desc-push-urgent-alerts"
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