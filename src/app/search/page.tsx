'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { IconSearch, IconUser, IconStar, IconMapPin } from '@tabler/icons-react';

export default function SearchMasters() {
  const [query, setQuery] = useState('');

  // Mock data for search
  const results = [
    { name: 'Александр Петров', spec: 'Силовой тренинг', rating: 4.9, location: 'Gold Gym' },
    { name: 'Елена Соколова', spec: 'Йога и пилатес', rating: 5.0, location: 'Balance Studio' },
  ];

  return (
    <div className="animate-fade-up max-w-[900px] mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-t1">Найти мастера</h1>

      <div className="relative">
        <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-t3" size={20} />
        <input
          type="text"
          placeholder="Имя, специализация или клуб..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-surface border border-border-light rounded-2xl text-[15px] focus:outline-none focus:ring-2 focus:ring-accent/20 shadow-sh-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((r, i) => (
          <div key={i} className="bg-surface p-5 rounded-2xl border border-border-light shadow-sh-sm hover:border-accent/30 transition-all cursor-pointer group">
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-full bg-accent/5 flex items-center justify-center text-accent shrink-0 border border-accent/10">
                <IconUser size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="text-[16px] font-bold text-t1 truncate">{r.name}</div>
                  <div className="flex items-center gap-1 text-yellow-500 text-[13px] font-bold">
                    <IconStar size={14} fill="currentColor" /> {r.rating}
                  </div>
                </div>
                <div className="text-[13px] text-t2 mt-0.5">{r.spec}</div>
                <div className="flex items-center gap-1 text-[12px] text-t3 mt-3">
                  <IconMapPin size={14} /> {r.location}
                </div>
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-bg-custom text-accent text-[13px] font-bold rounded-xl group-hover:bg-accent group-hover:text-white transition-all">
              Профиль и запись
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
