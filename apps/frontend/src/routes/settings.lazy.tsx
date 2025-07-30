import { createLazyFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/pages/settingsPage';

export const Route = createLazyFileRoute('/settings')({
  component: SettingsPage,
});
