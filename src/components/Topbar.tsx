'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { IconBell, IconSearch, IconPlus, IconSun, IconMoon, IconCircleFilled } from '@tabler/icons-react';
import NewEntryModal from './NewEntryModal';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { useTheme } from 'next-themes';

const Topbar = () => {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { requests, events } = useStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }, []);

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return { title: 'Сегодня', sub: todayLabel };
      case '/requests': return { title: 'Заявки', sub: 'Управление записями клиентов' };
      case '/schedule': return { title: 'Расписание', sub: 'Рабочие часы и доступность' };
      case '/clients': return { title: 'База клиентов', sub: 'Список ваших активных клиентов' };
      case '/services': return { title: 'Услуги и площадки', sub: 'Управление вашими предложениями' };
      case '/bot': return { title: 'Telegram-бот', sub: 'Управление ботом и ссылкой' };
      case '/settings': return { title: 'Профиль', sub: 'Настройки вашего аккаунта' };
      case '/analytics': return { title: 'Доходы', sub: 'Финансовая аналитика' };
      case '/reviews': return { title: 'Отзывы', sub: 'Обратная связь от клиентов' };
      case '/venues': return { title: 'Площадки', sub: 'Места проведения' };
      default: return { title: 'Окошко', sub: 'Сервис записи' };
    }
  };

  const { title, sub } = getPageTitle(pathname);

  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-border px-4 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-10">
      <div className="pl-12 lg:pl-0">
        <div className="text-[15px] font-semibold text-t1 tracking-tight">{title}</div>
        <div className="text-[11px] text-t3 mt-[1px] font-medium">{sub}</div>
      </div>
      <div className="flex items-center gap-2 lg:gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-surface flex items-center justify-center cursor-pointer text-t3 transition-all hover:text-t1 border border-border"
          >
            {theme === 'dark' ? <IconSun size={18} stroke={1.5} /> : <IconMoon size={18} stroke={1.5} />}
          </button>
        )}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            aria-label="Уведомления"
            className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all border relative ${
                isNotificationsOpen ? 'bg-surface text-t1 border-accent/20 ring-4 ring-accent/5' : 'bg-surface text-t3 hover:text-t1 border-border'
            }`}
          >
            <IconBell size={18} stroke={1.5} />
            {events.length > 0 && (
                <span className="w-2 h-2 bg-accent rounded-full absolute top-2 right-2 border-2 border-surface"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-[320px] bg-surface border border-border rounded-2xl shadow-sh-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                <div className="p-4 border-b border-border bg-bg-custom/50 flex items-center justify-between">
                    <span className="text-[12px] font-bold text-t1 uppercase tracking-wider">Уведомления</span>
                    <Link href="/requests" onClick={() => setIsNotificationsOpen(false)} className="text-[10px] font-bold text-accent hover:underline uppercase tracking-widest">
                        Все заявки
                    </Link>
                </div>
                <div className="max-h-[380px] overflow-y-auto">
                    {events.length > 0 ? (
                        events.map((event, i) => (
                            <div key={event.id} className={`p-4 flex gap-3 hover:bg-bg-custom/50 transition-colors ${i !== events.length - 1 ? 'border-b border-border/50' : ''}`}>
                                <div className={`mt-1 shrink-0`}>
                                    <IconCircleFilled size={8} className={
                                        event.type === 'booking' ? 'text-accent' :
                                        event.type === 'system' ? 'text-blue-custom' : 'text-t3'
                                    } />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[13px] text-t1 leading-relaxed font-medium">{event.message}</p>
                                    <p className="text-[10px] text-t3 font-bold uppercase tracking-widest">
                                        {new Date(event.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} · {new Date(event.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-[13px] text-t3 font-medium">Нет новых уведомлений</p>
                        </div>
                    )}
                </div>
            </div>
          )}
        </div>
        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-surface flex items-center justify-center cursor-pointer text-t3 transition-all hover:text-t1 border border-border">
          <IconSearch size={18} stroke={1.5} />
        </div>
        {(pathname === '/' || pathname === '/requests' || pathname === '/schedule') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-accent text-white rounded-lg px-3 lg:px-4 py-2 text-[13px] font-bold flex items-center gap-2 transition-all hover:bg-accent-hover hover:-translate-y-px active:translate-y-0"
          >
            <IconPlus size={16} stroke={2} /> <span className="hidden sm:inline">Новая запись</span>
          </button>
        )}
      </div>

      <NewEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
};

export default Topbar;
