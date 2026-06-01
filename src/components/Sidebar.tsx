'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconCalendarEvent,
  IconCalendarWeek,
  IconUsers,
  IconBrandTelegram,
  IconSettings,
  IconMenu2,
  IconX,
  IconStethoscope,
  IconChartBar,
  IconWindow,
  IconStar,
  IconCircleCheck
} from '@tabler/icons-react';
import { useStore } from '@/lib/store';

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { profile, requests } = useStore();

  const navItems = [
    { label: 'Рабочий стол', type: 'group' },
    { label: 'Сегодня', icon: <IconCircleCheck size={18} stroke={1.5} />, href: '/', id: 'dashboard' },
    { label: 'Заявки', icon: <IconCalendarEvent size={18} stroke={1.5} />, href: '/requests', id: 'requests', badge: requests.length > 0 ? requests.length : undefined },
    { label: 'Расписание', icon: <IconCalendarWeek size={18} stroke={1.5} />, href: '/schedule', id: 'schedule' },

    { label: 'Клиенты', type: 'group' },
    { label: 'База клиентов', icon: <IconUsers size={18} stroke={1.5} />, href: '/clients', id: 'clients' },
    { label: 'Доходы', icon: <IconChartBar size={18} stroke={1.5} />, href: '/analytics', id: 'analytics' },
    { label: 'Отзывы', icon: <IconStar size={18} stroke={1.5} />, href: '/reviews', id: 'reviews' },

    { label: 'Настройка', type: 'group' },
    { label: 'Услуги и площадки', icon: <IconStethoscope size={18} stroke={1.5} />, href: '/services', id: 'services' },
    { label: 'Telegram-бот', icon: <IconBrandTelegram size={18} stroke={1.5} />, href: '/bot', id: 'bot' },
    { label: 'Профиль', icon: <IconSettings size={18} stroke={1.5} />, href: '/settings', id: 'settings' },
  ];

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '??';

  const SidebarContent = () => (
    <>
      <div className="p-8 pb-4 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white shrink-0">
            <IconWindow size={18} stroke={1.5} />
          </div>
          <div>
            <div className="text-[15px] font-bold text-t1 tracking-tight leading-none">Окошко</div>
            <div className="text-[11px] text-t3 mt-1 font-medium">Сервис записи</div>
          </div>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-8 right-4 p-1 text-t3 hover:text-t1"
        >
          <IconX size={20} />
        </button>
      </div>

      <nav className="p-4 flex-1 overflow-y-auto">
        {navItems.map((item, index) => {
          if (item.type === 'group') {
            return (
              <div key={index} className="text-[10px] font-bold text-t3 uppercase tracking-[0.1em] px-3 mt-6 mb-2 first:mt-0">
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
              className={`flex items-center gap-3 px-3 py-2 text-[13.5px] font-medium rounded-lg transition-all select-none mb-0.5 ${
                isActive ? 'bg-slate-100 text-t1' : 'text-t2 hover:bg-slate-50 hover:text-t1'
              }`}
            >
              <span className={isActive ? 'text-accent' : 'text-t3 opacity-70'}>{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-accent text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-4 bg-slate-50 rounded-xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-[11px] font-bold text-accent shrink-0 border border-accent/20">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-t1 truncate">{profile?.full_name?.split(' ')[0] || 'Загрузка...'}</div>
          <div className="text-[11px] text-t3 truncate">{profile?.specialization || 'Профиль'}</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Toggle */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-[110] p-2 bg-white rounded-lg border border-border-light shadow-sm text-t2"
        >
          <IconMenu2 size={24} />
        </button>
      )}

      {/* Sidebar Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[120]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[240px] bg-white border-r border-slate-100 flex-col fixed top-0 left-0 h-screen z-[100]">
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
