'use client';

import React, { useState } from 'react';
import { useStore, Partnership } from '@/lib/store';
import { IconUserPlus, IconTrash, IconCheck, IconClock } from '@tabler/icons-react';

export default function PartnersPage() {
  const { partners, addPartnership, removePartnership } = useStore();
  const [email, setEmail] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      addPartnership(email);
      setEmail('');
    }
  };

  return (
    <div className="animate-fade-up max-w-[800px] mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-t1">Партнеры для тренировок</h1>
      <p className="text-t2 text-[14px]">Добавляйте друзей, чтобы вместе записываться на групповые занятия и следить за прогрессом друг друга.</p>

      <section className="bg-surface p-6 rounded-xl border border-border-light shadow-sh-sm">
        <h2 className="text-sm font-bold text-t1 uppercase tracking-wider mb-4">Пригласить партнера</h2>
        <form onSubmit={handleInvite} className="flex gap-3">
          <input
            type="text"
            placeholder="Email, Telegram или телефон"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2 bg-bg-custom border border-border-light rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-accent/20"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-accent text-white rounded-xl text-[14px] font-bold hover:bg-accent-hover transition-all flex items-center gap-2"
          >
            <IconUserPlus size={18} />
            Пригласить
          </button>
        </form>
      </section>

      <section className="bg-surface p-6 rounded-xl border border-border-light shadow-sh-sm">
        <h2 className="text-sm font-bold text-t1 uppercase tracking-wider mb-4">Ваши партнеры</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partners.length === 0 && (
            <div className="col-span-full py-12 text-center text-t3 text-[13px] bg-bg-custom rounded-xl border border-dashed border-border">
                У вас пока нет добавленных партнеров
            </div>
          )}
          {partners.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-bg-custom border border-border-light">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-[12px] font-bold text-accent">
                  {(p.partner_name || 'П').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-[14px] font-bold text-t1">{p.partner_name}</div>
                  <div className="text-[11px] text-t3 flex items-center gap-1">
                    {p.status === 'accepted' ? (
                      <><IconCheck size={12} className="text-green-custom" /> Активен</>
                    ) : (
                      <><IconClock size={12} /> Ожидает подтверждения</>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => removePartnership(p.id)}
                className="p-2 text-t3 hover:text-red-custom transition-colors"
              >
                <IconTrash size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
