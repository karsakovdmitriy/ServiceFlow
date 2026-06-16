'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { IconDeviceFloppy, IconBuildingStore, IconMail, IconPhone, IconBrandTelegram, IconMapPin, IconInfoCircle, IconShieldCheck, IconCheck, IconDatabase, IconDatabaseOff } from '@tabler/icons-react';

export default function VenueProfile() {
  const { venues, addVenue, updateVenue, profile, updateProfile, activeMaster, isDemoMode } = useStore();
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

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'TrainerSpaceBot';
  const linkTgLink = `https://t.me/${botUsername}?start=link_${activeMaster?.id || 'id'}`;
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    let result;
    if (venue) {
      result = await updateVenue(venue.id, formData);
    } else {
      result = await addVenue(formData as any);
    }

    if (result?.error) {
      setMessage('Ошибка при сохранении');
    } else {
      setMessage('Данные успешно сохранены');
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
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
                  <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Email площадки</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full input-modern bg-bg-custom/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Telegram ID / Username</label>
                  <input
                    type="text"
                    value={formData.telegram_id}
                    onChange={(e) => setFormData({ ...formData, telegram_id: e.target.value })}
                    className="w-full input-modern bg-bg-custom/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2 text-accent">Токен Telegram-бота (для прямых записей)</label>
                <input
                  type="password"
                  value={formData.telegram_bot_token}
                  onChange={(e) => setFormData({ ...formData, telegram_bot_token: e.target.value })}
                  className="w-full input-modern bg-bg-custom/50"
                  placeholder="123456789:ABCDefGhI..."
                />
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
          {!isDemoMode && (
            <section>
                <div className="text-[11px] font-bold text-t3 uppercase tracking-widest mb-4">Оповещения площадки</div>
                <div className="p-5 rounded-2xl bg-surface border border-border flex flex-col gap-4 shadow-sh-sm">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile?.telegram_id ? 'bg-green-light text-green-custom' : 'bg-accent-light text-accent'}`}>
                            <IconBrandTelegram size={22} stroke={1.5} />
                        </div>
                        <div>
                            <div className="text-[14px] font-bold text-t1 tracking-tight">
                                {profile?.telegram_id ? 'Telegram подключен' : 'Привязать Telegram'}
                            </div>
                            <div className="text-[11px] text-t3 font-medium mt-0.5">
                                {profile?.telegram_id ? 'Уведомления активны' : 'Получайте уведомления'}
                            </div>
                        </div>
                    </div>
                    <a
                        href={linkTgLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center text-[12px] font-bold py-2.5 bg-bg-custom text-t1 rounded-xl hover:bg-surface transition-all border border-border shadow-sh-sm"
                    >
                        {profile?.telegram_id ? 'Переподключить' : 'Подключить бота'}
                    </a>
                </div>
            </section>
          )}

          <section>
            <div className="text-[11px] font-bold text-t3 uppercase tracking-widest mb-4">Статус системы</div>
            <div className={`p-6 rounded-3xl border ${isDemoMode ? 'border-amber-100 bg-amber-50/20' : 'border-green-100 bg-green-50/20'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDemoMode ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                   {isDemoMode ? <IconDatabaseOff size={20} stroke={1.5} /> : <IconDatabase size={20} stroke={1.5} />}
                </div>
                <div className="min-w-0">
                  <div className={`text-[14px] font-bold tracking-tight ${isDemoMode ? 'text-amber-800' : 'text-green-800'}`}>
                    {isDemoMode ? 'Локальный режим' : 'Облако активно'}
                  </div>
                  <p className="text-[12px] text-t3 font-medium mt-1 leading-relaxed">
                    {isDemoMode
                      ? 'Данные сохраняются в браузере. Настройте Supabase для синхронизации.'
                      : 'Профиль вашей площадки надежно синхронизирован.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="p-6 rounded-3xl bg-surface border border-border shadow-sh-sm">
             <div className="flex items-center gap-3 text-accent mb-4">
                <IconShieldCheck size={20} stroke={1.5} />
                <h4 className="text-[13px] font-bold uppercase tracking-wider">Мои роли</h4>
             </div>
             <div className="space-y-3">
                {[
                  { id: 'is_master', label: 'Мастер' },
                  { id: 'is_client', label: 'Клиент' },
                  { id: 'is_venue', label: 'Площадка' }
                ].map(role => {
                  const active = profile?.[role.id as keyof typeof profile];
                  return (
                    <button
                      key={role.id}
                      onClick={() => updateProfile({ [role.id]: !active })}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-[13px] font-bold transition-all ${
                        active ? 'bg-accent/5 border-accent text-accent' : 'bg-bg-custom border-border text-t3 opacity-60'
                      }`}
                    >
                      {role.label}
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${active ? 'bg-accent border-accent text-white' : 'border-t3'}`}>
                        {active && <IconCheck size={10} stroke={3} />}
                      </div>
                    </button>
                  );
                })}
             </div>
          </section>

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
