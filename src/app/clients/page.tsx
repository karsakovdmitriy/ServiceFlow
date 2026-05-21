import React from 'react';

export default function ClientsPage() {
  const clients = [
    { name: 'Анна Иванова', meta: 'С января 2025 · Следующая: 21 мая · 09:00', sessions: '24 сессии', initials: 'АИ', bg: '#EDE9FE', color: '#7C3AED' },
    { name: 'Дмитрий Макаров', meta: 'С марта 2025 · Следующая: 21 мая · 12:00', sessions: '12 сессий', initials: 'ДМ', bg: '#DCFCE7', color: '#15803D' },
    { name: 'Михаил Козлов', meta: 'С апреля 2025 · Следующая: 21 мая · 15:00', sessions: '8 сессий', initials: 'МК', bg: '#FEF3C7', color: '#D97706' },
    { name: 'Елена Петрова', meta: 'С февраля 2025 · Следующая: 21 мая · 18:00', sessions: '18 сессий', initials: 'ЕП', bg: '#FEE2E2', color: '#DC2626' },
    { name: 'Наталья Соколова', meta: 'С мая 2025 · Заявка: 22 мая · 10:00', sessions: '1 сессия', initials: 'НС', bg: '#F0FDF4', color: '#16A34A' },
    { name: 'Павел Волков', meta: 'С мая 2025 · Заявка: 23 мая · 17:00', sessions: '3 сессии', initials: 'ПВ', bg: '#EFF6FF', color: '#2563EB' },
    { name: 'Ольга Кириллова', meta: 'С мая 2025 · Заявка: 24 мая · 11:00', sessions: '0 сессий', initials: 'ОК', bg: '#FDF4FF', color: '#9333EA' },
  ];

  return (
    <div className="animate-fade-up">
      <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Мои клиенты · 12 активных</div>
      <div className="card">
        <div className="flex gap-2 mb-4.5">
          <input
            type="text"
            placeholder="🔍  Поиск клиента..."
            className="text-[13px] border border-border-custom rounded-r-sm p-[9px_12px] bg-surface text-t1 outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] flex-1 max-w-[280px]"
          />
          <button className="bg-surface border border-border-custom text-t1 text-[13px] font-medium p-[9px_14px] rounded-r-sm cursor-pointer whitespace-nowrap transition-all hover:bg-bg-custom hover:border-t3">Все</button>
          <button className="bg-accent-light border border-accent/30 text-accent text-[13px] font-medium p-[9px_14px] rounded-r-sm cursor-pointer whitespace-nowrap transition-all">Активные</button>
        </div>

        {clients.map((client, i) => (
          <div key={i} className="flex items-center gap-3 py-[13px] border-b border-border-light last:border-none last:pb-0 first:pt-0">
            <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[11.5px] font-bold shrink-0" style={{ backgroundColor: client.bg, color: client.color }}>
              {client.initials}
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-medium text-t1">{client.name}</div>
              <div className="text-[12px] text-t3 mt-[2px]">{client.meta}</div>
            </div>
            <div className="text-right">
              <div className="text-[13px] font-medium text-t1">{client.sessions}</div>
              <div className="text-[11px] text-t3 mt-[1px]">всего</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
