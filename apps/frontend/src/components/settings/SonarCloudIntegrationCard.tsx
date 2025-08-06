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
import { useSonarCloudConfig, useSonarCloudQueries } from '@/hooks/api';
import { SonarCloudConfigTable } from './sonarCloud/SonarCloudConfigTable';
import { SonarCloudQueryModal } from './sonarCloud/SonarCloudQueryModal';
import { SonarCloudQueryTable } from './sonarCloud/SonarCloudQueryTable';
import { SonarCloudConfigModal } from './sonarCloud/SonarCloudConfigModal';
import type { SonarCloudConfig } from '@/types';

export function SonarCloudIntegrationCard() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);

  // Fetch existing SonarCloud configurations using the new hook
  const { data: sonarCloudConfigs = [], isLoading: isConfigLoading } =
    useSonarCloudConfig();

  // Fetch SonarCloud queries - use the hook if backend is ready, otherwise use mock data
  const { data: fetchedQueries = [], isLoading: isQueryLoading } =
    useSonarCloudQueries();
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>SonarCloud Integration</CardTitle>
        <CardDescription>
          Configure SonarCloud integration to sync issues with your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SonarCloud Configurations Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">SonarCloud Configurations</h3>
            <SonarCloudConfigModal
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add SonarCloud Config
                </Button>
              }
              isOpen={isConfigModalOpen}
              onOpenChange={setIsConfigModalOpen}
            />
          </div>

          <SonarCloudConfigTable
            configs={sonarCloudConfigs as SonarCloudConfig[]}
            isLoading={isConfigLoading}
            isConfigModalOpen={isConfigModalOpen}
            onConfigModalOpenChange={setIsConfigModalOpen}
          />
        </div>

        {/* SonarCloud Queries Section */}
        {Array.isArray(sonarCloudConfigs) && sonarCloudConfigs.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-lg">SonarCloud Queries</h3>
              <SonarCloudQueryModal
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Query
                  </Button>
                }
                isOpen={isQueryModalOpen}
                onOpenChange={setIsQueryModalOpen}
              />
            </div>
            <SonarCloudQueryTable
              queries={fetchedQueries}
              isLoading={isQueryLoading}
              isQueryModalOpen={isQueryModalOpen}
              onQueryModalOpenChange={setIsQueryModalOpen}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SonarCloudIntegrationCard;
