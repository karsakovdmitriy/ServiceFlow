'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    full_name: 'Алексей Смирнов',
    specialization: 'Персональный тренер',
    email: 'alex@trainerspace.ru',
    slot_duration: '60'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Initial load from local storage to keep prototype consistent
  useEffect(() => {
    const saved = localStorage.getItem('trainer_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    } else if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // fallback to Supabase if local is empty but URL is provided
      async function getProfile() {
        const { data, error } = await supabase
          .from('trainers')
          .select('*')
          .single();

        if (data && !error) {
          setProfile({
            full_name: data.full_name,
            specialization: data.specialization,
            email: data.email,
            slot_duration: String(data.slot_duration)
          });
        }
      }
      getProfile();
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    // Save to local storage for prototype functionality
    localStorage.setItem('trainer_profile', JSON.stringify(profile));

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key') {
       const { error } = await supabase
        .from('trainers')
        .update({
          full_name: profile.full_name,
          specialization: profile.specialization,
          email: profile.email,
          slot_duration: parseInt(profile.slot_duration)
        })
        .eq('email', profile.email);

        if (error) setMessage('Ошибка при сохранении: ' + error.message);
        else setMessage('Изменения сохранены в облаке!');
    } else {
      await new Promise(r => setTimeout(r, 600));
      setMessage('Изменения сохранены локально!');
    }
    setSaving(false);
  };

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
              value={profile.full_name}
              onChange={e => setProfile({...profile, full_name: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-t2 block mb-1">Специализация</label>
            <input
              className="text-[13px] border border-border-custom rounded-r-sm p-[9px_12px] bg-surface text-t1 outline-none transition-all focus:border-accent w-full"
              type="text"
              value={profile.specialization}
              onChange={e => setProfile({...profile, specialization: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-t2 block mb-1">Email</label>
            <input
              className="text-[13px] border border-border-custom rounded-r-sm p-[9px_12px] bg-surface text-t1 outline-none transition-all focus:border-accent w-full"
              type="email"
              value={profile.email}
              onChange={e => setProfile({...profile, email: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-t2 block mb-1">Длительность слота</label>
            <select
              className="text-[13px] border border-border-custom rounded-r-sm p-[9px_12px] bg-surface text-t1 outline-none transition-all focus:border-accent w-full"
              value={profile.slot_duration}
              onChange={e => setProfile({...profile, slot_duration: e.target.value})}
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
