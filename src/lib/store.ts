'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';

// Types and Mock Data
export interface Service { id: string; name: string; duration: number; price: number; }
export interface Session { id: string; name: string; time: string; initials: string; bg?: string; color?: string; status: string; date: string; service?: string; serviceId?: string; }
export interface ScheduleDay { name: string; startTime: string; endTime: string; on: boolean; }
export interface BlockedSlot { id: string; date: string; startTime: string; endTime: string; allDay: boolean; }
export interface TrainerProfile { full_name: string; specialization: string; email: string; slot_duration: number; }

const DAYS = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

const getTodayStr = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
};

const MOCK_SERVICES = [
  { id: 's1', name: 'Персональная тренировка', duration: 60, price: 2500 },
  { id: 's2', name: 'Сплит-тренировка', duration: 60, price: 3500 },
];

const MOCK_SESSIONS = [
  { id: '1', name: 'Анна Иванова', time: '09:00 – 10:00', initials: 'АИ', status: 'confirmed', date: getTodayStr(0) },
  { id: '2', name: 'Дмитрий Макаров', time: '12:00 – 13:00', initials: 'ДМ', status: 'confirmed', date: getTodayStr(1) },
];

const MOCK_SCHEDULE = DAYS.map((name, i) => ({
  name,
  startTime: '09:00',
  endTime: '20:00',
  on: i !== 0
}));

