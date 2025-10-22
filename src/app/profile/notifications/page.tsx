import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import NotificationSettingsForm from "@/components/profile/NotificationSettingsForm"
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

export default function NotificationSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="sr-only">Notification Settings</h1>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Profile', href: '/profile' },
          { label: 'Notifications' },
        ]}
        className="mb-4"
      />
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage how and when you receive notifications from AquaDex
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose which notifications you'd like to receive via email and in-app alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationSettingsForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const metadata = {
  title: "Notification Settings - AquaDex",
  description: "Manage your notification preferences and settings.",
}