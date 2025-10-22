import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="mb-6 h-9 w-48 bg-muted animate-pulse rounded" />

      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="border-b bg-card">
          <CardTitle className="h-8 w-72 bg-muted animate-pulse rounded" />
          <CardDescription className="mt-2 h-4 w-64 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="pt-6 grid md:grid-cols-3 gap-x-10 gap-y-8">
          <div className="md:col-span-2 space-y-6">
            <div className="w-full aspect-video bg-muted animate-pulse rounded" />
            <div className="h-5 w-40 bg-muted animate-pulse rounded" />
            <div className="h-24 w-full bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-3 p-4 border rounded-lg bg-background shadow-sm md:col-span-1">
            <div className="h-5 w-40 bg-muted animate-pulse rounded" />
            <div className="h-4 w-56 bg-muted animate-pulse rounded" />
            <div className="h-4 w-44 bg-muted animate-pulse rounded" />
            <div className="h-4 w-52 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
