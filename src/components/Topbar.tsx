'use client';

import React, { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { IconBell, IconSearch, IconPlus } from '@tabler/icons-react';
import NewEntryModal from './NewEntryModal';
import { useStore } from '@/lib/store';
import Link from 'next/link';

const Topbar = () => {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { requests } = useStore();

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
    <header className="bg-white/85 backdrop-blur-md border-b border-border-light px-4 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-10">
      <div className="pl-12 lg:pl-0">
        <div className="text-[20px] font-medium text-t1 tracking-tight">{title}</div>
        <div className="text-[13px] text-t3 mt-[1px]">{sub}</div>
      </div>
      <div className="flex items-center gap-[6px] lg:gap-[10px]">
        <Link
          href="/requests"
          className="w-8 h-8 lg:w-9 lg:h-9 rounded-r-sm bg-bg-custom border border-border-custom flex items-center justify-center cursor-pointer text-t2 transition-all hover:bg-border-light hover:text-t1 relative"
        >
          <IconBell size={18} />
          {requests.length > 0 && (
            <span className="min-w-[16px] h-[16px] px-1 bg-red-custom text-white text-[9px] font-bold rounded-full absolute -top-1.5 -right-1.5 border-[2px] border-white flex items-center justify-center">
              {requests.length}
            </span>
          )}
        </Link>
        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-r-sm bg-bg-custom border border-border-custom flex items-center justify-center cursor-pointer text-t2 transition-all hover:bg-border-light hover:text-t1">
          <IconSearch size={18} />
        </div>
        {(pathname === '/' || pathname === '/requests' || pathname === '/schedule') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-accent text-white border-none rounded-r-sm px-2.5 lg:px-4 py-1.5 lg:py-2 text-[12px] lg:text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 shadow-[0_2px_10px_rgba(99,102,241,0.3)] transition-all hover:bg-accent-hover hover:shadow-[0_4px_18px_rgba(99,102,241,0.38)] hover:-translate-y-px"
          >
            <IconPlus size={16} /> <span className="hidden sm:inline">Новая запись</span>
          </button>
        )}
      </div>

      <NewEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
};

export default Topbar;
