import { useParams } from '@tanstack/react-router';
import { useInfrastructureById } from '@/hooks/api';
import { Header } from '@/components/ui/headers';
import { AlertCircle } from 'lucide-react';

export function InfraPage() {
  const { infraId } = useParams({ from: '/infra/$infraId' });

  const { data, isLoading, error } = useInfrastructureById(infraId);

  // Handling loading states
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handling errors
  if (error || !data) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>
            {error
              ? typeof error === 'string'
                ? error
                : error.message
              : 'Infrastructure dashboard not found'}
          </p>
        </div>
      </div>
    );
  }

  // Check if dashboard is active
  if (!data.isActive) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>This infrastructure dashboard is currently inactive.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 h-full flex flex-col">
      <Header
        title={data.name}
        description={`Infrastructure Dashboard - ${data.name}`}
        icon="server"
      />
      <div className="flex-1 bg-background rounded-lg border overflow-hidden">
        <iframe
          src={data.iframeUrl}
          className="w-full h-full min-h-[600px]"
          title={data.name}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
