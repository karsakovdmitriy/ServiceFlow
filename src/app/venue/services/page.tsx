'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { IconStethoscope, IconPlus } from '@tabler/icons-react';

export default function VenueServices() {
  const { services, venueStaff, updateService } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="animate-fade-up max-w-[900px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-t1">Услуги площадки</h1>
        <button className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-[13px] font-bold hover:bg-accent-hover transition-all">
          <IconPlus size={18} />
          Добавить услугу
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-border-light shadow-sh-sm overflow-hidden">
        <div className="p-6 border-b border-border-light">
          <h2 className="text-[14px] font-bold text-t1 uppercase tracking-wider">Доступные услуги</h2>
        </div>
        <div className="divide-y divide-border-light">
          {services.length === 0 && (
             <div className="py-12 text-center text-t3 text-[13px] italic">Услуги еще не созданы</div>
          )}
          {services.map((s) => (
            <div key={s.id} className="p-6 hover:bg-bg-custom/50 transition-colors space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                    <IconStethoscope size={20} />
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-t1">{s.name}</div>
                    <div className="text-[13px] text-t3">{s.duration} мин · {s.price} ₽</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${s.is_group ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {s.is_group ? 'Групповая' : 'Индивид.'}
                  </span>
                  <button
                    onClick={() => setEditingId(editingId === s.id ? null : s.id)}
                    className="text-t3 hover:text-accent p-1 transition-colors"
                  >
                    Настроить
                  </button>
                </div>
              </div>

              {editingId === s.id && (
                <div className="pt-4 border-t border-border-light animate-fade-down space-y-3">
                  <label className="text-[11px] font-bold text-t3 uppercase tracking-wider">Назначить мастера для этой услуги:</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        // In a real app, call updateService to clear assigned_trainer_id
                        setEditingId(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-bg-custom border border-border-light text-[12px] font-medium hover:border-accent"
                    >
                      Любой мастер
                    </button>
                    {venueStaff.map((staff) => (
                      <button
                        key={staff.id}
                        onClick={() => {
                          // In a real app, call updateService(s.id, { assigned_trainer_id: staff.trainer_id })
                          setEditingId(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-bg-custom border border-border-light text-[12px] font-medium hover:border-accent flex items-center gap-2"
                      >
                        <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center text-[8px] font-bold text-accent">
                           {(staff.trainer_name || 'M').slice(0, 1)}
                        </div>
                        {staff.trainer_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
