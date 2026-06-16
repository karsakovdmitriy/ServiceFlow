'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/components/AuthProvider";
import InitialRoleSelection from "@/components/InitialRoleSelection";
import OnboardingWizard from "@/components/OnboardingWizard";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, user } = useAuth();
  const isLoginPage = pathname === '/login';
  const isLegalPage = pathname?.startsWith('/legal');

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-custom">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  if (isLoginPage || (isLegalPage && !user)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen lg:ml-[240px]">
        <Topbar />
        <div className="p-4 lg:p-[28px_32px] flex-1">
          <InitialRoleSelection />
          <OnboardingWizard />
          {children}
        </div>
      </main>
    </div>
  );
}
