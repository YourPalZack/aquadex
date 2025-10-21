'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EditProfileForm from '@/components/profile/EditProfileForm';
import NotificationSettingsForm from '@/components/profile/NotificationSettingsForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Settings, Bell, Shield, Activity, Droplet, TestTube2, 
  ShoppingBag, TrendingUp, Clock, Fish, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { getCurrentUserProfile, getUserDashboardData } from '@/lib/actions/profile-supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile } from '@/lib/actions/profile-supabase';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const [profileData, dashboard] = await Promise.all([
          getCurrentUserProfile(),
          getUserDashboardData()
        ]);
        
        setProfile(profileData);
        setDashboardData(dashboard);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please log in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileData = {
    displayName: profile.display_name || '',
    email: profile.email,
    bio: profile.bio || '',
    location: profile.location || '',
    experienceLevel: profile.experience_level || '',
    photoURL: profile.photo_url || undefined,
  };

  return (
    <div className="container mx-auto py-8">
      {/* Profile Header */}
      <Card className="mb-8 shadow-xl">
        <CardHeader className="bg-primary/10 border-b">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile.photo_url || undefined} alt={profile.display_name || 'User'} />
              <AvatarFallback className="text-3xl">
                {profile.display_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-grow">
              <CardTitle className="text-3xl md:text-4xl text-primary">
                {profile.display_name || 'Aquarium Enthusiast'}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {profile.email}
              </CardDescription>
              {profile.location && (
                <p className="text-sm text-muted-foreground mt-1">
                  📍 {profile.location}
                </p>
              )}
              {profile.experience_level && (
                <Badge variant="secondary" className="mt-2">
                  {profile.experience_level.charAt(0).toUpperCase() + profile.experience_level.slice(1)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dashboard Stats */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aquariums</CardTitle>
              <Droplet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.aquariumCount}</div>
              <p className="text-xs text-muted-foreground">Active tanks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Water Tests</CardTitle>
              <TestTube2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.waterTestCount}</div>
              <p className="text-xs text-muted-foreground">Total tests logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Listings</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.activeListings}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.totalListings} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor((dashboardData.aquariumCount + dashboardData.waterTestCount) / 10) || 1}
              </div>
              <p className="text-xs text-muted-foreground">Level</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <EditProfileForm 
            initialData={profileData} 
            onSave={async () => {
              // Reload profile data after save
              const updated = await getCurrentUserProfile();
              if (updated) setProfile(updated);
            }}
          />
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest aquarium updates and tests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recent Aquariums */}
              {dashboardData?.recentAquariums && dashboardData.recentAquariums.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center">
                    <Droplet className="h-4 w-4 mr-2 text-primary" />
                    Recent Aquariums
                  </h3>
                  <div className="space-y-2">
                    {dashboardData.recentAquariums.map((aquarium: any) => (
                      <Link 
                        key={aquarium.id} 
                        href={`/aquariums/${aquarium.id}`}
                        className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{aquarium.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {aquarium.size_gallons} gal • {aquarium.type}
                            </p>
                          </div>
                          <Fish className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Recent Water Tests */}
              {dashboardData?.recentTests && dashboardData.recentTests.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center">
                    <TestTube2 className="h-4 w-4 mr-2 text-primary" />
                    Recent Water Tests
                  </h3>
                  <div className="space-y-2">
                    {dashboardData.recentTests.map((test: any) => (
                      <div 
                        key={test.id}
                        className="p-3 rounded-lg border"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              pH: {test.ph?.toFixed(1) || 'N/A'} • Temp: {test.temperature?.toFixed(1) || 'N/A'}°C
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(test.test_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!dashboardData?.recentAquariums?.length && !dashboardData?.recentTests?.length) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm mt-1">Start by adding an aquarium or logging a water test!</p>
                  <div className="flex gap-3 justify-center mt-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/aquariums">Add Aquarium</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/water-tests/add">Log Test</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettingsForm 
            initialSettings={profile.contact_preferences as any}
          />
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control who can see your profile and activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Profile Visibility</h3>
                <p className="text-sm text-muted-foreground">
                  Current setting: <Badge variant="secondary">
                    {profile.privacy_settings?.profile_visibility || 'Public'}
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground">
                  Privacy settings management coming soon...
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Data & Account</h3>
                <Button variant="outline" size="sm" disabled>
                  Export My Data
                </Button>
                <Button variant="destructive" size="sm" className="ml-2" disabled>
                  Delete Account
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Account management features coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
