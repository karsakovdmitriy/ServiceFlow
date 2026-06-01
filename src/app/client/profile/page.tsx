'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { IconDeviceFloppy, IconBrandTelegram, IconMail, IconPhone } from '@tabler/icons-react';

export default function ClientProfile() {
  const { profile, updateProfile } = useStore();
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: (profile as any)?.phone || '',
    telegram_id: profile?.telegram_id || ''
  });

  const handleSave = async () => {
    await updateProfile(formData);
    alert('Профиль обновлен');
  };

  return (
    <div className="animate-fade-up max-w-[800px] mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-t1">Мой профиль</h1>

      <div className="bg-surface p-8 rounded-2xl border border-border-light shadow-sh-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-t3 uppercase tracking-wider">Имя Фамилия</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg-custom border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-t3 uppercase tracking-wider">Электронная почта</label>
            <div className="relative">
              <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" size={18} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-custom border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-t3 uppercase tracking-wider">Телефон</label>
            <div className="relative">
              <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" size={18} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 000-00-00"
                className="w-full pl-10 pr-4 py-2.5 bg-bg-custom border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-t3 uppercase tracking-wider">Telegram ID</label>
            <div className="relative">
              <IconBrandTelegram className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" size={18} />
              <input
                type="text"
                value={formData.telegram_id}
                onChange={(e) => setFormData({ ...formData, telegram_id: e.target.value })}
                placeholder="@username"
                className="w-full pl-10 pr-4 py-2.5 bg-bg-custom border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all shadow-lg shadow-accent/20"
          >
            <IconDeviceFloppy size={20} />
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
}
