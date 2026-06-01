'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  IconCircleCheck,
  IconChevronDown,
  IconUser,
  IconBuildingStore,
  IconFriends,
  IconSearch
} from '@tabler/icons-react';
import { useStore } from '@/lib/store';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const { profile, requests, activeRole, switchActiveRole } = useStore();

  const getNavItems = () => {
    if (activeRole === 'client') {
      return [
        { label: 'Мой профиль', type: 'group' },
        { label: 'Мои записи', icon: <IconCircleCheck size={18} stroke={1.5} />, href: '/my-bookings', id: 'my-bookings' },
        { label: 'Партнеры', icon: <IconFriends size={18} stroke={1.5} />, href: '/partners', id: 'partners' },
        { label: 'Найти мастера', icon: <IconSearch size={18} stroke={1.5} />, href: '/search', id: 'search' },
      ];
    }

    if (activeRole === 'venue') {
      return [
        { label: 'Площадка', type: 'group' },
        { label: 'Обзор', icon: <IconCircleCheck size={18} stroke={1.5} />, href: '/venue/dashboard', id: 'venue-dashboard' },
        { label: 'Мастера', icon: <IconUsers size={18} stroke={1.5} />, href: '/venue/masters', id: 'venue-masters' },
        { label: 'Услуги', icon: <IconStethoscope size={18} stroke={1.5} />, href: '/venue/services', id: 'venue-services' },
      ];
    }

    return [
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
  };

  const navItems = getNavItems();

  const roleLabels = {
    master: { label: 'Мастер', icon: <IconStethoscope size={16} /> },
    client: { label: 'Клиент', icon: <IconUser size={16} /> },
    venue: { label: 'Площадка', icon: <IconBuildingStore size={16} /> },
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '??';

  const SidebarContent = () => (
    <>
      <div className="p-8 pb-4 relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white shrink-0">
            <IconWindow size={18} stroke={1.5} />
          </div>
          <div>
            <div className="text-[15px] font-bold text-t1 tracking-tight leading-none">Окошко</div>
            <div className="text-[11px] text-t3 mt-1 font-medium">Сервис записи</div>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-bg-custom border border-border-light rounded-xl text-[13px] font-bold text-t1 hover:bg-surface transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="text-accent">{roleLabels[activeRole].icon}</span>
              {roleLabels[activeRole].label}
            </div>
            <IconChevronDown size={14} className={`transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {roleMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border-light rounded-xl shadow-xl z-50 overflow-hidden animate-fade-up">
              {(['master', 'client', 'venue'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    switchActiveRole(role);
                    setRoleMenuOpen(false);
                    router.push('/');
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-all hover:bg-bg-custom ${activeRole === role ? 'text-accent bg-accent/5' : 'text-t2'}`}
                >
                  {roleLabels[role].icon}
                  {roleLabels[role].label}
                </button>
              ))}
            </div>
          )}
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
                isActive ? 'bg-bg-custom text-t1 border border-border-light shadow-sm' : 'text-t2 hover:bg-bg-custom hover:text-t1'
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

      <div className="p-4 m-4 bg-bg-custom border border-border-light rounded-xl flex items-center gap-3">
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
          className="lg:hidden fixed top-4 left-4 z-[110] p-2 bg-surface rounded-lg border border-border-light shadow-sm text-t2"
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
      <aside className="hidden lg:flex w-[240px] bg-surface border-r border-border flex-col fixed top-0 left-0 h-screen z-[100]">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-screen w-[260px] bg-surface z-[130] flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
