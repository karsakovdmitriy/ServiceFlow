'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

// Types and Mock Data
export interface Venue { id: string; owner_id: string; name: string; address?: string; phone?: string; email?: string; telegram_id?: string; description?: string; telegram_bot_token?: string; }
export interface Service { id: string; owner_id: string; name: string; duration: number; price: number; is_group: boolean; venue_id?: string | null; master_id?: string | null; venue?: Venue; master?: Master; }
export interface Client { id: string; owner_id: string; user_id?: string; full_name: string; email?: string; phone?: string; telegram_id?: string; is_active: boolean; created_at: string; }
export interface Session { id: string; name: string; time: string; initials: string; bg?: string; color?: string; status: string; date: string; service?: string; serviceId?: string; clientId?: string; masterId?: string; }
export interface ScheduleDay { name: string; startTime: string; endTime: string; on: boolean; }
export interface BlockedSlot { id: string; master_id: string; date: string; startTime: string; endTime: string; allDay: boolean; }
export interface Partnership { id: string; user_id: string; partner_id: string; status: 'pending' | 'accepted'; partner_name?: string; }
export interface VenueStaff { id: string; venue_id: string; master_id: string; master_name?: string; }
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  is_master: boolean;
  is_client: boolean;
  is_venue: boolean;
  onboarding_completed_master: boolean;
  onboarding_completed_client: boolean;
  onboarding_completed_venue: boolean;
  subscription_tier?: 'free' | 'pro' | 'business';
  subscription_status?: string;
  subscription_period_end?: string;
}
export interface Master {
  id: string;
  user_id?: string;
  full_name: string;
  specialization?: string;
  avatar_url?: string;
  phone?: string;
  slot_duration: number;
  telegram_id?: string;
  telegram_bot_token?: string;
  category?: string;
  created_at: string;
}
export interface Message { id: string; profile_id: string; client_id: string; sender_type: 'master' | 'client'; text: string; read: boolean; created_at: string; }
export interface Event { id: string; profile_id: string; type: string; message: string; read: boolean; created_at: string; }
export interface Review { id: string; master_id: string; rating: number; comment?: string; created_at: string; client_name?: string; }

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

const getTodayStr = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
};

const MOCK_VENUES = [
  { id: 'v1', owner_id: 'demo-user', name: 'Gym 24/7', address: 'ул. Пушкина, 10' },
  { id: 'v2', owner_id: 'demo-user', name: 'Спорт-Лайф', address: 'пр. Мира, 5' },
];

const MOCK_SERVICES = [
  { id: 's1', owner_id: 'demo-user', name: 'Персональная тренировка', duration: 60, price: 2500, is_group: false, venue_id: 'v1' },
  { id: 's2', owner_id: 'demo-user', name: 'Сплит-тренировка', duration: 60, price: 3500, is_group: false, venue_id: 'v1' },
  { id: 's3', owner_id: 'demo-user', name: 'Групповая тренировка', duration: 60, price: 1000, is_group: true, venue_id: 'v2' },
];

const MOCK_SESSIONS = [
  { id: '1', name: 'Анна Иванова', time: '09:00 – 10:00', initials: 'АИ', status: 'confirmed', date: getTodayStr(0) },
  { id: '2', name: 'Дмитрий Макаров', time: '12:00 – 13:00', initials: 'ДМ', status: 'confirmed', date: getTodayStr(1) },
];

const MOCK_REQUESTS = [
  { id: 'req1', name: 'Мария Сидорова', time: '15:00 – 16:00', initials: 'МС', status: 'pending', date: getTodayStr(2) },
];

const MOCK_SCHEDULE = DAYS.map((name, i) => ({
  name,
  startTime: '09:00',
  endTime: '20:00',
  on: i !== 6 // Sunday (last in DAYS) is off by default
}));

