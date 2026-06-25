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
  console.log(`MoyKlass: Starting sync for session ${sessionId}`);

  // 1. Fetch basic session info
  const { data: session, error: sessErr } = await supabase
    .from('sessions')
    .select('start_time, end_time, master_id, client_id, service_id, venue_id')
    .eq('id', sessionId)
    .single();

  if (sessErr || !session) {
    console.error(`MoyKlass: Session ${sessionId} not found or error:`, sessErr);
    return;
  }

  // 2. Fetch master info
  const { data: master, error: masterErr } = await supabase
    .from('masters')
    .select('user_id, moyklass_teacher_id')
    .eq('id', session.master_id)
    .single();

  if (masterErr || !master?.user_id) {
    console.error(`MoyKlass: Master ${session.master_id} not found for sync:`, masterErr);
    return;
  }

  // 3. Fetch profile and check integration status
  const { data: profile } = await supabase
    .from('profiles')
    .select('moyklass_api_key, moyklass_filial_id, moyklass_enabled')
    .eq('id', master.user_id)
    .single();

  if (!profile?.moyklass_enabled || !profile?.moyklass_api_key) {
    console.log(`MoyKlass: Integration disabled or API key missing for user ${master.user_id}`);
    return;
  }

  // 4. Fetch client info
  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('id, full_name, email, phone, telegram_id, moyklass_id')
    .eq('id', session.client_id)
    .single();

  if (clientErr || !client) {
    console.error(`MoyKlass: Client ${session.client_id} not found:`, clientErr);
    return;
  }

  // 5. Fetch service info (safely, column by column if needed)
  const { data: service, error: svcErr } = await supabase
    .from('services')
    .select('id, name, duration, moyklass_class_id, moyklass_room_id')
    .eq('id', session.service_id)
    .single();

  if (svcErr || !service) {
    console.error(`MoyKlass: Service ${session.service_id} not found:`, svcErr);
    return;
  }

  // Try fetching moyklass_filial_id from service separately to avoid failing the whole query if column missing
  let serviceFilialId = null;
  try {
    const { data: svcExtra } = await supabase.from('services').select('moyklass_filial_id').eq('id', service.id).single();
    serviceFilialId = svcExtra?.moyklass_filial_id;
  } catch (e) {}

  // 6. Fetch venue info
  let venueFilialId = null;
  if (session.venue_id) {
    const { data: venue } = await supabase.from('venues').select('moyklass_filial_id').eq('id', session.venue_id).single();
    venueFilialId = venue?.moyklass_filial_id;
  }

  const mk = new MoyKlassClient(profile.moyklass_api_key, master.user_id);

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

  if (!mkUserId) {
    console.error(`MoyKlass: Could not find or create user for client ${client.id}`);
    return;
  }

  // 2. Find or create lesson
  const date = session.start_time.split('T')[0];
  const beginTime = session.start_time.split('T')[1].slice(0, 5);
  const activeFilialId = serviceFilialId || venueFilialId || profile.moyklass_filial_id;

  if (!activeFilialId) {
    console.error(`MoyKlass: Filial ID missing for sync of session ${sessionId}. checked: service(${serviceFilialId}), venue(${venueFilialId}), profile(${profile.moyklass_filial_id})`);
    return;
  }

  console.log(`MoyKlass: Using Filial ID ${activeFilialId} for lesson lookup/creation`);

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
        teacherIds: master.moyklass_teacher_id ? [master.moyklass_teacher_id] : []
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
