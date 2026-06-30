import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendMaxMessage, answerMaxCallback, escapeHtml } from '@/lib/max';

// Helper to get supabase client (Service Role for Bot bypass RLS)
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key);
}

const BOT_TOKEN = process.env.MAX_BOT_TOKEN;

export async function POST(request: Request) {
  const supabase = getSupabase();
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');

  // Simple security check via query param
  if (process.env.MAX_BOT_SECRET && secret !== process.env.MAX_BOT_SECRET) {
    console.warn('Unauthorized MAX bot request: secret mismatch or missing.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!BOT_TOKEN) {
    console.error('MAX_BOT_TOKEN is missing in environment variables.');
    return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    console.log('MAX Bot Update Body:', JSON.stringify(body, null, 2));

    const updateType = body.update_type;
    const message = body.message || body.message_created || body.message_edited;
    const callbackQuery = body.callback_query || body.message_callback;
    const botStarted = body.bot_started;

    console.log(`Detected Update Type: ${updateType}`);

    if (updateType === 'bot_started' || botStarted) {
      const chat_id = body.chat_id || botStarted?.chat_id;
      const user = body.user || botStarted?.user;
      const payload = body.payload || botStarted?.payload;
      const fromId = user?.user_id || body.user_id;
      const name = user?.name || user?.full_name;

      console.log(`Bot started event for ${fromId} (chat: ${chat_id}) with payload: ${payload}`);
      await handleStart(chat_id, fromId, name, payload);
    } else if (updateType === 'message_callback' || callbackQuery) {
      const chat_id = body.chat_id || callbackQuery?.chat_id;
      const user = body.user || callbackQuery?.user;
      const payload = body.payload || callbackQuery?.payload;
      const id = body.id || callbackQuery?.id;
      const fromId = user?.user_id || body.user_id;

      console.log(`Callback query event from ${fromId} (chat: ${chat_id}): ${payload}`);

      await handleCallback(id, payload, chat_id, user, url.origin);
    } else if (message || updateType === 'message_created' || body.text) {
      const chat_id = body.chat_id || message?.chat_id;
      const text = body.text || message?.text;
      const user = body.user || message?.user;
      const fromId = user?.user_id || body.user_id;
      console.log(`Processing message from ${fromId} (chat: ${chat_id}): ${text}`);

      const sendTarget = chat_id || fromId;
      const targetType = chat_id ? 'chat_id' : 'user_id';

      // Handle direct messages to master and Review comments
      if (text) {
         const { data: clients } = await supabase.from('clients')
            .select('id, owner_id, full_name, last_bot_state, last_session_id')
            .eq('max_id', fromId.toString())
            .order('created_at', { ascending: false });

         const client = clients?.[0];

         if (client) {
            if (client.last_bot_state === 'waiting_for_comment' && client.last_session_id) {
               await supabase.from('reviews').update({ comment: text }).eq('session_id', client.last_session_id);
               await supabase.from('clients').update({ last_bot_state: null, last_session_id: null }).eq('id', client.id);
               await sendMaxMessage(sendTarget, '✅ <b>Спасибо за ваш отзыв!</b> Он очень важен для нас.', undefined, targetType);
               await supabase.from('events').insert({
                 profile_id: client.owner_id,
                 type: 'review',
                 message: `Получен отзыв (MAX) от ${client.full_name}`
               });
               return NextResponse.json({ ok: true });
            }

            if (text === '/skip' && client.last_bot_state === 'waiting_for_comment') {
                await supabase.from('clients').update({ last_bot_state: null, last_session_id: null }).eq('id', client.id);
                await sendMaxMessage(sendTarget, '👌 Без проблем! Благодарим за оценку.', undefined, targetType);
                return NextResponse.json({ ok: true });
            }

            if (!text.startsWith('/')) {
                await supabase.from('messages').insert({
                    profile_id: client.owner_id,
                    client_id: client.id,
                    sender_type: 'client',
                    text
                });

                await supabase.from('events').insert({
                profile_id: client.owner_id,
                type: 'message',
                message: `Новое сообщение (MAX) от ${client.full_name}`
                });

                const { data: master } = await supabase.from('masters').select('telegram_id, max_id').eq('user_id', client.owner_id).limit(1).single();
                if (master?.max_id) {
                    await sendMaxMessage(master.max_id, `💬 <b>Новое сообщение (MAX) от ${escapeHtml(client.full_name)}:</b>\n\n${escapeHtml(text)}`, undefined, 'user_id');
                }
            }
         }
      }

      if (text?.startsWith('/start')) {
        const parts = text.split(' ');
        let masterId = parts[1];
        await handleStart(chat_id, fromId, user?.name || user?.full_name, masterId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in MAX bot API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function handleCallback(id: string, data: string, chat_id: any, user: any, origin: string) {
  const supabase = getSupabase();
  const fromId = user?.user_id;
  const sendTarget = chat_id || fromId;
  const targetType = chat_id ? 'chat_id' : 'user_id';

  try {
    const [action, ...params] = data.split(':');

    if (action === 'svc_list') {
          const [masterId] = params;
          const { data: master } = await supabase.from('masters').select('full_name, specialization').eq('id', masterId).single();
          if (master) {
             const servicesKeyboard = await getServicesKeyboard(masterId);
             await sendMaxMessage(sendTarget, `🏃 Запись к специалисту <b>${escapeHtml(master.full_name)}</b>\n\nВыберите услугу:`, {
                inline_keyboard: [
                    ...servicesKeyboard,
                    [{ text: '👤 Мои записи / Перенос', callback_data: `my_bookings:${masterId}` }]
                ]
             }, targetType);
          }
        } else if (action === 'rate_init') {
           const [sessionId] = params;
           const { data: session } = await supabase.from('sessions').select('master:masters!master_id(full_name)').eq('id', sessionId).single();

           if (session) {
                await supabase.from('clients').update({ last_bot_state: 'waiting_for_rating', last_session_id: sessionId }).eq('max_id', fromId.toString());

                await sendMaxMessage(sendTarget, `⭐ Пожалуйста, оцените ваш визит к специалисту <b>${escapeHtml((session.master as any).full_name)}</b>:`, {
                    inline_keyboard: [
                        [
                            { text: '1 ⭐', callback_data: `rate_val:${sessionId}:1` },
                            { text: '2 ⭐', callback_data: `rate_val:${sessionId}:2` },
                            { text: '3 ⭐', callback_data: `rate_val:${sessionId}:3` },
                            { text: '4 ⭐', callback_data: `rate_val:${sessionId}:4` },
                            { text: '5 ⭐', callback_data: `rate_val:${sessionId}:5` }
                        ]
                    ]
                }, targetType);
           }
        } else if (action === 'rate_val') {
           const [sessionId, rating] = params;
           const { data: session } = await supabase.from('sessions').select('master_id, client_id').eq('id', sessionId).single();

           if (session) {
                await supabase.from('reviews').upsert({
                    master_id: session.master_id,
                    client_id: session.client_id,
                    session_id: sessionId,
                    rating: parseInt(rating)
                }, { onConflict: 'session_id' });

                await supabase.from('clients').update({ last_bot_state: 'waiting_for_comment', last_session_id: sessionId }).eq('max_id', fromId.toString());

                await sendMaxMessage(sendTarget, '⭐ <b>Оценка сохранена!</b>\n\nТеперь вы можете написать текстовый отзыв или отправить /skip, чтобы пропустить этот шаг.', undefined, targetType);
           }
        } else if (action === 'my_bookings') {
          const [masterId] = params;
          const { data: master } = await supabase.from('masters').select('user_id').eq('id', masterId).single();
          if (master) {
              const { data: client } = await supabase.from('clients').select('id').eq('owner_id', master.user_id).eq('max_id', fromId.toString()).single();

              if (!client) {
                 await sendMaxMessage(sendTarget, '❌ У вас пока нет записей к этому специалисту.', undefined, targetType);
              } else {
                 const { data: sessions } = await supabase.from('sessions')
                    .select('id, start_time, service:services!service_id(name)')
                    .eq('client_id', client.id)
                    .gte('start_time', new Date().toISOString())
                    .order('start_time');

                 if (!sessions || sessions.length === 0) {
                    await sendMaxMessage(sendTarget, '📅 У вас нет предстоящих записей.', undefined, targetType);
                 } else {
                    let msg = '<b>Ваши предстоящие записи:</b>\n\n';
                    const buttons = [];

                    for (const s of sessions) {
                        const d = new Date(s.start_time);
                        const label = `${d.toLocaleDateString('ru-RU')} ${s.start_time.split('T')[1].slice(0, 5)} — ${(s.service as any)?.name}`;
                        msg += `• ${label}\n`;
                        buttons.push([{ text: `🔄 Перенести ${s.start_time.split('T')[1].slice(0, 5)}`, callback_data: `reschedule:${s.id}` }]);
                    }

                    await sendMaxMessage(sendTarget, msg, { inline_keyboard: buttons }, targetType);
                 }
              }
          }
        } else if (action === 'reschedule') {
           const [sessionId] = params;
           const { data: session } = await supabase.from('sessions').select('service_id').eq('id', sessionId).single();
           if (session) {
                await sendMaxMessage(sendTarget, '📅 Выберите новую дату для переноса:', {
                    inline_keyboard: await getDatesKeyboard(session.service_id)
                }, targetType);
           }
        } else if (action === 'svc') {
          const [serviceId] = params;
          const { data: service } = await supabase.from('services').select('id').eq('id', serviceId).single();
          if (!service) {
             await sendMaxMessage(sendTarget, '❌ Ошибка: Услуга не найдена или была удалена.', undefined, targetType);
          } else {
            await sendMaxMessage(sendTarget, '📅 Выберите удобную дату:', {
              inline_keyboard: await getDatesKeyboard(serviceId)
            }, targetType);
          }
        } else if (action === 'date') {
          const [serviceId, date] = params;
          const { data: service } = await supabase.from('services').select('master_id').eq('id', serviceId).single();

          if (!service) {
            await sendMaxMessage(sendTarget, '❌ Ошибка: Услуга не найдена.', undefined, targetType);
          } else {
            const timesKeyboard = await getTimesKeyboard(service.master_id, serviceId, date);
            if (timesKeyboard.length === 0 || (timesKeyboard.length === 1 && timesKeyboard[0][0].callback_data === 'none')) {
              await sendMaxMessage(sendTarget, `❌ К сожалению, на <b>${date}</b> нет доступного времени для записи. Пожалуйста, выберите другую дату.`, {
                inline_keyboard: await getDatesKeyboard(serviceId)
              }, targetType);
            } else {
              await sendMaxMessage(sendTarget, `🕒 Выберите время на <b>${date}</b>:`, {
                inline_keyboard: timesKeyboard
              }, targetType);
            }
          }
        } else if (action === 'book') {
          const [serviceId, date, time] = params;
          const { data: service } = await supabase.from('services').select('master_id, duration, venue_id').eq('id', serviceId).single();

          if (!service) {
            await sendMaxMessage(sendTarget, '❌ Ошибка: Услуга не найдена.', undefined, targetType);
          } else {
            const { data: master } = await supabase.from('masters').select('user_id, full_name, telegram_id, max_id').eq('id', service.master_id).single();
            if (master) {
                const { data: client } = await supabase.from('clients')
                  .select('id')
                  .eq('owner_id', master.user_id)
                  .eq('max_id', fromId.toString())
                  .single();

                if (client) {
                  const startTime = `${date}T${time}:00`;
                  const end = new Date(`${date}T${time}:00`);
                  end.setMinutes(end.getMinutes() + service.duration);
                  const endTime = end.toISOString().replace('.000Z', '+00:00');

                  const { data: session, error: sessErr } = await supabase.from('sessions').insert({
                    master_id: service.master_id,
                    client_id: client.id,
                    service_id: serviceId,
                    venue_id: service.venue_id,
                    start_time: startTime,
                    end_time: endTime,
                    status: 'pending'
                  }).select('id').single();

                  if (sessErr) {
                    console.error('Session insert error (MAX):', sessErr);
                    await sendMaxMessage(sendTarget, '❌ Ошибка при создании записи. Пожалуйста, попробуйте позже.', undefined, targetType);
                    return;
                  }

                  const { data: clientData } = await supabase.from('clients').select('full_name').eq('id', client.id).single();
                  const { data: svcData } = await supabase.from('services').select('name').eq('id', serviceId).single();

                  const notificationMsg = `🆕 <b>Новая заявка (MAX)!</b>\n\n` +
                    `Клиент: <b>${escapeHtml(clientData?.full_name || 'Неизвестно')}</b>\n` +
                    `Услуга: <b>${escapeHtml(svcData?.name || 'Услуга')}</b>\n` +
                    `Дата: <b>${date}</b>\n` +
                    `Время: <b>${time}</b>\n\n` +
                    `Для управления записью используйте веб-панель или Telegram-бот.`;

                  if (master.max_id) {
                     await sendMaxMessage(master.max_id, notificationMsg, undefined, 'user_id');
                  }

                  if (master.telegram_id) {
                      const tgMsg = notificationMsg + '\n\n' + `Выберите действие:`;
                      const tgKeyboard = {
                        inline_keyboard: [
                            [
                                { text: '✅ Подтвердить', callback_data: `tr_appr:${session.id}` },
                                { text: '❌ Отклонить', callback_data: `tr_rejt:${session.id}` }
                            ],
                            [{ text: '📅 Предложить перенос', callback_data: `tr_rsch:${session.id}` }]
                          ]
                      };
                      fetch(`${origin}/api/notify/custom`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ chatId: master.telegram_id, message: tgMsg, replyMarkup: tgKeyboard })
                      }).catch(e => console.error('TG notification from MAX bot failed:', e));
                  }

                  await sendMaxMessage(sendTarget, `✅ <b>Заявка отправлена!</b>\n\nМастер получит уведомление и подтвердит вашу запись. Ожидайте сообщения.`, undefined, targetType);
                } else {
                  await sendMaxMessage(sendTarget, '❌ Ошибка: Клиент не найден. Попробуйте перезапустить бот через ссылку мастера.', undefined, targetType);
                }
            }
          }
        }
  } catch (err) {
    console.error('Callback error (MAX):', err);
  } finally {
    await answerMaxCallback(id);
  }
}

async function handleStart(chat_id: any, fromId: any, userName: string, masterId?: string) {
  console.log(`Handling /start for user ${fromId} (chat: ${chat_id}) with masterId: ${masterId}`);
  const supabase = getSupabase();
  const sendTarget = chat_id || fromId;
  const targetType = chat_id ? 'chat_id' : 'user_id';

  if (!masterId) {
    const { data: previousClients } = await supabase.from('clients')
      .select('owner_id')
      .eq('max_id', fromId.toString());

    if (previousClients && previousClients.length > 0) {
      const ownerIds = Array.from(new Set(previousClients.map(pc => pc.owner_id)));

      const { data: previousMasters } = await supabase.from('masters')
        .select('id, full_name')
        .in('user_id', ownerIds);

      const masterButtons = (previousMasters || []).map(pm => ([{
        text: `🏃 Записаться к ${escapeHtml(pm.full_name)}`,
        callback_data: `svc_list:${pm.id}`
      }]));

      await sendMaxMessage(sendTarget, '👋 <b>С возвращением!</b>\n\nВыберите специалиста из вашей истории для новой записи:', {
        inline_keyboard: masterButtons
      }, targetType);
    } else {
      await sendMaxMessage(sendTarget, '👋 Привет! Чтобы записаться, используйте специальную ссылку от вашего мастера.', undefined, targetType);
    }
    return;
  }

  if (masterId.startsWith('link_')) {
    const actualId = masterId.replace('link_', '');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(actualId)) {
      await sendMaxMessage(sendTarget, '❌ Некорректная ссылка для привязки.', undefined, targetType);
      return;
    }

    let { data: entity, error: entityError } = await supabase.from('masters').select('full_name, user_id').eq('id', actualId).maybeSingle();
    let ownerId = entity?.user_id;
    let displayName = entity?.full_name;

    if (!entity) {
      const { data: venue, error: venueError } = await supabase.from('venues').select('name, owner_id').eq('id', actualId).maybeSingle();
      if (venue) {
        ownerId = venue.owner_id;
        displayName = venue.name;
        entity = venue as any;
      }
    }

    if (!entity || !ownerId) {
      await sendMaxMessage(sendTarget, '❌ Ошибка при привязке: Аккаунт не найден.', undefined, targetType);
      return;
    }

    const { error: mErr } = await supabase.from('masters').update({ max_id: fromId.toString() }).eq('user_id', ownerId);
    const { error: vErr } = await supabase.from('venues').update({ max_id: fromId.toString() }).eq('owner_id', ownerId);

    if (mErr || vErr) {
      console.error('Linking error (MAX):', mErr, vErr);
      await sendMaxMessage(sendTarget, '❌ Произошла ошибка при привязке аккаунта. Пожалуйста, попробуйте позже.', undefined, targetType);
      return;
    }

    await sendMaxMessage(sendTarget, `✅ <b>Аккаунт успешно привязан!</b>\n\nТеперь вы (${escapeHtml(displayName || '')}) будете получать уведомления в этот чат.`, undefined, targetType);

    await supabase.from('events').insert({
      profile_id: ownerId,
      type: 'system',
      message: 'MAX Messenger аккаунт успешно привязан'
    });

    return;
  }

  if (masterId.startsWith('v_')) {
    const venueId = masterId.replace('v_', '');
    const { data: venue } = await supabase.from('venues').select('name').eq('id', venueId).single();
    if (!venue) {
      await sendMaxMessage(sendTarget, '❌ Площадка не найдена.', undefined, targetType);
      return;
    }

    const { data: services } = await supabase.from('services').select('id, name, price').eq('venue_id', venueId);
    const svcButtons = (services || []).map(s => ([{
      text: `${s.name} — ${s.price} ₽`,
      callback_data: `svc:${s.id}`
    }]));

    await sendMaxMessage(sendTarget, `👋 Добро пожаловать в <b>${escapeHtml(venue.name)}</b>!\n\nВыберите услугу для записи:`, {
      inline_keyboard: svcButtons
    }, targetType);
    return;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(masterId)) {
    await sendMaxMessage(sendTarget, '❌ Некорректная ссылка (неверный ID).', undefined, targetType);
    return;
  }

  const { data: master, error: masterError } = await supabase.from('masters').select('full_name, specialization, user_id').eq('id', masterId).single();

  if (masterError || !master) {
    console.error('Master lookup error (MAX):', masterError);
    await sendMaxMessage(sendTarget, '❌ Мастер не найден. Проверьте правильность ссылки.', undefined, targetType);
    return;
  }

  const fullName = userName || 'Клиент MAX';
  const { error: upsertError } = await supabase.from('clients').upsert({
    owner_id: master.user_id,
    max_id: fromId.toString(),
    full_name: fullName
  }, { onConflict: 'owner_id, max_id' });

  if (upsertError) {
    console.error('Client upsert error during /start (MAX):', upsertError);
  }

  const servicesKeyboard = await getServicesKeyboard(masterId);

  if (servicesKeyboard.length === 0) {
    await sendMaxMessage(sendTarget, `👋 Привет! Вы записываетесь к мастеру <b>${escapeHtml(master.full_name)}</b>.\n\nК сожалению, пока нет настроенных услуг для записи. Пожалуйста, свяжитесь напрямую.`, undefined, targetType);
  } else {
    await sendMaxMessage(sendTarget, `👋 Привет! Вы записываетесь к специалисту <b>${escapeHtml(master.full_name)}</b> (${escapeHtml(master.specialization || '')}).\n\nВыберите действие:`, {
      inline_keyboard: [
        ...servicesKeyboard,
        [{ text: '👤 Мои записи / Перенос', callback_data: `my_bookings:${masterId}` }]
      ]
    }, targetType);
  }
}

async function getServicesKeyboard(masterId: string) {
  const supabase = getSupabase();
  const { data: services } = await supabase.from('services').select('id, name, price, venues!venue_id(name)').eq('master_id', masterId);
  return (services || []).map(s => ([{
    text: `${s.name} — ${s.price} ₽${(s.venues as any)?.name ? ` (${(s.venues as any).name})` : ''}`,
    callback_data: `svc:${s.id}`
  }]));
}

async function getDatesKeyboard(serviceId: string) {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    dates.push([{
      text: d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' }),
      callback_data: `date:${serviceId}:${dateStr}`
    }]);
  }
  return dates;
}

async function getTimesKeyboard(masterId: string, serviceId: string, date: string) {
  const supabase = getSupabase();
  const dayOfWeek = new Date(date).getDay();

  let { data: config } = await supabase.from('schedule_config')
    .select('start_hour, end_hour, is_active')
    .eq('master_id', masterId)
    .eq('day_of_week', dayOfWeek)
    .maybeSingle();

  if (!config) {
    config = {
        start_hour: '09:00',
        end_hour: '20:00',
        is_active: dayOfWeek !== 0
    };
  }

  if (!config.is_active) return [[{ text: 'В этот день нет записи', callback_data: 'none' }]];

  let start = parseInt(config.start_hour.split(':')[0]);
  let end = parseInt(config.end_hour.split(':')[0]);

  const { data: service } = await supabase.from('services').select('is_group, venue_id').eq('id', serviceId).single();

  if (service?.venue_id) {
    const { data: venueConfig } = await supabase.from('venue_schedule')
      .select('start_hour, end_hour, is_active')
      .eq('venue_id', service.venue_id)
      .eq('day_of_week', dayOfWeek)
      .single();

    if (venueConfig) {
      if (!venueConfig.is_active) return [[{ text: 'Площадка закрыта в этот день', callback_data: 'none' }]];
      const vStart = parseInt(venueConfig.start_hour.split(':')[0]);
      const vEnd = parseInt(venueConfig.end_hour.split(':')[0]);
      start = Math.max(start, vStart);
      end = Math.min(end, vEnd);
      if (start >= end) return [[{ text: 'Нет пересечения времени', callback_data: 'none' }]];
    }
  }

  const isSelectedGroup = service?.is_group || false;

  const { data: sessions } = await supabase.from('sessions')
    .select('start_time, service:services!service_id(is_group)')
    .eq('master_id', masterId)
    .filter('start_time', 'gte', `${date}T00:00:00`)
    .filter('start_time', 'lte', `${date}T23:59:59`);

  const { data: blocks } = await supabase.from('blocked_slots')
    .select('start_hour, end_hour, all_day')
    .eq('master_id', masterId)
    .eq('date', date);

  const times = [];
  for (let h = start; h < end; h++) {
    const time = `${h.toString().padStart(2, '0')}:00`;
    const existingSessionsAtTime = (sessions || []).filter(s => s.start_time.split('T')[1].slice(0, 5) === time);
    const hasIndividualSession = existingSessionsAtTime.some(s => !(s.service as any)?.is_group);
    const hasAnySession = existingSessionsAtTime.length > 0;

    let isBooked = isSelectedGroup ? hasIndividualSession : hasAnySession;

    const isBlocked = (blocks || []).some(b => {
        if (b.all_day) return true;
        return time >= (b.start_hour || '00:00') && time < (b.end_hour || '23:59');
    });

    if (!isBooked && !isBlocked) {
      times.push({
        text: time,
        callback_data: `book:${serviceId}:${date}:${time}`
      });
    }
  }

  const rows = [];
  for (let i = 0; i < times.length; i += 4) {
    rows.push(times.slice(i, i + 4));
  }
  return rows;
}
