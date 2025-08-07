import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { E2ETestResult } from '@/types';
import { dateFormat } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function LatestE2EtestResults({
  latestE2ETest,
}: {
  latestE2ETest: E2ETestResult;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest E2E Test Results</CardTitle>
        <CardDescription>End-to-end test execution details</CardDescription>
      </CardHeader>
      <CardContent>
        {latestE2ETest ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Test ID</span>
              <span className="font-mono text-xs text-muted-foreground">
                {latestE2ETest.id.substring(0, 8)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status</span>
              <Badge
                variant={
                  latestE2ETest.status === 'passed' ? 'default' : 'destructive'
                }
              >
                {latestE2ETest.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Environment</span>
              <span className="text-sm">{latestE2ETest.environment}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tag</span>
              <span className="text-sm">{latestE2ETest.tag}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Duration</span>
              <span className="text-sm">{latestE2ETest.duration}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Timestamp</span>
              <span className="text-sm">
                {dateFormat(latestE2ETest.timestamp)}
              </span>
            </div>

            <div className="pt-3 border-t">
              <h4 className="text-sm font-medium mb-2">Test Results</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-lg font-bold text-green-600">
                    {latestE2ETest.pass}
                  </div>
                  <div className="text-xs text-green-600">Passed</div>
                </div>
                <div className="bg-red-50 p-2 rounded">
                  <div className="text-lg font-bold text-red-600">
                    {latestE2ETest.fail}
                  </div>
                  <div className="text-xs text-red-600">Failed</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-lg font-bold text-gray-600">
                    {latestE2ETest.skip}
                  </div>
                  <div className="text-xs text-gray-600">Skipped</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            No E2E test results available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
