import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import BorrowerSidebar from '@/components/borrower/sidebar';
import BorrowerHeader from '@/components/borrower/header';

export default function BorrowerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <BorrowerSidebar />
      <main className="flex-1">
        <div className="flex items-center justify-between">
          <SidebarTrigger />
          <BorrowerHeader />
        </div>
        <div className="container py-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