interface StoreContextType {
  sessions: Session[];
  completedSessions: Session[];
  requests: Session[];
  clients: Client[];
  schedule: ScheduleDay[];
  blocks: BlockedSlot[];
  services: Service[];
  venues: Venue[];
  events: Event[];
  reviews: Review[];
  profile: Profile | null;
  masters: Master[];
  activeMaster: Master | null;
  activeRole: 'master' | 'client' | 'venue';
  partners: Partnership[];
  venueStaff: VenueStaff[];
  loading: boolean;
  userId: string | null;
  isDemoMode: boolean;
  switchActiveRole: (role: 'master' | 'client' | 'venue') => void;
  updateProfile: (updated: Partial<Profile>) => Promise<{ error: any }>;
  approveRequest: (id: string, masterId?: string) => Promise<void>;
  rejectRequest: (id: string, reschedule?: boolean) => Promise<void>;
  sendMessage: (clientId: string, text: string) => Promise<void>;
  getMessages: (clientId: string) => Promise<Message[]>;
  logEvent: (type: string, message: string) => Promise<void>;
  markEventsAsRead: () => Promise<void>;
  cancelSession: (id: string) => Promise<void>;
  completeSession: (id: string) => Promise<void>;
  addSession: (session: any) => Promise<void>;
  addService: (service: Omit<Service, 'id' | 'venue' | 'master'>) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  addVenue: (venue: Omit<Venue, 'id'>) => Promise<{ error: any }>;
  updateVenue: (id: string, venue: Partial<Venue>) => Promise<{ error: any }>;
  removeVenue: (id: string) => Promise<void>;
  addBlock: (block: Omit<BlockedSlot, 'id'>) => Promise<void>;
  removeBlock: (id: string) => Promise<void>;
  addPartnership: (partnerEmail: string) => Promise<void>;
  removePartnership: (partnershipId: string) => Promise<void>;
  addVenueStaff: (venueId: string, masterId: string) => Promise<void>;
  addMasterByEmail: (venueId: string, masterEmail: string) => Promise<void>;
  removeVenueStaff: (staffId: string) => Promise<void>;
  getAllMasters: () => Promise<Master[]>;
  addMaster: (master: Omit<Master, 'id' | 'created_at'>) => Promise<{ data: Master | null, error: any }>;
  updateMaster: (id: string, master: Partial<Master>) => Promise<{ error: any }>;
  removeMaster: (id: string) => Promise<void>;
  toggleDay: (idx: number) => Promise<void>;
  updateScheduleTime: (idx: number, startTime: string, endTime: string) => Promise<void>;
  removeService: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [completedSessions, setCompletedSessions] = useState<Session[]>([]);
  const [requests, setRequests] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [blocks, setBlocks] = useState<BlockedSlot[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [masters, setMasters] = useState<Master[]>([]);
  const [activeMaster, setActiveMaster] = useState<Master | null>(null);
  const [activeRole, setActiveRole] = useState<'master' | 'client' | 'venue'>('master');
  const [partners, setPartners] = useState<Partnership[]>([]);
  const [venueStaff, setVenueStaff] = useState<VenueStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

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
          setUserId(session.user.id);
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
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, [hasConfig]);

  useEffect(() => {
    if (userId && !isDemoMode) {
      fetchData();
    }
  }, [userId, isDemoMode]);

  const loadDemoData = () => {
    const saved = localStorage.getItem('trainer_space_demo');
    if (saved) {
      const data = JSON.parse(saved);
      setSessions(data.sessions || MOCK_SESSIONS);
      setCompletedSessions(data.completedSessions || []);
      setRequests(data.requests || MOCK_REQUESTS);
      setSchedule(data.schedule || MOCK_SCHEDULE);
      setBlocks(data.blocks || []);
      setServices(data.services || MOCK_SERVICES);
      setVenues(data.venues || MOCK_VENUES);
      setEvents(data.events || []);
      setProfile(data.profile || {
        id: 'demo-user',
        full_name: 'Алексей (Демо)', email: 'demo@example.com',
        is_master: false, is_client: false, is_venue: false,
        onboarding_completed_master: false, onboarding_completed_client: false, onboarding_completed_venue: false
      });
      setMasters(data.masters || []);
      setActiveMaster(data.activeMaster || null);
      setActiveRole(data.activeRole || 'master');
      setPartners(data.partners || []);
      setVenueStaff(data.venueStaff || []);
    } else {
      setSessions(MOCK_SESSIONS);
      setRequests(MOCK_REQUESTS);
      setSchedule(MOCK_SCHEDULE);
      setServices(MOCK_SERVICES);
      setVenues(MOCK_VENUES);
      setProfile({
        id: 'demo-user',
        full_name: 'Алексей (Демо)', email: 'demo@example.com',
        is_master: false, is_client: false, is_venue: false,
        onboarding_completed_master: false, onboarding_completed_client: false, onboarding_completed_venue: false
      });
      setActiveRole('master');
    }
    setLoading(false);
  };

  const saveDemoData = (updated: any) => {
    const current = JSON.parse(localStorage.getItem('trainer_space_demo') || '{}');
    const newData = { ...current, ...updated };
    localStorage.setItem('trainer_space_demo', JSON.stringify(newData));
    return newData;
  };

