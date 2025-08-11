import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductSettingsCard } from '@/components/settings/ProductSettingsCard';
import { JiraIntegrationCard } from '@/components/settings/JiraIntegrationCard';
import SonarCloudIntegrationCard from '@/components/settings/SonarCloudIntegrationCard';
import { GitHubIntegrationCard } from '@/components/settings/GitHubIntegrationCard';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';

export function SettingsPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/settings' }) as { tab?: string };
  const currentTab = search.tab || 'products';

  const handleTabChange = (value: string) => {
    navigate({
      to: '/settings',
      search: { tab: value },
      replace: true,
    });
  };

  // Set default tab if none is specified
  useEffect(() => {
    if (!search.tab) {
      navigate({
        to: '/settings',
        search: { tab: 'products' },
        replace: true,
      });
    }
  }, [search.tab, navigate]);

  return (
    <div className="container mx-auto md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage dashboard settings and configurations
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 md:w-[600px]">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="jira">Jira</TabsTrigger>
          <TabsTrigger value="sonarcloud">SonarCloud</TabsTrigger>
          <TabsTrigger value="github">GitHub</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6 space-y-6">
          <ProductSettingsCard />
        </TabsContent>

        <TabsContent value="jira" className="mt-6 space-y-6">
          <JiraIntegrationCard />
        </TabsContent>

        <TabsContent value="sonarcloud" className="mt-6 space-y-6">
          <SonarCloudIntegrationCard />
        </TabsContent>

        <TabsContent value="github" className="mt-6 space-y-6">
          <GitHubIntegrationCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
