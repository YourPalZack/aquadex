import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card className="bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl h-6 w-64 bg-muted animate-pulse rounded" />
          <CardDescription className="mt-3 h-4 w-80 bg-muted animate-pulse rounded" />
        </CardHeader>
      </Card>

      <div className="w-full h-[420px] rounded-lg border bg-muted animate-pulse" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-64">
            <div className="h-36 w-full bg-muted animate-pulse" />
            <CardContent className="pt-4 space-y-2">
              <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
