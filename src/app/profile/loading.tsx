import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-3 w-full">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex gap-4 border-b pb-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
