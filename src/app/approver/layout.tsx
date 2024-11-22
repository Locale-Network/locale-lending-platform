import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import ApproverSidebar from '@/components/approver/sidebar';
import ApproverHeader from '@/components/approver/header';

export default function ApproverLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ApproverSidebar />
      <main className="flex-1">
        <div className="flex items-center justify-between">
          <SidebarTrigger />
          <ApproverHeader />
        </div>
        <div className="container py-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
