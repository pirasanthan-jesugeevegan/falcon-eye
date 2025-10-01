import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useInfrastructure } from '@/hooks/api';
import { InfraModal } from './infra/InfraModal';
import { InfraTable } from './infra/InfraTable';

export function InfraIntegrationCard() {
  const [isInfraModalOpen, setIsInfraModalOpen] = useState(false);

  // Fetch existing infrastructure dashboards
  const { data: infrastructureDashboards = [], isLoading: isInfraLoading } =
    useInfrastructure();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Infrastructure Dashboards</CardTitle>
        <CardDescription>
          Configure infrastructure dashboard URLs to embed in your application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Infrastructure Dashboards Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">Dashboards</h3>
            <InfraModal
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Dashboard
                </Button>
              }
              isOpen={isInfraModalOpen}
              onOpenChange={setIsInfraModalOpen}
            />
          </div>

          <InfraTable
            infrastructure={infrastructureDashboards}
            isLoading={isInfraLoading}
            isInfraModalOpen={isInfraModalOpen}
            onInfraModalOpenChange={setIsInfraModalOpen}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default InfraIntegrationCard;
