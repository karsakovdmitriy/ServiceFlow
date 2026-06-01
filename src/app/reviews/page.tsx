'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { IconStarFilled, IconUser } from '@tabler/icons-react';

export default function ReviewsPage() {
  const { reviews } = useStore();

  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="card flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent-light text-accent flex items-center justify-center">
                    <IconUser size={16} />
                  </div>
                  <span className="text-[14px] font-bold text-t1">{review.client_name || 'Клиент'}</span>
                </div>
                <div className="flex items-center gap-0.5 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <IconStarFilled key={i} size={12} className={i < review.rating ? 'opacity-100' : 'opacity-20'} />
                  ))}
                </div>
              </div>
              <p className="text-[13px] text-t2 italic leading-relaxed">
                {review.comment || 'Оценка без комментария'}
              </p>
              <div className="text-[11px] text-t3 mt-auto pt-2 border-t border-border-light flex justify-between">
                <span>{new Date(review.created_at).toLocaleDateString('ru-RU')}</span>
                <span className="font-medium text-accent">Оценка: {review.rating}/5</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center card bg-bg-custom border-dashed border-2 border-border-light">
            <div className="text-t3 text-[14px]">Отзывов пока нет. Они появятся здесь, когда клиенты оценят ваши услуги в боте.</div>
          </div>
        )}
      </div>
    </div>
  );
}
