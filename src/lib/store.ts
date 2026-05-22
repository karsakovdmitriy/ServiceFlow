'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';

// Types
export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface Session {
  id: string;
  name: string;
  time: string;
  initials: string;
  bg?: string;
  color?: string;
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

const DAYS = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

export function useStore() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [completedSessions, setCompletedSessions] = useState<Session[]>([]);
  const [requests, setRequests] = useState<Session[]>([]);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [blocks, setBlocks] = useState<BlockedSlot[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainerId, setTrainerId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setTrainerId(session.user.id);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTrainerId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (trainerId) {
      fetchData();
    }
  }, [trainerId]);

  const fetchData = async () => {
    if (!trainerId) return;
    setLoading(true);
    try {
      // Fetch Services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('name');
      if (servicesData) setServices(servicesData);

      // Fetch Sessions (Requests, Active, Completed)
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select(`
          id,
          status,
          start_time,
          end_time,
          clients (full_name),
          services (name)
        `)
        .eq('trainer_id', trainerId)
        .order('start_time', { ascending: true });

      if (sessionsData) {
        const formatted = sessionsData.map((s: any) => ({
          id: s.id,
          name: s.clients?.full_name || 'Клиент',
          service: s.services?.name,
          status: s.status,
          date: s.start_time.split('T')[0],
          time: `${s.start_time.split('T')[1].slice(0,5)} – ${s.end_time.split('T')[1].slice(0,5)}`,
          initials: (s.clients?.full_name || 'К').split(' ').map((n: string) => n[0]).join('').toUpperCase()
        }));

        setRequests(formatted.filter(s => s.status === 'pending'));
        setSessions(formatted.filter(s => s.status === 'confirmed'));
        setCompletedSessions(formatted.filter(s => s.status === 'completed'));
      }

      // Fetch Schedule
      const { data: schedData } = await supabase
        .from('schedule_config')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('day_of_week');

      if (schedData && schedData.length > 0) {
        setSchedule(schedData.map(s => ({
          name: DAYS[s.day_of_week],
          startTime: s.start_hour,
          endTime: s.end_hour,
          on: s.is_active
        })));
      }

      // Fetch Blocked Slots
      const { data: blocksData } = await supabase
        .from('blocked_slots')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('date');

      if (blocksData) {
        setBlocks(blocksData.map(b => ({
          id: b.id,
          date: b.date,
          startTime: b.start_hour,
          endTime: b.end_hour,
          allDay: b.all_day
        })));
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('sessions')
      .update({ status })
      .eq('id', id);

    if (!error) fetchData();
  };

  const approveRequest = (id: string) => updateSessionStatus(id, 'confirmed');
  const rejectRequest = (id: string) => updateSessionStatus(id, 'rejected');
  const cancelSession = (id: string) => updateSessionStatus(id, 'cancelled');
  const completeSession = (id: string) => updateSessionStatus(id, 'completed');

  const addSession = async (session: any) => {
    if (!trainerId) return;

    // 1. Get or create client
    let clientId;
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('trainer_id', trainerId)
      .eq('full_name', session.name)
      .maybeSingle();

    if (client) {
      clientId = client.id;
    } else {
      const { data: newClient } = await supabase
        .from('clients')
        .insert({ full_name: session.name, trainer_id: trainerId })
        .select()
        .single();
      clientId = newClient.id;
    }

    // 2. Insert session
    const startTime = `${session.date}T${session.time.split(' – ')[0]}:00Z`;
    const endTime = `${session.date}T${session.time.split(' – ')[1]}:00Z`;

    await supabase.from('sessions').insert({
      trainer_id: trainerId,
      client_id: clientId,
      start_time: startTime,
      end_time: endTime,
      status: 'confirmed'
    });

    fetchData();
  };

  const toggleDay = async (index: number) => {
    if (!trainerId) return;
    const day = schedule[index];
    await supabase
      .from('schedule_config')
      .update({ is_active: !day.on })
      .eq('trainer_id', trainerId)
      .eq('day_of_week', index);

    fetchData();
  };

  const updateScheduleTime = async (index: number, startTime: string, endTime: string) => {
    if (!trainerId) return;
    await supabase
      .from('schedule_config')
      .update({ start_hour: startTime, end_hour: endTime })
      .eq('trainer_id', trainerId)
      .eq('day_of_week', index);

    fetchData();
  };

  const addBlock = async (block: Omit<BlockedSlot, 'id'>) => {
    if (!trainerId) return;
    await supabase.from('blocked_slots').insert({
      trainer_id: trainerId,
      date: block.date,
      start_hour: block.startTime,
      end_hour: block.endTime,
      all_day: block.allDay
    });
    fetchData();
  };

  const removeBlock = async (id: string) => {
    await supabase.from('blocked_slots').delete().eq('id', id);
    fetchData();
  };

  const addService = async (service: Omit<Service, 'id'>) => {
    if (!trainerId) return;
    await supabase.from('services').insert({
      trainer_id: trainerId,
      ...service
    });
    fetchData();
  };

  const updateService = async (id: string, updated: Partial<Service>) => {
    await supabase.from('services').update(updated).eq('id', id);
    fetchData();
  };

  const removeService = async (id: string) => {
    await supabase.from('services').delete().eq('id', id);
    fetchData();
  };

  return {
    sessions,
    completedSessions,
    requests,
    schedule,
    blocks,
    services,
    loading,
    trainerId,
    approveRequest,
    rejectRequest,
    cancelSession,
    completeSession,
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
