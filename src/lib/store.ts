'use client';

import { useState, useEffect } from 'react';

// Types
export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
}

export interface Session {
  id: string;
  name: string;
  time: string;
  initials: string;
  bg: string;
  color: string;
  status: string;
  date: string;
  service?: string;
}

export interface ScheduleDay {
  name: string;
  startTime: string;
  endTime: string;
  on: boolean;
}

export interface BlockedSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
}

// Initial Mock Data
const initialServices: Service[] = [
  { id: 's1', name: 'Персональная тренировка', duration: 60, price: 2500 },
  { id: 's2', name: 'Сплит-тренировка', duration: 60, price: 3500 },
  { id: 's3', name: 'Консультация по питанию', duration: 30, price: 1500 },
];

const initialSessions: Session[] = [
  { id: '1', name: 'Анна Иванова', time: '09:00 – 10:00', initials: 'АИ', bg: '#EDE9FE', color: '#7C3AED', status: 'confirmed', date: '2025-05-21' },
  { id: '2', name: 'Дмитрий Макаров', time: '12:00 – 13:00', initials: 'ДМ', bg: '#DCFCE7', color: '#15803D', status: 'confirmed', date: '2025-05-21' },
  { id: '3', name: 'Михаил Козлов', time: '15:00 – 16:00', initials: 'МК', bg: '#FEF3C7', color: '#D97706', status: 'confirmed', date: '2025-05-21' },
  { id: '4', name: 'Елена Петрова', time: '18:00 – 19:00', initials: 'ЕП', bg: '#FEE2E2', color: '#DC2626', status: 'confirmed', date: '2025-05-21' },
];

const initialRequests = [
  { id: 'r1', name: 'Наталья Соколова', time: 'Чт 22 мая · 10:00–11:00', initials: 'НС', status: 'pending' },
  { id: 'r2', name: 'Павел Волков', time: 'Пт 23 мая · 17:00–18:00', initials: 'ПВ', status: 'pending' },
  { id: 'r3', name: 'Ольга Кириллова', time: 'Сб 24 мая · 11:00–12:00', initials: 'ОК', status: 'pending' },
];

const initialSchedule: ScheduleDay[] = [
  { name: 'Понедельник', startTime: '09:00', endTime: '20:00', on: true },
  { name: 'Вторник', startTime: '09:00', endTime: '20:00', on: true },
  { name: 'Среда', startTime: '12:00', endTime: '20:00', on: true },
  { name: 'Четверг', startTime: '09:00', endTime: '20:00', on: true },
  { name: 'Пятница', startTime: '09:00', endTime: '18:00', on: true },
  { name: 'Суббота', startTime: '10:00', endTime: '15:00', on: true },
  { name: 'Воскресенье', startTime: '09:00', endTime: '18:00', on: false },
];

const initialBlocks: BlockedSlot[] = [
  { id: 'b1', date: '2025-05-24', startTime: '14:00', endTime: '16:00', allDay: false },
  { id: 'b2', date: '2025-05-28', startTime: '00:00', endTime: '23:59', allDay: true }
];

export function useStore() {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [requests, setRequests] = useState(initialRequests);
  const [schedule, setSchedule] = useState<ScheduleDay[]>(initialSchedule);
  const [blocks, setBlocks] = useState<BlockedSlot[]>(initialBlocks);
  const [services, setServices] = useState<Service[]>(initialServices);

  // Persistence logic
  useEffect(() => {
    const saved = localStorage.getItem('trainer_space_data_v2');
    if (saved) {
      const data = JSON.parse(saved);
      setSessions(data.sessions || initialSessions);
      setRequests(data.requests || initialRequests);
      setSchedule(data.schedule || initialSchedule);
      setBlocks(data.blocks || initialBlocks);
      setServices(data.services || initialServices);
    }
  }, []);

  const save = (updated: any) => {
    const current = { sessions, requests, schedule, blocks, services, ...updated };
    localStorage.setItem('trainer_space_data_v2', JSON.stringify(current));
  };

  const approveRequest = (id: string) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;

    const newRequests = requests.filter(r => r.id !== id);
    const newSessions = [...sessions, {
        id: Math.random().toString(36).substr(2, 9),
        name: req.name,
        initials: req.initials,
        time: '10:00 – 11:00', // simplified
        status: 'confirmed',
        bg: '#EDE9FE',
        color: '#7C3AED',
        date: '2025-05-22'
    }];

    setRequests(newRequests);
    setSessions(newSessions);
    save({ sessions: newSessions, requests: newRequests });
  };

  const rejectRequest = (id: string) => {
    const newRequests = requests.filter(r => r.id !== id);
    setRequests(newRequests);
    save({ requests: newRequests });
  };

  const cancelSession = (id: string) => {
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    save({ sessions: newSessions });
  };

  const addSession = (session: Omit<Session, 'id' | 'initials' | 'bg' | 'color' | 'status'>) => {
    const initials = session.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const newSession: Session = {
      ...session,
      id: Math.random().toString(36).substr(2, 9),
      initials,
      status: 'confirmed',
      bg: '#EDE9FE',
      color: '#7C3AED',
    };
    const newSessions = [...sessions, newSession];
    setSessions(newSessions);
    save({ sessions: newSessions });
  };

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].on = !newSchedule[index].on;
    setSchedule(newSchedule);
    save({ schedule: newSchedule });
  };

  const updateScheduleTime = (index: number, startTime: string, endTime: string) => {
    const newSchedule = [...schedule];
    newSchedule[index].startTime = startTime;
    newSchedule[index].endTime = endTime;
    setSchedule(newSchedule);
    save({ schedule: newSchedule });
  };

  const addBlock = (block: Omit<BlockedSlot, 'id'>) => {
    const newBlock = { ...block, id: Math.random().toString(36).substr(2, 9) };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    save({ blocks: newBlocks });
  };

  const removeBlock = (id: string) => {
    const newBlocks = blocks.filter(b => b.id !== id);
    setBlocks(newBlocks);
    save({ blocks: newBlocks });
  };

  // Services CRUD
  const addService = (service: Omit<Service, 'id'>) => {
    const newService = { ...service, id: Math.random().toString(36).substr(2, 9) };
    const newServices = [...services, newService];
    setServices(newServices);
    save({ services: newServices });
  };

  const updateService = (id: string, updated: Partial<Service>) => {
    const newServices = services.map(s => s.id === id ? { ...s, ...updated } : s);
    setServices(newServices);
    save({ services: newServices });
  };

  const removeService = (id: string) => {
    const newServices = services.filter(s => s.id !== id);
    setServices(newServices);
    save({ services: newServices });
  };

  return {
    sessions,
    requests,
    schedule,
    blocks,
    services,
    approveRequest,
    rejectRequest,
    cancelSession,
    addSession,
    toggleDay,
    updateScheduleTime,
    addBlock,
    removeBlock,
    addService,
    updateService,
    removeService
  };
}
