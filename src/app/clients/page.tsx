'use client';

import React, { useState, useMemo } from 'react';
import { IconSearch, IconUserPlus, IconDotsVertical, IconCheck, IconClock, IconMail, IconPhone, IconSend, IconMessage, IconX, IconChevronRight } from '@tabler/icons-react';
import { useStore, Message } from '@/lib/store';

export default function ClientsPage() {
  const { sessions, requests, completedSessions, clients: storeClients, sendMessage, getMessages } = useStore();
  const [filter, setFilter] = useState('active'); // 'all' or 'active'
  const [search, setSearch] = useState('');

  const [chatClientId, setChatClientId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const clientsList = useMemo(() => {
    return storeClients.map(client => {
      const name = client.full_name;
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
      const lastSession = sessions.find(s => s.clientId === client.id) || completedSessions.find(s => s.clientId === client.id);
      const isPending = requests.some(r => r.clientId === client.id);
      const isActive = sessions.some(s => s.clientId === client.id);

      return {
        id: client.id,
        name,
        initials,
        status: isPending ? 'Ожидает' : (isActive ? 'Активен' : 'Завершено'),
        lastDate: lastSession?.date || '—',
        email: client.email || (name.toLowerCase().replace(' ', '.') + '@example.com'),
        isActive: isPending || isActive
      };
    }).filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      if (filter === 'active') return matchesSearch && c.isActive;
      return matchesSearch;
    });
  }, [filter, storeClients, sessions, requests, completedSessions, search]);

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

      <div className="space-y-3 sm:space-y-0 sm:card sm:overflow-hidden">
        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
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
              {clientsList.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-t3 text-[14px]">Клиенты не найдены</td>
                </tr>
              )}
              {clientsList.map((client, i) => (
                <tr key={i} className="border-b border-border-light last:border-none hover:bg-bg-custom/80 transition-all group cursor-pointer">
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
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            setChatClientId(client.id);
                            const msgs = await getMessages(client.id);
                            setChatMessages(msgs);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-t3 hover:text-accent hover:bg-accent-light rounded-lg transition-all group/btn"
                        title="Написать в бот"
                      >
                        <IconMessage size={16} />
                      </button>
                      <button onClick={e => e.stopPropagation()} title={client.email} className="w-8 h-8 flex items-center justify-center text-t3 hover:text-accent hover:bg-accent-light rounded-lg transition-all"><IconMail size={16} /></button>
                      <button onClick={e => e.stopPropagation()} className="w-8 h-8 flex items-center justify-center text-t3 hover:text-accent hover:bg-accent-light rounded-lg transition-all"><IconPhone size={16} /></button>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={e => e.stopPropagation()} className="p-1.5 text-t3 hover:text-t1 opacity-0 group-hover:opacity-100 transition-all">
                        <IconDotsVertical size={18} />
                        </button>
                        <IconChevronRight size={18} className="text-t3 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden space-y-3">
          {clientsList.length === 0 && (
            <div className="card p-8 text-center text-t3 text-[14px]">Клиенты не найдены</div>
          )}
          {clientsList.map((client, i) => (
            <div key={i} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-light text-accent flex items-center justify-center text-[13px] font-bold shrink-0">
                  {client.initials}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-t1">{client.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      client.status === 'Активен' ? 'bg-green-light text-green-custom' :
                      client.status === 'Ожидает' ? 'bg-yellow-light text-yellow-custom' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {client.status}
                    </span>
                    <span className="text-[11px] text-t3 flex items-center gap-1">
                      <IconClock size={12} /> {client.lastDate}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="p-2 text-t3 hover:text-accent transition-colors bg-bg-custom rounded-lg"><IconDotsVertical size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Modal */}
      {chatClientId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fade-up overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 border-b border-border-light flex items-center justify-between bg-bg-custom">
                    <div className="font-bold text-t1">Чат с {storeClients.find(c => c.id === chatClientId)?.full_name}</div>
                    <button onClick={() => setChatClientId(null)} className="text-t3 hover:text-t1"><IconX size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                    {chatMessages.length === 0 && (
                        <div className="text-center text-t3 text-[12px] py-10 italic">История сообщений пуста. Напишите что-нибудь первым!</div>
                    )}
                    {chatMessages.map((m, i) => (
                        <div key={i} className={`flex ${m.sender_type === 'trainer' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-[13px] shadow-sm ${
                                m.sender_type === 'trainer'
                                ? 'bg-accent text-white rounded-br-none'
                                : 'bg-white text-t1 border border-border-light rounded-bl-none'
                            }`}>
                                {m.text}
                                <div className={`text-[9px] mt-1 opacity-60 ${m.sender_type === 'trainer' ? 'text-right' : 'text-left'}`}>
                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-border-light bg-white">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && newMessage.trim() && (async () => {
                                await sendMessage(chatClientId, newMessage);
                                setNewMessage('');
                                const msgs = await getMessages(chatClientId);
                                setChatMessages(msgs);
                            })()}
                            placeholder="Введите сообщение..."
                            className="flex-1 bg-bg-custom border border-border-light rounded-xl px-4 py-2 text-[13px] outline-none focus:border-accent"
                        />
                        <button
                            disabled={!newMessage.trim()}
                            onClick={async () => {
                                await sendMessage(chatClientId, newMessage);
                                setNewMessage('');
                                const msgs = await getMessages(chatClientId);
                                setChatMessages(msgs);
                            }}
                            className="bg-accent text-white p-2 rounded-xl hover:bg-accent-hover transition-all disabled:opacity-50"
                        >
                            <IconSend size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
