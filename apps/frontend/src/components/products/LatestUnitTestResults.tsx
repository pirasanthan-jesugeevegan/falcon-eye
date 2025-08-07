import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { UnitTestResult } from '@/types';
import { dateFormat } from '@/lib/utils';

export default function LatestUnitTestResults({
  latestUnitTest,
}: {
  latestUnitTest: UnitTestResult;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Unit Test Results</CardTitle>
        <CardDescription>
          Detailed coverage and test information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {latestUnitTest ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Pull Request</span>
              <span className="text-sm">
                {latestUnitTest.pullRequest || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Author</span>
              <span className="text-sm">{latestUnitTest.result[0].author}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Commit</span>
              <span className="font-mono text-xs text-muted-foreground">
                {latestUnitTest.result[0].commit.substring(0, 8)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Date</span>
              <span className="text-sm">
                {dateFormat(latestUnitTest.result[0].date)}
              </span>
            </div>

            <div className="pt-3 border-t">
              <h4 className="text-sm font-medium mb-2">Coverage Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Line Coverage</span>
                  <span className="font-medium">
                    {latestUnitTest.result[0].lineCoverage}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Function Coverage</span>
                  <span className="font-medium">
                    {latestUnitTest.result[0].functionCoverage}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Statement Coverage</span>
                  <span className="font-medium">
                    {latestUnitTest.result[0].statementCoverage}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Branch Coverage</span>
                  <span className="font-medium">
                    {latestUnitTest.result[0].branchCoverage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            No unit test results available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