  const fetchData = async (roleOverride?: 'master' | 'client' | 'venue') => {
    if (!userId) return;
    const role = roleOverride || activeRole;
    setLoading(true);
    try {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (profileData) {
        setProfile(profileData);
        // Ensure activeRole is one of the enabled roles
        if (role === 'master' && !profileData.is_master) {
          if (profileData.is_client) { setActiveRole('client'); return fetchData('client'); }
          if (profileData.is_venue) { setActiveRole('venue'); return fetchData('venue'); }
        } else if (role === 'client' && !profileData.is_client) {
          if (profileData.is_master) { setActiveRole('master'); return fetchData('master'); }
          if (profileData.is_venue) { setActiveRole('venue'); return fetchData('venue'); }
        } else if (role === 'venue' && !profileData.is_venue) {
          if (profileData.is_master) { setActiveRole('master'); return fetchData('master'); }
          if (profileData.is_client) { setActiveRole('client'); return fetchData('client'); }
        }
      }

      // Fetch masters linked to this user
      const { data: mastersData } = await supabase.from('masters').select('*').eq('user_id', userId);
      if (mastersData) {
        setMasters(mastersData);
        // Find the "primary" master record for the current user
        const primaryMaster = mastersData.find(m => m.user_id === userId) || mastersData[0];
        if (primaryMaster && (!activeMaster || !mastersData.find(m => m.id === activeMaster.id))) {
          setActiveMaster(primaryMaster);
        }
      }

      if (role === 'master' && mastersData && mastersData.length > 0) {
        const currentMasterId = activeMaster?.id || mastersData[0].id;
        
        const { data: venuesData } = await supabase.from('venues').select('*').eq('owner_id', userId).order('created_at');
        if (venuesData) setVenues(venuesData);

        const { data: servicesData } = await supabase.from('services')
          .select('*, venues!venue_id(id, name, address), masters!master_id(id, full_name)')
          .or(`owner_id.eq.${userId},master_id.eq.${currentMasterId}`)
          .order('name');
        if (servicesData) {
          setServices(servicesData.map(s => ({
            ...s,
            venue: s.venues,
            master: s.masters
          })));
        }

        const { data: clientsData } = await supabase.from('clients').select('*').eq('owner_id', userId).order('full_name');
        if (clientsData) setClients(clientsData);

        const { data: sessionsData, error: sessErr } = await supabase
          .from('sessions')
          .select(`
            id,
            status,
            start_time,
            end_time,
            client:clients!client_id(id, full_name),
            service:services!service_id(name, id, price)
          `)
          .eq('master_id', currentMasterId);

        if (!sessErr && sessionsData) {
          const formatted = sessionsData.map((s: any) => ({
            id: s.id,
            name: s.client?.full_name || 'Клиент',
            clientId: s.client?.id,
            service: s.service?.name,
            serviceId: s.service?.id,
            price: s.service?.price || 0,
            status: s.status,
            date: s.start_time.split('T')[0],
            time: `${s.start_time.split('T')[1].slice(0,5)} – ${s.end_time.split('T')[1].slice(0,5)}`,
            initials: (() => {
              const name = (s.client?.full_name || 'К').split('(')[0].trim();
              const parts = name.split(/\s+/).filter((p: string) => p.length > 0);
              if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
              return parts[0].slice(0, 2).toUpperCase();
            })()
          }));
          setRequests(formatted.filter(s => s.status === 'pending'));
          setSessions(formatted.filter(s => s.status === 'confirmed'));
          setCompletedSessions(formatted.filter(s => s.status === 'completed'));
        }

        const { data: schedData } = await supabase.from('schedule_config').select('*').eq('master_id', currentMasterId).order('day_of_week');
        if (schedData && schedData.length > 0) {
          const sorted = [...schedData].sort((a, b) => (a.day_of_week === 0 ? 7 : a.day_of_week) - (b.day_of_week === 0 ? 7 : b.day_of_week));
          setSchedule(sorted.map(s => ({
            name: DAYS[(s.day_of_week + 6) % 7],
            startTime: s.start_hour?.slice(0, 5) || '09:00',
            endTime: s.end_hour?.slice(0, 5) || '20:00',
            on: s.is_active
          })));
        } else {
          setSchedule(DAYS.map((name, i) => ({
            name,
            startTime: '09:00',
            endTime: '20:00',
            on: i !== 6 // Sunday is last in DAYS now
          })));
        }

        const { data: blocksData } = await supabase.from('blocked_slots').select('*').eq('master_id', currentMasterId).order('date');
        if (blocksData) {
          setBlocks(blocksData.map(b => ({
            id: b.id,
            master_id: b.master_id,
            date: b.date,
            startTime: b.start_hour?.slice(0, 5) || '00:00',
            endTime: b.end_hour?.slice(0, 5) || '23:59',
            allDay: b.all_day
          })));
        }

        const { data: eventsData } = await supabase.from('events').select('*').eq('profile_id', userId).order('created_at', { ascending: false }).limit(20);
        if (eventsData) setEvents(eventsData.map(e => ({ ...e, read: e.read ?? true })));

        const { data: reviewsData } = await supabase.from('reviews').select('*, clients(full_name)').eq('master_id', currentMasterId).order('created_at', { ascending: false });
        if (reviewsData) {
          setReviews(reviewsData.map(r => ({
            id: r.id,
            master_id: r.master_id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            client_name: (r.clients as any)?.full_name
          })));
        }
      } else if (role === 'client') {
        const { data: myClientRecords } = await supabase.from('clients').select('id').eq('user_id', userId);
        const myClientIds = myClientRecords?.map(c => c.id) || [];

        if (myClientIds.length > 0) {
          const { data: sessionsData } = await supabase
            .from('sessions')
            .select(`
              id,
              status,
              start_time,
              end_time,
              master:masters!master_id(full_name),
              service:services!service_id(name, id)
            `)
            .in('client_id', myClientIds);

          if (sessionsData) {
            const formatted = sessionsData.map((s: any) => ({
              id: s.id,
              name: s.master?.full_name || 'Мастер',
              service: s.service?.name,
              serviceId: s.service?.id,
              status: s.status,
              date: s.start_time.split('T')[0],
              time: `${s.start_time.split('T')[1].slice(0,5)} – ${s.end_time.split('T')[1].slice(0,5)}`,
              initials: (s.master?.full_name || 'М').slice(0, 2).toUpperCase()
            }));
            setSessions(formatted.filter(s => s.status === 'confirmed'));
            setRequests(formatted.filter(s => s.status === 'pending'));
          }
        }

        const { data: partnersData } = await supabase.from('partnerships')
          .select('*, partner:profiles!partner_id(full_name)')
          .eq('user_id', userId);
        if (partnersData) {
          setPartners(partnersData.map(p => ({
            ...p,
            partner_name: (p.partner as any)?.full_name
          })));
        }
      } else if (role === 'venue') {
        const { data: myVenues } = await supabase.from('venues').select('*').eq('owner_id', userId).order('created_at');
        if (myVenues && myVenues.length > 0) {
          setVenues(myVenues);
          const venueIds = myVenues.map(v => v.id);
          let currentStaff: any[] = [];

          const { data: staffData } = await supabase.from('venue_staff').select('*, master:masters!master_id(full_name)').in('venue_id', venueIds);
          if (staffData) {
            currentStaff = staffData.map(s => ({ ...s, master_name: (s.master as any)?.full_name }));
            setVenueStaff(currentStaff);
          }

          const { data: sessionsData } = await supabase
            .from('sessions')
            .select(`
              id, status, start_time, end_time,
              client:clients!client_id(full_name),
              master:masters!master_id(full_name),
              service:services!service_id(name)
            `)
            .in('venue_id', venueIds);

          if (sessionsData) {
            const formatted = sessionsData.map((s: any) => ({
              id: s.id,
              name: `${s.master?.full_name} > ${s.client?.full_name}`,
              service: s.service?.name,
              status: s.status,
              date: s.start_time.split('T')[0],
              time: `${s.start_time.split('T')[1].slice(0,5)} – ${s.end_time.split('T')[1].slice(0,5)}`,
              initials: 'VS'
            }));
            setSessions(formatted.filter(s => s.status === 'confirmed'));
            setRequests(formatted.filter(s => s.status === 'pending'));
            setCompletedSessions(formatted.filter(s => s.status === 'completed'));
          }

          // Fetch Venue Schedule
          if (venueIds.length > 0) {
            const { data: schedData } = await supabase.from('venue_schedule').select('*').eq('venue_id', venueIds[0]).order('day_of_week');
            if (schedData && schedData.length > 0) {
              const sorted = [...schedData].sort((a, b) => (a.day_of_week === 0 ? 7 : a.day_of_week) - (b.day_of_week === 0 ? 7 : b.day_of_week));
              setSchedule(sorted.map(s => ({
              name: DAYS[(s.day_of_week + 6) % 7],
                startTime: s.start_hour?.slice(0, 5) || '09:00',
                endTime: s.end_hour?.slice(0, 5) || '20:00',
                on: s.is_active
              })));
            } else {
              setSchedule(DAYS.map((name, i) => ({
                name,
                startTime: '09:00',
                endTime: '20:00',
                on: i !== 6
              })));
            }
          }

          // Fetch Clients for Venue
          const { data: clientsData } = await supabase.from('clients').select('*').in('owner_id', [userId]);
          if (clientsData) setClients(clientsData);

          // Fetch Reviews for Venue
          const { data: reviewsData } = await supabase.from('reviews').select('*, clients(full_name)').in('venue_id', venueIds);
          if (reviewsData) {
            setReviews(reviewsData.map(r => ({
              id: r.id,
              master_id: r.master_id,
              rating: r.rating,
              comment: r.comment,
              created_at: r.created_at,
              client_name: (r.clients as any)?.full_name
            })));
          }
        } else {
          setVenues([]);
          setVenueStaff([]);
          setSessions([]);
          setRequests([]);
          setCompletedSessions([]);
          setSchedule([]);
          setClients([]);
          setReviews([]);
        }
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updated: Partial<Profile>) => {
    // Explicitly allow only valid profile fields to prevent PGRST204 errors
    const allowedFields = [
      'full_name', 'email', 'phone', 'avatar_url',
      'is_master', 'is_client', 'is_venue',
      'onboarding_completed_master', 'onboarding_completed_client', 'onboarding_completed_venue',
      'subscription_tier', 'subscription_status', 'subscription_period_end'
    ];

    const filteredUpdate = Object.keys(updated)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key as keyof Profile] = updated[key as keyof Profile];
        return obj;
      }, {} as any);

