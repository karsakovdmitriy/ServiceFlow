'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { IconDeviceFloppy, IconBuildingStore, IconMail, IconPhone, IconBrandTelegram, IconMapPin, IconInfoCircle } from '@tabler/icons-react';

export default function VenueProfile() {
  const { venues, updateVenue } = useStore();
  const venue = venues[0]; // Assuming management for first venue for now

  const [formData, setFormData] = useState({
    name: venue?.name || '',
    address: venue?.address || '',
    phone: venue?.phone || '',
    email: venue?.email || '',
    telegram_id: venue?.telegram_id || '',
    description: venue?.description || '',
    telegram_bot_token: venue?.telegram_bot_token || ''
  });

  const handleSave = async () => {
    if (venue) {
      await updateVenue(venue.id, formData);
      alert('Профиль площадки обновлен');
    }
  };

  return (
    <div className="animate-fade-up max-w-[900px] mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-t1">Профиль площадки</h1>

      <div className="bg-surface p-8 rounded-2xl border border-border-light shadow-sh-sm space-y-8">
        <section className="space-y-6">
            <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider flex items-center gap-2">
                <IconBuildingStore size={18} className="text-accent" /> Основная информация
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[12px] font-bold text-t3 uppercase tracking-wider">Название площадки</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-bg-custom border border-border-light rounded-xl focus:outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[12px] font-bold text-t3 uppercase tracking-wider">Адрес</label>
                    <div className="relative">
                        <IconMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" size={18} />
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-bg-custom border border-border-light rounded-xl focus:outline-none"
                        />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[12px] font-bold text-t3 uppercase tracking-wider">Описание</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-bg-custom border border-border-light rounded-xl focus:outline-none resize-none"
                    placeholder="Расскажите о вашей площадке..."
                />
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider flex items-center gap-2">
                <IconInfoCircle size={18} className="text-accent" /> Контакты и интеграция
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[12px] font-bold text-t3 uppercase tracking-wider">Телефон</label>
                    <div className="relative">
                        <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" size={18} />
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-bg-custom border border-border-light rounded-xl focus:outline-none"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[12px] font-bold text-t3 uppercase tracking-wider">Telegram ID / @username</label>
                    <div className="relative">
                        <IconBrandTelegram className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" size={18} />
                        <input
                            type="text"
                            value={formData.telegram_id}
                            onChange={(e) => setFormData({ ...formData, telegram_id: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-bg-custom border border-border-light rounded-xl focus:outline-none"
                        />
                    </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-[12px] font-bold text-t3 uppercase tracking-wider">Telegram Bot Token (для площадки)</label>
                    <input
                        type="password"
                        value={formData.telegram_bot_token}
                        onChange={(e) => setFormData({ ...formData, telegram_bot_token: e.target.value })}
                        placeholder="7123456789:ABCDefGh..."
                        className="w-full px-4 py-2.5 bg-bg-custom border border-border-light rounded-xl focus:outline-none"
                    />
                    <p className="text-[11px] text-t3 mt-1">Оставьте пустым, если используете общий бот системы.</p>
                </div>
            </div>
        </section>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all shadow-lg shadow-accent/20"
          >
            <IconDeviceFloppy size={20} />
            Сохранить карточку площадки
          </button>
        </div>
      </div>
    </div>
  );
}
