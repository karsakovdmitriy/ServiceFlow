'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { IconStarFilled, IconUser } from '@tabler/icons-react';

export default function ReviewsPage() {
  const { reviews } = useStore();

  return (
    <div className="animate-fade-up max-w-[1000px] mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider whitespace-nowrap">Отзывы клиентов</h2>
        <div className="h-px bg-border flex-1"></div>
        <div className="bg-surface px-3 py-1 rounded-full border border-border text-[11px] font-bold text-t3 uppercase tracking-widest">
            Всего {reviews.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bg-surface p-6 rounded-3xl border border-border/50 hover:border-border transition-all group flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-bg-custom flex items-center justify-center text-t3">
                    <IconUser size={20} stroke={1.5} />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-t1 tracking-tight">{review.client_name || 'Клиент'}</div>
                    <div className="text-[10px] text-t3 font-bold uppercase tracking-widest mt-0.5">
                        {new Date(review.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                  <IconStarFilled size={14} className="text-yellow-500" />
                  <span className="text-[13px] font-extrabold text-yellow-700">{review.rating}</span>
                </div>
              </div>

              <div className="relative">
                <div className="text-[24px] text-accent/10 font-serif absolute -top-2 -left-2 select-none">“</div>
                <p className="text-[14px] text-t2 italic leading-relaxed relative z-10 pl-2">
                    {review.comment || 'Клиент оставил оценку без текстового комментария.'}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <span className="text-[10px] font-bold text-t3 uppercase tracking-widest opacity-60">Проверено через бот</span>
                <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < review.rating ? 'bg-yellow-400' : 'bg-border'}`}></div>
                    ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-bg-custom/50 rounded-3xl border border-dashed border-border">
            <div className="text-t3 text-[13px] font-medium italic">Отзывов пока нет. Они появятся здесь, когда клиенты оценят ваши услуги в боте.</div>
          </div>
        )}
      </div>
    </div>
  );
}
