'use client';

import React, { useState, useMemo } from 'react';
import { IconSearch, IconUserPlus, IconDotsVertical, IconCheck, IconClock, IconMail, IconPhone, IconSend, IconMessage, IconX, IconChevronRight, IconUsers } from '@tabler/icons-react';
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
      const initials = name.split(/\s+/).filter(p => p.length > 0).slice(0, 2).map(n => n[0]).join('').toUpperCase();
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
    <div className="animate-fade-up max-w-[1000px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex bg-bg-custom p-1 rounded-xl self-start border border-border">
          <button
            onClick={() => setFilter('active')}
            className={`px-6 py-2 text-[13px] font-bold rounded-lg transition-all ${filter === 'active' ? 'bg-surface text-t1 shadow-sm' : 'text-t3 hover:text-t2'}`}
          >
            Активные
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 text-[13px] font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-surface text-t1 shadow-sm' : 'text-t3 hover:text-t2'}`}
          >
            Все
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <IconSearch size={16} stroke={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" />
            <input
              type="text"
              placeholder="Поиск клиента..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-[13px] font-medium outline-none focus:border-accent transition-all shadow-sm text-t1"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-custom border-b border-border">
                <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest">Клиент</th>
                <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest">Статус</th>
                <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest">Последняя сессия</th>
                <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {clientsList.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-t3 text-[13px] font-medium italic">Клиенты не найдены</td>
                </tr>
              )}
              {clientsList.map((client, i) => (
                <tr key={i} className="group hover:bg-bg-custom/50 transition-colors cursor-pointer" onClick={() => {
                    setChatClientId(client.id);
                    getMessages(client.id).then(setChatMessages);
                }}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-bg-custom text-t2 flex items-center justify-center text-[11px] font-bold shrink-0">
                        {client.initials}
                      </div>
                      <div className="text-[14px] font-bold text-t1">{client.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center text-[11px] font-bold">
                        <span className={`status-dot ${
                            client.status === 'Активен' ? 'bg-green-custom' :
                            client.status === 'Ожидает' ? 'bg-yellow-custom' : 'bg-slate-300'
                        }`}></span>
                        <span className={
                             client.status === 'Активен' ? 'text-green-custom' :
                             client.status === 'Ожидает' ? 'text-yellow-custom' : 'text-t3'
                        }>{client.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-t2">
                      <IconClock size={14} stroke={2} className="opacity-40" />
                      {client.lastDate}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            setChatClientId(client.id);
                            const msgs = await getMessages(client.id);
                            setChatMessages(msgs);
                        }}
                        className="p-2 text-t3 hover:text-accent hover:bg-accent/5 rounded-lg transition-all"
                        title="Написать в бот"
                      >
                        <IconMessage size={18} stroke={1.5} />
                      </button>
                      <button onClick={e => e.stopPropagation()} className="p-2 text-t3 hover:text-accent hover:bg-accent/5 rounded-lg transition-all"><IconMail size={18} stroke={1.5} /></button>
                      <button onClick={e => e.stopPropagation()} className="p-2 text-t3 hover:text-accent hover:bg-accent/5 rounded-lg transition-all"><IconPhone size={18} stroke={1.5} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-border-light">
          {clientsList.length === 0 && (
            <div className="py-20 text-center text-t3 text-[13px] font-medium italic">Клиенты не найдены</div>
          )}
          {clientsList.map((client, i) => (
            <div key={i} className="p-5 flex items-center justify-between" onClick={() => {
                setChatClientId(client.id);
                getMessages(client.id).then(setChatMessages);
            }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bg-custom text-t2 flex items-center justify-center text-[12px] font-bold shrink-0">
                  {client.initials}
                </div>
                <div>
                  <div className="text-[14px] font-bold text-t1">{client.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="flex items-center text-[10px] font-bold uppercase tracking-wider">
                        <span className={`status-dot w-1 h-1 ${
                            client.status === 'Активен' ? 'bg-green-custom' :
                            client.status === 'Ожидает' ? 'bg-yellow-custom' : 'bg-slate-300'
                        }`}></span>
                        {client.status}
                    </div>
                    <span className="text-slate-300 mx-1">·</span>
                    <span className="text-[11px] text-t3 font-medium">{client.lastDate}</span>
                  </div>
                </div>
              </div>
              <IconChevronRight size={18} className="text-slate-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Chat Modal */}
      {chatClientId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
            <div className="bg-surface rounded-3xl w-full max-w-lg shadow-2xl animate-fade-up overflow-hidden flex flex-col h-[550px] border border-border">
                <div className="p-5 border-b border-border flex items-center justify-between bg-bg-custom/50">
                    <div>
                        <div className="text-[11px] font-bold text-t3 uppercase tracking-widest mb-0.5">Чат с клиентом</div>
                        <div className="text-[15px] font-bold text-t1 tracking-tight">{storeClients.find(c => c.id === chatClientId)?.full_name}</div>
                    </div>
                    <button onClick={() => setChatClientId(null)} className="text-t3 hover:text-t1 transition-colors"><IconX size={20} stroke={2.5} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface">
                    {chatMessages.length === 0 && (
                        <div className="text-center text-t3 text-[12px] py-20 font-medium italic">История сообщений пуста.</div>
                    )}
                    {chatMessages.map((m, i) => (
                        <div key={i} className={`flex ${m.sender_type === 'trainer' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 px-4 rounded-2xl text-[13.5px] leading-relaxed shadow-sm ${
                                m.sender_type === 'trainer'
                                ? 'bg-accent text-white rounded-tr-none'
                                : 'bg-bg-custom text-t1 border border-border rounded-tl-none'
                            }`}>
                                {m.text}
                                <div className={`text-[9px] mt-1.5 font-bold uppercase tracking-wider ${m.sender_type === 'trainer' ? 'text-white/60 text-right' : 'text-t3'}`}>
                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-5 border-t border-border bg-bg-custom/30">
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
                            placeholder="Напишите клиенту в бот..."
                            className="flex-1 input-modern bg-surface"
                        />
                        <button
                            disabled={!newMessage.trim()}
                            onClick={async () => {
                                await sendMessage(chatClientId, newMessage);
                                setNewMessage('');
                                const msgs = await getMessages(chatClientId);
                                setChatMessages(msgs);
                            }}
                            className="bg-accent text-white w-11 h-11 flex items-center justify-center rounded-xl hover:bg-accent-hover transition-all disabled:opacity-50 active:scale-95"
                        >
                            <IconSend size={20} stroke={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
