'use client';

import React, { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { IconBell, IconSearch, IconPlus, IconSun, IconMoon, IconCircleCheck } from '@tabler/icons-react';
import NewEntryModal from './NewEntryModal';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { useTheme } from 'next-themes';

const Topbar = () => {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { requests, events } = useStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
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
    <header className="bg-surface/80 backdrop-blur-md border-b border-border px-4 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-[100]">
      <div className="pl-12 lg:pl-0">
        <div className="text-[15px] font-semibold text-t1 tracking-tight">{title}</div>
        <div className="text-[11px] text-t3 mt-[1px] font-medium">{sub}</div>
      </div>
      <div className="flex items-center gap-2 lg:gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-bg-custom flex items-center justify-center cursor-pointer text-t3 transition-all hover:bg-surface hover:text-t1 border border-border-light"
          >
            {theme === 'dark' ? <IconSun size={18} stroke={1.5} /> : <IconMoon size={18} stroke={1.5} />}
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-bg-custom flex items-center justify-center cursor-pointer text-t3 transition-all hover:bg-surface hover:text-t1 border border-border-light relative"
          >
            <IconBell size={18} stroke={1.5} />
            {requests.length > 0 && (
              <span className="w-2 h-2 bg-accent rounded-full absolute top-2 right-2 border-2 border-surface"></span>
            )}
          </button>

          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)}></div>
              <div className="absolute right-0 mt-3 w-80 bg-surface border border-border rounded-2xl shadow-2xl z-20 overflow-hidden animate-fade-up">
                <div className="p-4 border-b border-border flex items-center justify-between bg-bg-custom/50">
                   <h3 className="text-[12px] font-bold text-t1 uppercase tracking-widest">События</h3>
                   {requests.length > 0 && (
                     <Link href="/requests" onClick={() => setIsNotifOpen(false)} className="text-[10px] font-bold text-accent hover:underline uppercase">
                        {requests.length} ЗАЯВКИ
                     </Link>
                   )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                   {events.length === 0 ? (
                     <div className="p-8 text-center text-t3 text-[12px] italic">У вас пока нет уведомлений</div>
                   ) : (
                     events.slice(0, 10).map((ev, i) => (
                       <div key={i} className="p-4 border-b border-border-light last:border-0 hover:bg-bg-custom/30 transition-colors">
                          <div className="text-[13px] text-t1 leading-relaxed font-medium mb-1">{ev.message}</div>
                          <div className="text-[10px] text-t3 font-bold uppercase opacity-60">
                             {new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                       </div>
                     ))
                   )}
                </div>
                <Link
                  href="/requests"
                  onClick={() => setIsNotifOpen(false)}
                  className="block p-4 text-center text-[11px] font-bold text-t3 hover:text-t1 bg-bg-custom/30 transition-colors border-t border-border"
                >
                  ПЕРЕЙТИ В ЗАЯВКИ
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-bg-custom flex items-center justify-center cursor-pointer text-t3 transition-all hover:bg-surface hover:text-t1 border border-border-light">
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
