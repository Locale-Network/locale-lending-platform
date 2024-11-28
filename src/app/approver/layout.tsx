import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import ApproverSidebar from '@/components/approver/sidebar';
import ApproverHeader from '@/components/approver/header';
import AdminSidebar from '@/components/admin/sidebar';
import AdminHeader from '@/components/admin/header';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { Role } from '@prisma/client';

export default async function ApproverLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  const role = session?.user?.role;

  if (!role || (role !== Role.APPROVER && role !== Role.ADMIN)) {
    throw new Error('User role is not set');
  }

  return (
    <SidebarProvider>
      {role === Role.APPROVER && <ApproverSidebar />}
      {role === Role.ADMIN && <AdminSidebar />}
      <main className="flex-1">
        <div className="flex items-center justify-between">
          <SidebarTrigger />
          {role === Role.APPROVER && <ApproverHeader />}
          {role === Role.ADMIN && <AdminHeader />}
        </div>
        <div className="container py-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
