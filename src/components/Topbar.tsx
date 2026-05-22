'use client';

import React, { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { IconBell, IconSearch, IconPlus } from '@tabler/icons-react';
import NewEntryModal from './NewEntryModal';

const Topbar = () => {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }, []);

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return { title: 'Обзор', sub: todayLabel };
      case '/requests': return { title: 'Заявки', sub: 'Управление записями клиентов' };
      case '/schedule': return { title: 'Расписание', sub: 'Рабочие часы и доступность' };
      case '/clients': return { title: 'Мои клиенты', sub: 'База ваших активных клиентов' };
      case '/services': return { title: 'Услуги', sub: 'Управление вашими предложениями' };
      case '/bot': return { title: 'Telegram-бот', sub: 'Управление ботом и ссылкой' };
      case '/settings': return { title: 'Настройки', sub: 'Профиль и параметры' };
      default: return { title: 'TrainerSpace', sub: 'Панель управления' };
    }
  };

  const { title, sub } = getPageTitle(pathname);

  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-border-light px-4 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-10">
      <div className="pl-12 lg:pl-0">
        <div className="text-[17px] font-bold text-t1 tracking-[-0.4px]">{title}</div>
        <div className="text-[12px] text-t3 mt-[1px] capitalize">{sub}</div>
      </div>
      <div className="flex items-center gap-[6px] lg:gap-[10px]">
        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-r-sm bg-bg-custom border border-border-custom flex items-center justify-center cursor-pointer text-t2 transition-all hover:bg-border-light hover:text-t1 relative">
          <IconBell size={18} />
          <span className="w-[7px] h-[7px] bg-red-custom rounded-full absolute top-[7px] right-[7px] border-[1.5px] border-white"></span>
        </div>
        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-r-sm bg-bg-custom border border-border-custom flex items-center justify-center cursor-pointer text-t2 transition-all hover:bg-border-light hover:text-t1">
          <IconSearch size={18} />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-accent text-white border-none rounded-r-sm px-2.5 lg:px-4 py-1.5 lg:py-2 text-[12px] lg:text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 shadow-[0_2px_10px_rgba(99,102,241,0.3)] transition-all hover:bg-accent-hover hover:shadow-[0_4px_18px_rgba(99,102,241,0.38)] hover:-translate-y-px"
        >
          <IconPlus size={16} /> <span className="hidden sm:inline">Новая запись</span>
        </button>
      </div>

      <NewEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
};

export default Topbar;
