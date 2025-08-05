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
import { useJiraConfig, useJiraQueries } from '@/hooks/api/use-jira';
import { JiraConfigModal } from './jira/JiraConfigModal';
import { JiraQueryModal } from './jira/JiraQueryModal';
import { JiraConfigTable } from './jira/JiraConfigTable';
import { JiraQueryTable } from './jira/JiraQueryTable';
import type { JiraConfig } from '@/types';

export function JiraIntegrationCard() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);

  // Fetch existing Jira configurations using the new hook
  const { data: jiraConfigs = [] as JiraConfig[], isLoading: isConfigLoading } =
    useJiraConfig();

  // Fetch Jira queries - use the hook if backend is ready, otherwise use mock data
  const { data: fetchedQueries = [], isLoading: isQueryLoading } =
    useJiraQueries();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Jira Integration</CardTitle>
        <CardDescription>
          Configure Jira integration to sync issues with your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* JIRA Configurations Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">JIRA Configurations</h3>
            <JiraConfigModal
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Jira Config
                </Button>
              }
              isOpen={isConfigModalOpen}
              onOpenChange={setIsConfigModalOpen}
            />
          </div>

          <JiraConfigTable
            configs={jiraConfigs as JiraConfig[]}
            isLoading={isConfigLoading}
            isConfigModalOpen={isConfigModalOpen}
            onConfigModalOpenChange={setIsConfigModalOpen}
          />
        </div>

        {/* JIRA Queries Section */}
        {Array.isArray(jiraConfigs) && jiraConfigs.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-lg">JIRA Queries</h3>
              <JiraQueryModal
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

            <JiraQueryTable
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

export default JiraIntegrationCard;
