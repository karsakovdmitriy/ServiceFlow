'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { IconDeviceFloppy, IconBuildingStore, IconMail, IconPhone, IconBrandTelegram, IconMapPin, IconInfoCircle } from '@tabler/icons-react';

export default function VenueProfile() {
  const { venues, updateVenue } = useStore();
  const venue = venues[0];

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    telegram_id: '',
    description: '',
    telegram_bot_token: ''
  });

  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name || '',
        address: venue.address || '',
        phone: venue.phone || '',
        email: venue.email || '',
        telegram_id: venue.telegram_id || '',
        description: venue.description || '',
        telegram_bot_token: venue.telegram_bot_token || ''
      });
    }
  }, [venue]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (venue) {
      setSaving(true);
      const { error } = await updateVenue(venue.id, formData) as any;
      if (error) setMessage('Ошибка');
      else {
        setMessage('Сохранено');
        setTimeout(() => setMessage(''), 3000);
      }
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-up max-w-[900px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-surface p-6 lg:p-8 rounded-r-xl border border-border shadow-sh-sm">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider whitespace-nowrap">Профиль площадки</h2>
              <div className="h-px bg-border flex-1"></div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Название площадки</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full input-modern bg-bg-custom/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Адрес</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full input-modern bg-bg-custom/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Телефон</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full input-modern bg-bg-custom/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Telegram username</label>
                  <input
                    type="text"
                    value={formData.telegram_id}
                    onChange={(e) => setFormData({ ...formData, telegram_id: e.target.value })}
                    className="w-full input-modern bg-bg-custom/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full input-modern bg-bg-custom/50 resize-none"
                  placeholder="Расскажите о вашей площадке..."
                />
              </div>

              <div className="pt-6 flex items-center justify-between">
                {message && <div className="text-[12px] font-bold text-green-custom">{message}</div>}
                <div className="flex-1"></div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-accent text-white px-8 py-3 rounded-xl text-[13px] font-bold hover:bg-accent-hover transition-all shadow-lg shadow-accent/10 active:scale-95 disabled:opacity-50"
                >
                  {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <section className="p-6 rounded-3xl bg-surface border border-border shadow-sh-sm">
             <h4 className="text-[13px] font-bold uppercase tracking-wider text-t1 mb-4">Информация</h4>
             <p className="text-[12px] text-t2 leading-relaxed font-medium">
                Эти данные отображаются в карточке площадки для мастеров и клиентов.
             </p>
          </section>
        </div>
      </div>
    </div>
  );
}
