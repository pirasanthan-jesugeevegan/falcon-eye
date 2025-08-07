import { Header } from '@/layout/header';
import { Sidebar } from '@/layout/sidebar';
import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Content */}
      <div className="flex flex-col flex-1 md:ml-64 h-screen">
        <Header />
        <main className="flex-1 p-5 bg-slate-500/10 rounded-t-[12px] md:mr-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