    if (isDemoMode) {
      const newProfile = { ...profile!, ...filteredUpdate };
      setProfile(newProfile);
      saveDemoData({ profile: newProfile });
      logEvent('system', 'Профиль обновлен (Демо)');
      return { error: null };
    }
    const { error } = await supabase.from('profiles').update(filteredUpdate).eq('id', userId);
    if (error) {
      console.error('Update profile error:', error);
    } else {
      logEvent('system', 'Профиль обновлен');
      fetchData();
    }
    return { error };
  };

  const updateSessionStatus = async (id: string, status: string, reschedule: boolean = false, assignedMasterId?: string) => {
    if (isDemoMode) {
        const all = [...sessions, ...requests, ...completedSessions];
        const session = all.find(s => s.id === id);
        if (session) {
            const updated = { ...session, status };
            const newRequests = requests.filter(s => s.id !== id);
            const newSessions = sessions.filter(s => s.id !== id);
            const newCompleted = completedSessions.filter(s => s.id !== id);
            if (status === 'pending') newRequests.push(updated);
            else if (status === 'confirmed') {
                if (assignedMasterId) updated.name = `(Назначен) ${session.name}`;
                newSessions.push(updated);
                logEvent('booking', `Запись ${session.name} подтверждена`);
            }
            else if (status === 'completed') {
                newCompleted.push(updated);
                logEvent('booking', `Запись ${session.name} завершена`);
            }
            else if (status === 'rejected') {
                logEvent('booking', `Запись ${session.name} отклонена`);
            }
            setRequests(newRequests); setSessions(newSessions); setCompletedSessions(newCompleted);
            saveDemoData({ requests: newRequests, sessions: newSessions, completedSessions: newCompleted });
        }
        return;
    }
    const { data: currentSession } = await supabase.from('sessions').select('client:clients!client_id(full_name)').eq('id', id).single();
    const clientName = (currentSession?.client as any)?.full_name || 'Клиент';

    const updateData: any = { status };
    if (assignedMasterId) updateData.master_id = assignedMasterId;

    const { error } = await supabase.from('sessions').update(updateData).eq('id', id);

    if (!error) {
        if (status === 'confirmed') logEvent('booking', `Запись ${clientName} подтверждена`);
        else if (status === 'completed') logEvent('booking', `Запись ${clientName} завершена`);
        else if (status === 'rejected') logEvent('booking', `Запись ${clientName} отклонена`);
    }

    if (!error && status === 'rejected' && reschedule) {
       // Notify client about rejection with reschedule request
       const { data: sessionData } = await supabase.from('sessions').select('client:clients!client_id(telegram_id), master:masters!master_id(full_name)').eq('id', id).single();
       if (sessionData && (sessionData.client as any)?.telegram_id) {
          const message = `❌ <b>Мастер ${(sessionData.master as any)?.full_name} отклонил вашу заявку.</b>\n\nНо он предлагает вам выбрать другое время! Пожалуйста, воспользуйтесь меню бота для повторной записи.`;
          await fetch('/api/notify/custom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId: (sessionData.client as any).telegram_id, message })
          });
       }
    }

    if (!error && (status === 'confirmed' || status === 'completed')) {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id, status })
      }).catch(err => console.error('Notification trigger error:', err));
    }
    fetchData();
  };

  const addSession = async (session: any) => {
    const currentMasterId = activeMaster?.id;
    if (isDemoMode) {
      const newSession = {
        ...session,
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
        status: 'confirmed',
        initials: (() => {
            const name = session.name.split('(')[0].trim();
            const parts = name.split(/\s+/);
            if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
            return parts[0].slice(0, 2).toUpperCase();
        })(),
        time: `${session.startTime} – ${session.endTime}`,
        masterId: currentMasterId
      };
      const newSess = [...sessions, newSession];
      setSessions(newSess);
      saveDemoData({ sessions: newSess });
      return;
    }

    let clientId;
    const { data: client } = await supabase.from('clients').select('id').eq('owner_id', userId).eq('full_name', session.name).maybeSingle();
    if (client) clientId = client.id;
    else {
      const { data: newClient } = await supabase.from('clients').insert({ full_name: session.name, owner_id: userId }).select().single();
      clientId = newClient?.id;
    }

    const startTime = `${session.date}T${session.startTime}:00`;
    const endTime = `${session.date}T${session.endTime}:00`;

    const selectedService = services.find(s => s.id === session.serviceId);

    await supabase.from('sessions').insert({
      master_id: currentMasterId,
      client_id: clientId,
      service_id: session.serviceId,
      venue_id: selectedService?.venue_id,
      start_time: startTime,
      end_time: endTime,
      status: 'confirmed'
    });
    logEvent('booking', `Добавлена новая запись: ${session.name}`);
    fetchData();
  };

  const addBlock = async (block: Omit<BlockedSlot, 'id'>) => {
    const currentMasterId = activeMaster?.id;
    if (isDemoMode) {
      const newB = { ...block, id: Math.random().toString(), master_id: currentMasterId || 'demo-master' };
      const newBlocks = [...blocks, newB];
      setBlocks(newBlocks);
      saveDemoData({ blocks: newBlocks });
      return;
    }
    await supabase.from('blocked_slots').insert({
      master_id: currentMasterId,
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
    // Map our UI index to DB index (0 is Sunday, 1 is Monday ...)
    const dbDayOfWeek = (idx + 1) % 7;
    if (isDemoMode) {
        const newSched = [...schedule];
        newSched[idx].on = !newSched[idx].on;
        setSchedule(newSched);
        saveDemoData({ schedule: newSched });
        return;
    }
    if (activeRole === 'venue' && venues.length > 0) {
      await supabase.from('venue_schedule').upsert({
        venue_id: venues[0].id,
        day_of_week: dbDayOfWeek,
        is_active: !day.on
      }, { onConflict: 'venue_id,day_of_week' });
    } else {
      await supabase.from('schedule_config').upsert({
        master_id: activeMaster?.id,
        day_of_week: dbDayOfWeek,
        is_active: !day.on
      }, { onConflict: 'master_id,day_of_week' });
    }
    fetchData();
  };

  const updateScheduleTime = async (idx: number, startTime: string, endTime: string) => {
    const day = schedule[idx];
    const dbDayOfWeek = (idx + 1) % 7;
    if (isDemoMode) {
        const newSched = [...schedule];
        newSched[idx].startTime = startTime;
        newSched[idx].endTime = endTime;
        setSchedule(newSched);
        saveDemoData({ schedule: newSched });
        return;
    }
    if (activeRole === 'venue' && venues.length > 0) {
      await supabase.from('venue_schedule').upsert({
        venue_id: venues[0].id,
        day_of_week: dbDayOfWeek,
        start_hour: startTime,
        end_hour: endTime
      }, { onConflict: 'venue_id,day_of_week' });
    } else {
      await supabase.from('schedule_config').upsert({
        master_id: activeMaster?.id,
        day_of_week: dbDayOfWeek,
        start_hour: startTime,
        end_hour: endTime
      }, { onConflict: 'master_id,day_of_week' });
    }
    fetchData();
  };

  const addService = async (service: Omit<Service, 'id' | 'venue' | 'master'>) => {
    if (isDemoMode) {
      const venue = service.venue_id ? venues.find(v => v.id === service.venue_id) : undefined;
      const master = service.master_id ? masters.find(m => m.id === service.master_id) : undefined;
      const newS = { ...service, id: Math.random().toString(), venue, master };
      const newServices = [...services, newS as Service];
      setServices(newServices);
      saveDemoData({ services: newServices });
      return;
    }
    await supabase.from('services').insert({
      ...service,
      owner_id: userId,
      master_id: service.master_id || activeMaster?.id
    });
    fetchData();
  };

  const updateService = async (id: string, service: Partial<Service>) => {
    const { venue: _v, master: _m, ...rest } = service;
    if (isDemoMode) {
      const venue = rest.venue_id ? venues.find(v => v.id === rest.venue_id) : undefined;
      const master = rest.master_id ? masters.find(m => m.id === rest.master_id) : undefined;
      const newServices = services.map(s => s.id === id ? { ...s, ...rest, venue, master } : s);
      setServices(newServices);
      saveDemoData({ services: newServices });
      return;
    }
    await supabase.from('services').update(rest).eq('id', id);
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

  const sendMessage = async (clientId: string, text: string) => {
    if (isDemoMode) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('messages').insert({
      profile_id: user.id,
      client_id: clientId,
      sender_type: 'master',
      text
    });

    const { data: client } = await supabase.from('clients').select('telegram_id').eq('id', clientId).single();
    if (client?.telegram_id) {
      await fetch('/api/notify/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: client.telegram_id, message: `💬 <b>Сообщение:</b>\n\n${text}` })
      });
    }
  };

  const getMessages = async (clientId: string) => {
    if (isDemoMode) return [];
    const { data } = await supabase.from('messages')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });
    return data || [];
  };

  const logEvent = async (type: string, message: string) => {
    if (isDemoMode) {
      const newEvent = {
        id: Math.random().toString(),
        profile_id: 'demo',
        type,
        message,
        read: false,
        created_at: new Date().toISOString()
      };
      const newEvents = [newEvent, ...events].slice(0, 20);
      setEvents(newEvents as Event[]);
      saveDemoData({ events: newEvents });
      return;
    }
    await supabase.from('events').insert({
      profile_id: userId,
      type,
      message
    });
    fetchData();
  };

  const addVenue = async (venue: Omit<Venue, 'id'>) => {
    if (isDemoMode) {
      const newV = { ...venue, id: Math.random().toString(), owner_id: profile?.id || 'demo-user' };
      const newVenues = [...venues, newV as Venue];
      setVenues(newVenues);
      saveDemoData({ venues: newVenues });
      return { error: null };
    }
    if (!userId) return { error: new Error('User ID not found') };
    const { error } = await supabase.from('venues').insert({
      ...venue,
      owner_id: userId
    });
    if (!error) fetchData();
    return { error };
  };

  const updateVenue = async (id: string, venue: Partial<Venue>) => {
    if (isDemoMode) {
      const newVenues = venues.map(v => v.id === id ? { ...v, ...venue } : v);
      setVenues(newVenues);
      saveDemoData({ venues: newVenues });
      return { error: null };
    }
    if (!id) return { error: new Error('Venue ID not found') };
    const { error } = await supabase.from('venues').update(venue).eq('id', id);
    if (!error) fetchData();
    return { error };
  };

  const removeVenue = async (id: string) => {
    if (isDemoMode) {
      const newV = venues.filter(v => v.id !== id);
      setVenues(newV);
      saveDemoData({ venues: newV });
      return;
    }
    await supabase.from('venues').delete().eq('id', id);
    fetchData();
  };

  const markEventsAsRead = async () => {
    if (isDemoMode) {
        const updated = events.map(e => ({ ...e, read: true }));
        setEvents(updated);
        saveDemoData({ events: updated });
        return;
    }
    const unreadIds = events.filter(e => !e.read).map(e => e.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase.from('events').update({ read: true }).in('id', unreadIds);
    if (!error) {
        setEvents(events.map(e => ({ ...e, read: true })));
    }
  };

  const addPartnership = async (partnerSearch: string) => {
    if (isDemoMode) {
      const newP: Partnership = { id: Math.random().toString(), user_id: userId!, partner_id: 'demo-partner', status: 'pending', partner_name: partnerSearch };
      const updated = [...partners, newP];
      setPartners(updated);
      saveDemoData({ partners: updated });
      return;
    }
    const { data: partner } = await supabase.from('profiles')
      .select('id')
      .or(`email.eq.${partnerSearch},phone.eq.${partnerSearch}`)
      .maybeSingle();

    if (partner) {
      await supabase.from('partnerships').insert({ user_id: userId, partner_id: partner.id });
      fetchData();
    }
  };

  const removePartnership = async (partnershipId: string) => {
    if (isDemoMode) {
      const updated = partners.filter(p => p.id !== partnershipId);
      setPartners(updated);
      saveDemoData({ partners: updated });
      return;
    }
    await supabase.from('partnerships').delete().eq('id', partnershipId);
    fetchData();
  };

  const addVenueStaff = async (venueId: string, masterId: string) => {
    if (isDemoMode) {
      const master = masters.find(m => m.id === masterId);
      const newS: VenueStaff = { id: Math.random().toString(), venue_id: venueId, master_id: masterId, master_name: master?.full_name || 'Мастер' };
      const updated = [...venueStaff, newS];
      setVenueStaff(updated);
      saveDemoData({ venueStaff: updated });
      return;
    }
    await supabase.from('venue_staff').insert({ venue_id: venueId, master_id: masterId });
    fetchData();
  };

  const addMasterByEmail = async (venueId: string, masterEmail: string) => {
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', masterEmail).maybeSingle();
    if (profile) {
      const { data: master } = await supabase.from('masters').select('id').eq('user_id', profile.id).maybeSingle();
      if (master) {
        await addVenueStaff(venueId, master.id);
      }
    }
  };

  const removeVenueStaff = async (staffId: string) => {
    if (isDemoMode) {
      const updated = venueStaff.filter(s => s.id !== staffId);
      setVenueStaff(updated);
      saveDemoData({ venueStaff: updated });
      return;
    }
    await supabase.from('venue_staff').delete().eq('id', staffId);
    fetchData();
  };

  const getAllMasters = async () => {
    if (isDemoMode) {
      return [
        { id: 'm1', full_name: 'Александр Петров', specialization: 'Силовой тренинг', slot_duration: 60, category: 'Спорт', created_at: '' },
        { id: 'm2', full_name: 'Елена Соколова', specialization: 'Йога и пилатес', slot_duration: 60, category: 'Спорт', created_at: '' },
      ] as Master[];
    }
    const { data } = await supabase.from('masters').select('*');
    return data || [];
  };

  const addMaster = async (master: Omit<Master, 'id' | 'created_at'>) => {
    if (isDemoMode) {
      const newMaster: Master = { ...master, id: Math.random().toString(), created_at: new Date().toISOString() };
      const updatedMasters = [...masters, newMaster];
      setMasters(updatedMasters);
      saveDemoData({ masters: updatedMasters });
      return { data: newMaster, error: null };
    }
    const { data, error } = await supabase.from('masters').insert(master).select().single();
    if (!error) fetchData();
    return { data, error };
  };

  const updateMaster = async (id: string, master: Partial<Master>) => {
    if (isDemoMode) {
      const updatedMasters = masters.map(m => m.id === id ? { ...m, ...master } : m);
      setMasters(updatedMasters);
      if (activeMaster?.id === id) setActiveMaster({ ...activeMaster, ...master });
      saveDemoData({ masters: updatedMasters, activeMaster: activeMaster?.id === id ? { ...activeMaster, ...master } : activeMaster });
      return { error: null };
    }
    const { error } = await supabase.from('masters').update(master).eq('id', id);
    if (!error) {
      if (activeMaster?.id === id) setActiveMaster({ ...activeMaster, ...master });
      fetchData();
    }
    return { error };
  };

  const removeMaster = async (id: string) => {
    if (isDemoMode) {
      const updatedMasters = masters.filter(m => m.id !== id);
      setMasters(updatedMasters);
      saveDemoData({ masters: updatedMasters });
      return;
    }
    await supabase.from('masters').delete().eq('id', id);
    fetchData();
  };

  const switchActiveRole = (role: 'master' | 'client' | 'venue') => {
    setActiveRole(role);
    if (isDemoMode) {
      saveDemoData({ activeRole: role });
    } else {
      fetchData(role);
    }
  };

  const value = {
    sessions, completedSessions, requests, clients, schedule, blocks, services, venues, events, reviews, profile,
    masters, activeMaster,
    activeRole, partners, venueStaff,
    loading, userId, isDemoMode,
    switchActiveRole,
    updateProfile, approveRequest: (id: string, mId?: string) => updateSessionStatus(id, 'confirmed', false, mId),
    rejectRequest: (id: string, reschedule: boolean = false) => updateSessionStatus(id, 'rejected', reschedule),
    sendMessage, getMessages, logEvent, markEventsAsRead,
    cancelSession: (id: string) => updateSessionStatus(id, 'cancelled'),
    completeSession: (id: string) => updateSessionStatus(id, 'completed'),
    addSession, addService, updateService, addVenue, updateVenue, removeVenue, addBlock, removeBlock,
    addPartnership, removePartnership, addVenueStaff, addMasterByEmail, removeVenueStaff, getAllMasters,
    addMaster, updateMaster, removeMaster,
    toggleDay, updateScheduleTime, removeService,
    refresh: fetchData
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
