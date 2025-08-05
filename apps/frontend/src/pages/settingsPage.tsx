import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductSettingsCard } from '@/components/settings/ProductSettingsCard';
import { JiraIntegrationCard } from '@/components/settings/JiraIntegrationCard';
// import SonarCloudIntegrationCard from '@/components/settings/SonarCloudIntegrationCard';

export function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage dashboard settings and configurations
        </p>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="jira">Jira</TabsTrigger>
          {/*  <TabsTrigger value="sonarcloud">SonarCloud</TabsTrigger> */}
        </TabsList>

        <TabsContent value="products" className="mt-6 space-y-6">
          <ProductSettingsCard />
        </TabsContent>

        <TabsContent value="jira" className="mt-6 space-y-6">
          <JiraIntegrationCard />
        </TabsContent>

        {/*   <TabsContent value="sonarcloud" className="mt-6 space-y-6">
          <SonarCloudIntegrationCard />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
