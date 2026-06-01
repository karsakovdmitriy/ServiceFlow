'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { IconDatabase, IconDatabaseOff, IconInfoCircle, IconShieldCheck, IconLock, IconBrandTelegram, IconPhoto } from '@tabler/icons-react';

export default function SettingsPage() {
  const { profile, trainerId, updateProfile, loading: storeLoading, isDemoMode } = useStore();
  const [formData, setFormData] = useState({
    full_name: '',
    specialization: '',
    avatar_url: '',
    email: '',
    slot_duration: '60',
    category: 'Спорт'
  });

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'TrainerSpaceBot';
  const linkTgLink = `https://t.me/${botUsername}?start=link_${trainerId || 'id'}`;
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        specialization: profile.specialization || '',
        avatar_url: profile.avatar_url || '',
        email: profile.email || '',
        slot_duration: String(profile.slot_duration || 60),
        category: (profile as any).category || 'Спорт'
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    const { error } = await updateProfile({
      full_name: formData.full_name,
      specialization: formData.specialization,
      avatar_url: formData.avatar_url,
      email: formData.email,
      slot_duration: parseInt(formData.slot_duration),
      category: formData.category
    } as any) as any;

    if (error) setMessage('Ошибка при сохранении: ' + error.message);
    else {
        setMessage('Изменения успешно сохранены');
        setTimeout(() => setMessage(''), 3000);
    }

    setSaving(false);
  };

  if (storeLoading && !profile) {
    return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <div className="text-[13px] text-t3 font-medium">Загрузка профиля...</div>
        </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-[900px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Main Settings */}
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-surface p-6 lg:p-8 rounded-r-xl border border-border shadow-sh-sm">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider whitespace-nowrap">Личные данные</h2>
              <div className="h-px bg-border flex-1"></div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Полное имя</label>
                    <input
                      className="w-full input-modern bg-bg-custom/50"
                      type="text"
                      placeholder="Алексей Смирнов"
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Специализация</label>
                    <input
                      className="w-full input-modern bg-bg-custom/50"
                      type="text"
                      placeholder="Фитнес-тренер"
                      value={formData.specialization}
                      onChange={e => setFormData({...formData, specialization: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Категория (сфера)</label>
                    <select
                      className="w-full input-modern bg-bg-custom/50 appearance-none"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Спорт">Спорт</option>
                      <option value="Бьюти">Бьюти</option>
                      <option value="Образование">Образование</option>
                      <option value="Медицина">Медицина</option>
                    </select>
                  </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Фото профиля</label>
                <div className="flex items-center gap-6">
                    {formData.avatar_url ? (
                        <img src={formData.avatar_url} className="w-16 h-16 rounded-full object-cover border-2 border-border shadow-sh-sm" alt="Avatar" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-bg-custom border-2 border-border flex items-center justify-center text-t3">
                            <IconPhoto size={24} stroke={1.5} />
                        </div>
                    )}
                    <div className="flex-1 space-y-2">
                        <input
                            className="w-full input-modern bg-bg-custom/50"
                            type="text"
                            placeholder="URL Аватара (напр. https://images.com/photo.jpg)"
                            value={formData.avatar_url}
                            onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                        />
                        <div className="relative">
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({...formData, avatar_url: reader.result as string});
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <label
                                htmlFor="avatar-upload"
                                className="text-[11px] font-bold text-accent hover:underline cursor-pointer flex items-center gap-1.5"
                            >
                                <IconPhoto size={14} /> Загрузить файл с устройства
                            </label>
                        </div>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div>
                    <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                        <IconLock size={12} /> Email (аккаунт)
                    </label>
                    <input
                      className="w-full input-modern bg-bg-custom/30 cursor-not-allowed opacity-60"
                      type="email"
                      readOnly
                      value={formData.email}
                    />
                  </div>
                  <div className="hidden">
                    <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Длительность слота</label>
                    <select
                      className="w-full input-modern appearance-none"
                      value={formData.slot_duration}
                      onChange={e => setFormData({...formData, slot_duration: e.target.value})}
                    >
                      <option value="60">60 минут</option>
                      <option value="45">45 минут</option>
                      <option value="90">90 минут</option>
                    </select>
                  </div>
              </div>

              <div className="pt-6 flex items-center justify-between">
                {message && (
                  <div className={`text-[12px] font-bold flex items-center gap-1.5 ${message.includes('Ошибка') ? 'text-red-custom' : 'text-green-custom'}`}>
                    {!message.includes('Ошибка') && <IconShieldCheck size={16} />} {message}
                  </div>
                )}
                <div className="flex-1"></div>
                <button
                  className="bg-accent text-white px-8 py-3 rounded-xl text-[13px] font-bold hover:bg-accent-hover transition-all shadow-lg shadow-accent/10 disabled:opacity-50 active:scale-95"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-10">
          {!isDemoMode && (
            <section>
                <div className="text-[11px] font-bold text-t3 uppercase tracking-widest mb-4">Оповещения тренера</div>
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
                      : 'Ваш профиль и записи надежно защищены и синхронизированы.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="p-6 rounded-3xl bg-surface border border-border shadow-sh-sm">
             <div className="flex items-center gap-3 text-accent mb-4">
                <IconInfoCircle size={20} stroke={1.5} />
                <h4 className="text-[13px] font-bold uppercase tracking-wider">Безопасность</h4>
             </div>
             <p className="text-[12px] text-t2 leading-relaxed font-medium">
                Мы используем Row Level Security (RLS) для защиты ваших данных. Доступ к вашим записям есть только у вас и ваших клиентов через официальный бот.
             </p>
          </section>
        </div>
      </div>
    </div>
  );
}
