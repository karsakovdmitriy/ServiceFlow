'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { IconSearch, IconUser, IconStar, IconMapPin } from '@tabler/icons-react';

export default function SearchMasters() {
  const { getAllMasters } = useStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');
  const [masters, setMasters] = useState<any[]>([]);

  const categories = ['Все', 'Спорт', 'Бьюти', 'Образование', 'Медицина'];

  React.useEffect(() => {
    getAllMasters().then(data => {
      setMasters(data.map(m => ({
        name: m.full_name,
        spec: m.specialization,
        rating: 4.9 + (Math.random() * 0.1),
        location: 'Окошко',
        category: m.category || 'Спорт'
      })));
    });
  }, []);

  const filtered = masters.filter(r =>
    (activeCategory === 'Все' || r.category === activeCategory) &&
    (r.name.toLowerCase().includes(query.toLowerCase()) || r.spec.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="animate-fade-up max-w-[900px] mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-t1">Найти мастера</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-accent text-white shadow-lg shadow-accent/20'
                : 'bg-surface text-t2 border border-border-light hover:border-accent/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filtered.map((r, i) => (
          <div key={i} className="bg-surface p-4 sm:p-5 rounded-2xl border border-border-light shadow-sh-sm hover:border-accent/30 transition-all cursor-pointer group">
            <div className="flex gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent/5 flex items-center justify-center text-accent shrink-0 border border-accent/10">
                <IconUser size={24} className="sm:hidden" />
                <IconUser size={28} className="hidden sm:block" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[15px] sm:text-[16px] font-bold text-t1 truncate">{r.name}</div>
                  <div className="flex items-center gap-1 text-yellow-500 text-[12px] sm:text-[13px] font-bold shrink-0">
                    <IconStar size={14} fill="currentColor" /> {r.rating.toFixed(1)}
                  </div>
                </div>
                <div className="text-[12px] sm:text-[13px] text-t2 mt-0.5 truncate">{r.spec}</div>
                <div className="flex items-center gap-1 text-[11px] sm:text-[12px] text-t3 mt-2 sm:mt-3">
                  <IconMapPin size={14} /> {r.location}
                </div>
              </div>
            </div>
            <button className="w-full mt-4 py-2.5 bg-bg-custom text-accent text-[13px] font-bold rounded-xl group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
              Профиль и запись
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-t3 text-[14px] italic bg-bg-custom/30 rounded-3xl border border-dashed border-border">
            Мастера не найдены
          </div>
        )}
      </div>
    </div>
  );
}
