import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CheckCircle, Dot, HelpCircle, Info, XCircle } from 'lucide-react';
import type { Product } from '@/types';
import { StatusBadge } from '../ui/status-badge';
import { Progress } from '../ui/progress';
import { useTestResults } from '@/hooks/api/use-test-results';
import DynamicHeroIcon from '@/components/ui/dynamicIcon';
import * as HIcons from '@heroicons/react/24/solid';

export function ProductTestResultsStatus({
  products,
}: {
  products: Product[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold">Product Status</h2>
        <Tooltip>
          <TooltipTrigger>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              Overview of test status for each product. Shows E2E test results
              and unit test coverage.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
        <div className="p-6">
          {(!products || products.length === 0) && (
            <div className="text-center py-4 text-muted-foreground">
              <p>No products configured</p>
              <p className="text-sm mt-1">Add products to start monitoring</p>
            </div>
          )}
          {products && products.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product / Service</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      E2E Test
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>End-to-end test results (passed/failed)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Unit Test
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Unit test coverage percentage</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, i) => (
                  <ProductStatusRow key={i} product={product} />
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

// Component to display individual product status row
function ProductStatusRow({ product }: { product: any }) {
  const { unitResults, e2eResults } = useTestResults(product.productName);

  // Get latest E2E test result
  const latestE2EResult = e2eResults.data?.[0]?.status;

  // Get latest unit test result
  const latestUnitResult = unitResults.data?.[0]?.result?.[0];
  const unitCoverage = latestUnitResult
    ? parseFloat(latestUnitResult.percentage)
    : 0;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          {product.icon ? (
            <DynamicHeroIcon
              icon={product.icon as keyof typeof HIcons}
              className="h-5 w-5"
            />
          ) : (
            <Dot className="h-5 w-5" />
          )}
          <span className="font-medium">{product.productName}</span>
        </div>
      </TableCell>
      <TableCell>
        {latestE2EResult === 'passed' && (
          <StatusBadge status="healthy">
            <CheckCircle className="h-3 w-3 mr-1" />
            {latestE2EResult}
          </StatusBadge>
        )}
        {latestE2EResult === 'failed' && (
          <StatusBadge status="critical">
            <XCircle className="h-3 w-3 mr-1" />
            {latestE2EResult}
          </StatusBadge>
        )}
        {latestE2EResult === undefined && (
          <span className="text-muted-foreground">No E2E tests</span>
        )}
      </TableCell>
      <TableCell>
        {unitCoverage > 0 ? (
          <div className="flex items-center gap-2">
            <Progress value={unitCoverage} className="w-16" />
            <span className="text-sm font-medium">
              {unitCoverage.toFixed(1)}%
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">No unit tests</span>
        )}
      </TableCell>
    </TableRow>
  );
}
