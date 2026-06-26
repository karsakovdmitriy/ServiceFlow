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

  let activeFilialId = serviceFilialId || venueFilialId || profile.moyklass_filial_id;

  // Robust Filial Check: If we have a classId, verify its branch to avoid "class belongs to another branch"
  if (service?.moyklass_class_id) {
    try {
      const mkClass = await mk.getClass(service.moyklass_class_id);
      console.log(`MoyKlass: Class ${service.moyklass_class_id} details:`, JSON.stringify(mkClass));

      const classFilials = mkClass.filialIds || (mkClass.filialId ? [mkClass.filialId] : []);

      if (classFilials.length > 0) {
        // If current activeFilialId is not in the class's filials, override it
        if (!activeFilialId || !classFilials.includes(activeFilialId)) {
          activeFilialId = classFilials[0];
          console.log(`MoyKlass: Filial ID overridden to ${activeFilialId} based on class ${service.moyklass_class_id} branches: ${classFilials.join(',')}`);
        }
      }
    } catch (e) {
      console.warn(`MoyKlass: Failed to verify class ${service.moyklass_class_id} branch:`, e);
    }
  }

  if (!activeFilialId) {
    console.error(`MoyKlass: Filial ID missing for sync of session ${sessionId}. checked: service(${serviceFilialId}), venue(${venueFilialId}), profile(${profile.moyklass_filial_id})`);
    return;
  }

  console.log(`MoyKlass: Using Filial ID ${activeFilialId} for lesson lookup/creation`);

  const lessons = await mk.getLessons({ from: date, to: date, filialId: activeFilialId });
  let lesson = lessons.find((l: any) => l.date === date && l.beginTime?.startsWith(beginTime));

  if (!lesson && service?.moyklass_class_id) {
    const endTimeStr = session.end_time.split('T')[1].slice(0, 5);

    // Robust Teacher Check: Verify if teacher belongs to the branch
    let teacherIds: number[] = [];
    if (master.moyklass_teacher_id) {
        try {
            const manager = await mk.getManager(master.moyklass_teacher_id);
            const managerFilials = manager.filialIds || (manager.filialId ? [manager.filialId] : []);
            if (managerFilials.includes(activeFilialId)) {
                teacherIds = [master.moyklass_teacher_id];
            } else {
                console.warn(`MoyKlass: Teacher ${master.moyklass_teacher_id} does not belong to branch ${activeFilialId}. Manager branches: ${managerFilials.join(',')}. Syncing without teacher.`);
            }
        } catch (e) {
            console.warn(`MoyKlass: Could not verify teacher ${master.moyklass_teacher_id} branches. Proceeding with caution.`);
            teacherIds = [master.moyklass_teacher_id];
        }
    }

    const lessonPayload: any = {
      date,
      beginTime,
      endTime: endTimeStr,
      filialId: activeFilialId,
      roomId: service.moyklass_room_id!,
      classId: service.moyklass_class_id!,
      teacherIds: teacherIds
    };

    console.log(`MoyKlass: Creating lesson with payload:`, JSON.stringify(lessonPayload));

    try {
      lesson = await mk.createLesson(lessonPayload);
      console.log(`MoyKlass: Lesson created successfully with ID ${lesson.id}`);
    } catch (e: any) {
      console.error('Failed to create lesson in MoyKlass:', e);
      // Fallback: Try without teacher if it failed due to incorrect teacherIds
      if (e.message?.includes('incorrect teacherIds') && teacherIds.length > 0) {
          console.log('MoyKlass: Retrying lesson creation without teacherIds...');
          try {
              lesson = await mk.createLesson({ ...lessonPayload, teacherIds: [] });
              console.log(`MoyKlass: Lesson created (fallback) with ID ${lesson.id}`);
          } catch (e2) {
              console.error('MoyKlass: Fallback lesson creation failed:', e2);
          }
      }
    }
  }

  // 3. Create record
  if (lesson) {
    console.log(`MoyKlass: Attempting to create record for lesson ${lesson.id} and user ${mkUserId}`);
    try {
      // Pass classId in options as some MoyKlass configurations require it for record creation
      const record = await mk.createRecord(lesson.id, mkUserId, {
        classId: service?.moyklass_class_id
      } as any);
      console.log(`MoyKlass: Record created successfully for user ${mkUserId} on lesson ${lesson.id}`);
    } catch (e) {
      console.error(`MoyKlass: Final attempt to create record failed for user ${mkUserId} on lesson ${lesson.id}:`, e);
    }
  } else {
    console.warn(`MoyKlass: Skipping record creation as no lesson was found or created`);
  }
}