export function useStore() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [completedSessions, setCompletedSessions] = useState<Session[]>([]);
  const [requests, setRequests] = useState<Session[]>([]);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [blocks, setBlocks] = useState<BlockedSlot[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check Supabase Config
  const hasConfig = process.env.NEXT_PUBLIC_SUPABASE_URL &&
                    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co';

  useEffect(() => {
    if (!hasConfig) {
      setIsDemoMode(true);
      loadDemoData();
      return;
    }

    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user) {
          setTrainerId(session.user.id);
          setIsDemoMode(false);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setIsDemoMode(true);
        loadDemoData();
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTrainerId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, [hasConfig]);

  useEffect(() => {
    if (trainerId && !isDemoMode) {
      fetchData();
    }
  }, [trainerId, isDemoMode]);

  const loadDemoData = () => {
    const saved = localStorage.getItem('trainer_space_demo');
    if (saved) {
      const data = JSON.parse(saved);
      setSessions(data.sessions || MOCK_SESSIONS);
      setCompletedSessions(data.completedSessions || []);
      setRequests(data.requests || []);
      setSchedule(data.schedule || MOCK_SCHEDULE);
      setBlocks(data.blocks || []);
      setServices(data.services || MOCK_SERVICES);
      setProfile(data.profile || { full_name: 'Алексей (Демо)', specialization: 'Тренер', email: 'demo@example.com', slot_duration: 60 });
    } else {
      setSessions(MOCK_SESSIONS);
      setSchedule(MOCK_SCHEDULE);
      setServices(MOCK_SERVICES);
      setProfile({ full_name: 'Алексей (Демо)', specialization: 'Тренер', email: 'demo@example.com', slot_duration: 60 });
    }
    setLoading(false);
  };

  const saveDemoData = (updated: any) => {
    const current = JSON.parse(localStorage.getItem('trainer_space_demo') || '{}');
    const newData = { ...current, ...updated };
    localStorage.setItem('trainer_space_demo', JSON.stringify(newData));
    return newData;
  };

  const fetchData = async () => {
    if (!trainerId) return;
    setLoading(true);
    try {
      const { data: profileData } = await supabase.from('trainers').select('*').eq('id', trainerId).maybeSingle();
      if (profileData) setProfile(profileData);

      const { data: servicesData } = await supabase.from('services').select('*').eq('trainer_id', trainerId).order('name');
      if (servicesData) setServices(servicesData);

      const { data: sessionsData, error: sessErr } = await supabase
        .from('sessions')
        .select(`
          id,
          status,
          start_time,
          end_time,
          client:clients!client_id(full_name),
          service:services!service_id(name, id)
        `)
        .eq('trainer_id', trainerId);

      if (!sessErr && sessionsData) {
        const formatted = sessionsData.map((s: any) => ({
          id: s.id,
          name: s.client?.full_name || 'Клиент',
          service: s.service?.name,
          serviceId: s.service?.id,
          status: s.status,
          date: s.start_time.split('T')[0],
          time: `${s.start_time.split('T')[1].slice(0,5)} – ${s.end_time.split('T')[1].slice(0,5)}`,
          initials: (s.client?.full_name || 'К').split(' ').map((n: string) => n[0]).join('').toUpperCase()
        }));
        setRequests(formatted.filter(s => s.status === 'pending'));
        setSessions(formatted.filter(s => s.status === 'confirmed'));
        setCompletedSessions(formatted.filter(s => s.status === 'completed'));
      }

      const { data: schedData } = await supabase.from('schedule_config').select('*').eq('trainer_id', trainerId).order('day_of_week');
      if (schedData && schedData.length > 0) {
        const sorted = [...schedData].sort((a, b) => (a.day_of_week === 0 ? 7 : a.day_of_week) - (b.day_of_week === 0 ? 7 : b.day_of_week));
        setSchedule(sorted.map(s => ({
          name: DAYS[s.day_of_week],
          startTime: s.start_hour?.slice(0, 5) || '09:00',
          endTime: s.end_hour?.slice(0, 5) || '20:00',
          on: s.is_active
        })));
      }

      const { data: blocksData } = await supabase.from('blocked_slots').select('*').eq('trainer_id', trainerId).order('date');
      if (blocksData) {
        setBlocks(blocksData.map(b => ({
          id: b.id,
          date: b.date,
          startTime: b.start_hour?.slice(0, 5) || '00:00',
          endTime: b.end_hour?.slice(0, 5) || '23:59',
          allDay: b.all_day
        })));
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updated: Partial<TrainerProfile>) => {
    if (isDemoMode) {
      const newProfile = { ...profile!, ...updated };
      setProfile(newProfile);
      saveDemoData({ profile: newProfile });
      return { error: null };
    }
    const { error } = await supabase.from('trainers').update(updated).eq('id', trainerId);
    if (!error) fetchData();
    return { error };
  };

  const updateSessionStatus = async (id: string, status: string) => {
    if (isDemoMode) {
        const all = [...sessions, ...requests, ...completedSessions];
        const session = all.find(s => s.id === id);
        if (session) {
            const updated = { ...session, status };
            const newRequests = requests.filter(s => s.id !== id);
            const newSessions = sessions.filter(s => s.id !== id);
            const newCompleted = completedSessions.filter(s => s.id !== id);
            if (status === 'pending') newRequests.push(updated);
            else if (status === 'confirmed') newSessions.push(updated);
            else if (status === 'completed') newCompleted.push(updated);
            setRequests(newRequests); setSessions(newSessions); setCompletedSessions(newCompleted);
            saveDemoData({ requests: newRequests, sessions: newSessions, completedSessions: newCompleted });
        }
        return;
    }
    await supabase.from('sessions').update({ status }).eq('id', id);
    fetchData();
  };

  const addSession = async (session: any) => {
    if (isDemoMode) {
      const newSession = {
        ...session,
        id: Math.random().toString(),
        status: 'confirmed',
        initials: session.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        time: `${session.startTime} – ${session.endTime}`
      };
      const newSess = [...sessions, newSession];
      setSessions(newSess);
      saveDemoData({ sessions: newSess });
      return;
    }

    let clientId;
    const { data: client } = await supabase.from('clients').select('id').eq('trainer_id', trainerId).eq('full_name', session.name).maybeSingle();
    if (client) clientId = client.id;
    else {
      const { data: newClient } = await supabase.from('clients').insert({ full_name: session.name, trainer_id: trainerId }).select().single();
      clientId = newClient?.id;
    }

    const startTime = `${session.date}T${session.startTime}:00`;
    const endTime = `${session.date}T${session.endTime}:00`;

    await supabase.from('sessions').insert({
      trainer_id: trainerId,
      client_id: clientId,
      service_id: session.serviceId,
      start_time: startTime,
      end_time: endTime,
      status: 'confirmed'
    });
    fetchData();
  };

  const addBlock = async (block: Omit<BlockedSlot, 'id'>) => {
    if (isDemoMode) {
      const newB = { ...block, id: Math.random().toString() };
      const newBlocks = [...blocks, newB];
      setBlocks(newBlocks);
      saveDemoData({ blocks: newBlocks });
      return;
    }
    await supabase.from('blocked_slots').insert({
      trainer_id: trainerId,
      date: block.date,
      start_hour: block.allDay ? null : block.startTime,
      end_hour: block.allDay ? null : block.endTime,
      all_day: block.allDay
    });
    fetchData();
  };

  const removeBlock = async (id: string) => {
    if (isDemoMode) {
      const newB = blocks.filter(b => b.id !== id);
      setBlocks(newB);
      saveDemoData({ blocks: newB });
      return;
    }
    await supabase.from('blocked_slots').delete().eq('id', id);
    fetchData();
  };

  const toggleDay = async (idx: number) => {
    const day = schedule[idx];
    const dayOfWeek = DAYS.indexOf(day.name);
    if (isDemoMode) {
        const newSched = [...schedule];
        newSched[idx].on = !newSched[idx].on;
        setSchedule(newSched);
        saveDemoData({ schedule: newSched });
        return;
    }
    await supabase.from('schedule_config').update({ is_active: !day.on }).eq('trainer_id', trainerId).eq('day_of_week', dayOfWeek);
    fetchData();
  };

  const updateScheduleTime = async (idx: number, startTime: string, endTime: string) => {
    const day = schedule[idx];
    const dayOfWeek = DAYS.indexOf(day.name);
    if (isDemoMode) {
        const newSched = [...schedule];
        newSched[idx].startTime = startTime;
        newSched[idx].endTime = endTime;
        setSchedule(newSched);
        saveDemoData({ schedule: newSched });
        return;
    }
    await supabase.from('schedule_config').update({ start_hour: startTime, end_hour: endTime }).eq('trainer_id', trainerId).eq('day_of_week', dayOfWeek);
    fetchData();
  };

  const addService = async (service: Omit<Service, 'id'>) => {
    if (isDemoMode) {
      const newS = { ...service, id: Math.random().toString() };
      const newServices = [...services, newS];
      setServices(newServices);
      saveDemoData({ services: newServices });
      return;
    }
    await supabase.from('services').insert({ trainer_id: trainerId, ...service });
    fetchData();
  };

  const updateService = async (id: string, service: Partial<Service>) => {
    if (isDemoMode) {
      const newServices = services.map(s => s.id === id ? { ...s, ...service } : s);
      setServices(newServices);
      saveDemoData({ services: newServices });
      return;
    }
    await supabase.from('services').update(service).eq('id', id);
    fetchData();
  };

  const removeService = async (id: string) => {
    if (isDemoMode) {
      const newS = services.filter(s => s.id !== id);
      setServices(newS);
      saveDemoData({ services: newS });
      return;
    }
    await supabase.from('services').delete().eq('id', id);
    fetchData();
  };

  return {
    sessions, completedSessions, requests, schedule, blocks, services, profile,
    loading, trainerId, isDemoMode,
    updateProfile, approveRequest: (id: string) => updateSessionStatus(id, 'confirmed'),
    rejectRequest: (id: string) => updateSessionStatus(id, 'rejected'),
    cancelSession: (id: string) => updateSessionStatus(id, 'cancelled'),
    completeSession: (id: string) => updateSessionStatus(id, 'completed'),
    addSession, addService, updateService, addBlock, removeBlock, toggleDay, updateScheduleTime, removeService
  };
}
