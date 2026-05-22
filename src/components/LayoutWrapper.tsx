'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen lg:ml-[240px]">
        <Topbar />
        <div className="p-4 lg:p-[28px_32px] flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
