'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { IconChevronLeft, IconWindow } from '@tabler/icons-react';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-custom pb-20">
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-t2 hover:text-t1 transition-colors font-medium text-sm"
          >
            <IconChevronLeft size={20} />
            Назад
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
              <IconWindow size={18} />
            </div>
            <span className="font-bold text-t1 tracking-tight">Окошко</span>
          </div>

          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-12">
        <article className="prose prose-slate max-w-none prose-headings:text-t1 prose-p:text-t2 prose-li:text-t2 prose-strong:text-t1">
          {children}
        </article>
      </main>
    </div>
  );
}
