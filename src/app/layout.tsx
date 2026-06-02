import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { AuthProvider } from "@/components/AuthProvider";
import LayoutWrapper from "@/components/LayoutWrapper";
import { StoreProvider } from "@/lib/store";
import { ThemeProvider } from "@/components/ThemeProvider";
import OnboardingWizard from "@/components/OnboardingWizard";
import InitialRoleSelection from "@/components/InitialRoleSelection";

export const metadata: Metadata = {
  title: "Окошко — Сервис записи",
  description: "Система управления записями и клиентами",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="bg-bg text-t1 antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <StoreProvider>
              <LayoutWrapper>
                <InitialRoleSelection />
                <OnboardingWizard />
                {children}
              </LayoutWrapper>
            </StoreProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
