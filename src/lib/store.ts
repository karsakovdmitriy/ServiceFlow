'use client';

import { useState, useEffect } from 'react';

// Initial Mock Data
const initialSessions = [
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

const initialSchedule = [
  { name: 'Понедельник', time: '09:00 – 20:00', on: true },
  { name: 'Вторник', time: '09:00 – 20:00', on: true },
  { name: 'Среда', time: '12:00 – 20:00', on: true },
  { name: 'Четверг', time: '09:00 – 20:00', on: true },
  { name: 'Пятница', time: '09:00 – 18:00', on: true },
  { name: 'Суббота', time: '10:00 – 15:00', on: true },
  { name: 'Воскресенье', time: '—', on: false },
];

const initialBlocks = [
  '24 мая · 14:00–16:00',
  '28 мая · весь день'
];

export function useStore() {
  const [sessions, setSessions] = useState(initialSessions);
  const [requests, setRequests] = useState(initialRequests);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [blocks, setBlocks] = useState(initialBlocks);

  // Persistence logic (localStorage for prototype)
  useEffect(() => {
    const saved = localStorage.getItem('trainer_space_data');
    if (saved) {
      const data = JSON.parse(saved);
      setSessions(data.sessions || initialSessions);
      setRequests(data.requests || initialRequests);
      setSchedule(data.schedule || initialSchedule);
      setBlocks(data.blocks || initialBlocks);
    }
  }, []);

  const save = (data: any) => {
    localStorage.setItem('trainer_space_data', JSON.stringify(data));
  };

  const approveRequest = (id: string) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;

    const newRequests = requests.filter(r => r.id !== id);
    const newSessions = [...sessions, {
        ...req,
        status: 'confirmed',
        bg: '#EDE9FE', // default
        color: '#7C3AED',
        date: '2025-05-22' // mock date
    }];

    setRequests(newRequests);
    setSessions(newSessions);
    save({ sessions: newSessions, requests: newRequests, schedule, blocks });
  };

  const rejectRequest = (id: string) => {
    const newRequests = requests.filter(r => r.id !== id);
    setRequests(newRequests);
    save({ sessions, requests: newRequests, schedule, blocks });
  };

  const cancelSession = (id: string) => {
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    save({ sessions: newSessions, requests, schedule, blocks });
  };

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].on = !newSchedule[index].on;
    setSchedule(newSchedule);
    save({ sessions, requests, schedule: newSchedule, blocks });
  };

  const addBlock = (text: string) => {
    const newBlocks = [...blocks, text];
    setBlocks(newBlocks);
    save({ sessions, requests, schedule, blocks: newBlocks });
  };

  const removeBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
    save({ sessions, requests, schedule, blocks: newBlocks });
  };

  return {
    sessions,
    requests,
    schedule,
    blocks,
    approveRequest,
    rejectRequest,
    cancelSession,
    toggleDay,
    addBlock,
    removeBlock
  };
}
