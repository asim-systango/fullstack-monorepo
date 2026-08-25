import type { ReactNode } from 'react';
import { Footer } from './footer';
import { Header } from './header';
import { MobileSidebar } from './mobile-sidebar';
import { Sidebar } from './sidebar';
import { SidebarProvider } from './sidebar-provider';

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <SidebarProvider>
      <div className="ui-app-shell">
        <Sidebar />
        <MobileSidebar />
        <div className="ui-app-body">
          <Header />
          <div className="ui-app-main">{children}</div>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
