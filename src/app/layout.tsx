import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

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
      <body className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen lg:ml-[240px]">
          <Topbar />
          <div className="p-4 lg:p-[28px_32px] flex-1">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
