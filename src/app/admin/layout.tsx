import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/sidebar';
import AdminHeader from '@/components/admin/header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="flex-1">
        <div className="flex items-center justify-between">
          <SidebarTrigger />
          <AdminHeader />
        </div>
        <div className="container py-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
