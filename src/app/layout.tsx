import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { AuthProvider } from "@/components/AuthProvider";
import LayoutWrapper from "@/components/LayoutWrapper";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "TrainerSpace — Кабинет тренера",
  description: "Система управления тренировками",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="bg-[#F9FAFB]">
        <AuthProvider>
          <StoreProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
