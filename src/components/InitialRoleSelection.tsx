'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { IconStethoscope, IconUser, IconBuildingStore, IconCheck } from '@tabler/icons-react';

export default function InitialRoleSelection() {
  const pathname = usePathname();
  const { profile, updateProfile, loading, switchActiveRole, addMaster, userId } = useStore();
  const [selectedRoles, setSelectedRoles] = useState<{ master: boolean; client: boolean; venue: boolean }>({
    master: false,
    client: false,
    venue: false
  });

  const hasAnyRole = profile && (profile.is_master || profile.is_client || profile.is_venue);

  const isLegalPage = pathname?.startsWith('/legal');

  if (loading || !profile || hasAnyRole || isLegalPage) return null;

  const handleSave = async () => {
    const rolesToEnable = {
      is_master: selectedRoles.master,
      is_client: selectedRoles.client,
      is_venue: selectedRoles.venue
    };

    const { error } = await updateProfile(rolesToEnable);

    if (!error && selectedRoles.master) {
      // Create initial master record if it doesn't exist
      await addMaster({
        user_id: userId || profile?.id,
        full_name: profile?.full_name || 'Новый мастер',
        slot_duration: 60
      });
    }

    // Set active role to the first selected one
    if (selectedRoles.master) switchActiveRole('master');
    else if (selectedRoles.client) switchActiveRole('client');
    else if (selectedRoles.venue) switchActiveRole('venue');
  };

  const isButtonDisabled = !selectedRoles.master && !selectedRoles.client && !selectedRoles.venue;

  return (
    <div className="fixed inset-0 z-[20000] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-[500px] rounded-[40px] shadow-2xl overflow-hidden border border-white/20 animate-fade-up">
        <div className="p-10 text-center">
          <h1 className="text-[28px] font-black text-t1 mb-3 tracking-tight">Выберите ваши роли</h1>
          <p className="text-t3 text-[15px] mb-10 leading-relaxed">Кем вы планируете пользоваться в Окошке? Можно выбрать несколько вариантов, их всегда можно изменить позже.</p>

          <div className="grid grid-cols-1 gap-4 mb-10">
            {[
              { id: 'master', label: 'Мастер', desc: 'Записываю клиентов и веду расписание', icon: <IconStethoscope size={24} /> },
              { id: 'client', label: 'Клиент', desc: 'Записываюсь на услуги и сеансы', icon: <IconUser size={24} /> },
              { id: 'venue', label: 'Площадка', desc: 'Управляю локацией и мастерами', icon: <IconBuildingStore size={24} /> }
            ].map(role => {
              const active = selectedRoles[role.id as keyof typeof selectedRoles];
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoles({ ...selectedRoles, [role.id]: !active })}
                  className={`flex items-center gap-5 p-5 rounded-[24px] border-2 transition-all text-left group ${
                    active ? 'bg-accent/5 border-accent shadow-lg shadow-accent/5' : 'bg-bg-custom border-transparent hover:border-accent/30'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    active ? 'bg-accent text-white' : 'bg-surface text-t3 group-hover:text-accent'
                  }`}>
                    {role.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`text-[17px] font-bold ${active ? 'text-accent' : 'text-t1'}`}>{role.label}</div>
                    <div className="text-[13px] text-t3 font-medium mt-0.5">{role.desc}</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    active ? 'bg-accent border-accent text-white' : 'border-border-light'
                  }`}>
                    {active && <IconCheck size={14} stroke={3} />}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSave}
            disabled={isButtonDisabled}
            className="w-full bg-accent text-white py-4 rounded-[20px] font-black text-[16px] hover:shadow-2xl shadow-accent/40 transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
          >
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
}
