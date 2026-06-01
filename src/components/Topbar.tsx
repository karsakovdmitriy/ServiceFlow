'use client';

import React, { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { IconBell, IconSearch, IconPlus, IconSun, IconMoon } from '@tabler/icons-react';
import NewEntryModal from './NewEntryModal';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { useTheme } from 'next-themes';

const Topbar = () => {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { requests } = useStore();
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
    <header className="bg-surface/80 backdrop-blur-md border-b border-border px-4 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-10">
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
        <Link
          href="/requests"
          className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-bg-custom flex items-center justify-center cursor-pointer text-t3 transition-all hover:bg-surface hover:text-t1 border border-border-light relative"
        >
          <IconBell size={18} stroke={1.5} />
          {requests.length > 0 && (
            <span className="w-2 h-2 bg-accent rounded-full absolute top-2 right-2 border-2 border-surface"></span>
          )}
        </Link>
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
