import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TestSummary({
  unitTestCoverage,
  e2eSuccessRate,
}: {
  unitTestCoverage: number;
  e2eSuccessRate: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Summary</CardTitle>
        <CardDescription>Overall test health and trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Unit Test Coverage</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${unitTestCoverage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">
                {unitTestCoverage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">E2E Test Success</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${e2eSuccessRate}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{e2eSuccessRate}%</span>
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Health</span>
              <Badge
                variant={
                  unitTestCoverage >= 80 && e2eSuccessRate >= 80
                    ? 'default'
                    : unitTestCoverage >= 60 && e2eSuccessRate >= 60
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {unitTestCoverage >= 80 && e2eSuccessRate >= 80
                  ? 'Healthy'
                  : unitTestCoverage >= 60 && e2eSuccessRate >= 60
                    ? 'Warning'
                    : 'Critical'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
