import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GithubConfigTable } from './github/GithubConfigTable';
import { GithubConfigModal } from './github/GithubConfigModal';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { useGithubConfig } from '@/hooks/api';

export function GitHubIntegrationCard() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const { data: githubConfigs = [], isLoading: isConfigLoading } =
    useGithubConfig();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>GitHub Integration</CardTitle>
        <CardDescription>
          Configure GitHub integration to trigger/view workflows with your
          dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* GitHub Configurations Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">GitHub Configurations</h3>
            <GithubConfigModal
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Github Config
                </Button>
              }
              isOpen={isConfigModalOpen}
              onOpenChange={setIsConfigModalOpen}
            />
          </div>

          <GithubConfigTable
            configs={githubConfigs}
            isLoading={isConfigLoading}
            isConfigModalOpen={isConfigModalOpen}
            onConfigModalOpenChange={setIsConfigModalOpen}
          />
        </div>
      </CardContent>
    </Card>
  );
}
