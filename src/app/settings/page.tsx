'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function SettingsPage() {
  const { profile, updateProfile, loading: storeLoading } = useStore();
  const [formData, setFormData] = useState({
    full_name: '',
    specialization: '',
    email: '',
    slot_duration: '60'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        specialization: profile.specialization || '',
        email: profile.email || '',
        slot_duration: String(profile.slot_duration || 60)
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    const { error } = await updateProfile({
      full_name: formData.full_name,
      specialization: formData.specialization,
      email: formData.email,
      slot_duration: parseInt(formData.slot_duration)
    }) as any;

    if (error) setMessage('Ошибка при сохранении: ' + error.message);
    else setMessage('Изменения сохранены!');

    setSaving(false);
  };

  if (storeLoading && !profile) {
    return <div className="animate-pulse flex items-center justify-center h-64 text-t3">Загрузка настроек...</div>;
  }

  return (
    <div className="animate-fade-up">
      <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Настройки профиля</div>
      <div className="card max-w-[520px]">
        <div className="flex flex-col gap-3.5">
          <div>
            <label className="text-[12px] font-medium text-t2 block mb-1">Имя</label>
            <input
              className="text-[13px] border border-border-custom rounded-r-sm p-[9px_12px] bg-surface text-t1 outline-none transition-all focus:border-accent w-full"
              type="text"
              value={formData.full_name}
              onChange={e => setFormData({...formData, full_name: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-t2 block mb-1">Специализация</label>
            <input
              className="text-[13px] border border-border-custom rounded-r-sm p-[9px_12px] bg-surface text-t1 outline-none transition-all focus:border-accent w-full"
              type="text"
              value={formData.specialization}
              onChange={e => setFormData({...formData, specialization: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-t2 block mb-1">Email</label>
            <input
              className="text-[13px] border border-border-custom rounded-r-sm p-[9px_12px] bg-surface text-t1 outline-none transition-all focus:border-accent w-full opacity-60 cursor-not-allowed"
              type="email"
              readOnly
              value={formData.email}
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-t2 block mb-1">Длительность слота</label>
            <select
              className="text-[13px] border border-border-custom rounded-r-sm p-[9px_12px] bg-surface text-t1 outline-none transition-all focus:border-accent w-full"
              value={formData.slot_duration}
              onChange={e => setFormData({...formData, slot_duration: e.target.value})}
            >
              <option value="60">60 минут</option>
              <option value="45">45 минут</option>
              <option value="90">90 минут</option>
            </select>
          </div>

          {message && (
            <div className={`text-[12px] font-medium ${message.includes('Ошибка') ? 'text-red-custom' : 'text-green-custom'}`}>
              {message}
            </div>
          )}

          <button
            className="bg-accent text-white border-none rounded-r-sm px-4 py-2 text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 shadow-[0_2px_10px_rgba(99,102,241,0.3)] transition-all hover:bg-accent-hover self-start disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </div>
    </div>
  );
}
