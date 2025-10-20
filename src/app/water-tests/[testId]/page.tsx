import { notFound } from 'next/navigation';
import { getWaterTestById } from '@/lib/actions/water-test';
import { getAquariumById } from '@/lib/actions/aquarium';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Calendar, 
  Droplet, 
  AlertTriangle, 
  CheckCircle2,
  Edit 
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface WaterTestDetailPageProps {
  params: {
    testId: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ideal':
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
    case 'acceptable':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    case 'warning':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
    case 'critical':
      return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'ideal':
      return <CheckCircle2 className="h-5 w-5" />;
    case 'warning':
    case 'critical':
      return <AlertTriangle className="h-5 w-5" />;
    default:
      return <Droplet className="h-5 w-5" />;
  }
};

const getMethodLabel = (method: string) => {
  switch (method) {
    case 'test-strip':
      return 'Test Strip';
    case 'liquid-test':
      return 'Liquid Test';
    case 'digital-meter':
      return 'Digital Meter';
    case 'manual-entry':
      return 'Manual Entry';
    default:
      return method;
  }
};

export default async function WaterTestDetailPage({ params }: WaterTestDetailPageProps) {
  const { testId } = params;

  // Fetch water test
  const testResult = await getWaterTestById(testId);

  if (testResult.error || !testResult.waterTest) {
    notFound();
  }

  const test = testResult.waterTest;

  // Fetch associated aquarium
  const aquariumResult = await getAquariumById(test.aquariumId);
  const aquarium = aquariumResult.aquarium;

  const hasWarnings = test.parameters.some(p => p.status === 'warning' || p.status === 'critical');
  const criticalCount = test.parameters.filter(p => p.status === 'critical').length;
  const warningCount = test.parameters.filter(p => p.status === 'warning').length;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link href={aquarium ? `/aquariums/${aquarium.id}` : '/history'}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to {aquarium ? aquarium.name : 'History'}
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Droplet className="h-8 w-8 text-primary" />
              Water Test Results
            </h1>
            {aquarium && (
              <p className="text-muted-foreground text-lg">
                {aquarium.name} • {format(new Date(test.testDate), 'MMMM d, yyyy \'at\' h:mm a')}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {criticalCount} Critical
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {warningCount} Warning
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Test Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
            <CardDescription>Details about this water quality test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Test Date</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(test.testDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Test Method</p>
                <Badge variant="outline">{getMethodLabel(test.method)}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Parameters Tested</p>
                <p className="font-medium">{test.parameters.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Water Parameters Card */}
        <Card className={hasWarnings ? 'border-yellow-500/50' : ''}>
          <CardHeader>
            <CardTitle>Water Parameters</CardTitle>
            <CardDescription>Measured values and status for each parameter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {test.parameters.map((param, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(param.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{param.name}</span>
                    {getStatusIcon(param.status)}
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {param.value}
                    {param.unit && <span className="text-lg font-normal ml-1">{param.unit}</span>}
                  </div>
                  {param.idealRange && (
                    <div className="text-xs text-muted-foreground">
                      Ideal Range: {param.idealRange.min}-{param.idealRange.max}
                      {param.unit && ` ${param.unit}`}
                    </div>
                  )}
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {param.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes Card */}
        {test.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional observations and details</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{test.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Card */}
        {test.recommendations && test.recommendations.length > 0 && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Recommendations
              </CardTitle>
              <CardDescription>Suggested actions based on test results</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {test.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
