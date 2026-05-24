'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconBarbell,
  IconLayoutDashboard,
  IconCalendarEvent,
  IconCalendarWeek,
  IconUsers,
  IconBrandTelegram,
  IconSettings,
  IconMenu2,
  IconX,
  IconStethoscope
} from '@tabler/icons-react';
import { useStore } from '@/lib/store';

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { profile, requests } = useStore();

  const navItems = [
    { label: 'Главное', type: 'group' },
    { label: 'Обзор', icon: <IconLayoutDashboard size={18} />, href: '/', id: 'dashboard' },
    { label: 'Заявки', icon: <IconCalendarEvent size={18} />, href: '/requests', id: 'requests', badge: requests.length > 0 ? requests.length : undefined },
    { label: 'Расписание', icon: <IconCalendarWeek size={18} />, href: '/schedule', id: 'schedule' },
    { label: 'Клиенты', type: 'group' },
    { label: 'Мои клиенты', icon: <IconUsers size={18} />, href: '/clients', id: 'clients' },
    { label: 'Инструменты', type: 'group' },
    { label: 'Услуги', icon: <IconStethoscope size={18} />, href: '/services', id: 'services' },
    { label: 'Площадки', icon: <IconBarbell size={18} />, href: '/venues', id: 'venues' },
    { label: 'Telegram-бот', icon: <IconBrandTelegram size={18} />, href: '/bot', id: 'bot' },
    { label: 'Настройки', icon: <IconSettings size={18} />, href: '/settings', id: 'settings' },
  ];

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '??';

  const SidebarContent = () => (
    <>
      <div className="p-[24px_18px_18px] border-b border-border-light relative">
        <div className="w-[38px] h-[38px] bg-gradient-to-br from-accent to-accent-mid rounded-[11px] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(99,102,241,0.32)] mb-[10px]">
          <IconBarbell size={19} />
        </div>
        <div className="text-[15px] font-bold text-t1 tracking-[-0.3px]">TrainerSpace</div>
        <div className="text-[11.5px] text-t3 mt-[1px]">Кабинет тренера</div>

        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-6 right-4 p-1 text-t3 hover:text-t1"
        >
          <IconX size={20} />
        </button>
      </div>

      <nav className="p-[14px_10px] flex-1 overflow-y-auto">
        {navItems.map((item, index) => {
          if (item.type === 'group') {
            return (
              <div key={index} className="text-[10px] font-semibold text-t3 uppercase tracking-[0.08em] px-2 mt-[14px] mb-[5px] first:mt-0">
                {item.label}
              </div>
            );
          }

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href!}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-[9px] p-[9px_8px] text-[13.5px] font-medium rounded-r-sm transition-all select-none hover:bg-bg-custom hover:text-t1 ${
                isActive ? 'bg-accent-light text-accent' : 'text-t2'
              }`}
            >
              <span className={isActive ? 'opacity-100' : 'opacity-65'}>{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-red-custom text-white text-[10px] font-semibold rounded-full px-[7px] py-[2px] min-w-[19px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-[14px_10px_16px] border-t border-border-light flex items-center gap-[10px]">
        <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-accent to-[#A5B4FC] flex items-center justify-center text-[12px] font-bold text-white shrink-0">
          {initials}
        </div>
        <div>
          <div className="text-[13px] font-semibold text-t1">{profile?.full_name || 'Загрузка...'}</div>
          <div className="text-[11px] text-t3 mt-[1px]">{profile?.specialization || 'Профиль'}</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[110] p-2 bg-white rounded-r-sm border border-border-light shadow-sh-sm text-t2"
      >
        <IconMenu2 size={24} />
      </button>

      {/* Sidebar Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[120]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[240px] bg-white/92 backdrop-blur-md border-r border-border-light flex-col fixed top-0 left-0 h-screen z-[100]">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-screen w-[260px] bg-white z-[130] flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
