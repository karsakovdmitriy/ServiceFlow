'use client';

import React, { useState, useMemo } from 'react';
import { IconSearch, IconUserPlus, IconDotsVertical, IconCheck, IconClock, IconMail, IconPhone, IconBrandTelegram } from '@tabler/icons-react';
import { useStore } from '@/lib/store';

export default function ClientsPage() {
  const { sessions, requests, completedSessions } = useStore();
  const [filter, setFilter] = useState('active'); // 'all' or 'active'
  const [search, setSearch] = useState('');

  // Extract unique clients
  const allClientNames = useMemo(() => {
    const names = new Set([
      ...sessions.map(s => s.name),
      ...requests.map(r => r.name),
      ...completedSessions.map(c => c.name)
    ]);
    return Array.from(names);
  }, [sessions, requests, completedSessions]);

  const activeClientNames = useMemo(() => {
    const names = new Set([
      ...sessions.map(s => s.name),
      ...requests.map(r => r.name)
    ]);
    return Array.from(names);
  }, [sessions, requests]);

  const clients = useMemo(() => {
    const targetNames = filter === 'active' ? activeClientNames : allClientNames;

    return targetNames.map(name => {
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
      const lastSession = sessions.find(s => s.name === name) || completedSessions.find(s => s.name === name);
      const isPending = requests.some(r => r.name === name);

      return {
        name,
        initials,
        status: isPending ? 'Ожидает' : (sessions.some(s => s.name === name) ? 'Активен' : 'Завершено'),
        lastDate: lastSession?.date || '—',
        email: name.toLowerCase().replace(' ', '.') + '@example.com',
        telegram: lastSession?.telegram_username
      };
    }).filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [filter, allClientNames, activeClientNames, sessions, requests, completedSessions, search]);

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex bg-white p-1 rounded-xl border border-border-light shadow-sm self-start">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-1.5 text-[13px] font-bold rounded-lg transition-all ${filter === 'active' ? 'bg-accent text-white shadow-md shadow-accent/20' : 'text-t3 hover:text-t2'}`}
          >
            Активные
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 text-[13px] font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-accent text-white shadow-md shadow-accent/20' : 'text-t3 hover:text-t2'}`}
          >
            Все
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" />
            <input
              type="text"
              placeholder="Поиск клиента..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-border-light rounded-xl text-[13px] outline-none focus:border-accent w-[200px] sm:w-[240px] transition-all"
            />
          </div>
          <button className="bg-white border border-border-light text-t2 p-2 rounded-xl hover:bg-bg-custom transition-all">
            <IconUserPlus size={18} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-light">
                <th className="p-4 text-[11px] font-bold text-t3 uppercase tracking-wider">Клиент</th>
                <th className="p-4 text-[11px] font-bold text-t3 uppercase tracking-wider">Статус</th>
                <th className="p-4 text-[11px] font-bold text-t3 uppercase tracking-wider">Последняя сессия</th>
                <th className="p-4 text-[11px] font-bold text-t3 uppercase tracking-wider">Контакты</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-t3 text-[14px]">Клиенты не найдены</td>
                </tr>
              )}
              {clients.map((client, i) => (
                <tr key={i} className="border-b border-border-light last:border-none hover:bg-bg-custom/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent-light text-accent flex items-center justify-center text-[12px] font-bold shrink-0">
                        {client.initials}
                      </div>
                      <div className="text-[14px] font-semibold text-t1">{client.name}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      client.status === 'Активен' ? 'bg-green-light text-green-custom' :
                      client.status === 'Ожидает' ? 'bg-yellow-light text-yellow-custom' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-[13px] text-t2">
                      <IconClock size={14} className="text-t3" />
                      {client.lastDate}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {client.telegram && (
                        <a
                          href={`https://t.me/${client.telegram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-t3 hover:text-accent transition-colors"
                          title={`@${client.telegram}`}
                        >
                          <IconBrandTelegram size={16} />
                        </a>
                      )}
                      <button title={client.email} className="p-1.5 text-t3 hover:text-accent transition-colors"><IconMail size={16} /></button>
                      <button className="p-1.5 text-t3 hover:text-accent transition-colors"><IconPhone size={16} /></button>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 text-t3 hover:text-t1 opacity-0 group-hover:opacity-100 transition-all">
                      <IconDotsVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
