'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { IconUserPlus, IconTrash, IconMail } from '@tabler/icons-react';

export default function VenueMasters() {
  const { venueStaff, addVenueStaff, removeVenueStaff, venues, clients } = useStore();
  const [email, setEmail] = useState('');
  const currentVenue = venues[0];

  // Helper to find email for staff
  const getStaffEmail = (trainerName: string) => {
    const client = clients.find(c => c.full_name === trainerName);
    return client?.email || 'master@example.com';
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && currentVenue) {
      addVenueStaff(currentVenue.id, email);
      setEmail('');
    }
  };

  return (
    <div className="animate-fade-up max-w-[900px] mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-t1">Управление мастерами</h1>

      <section className="bg-surface p-6 rounded-xl border border-border-light shadow-sh-sm">
        <h2 className="text-sm font-bold text-t1 uppercase tracking-wider mb-4">Добавить мастера на площадку</h2>
        <form onSubmit={handleAddStaff} className="flex gap-3">
          <input
            type="text"
            placeholder="Email, Telegram или телефон мастера"
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
            Добавить
          </button>
        </form>
      </section>

      <div className="bg-surface rounded-xl border border-border-light shadow-sh-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-custom border-bottom border-border-light">
              <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-wider">Мастер</th>
              <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-wider">Контакты</th>
              <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-wider text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {venueStaff.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-t3 text-[13px] italic">
                  Мастера еще не добавлены
                </td>
              </tr>
            )}
            {venueStaff.map((staff) => (
              <tr key={staff.id} className="hover:bg-bg-custom/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-[12px] font-bold text-accent">
                      {(staff.trainer_name || 'М').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[14px] font-bold text-t1">{staff.trainer_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-t2 text-[13px]">
                    <IconMail size={14} className="text-t3" />
                    <span>{getStaffEmail(staff.trainer_name || '')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => removeVenueStaff(staff.id)}
                    className="p-2 text-t3 hover:text-red-custom opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <IconTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
