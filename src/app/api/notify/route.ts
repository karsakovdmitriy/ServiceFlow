import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '@/lib/telegram';
import { sendMaxMessage } from '@/lib/max';
import { MoyKlassClient } from '@/lib/moyklass';

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 });
  }

  const supabase = createClient(url, key);

  try {
    const { sessionId, status } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID missing' }, { status: 400 });
    }

    const { data: sessionData, error } = await supabase
      .from('sessions')
      .select(`
        start_time,
        master_id,
        client:clients!client_id(telegram_id, max_id),
        service:services!service_id(name, venues!venue_id(name, address)),
        master:masters!master_id(full_name)
      `)
      .eq('id', sessionId)
      .single();

    if (error || !sessionData) {
      console.error('Notify: Session lookup error:', error);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const clientTelegramId = (sessionData.client as any)?.telegram_id;
    const clientMaxId = (sessionData.client as any)?.max_id;

      if (status === 'confirmed') {
        try {
          await syncToMoyKlass(supabase, sessionId);
        } catch (mkErr) {
          console.error('MoyKlass Sync Error:', mkErr);
        }
      }

    if (clientTelegramId || clientMaxId) {
      const date = new Date(sessionData.start_time);
      const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      const timeStr = sessionData.start_time.split('T')[1].slice(0, 5);

      const venueInfo = (sessionData.service as any)?.venues;
      const venueText = venueInfo ? `\nПлощадка: <b>${venueInfo.name}</b>${venueInfo.address ? ` (${venueInfo.address})` : ''}` : '';

      let message = '';
      let replyMarkup = undefined;
      if (status === 'completed') {
        message = `💪 <b>Как все прошло?</b>\n\n` +
          `Надеемся, вам понравилась услуга у специалиста <b>${(sessionData.master as any)?.full_name}</b>!\n\n` +
          `Будем рады вашему отзыву.`;

        replyMarkup = {
          inline_keyboard: [
            [{ text: '⭐ Оценить и оставить отзыв', callback_data: `rate_init:${sessionId}` }],
            [{ text: '🔄 Записаться снова', callback_data: `svc_list:${sessionData.master_id}` }]
          ]
        };
      } else {
        message = `✅ <b>Ваша запись подтверждена!</b>\n\n` +
          `Мастер: <b>${(sessionData.master as any)?.full_name}</b>\n` +
          `Услуга: <b>${(sessionData.service as any)?.name}</b>${venueText}\n` +
          `Дата: <b>${dateStr}</b>\n` +
          `Время: <b>${timeStr}</b>\n\n` +
          `Ждем вас!`;
      }

      if (clientTelegramId) {
        await sendTelegramMessage(clientTelegramId, message, replyMarkup);
      }
      if (clientMaxId) {
        await sendMaxMessage(clientMaxId, message, replyMarkup);
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, message: 'No telegram or MAX ID' });
  } catch (error) {
    console.error('Error in notify API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function syncToMoyKlass(supabase: any, sessionId: string) {
  const { data: session } = await supabase
    .from('sessions')
    .select(`
      start_time,
      end_time,
      master_id,
      client_id,
      service_id,
      client:clients!client_id(id, full_name, email, phone, telegram_id, moyklass_id),
      service:services!service_id(id, name, duration, moyklass_class_id, moyklass_room_id, venue:venues!venue_id(moyklass_filial_id)),
      master:masters!master_id(user_id, moyklass_teacher_id)
    `)
    .eq('id', sessionId)
    .single();

  if (!session || !session.master?.user_id) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('moyklass_api_key, moyklass_filial_id, moyklass_enabled')
    .eq('id', session.master.user_id)
    .single();

  if (!profile?.moyklass_enabled || !profile?.moyklass_api_key) return;

  const mk = new MoyKlassClient(profile.moyklass_api_key, session.master.user_id);
  const client = session.client;
  const service = session.service;

  // 1. Find or create user
  let mkUserId = client.moyklass_id;
  if (!mkUserId) {
    const contact = client.phone || client.email || client.telegram_id;
    if (contact) {
      const mkUser = await mk.findUserByContact(contact);
      if (mkUser) {
        mkUserId = mkUser.id;
      }
    }

    if (!mkUserId) {
      const newUser = await mk.createUser({
        name: client.full_name,
        email: client.email,
        phone: client.phone
      });
      mkUserId = newUser.id;
    }

    if (mkUserId) {
      await supabase.from('clients').update({ moyklass_id: mkUserId }).eq('id', client.id);
    }
  }

  if (!mkUserId) return;

  // 2. Find or create lesson
  const date = session.start_time.split('T')[0];
  const beginTime = session.start_time.split('T')[1].slice(0, 5);
  const activeFilialId = service?.venue?.moyklass_filial_id || profile.moyklass_filial_id;

  if (!activeFilialId) return;

  const lessons = await mk.getLessons({ from: date, to: date, filialId: activeFilialId });
  let lesson = lessons.find((l: any) => l.date === date && l.beginTime?.startsWith(beginTime));

  if (!lesson && service?.moyklass_class_id) {
    const endTimeStr = session.end_time.split('T')[1].slice(0, 5);
    try {
      lesson = await mk.createLesson({
        date,
        beginTime,
        endTime: endTimeStr,
        filialId: activeFilialId,
        roomId: service.moyklass_room_id!,
        classId: service.moyklass_class_id!,
        teacherIds: session.master.moyklass_teacher_id ? [session.master.moyklass_teacher_id] : []
      });
    } catch (e) {
      console.error('Failed to create lesson in MoyKlass:', e);
    }
  }

  // 3. Create record
  if (lesson) {
    await mk.createRecord(lesson.id, mkUserId);
  }
}
