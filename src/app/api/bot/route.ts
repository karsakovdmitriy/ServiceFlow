import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage, answerCallbackQuery, escapeHtml } from '@/lib/telegram';

// Helper to get supabase client
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY is not set. Bot may encounter RLS issues.');
  }

  return createClient(url, key);
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(request: Request) {
  const supabase = getSupabase();
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');

  // Simple security check via query param
  if (process.env.TELEGRAM_BOT_SECRET && secret !== process.env.TELEGRAM_BOT_SECRET) {
    console.warn('Unauthorized bot request: secret mismatch or missing.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is missing in environment variables.');
    return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    console.log('Bot Update:', JSON.stringify(body, null, 2));

    if (body.message) {
      const { chat, text, from } = body.message;
      console.log(`Message from ${from.id}: ${text}`);

      // Handle direct messages to master and Review comments
      if (text) {
         const { data: client } = await supabase.from('clients').select('id, owner_id, full_name, last_bot_state, last_session_id, moyklass_id').eq('telegram_id', from.id.toString()).limit(1).single();

         if (client) {
            if (client.last_bot_state === 'waiting_for_comment' && client.last_session_id) {
               // This is a review comment
               await supabase.from('reviews').update({ comment: text }).eq('session_id', client.last_session_id);
               await supabase.from('clients').update({ last_bot_state: null, last_session_id: null }).eq('id', client.id);

               await sendTelegramMessage(chat.id, '✅ <b>Спасибо за ваш отзыв!</b> Он очень важен для нас.');

               // Log review event
               await supabase.from('events').insert({
                 profile_id: client.owner_id,
                 type: 'review',
                 message: `Получен отзыв от ${client.full_name}`
               });
               return NextResponse.json({ ok: true });
            }

            if (text === '/skip' && client.last_bot_state === 'waiting_for_comment') {
                await supabase.from('clients').update({ last_bot_state: null, last_session_id: null }).eq('id', client.id);
                await sendTelegramMessage(chat.id, '👌 Без проблем! Благодарим за оценку.');
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
                message: `Новое сообщение от ${client.full_name}`
                });

                // Notify master about message
                const { data: master } = await supabase.from('masters').select('telegram_id').eq('user_id', client.owner_id).limit(1).single();
                if (master?.telegram_id) {
                    await sendTelegramMessage(master.telegram_id, `💬 <b>Новое сообщение от ${escapeHtml(client.full_name)}:</b>\n\n${escapeHtml(text)}`);
                }
            }
         }
      }

      if (text?.startsWith('/start')) {
        const parts = text.split(' ');
        let masterId = parts[1];

        if (!masterId) {
          const { data: previousClients } = await supabase.from('clients')
            .select('owner_id')
            .eq('telegram_id', from.id.toString());

          if (previousClients && previousClients.length > 0) {
            // Filter unique owners
            const ownerIds = Array.from(new Set(previousClients.map(pc => pc.owner_id)));

            // Find masters for these owners
            const { data: previousMasters } = await supabase.from('masters')
              .select('id, full_name')
              .in('user_id', ownerIds);

            const masterButtons = (previousMasters || []).map(pm => ([{
              text: `🏃 Записаться к ${escapeHtml(pm.full_name)}`,
              callback_data: `svc_list:${pm.id}`
            }]));

            await sendTelegramMessage(chat.id, '👋 <b>С возвращением!</b>\n\nВыберите специалиста из вашей истории для новой записи:', {
              inline_keyboard: masterButtons
            });
          } else {
            await sendTelegramMessage(chat.id, '👋 Привет! Чтобы записаться, используйте специальную ссылку от вашего мастера.');
          }
          return NextResponse.json({ ok: true });
        }

        // Handle Account Linking (Master or Venue)
        if (masterId.startsWith('link_')) {
          const actualId = masterId.replace('link_', '');

          // Validate UUID format for linking
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(actualId)) {
            await sendTelegramMessage(chat.id, '❌ Некорректная ссылка для привязки.');
            return NextResponse.json({ ok: true });
          }

          // Try finding in masters
          let { data: entity, error: entityError } = await supabase.from('masters').select('full_name, user_id').eq('id', actualId).maybeSingle();
          let ownerId = entity?.user_id;
          let displayName = entity?.full_name;

          // If not found in masters, try venues
          if (!entity) {
             const { data: venue, error: venueError } = await supabase.from('venues').select('name, owner_id').eq('id', actualId).maybeSingle();
             if (venue) {
                ownerId = venue.owner_id;
                displayName = venue.name;
                entity = venue as any;
             }
          }

          if (!entity || !ownerId) {
             await sendTelegramMessage(chat.id, '❌ Ошибка при привязке: Аккаунт не найден.');
             return NextResponse.json({ ok: true });
          }

          // Update ALL master and venue records for this user to have this telegram_id
          const { error: mErr } = await supabase.from('masters').update({ telegram_id: from.id.toString() }).eq('user_id', ownerId);
          const { error: vErr } = await supabase.from('venues').update({ telegram_id: from.id.toString() }).eq('owner_id', ownerId);

          if (mErr || vErr) {
             console.error('Linking error:', mErr, vErr);
             await sendTelegramMessage(chat.id, '❌ Произошла ошибка при привязке аккаунта. Пожалуйста, попробуйте позже.');
             return NextResponse.json({ ok: true });
          }

          await sendTelegramMessage(chat.id, `✅ <b>Аккаунт успешно привязан!</b>\n\nТеперь вы (${escapeHtml(displayName || '')}) будете получать уведомления в этот чат.`);

          await supabase.from('events').insert({
            profile_id: ownerId,
            type: 'system',
            message: 'Telegram аккаунт успешно привязан'
          });

          return NextResponse.json({ ok: true });
        }

        // Handle Venue Booking
        if (masterId.startsWith('v_')) {
           const venueId = masterId.replace('v_', '');
           const { data: venue } = await supabase.from('venues').select('name').eq('id', venueId).single();
           if (!venue) {
             await sendTelegramMessage(chat.id, '❌ Площадка не найдена.');
             return NextResponse.json({ ok: true });
           }

           const { data: services } = await supabase.from('services').select('id, name, price').eq('venue_id', venueId);
           const svcButtons = (services || []).map(s => ([{
             text: `${s.name} — ${s.price} ₽`,
             callback_data: `svc:${s.id}`
           }]));

           await sendTelegramMessage(chat.id, `👋 Добро пожаловать в <b>${escapeHtml(venue.name)}</b>!\n\nВыберите услугу для записи:`, {
             inline_keyboard: svcButtons
           });
           return NextResponse.json({ ok: true });
        }

        // Validate UUID format to prevent Supabase error
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(masterId)) {
          await sendTelegramMessage(chat.id, '❌ Некорректная ссылка (неверный ID).');
          return NextResponse.json({ ok: true });
        }

        // Fetch master info
        const { data: master, error: masterError } = await supabase.from('masters').select('full_name, specialization, user_id').eq('id', masterId).single();

        if (masterError || !master) {
          console.error('Master lookup error:', masterError);
          await sendTelegramMessage(chat.id, '❌ Мастер не найден. Проверьте правильность ссылки.');
          return NextResponse.json({ ok: true });
        }

        // Upsert client
        const namePart = `${from.first_name || ''} ${from.last_name || ''}`.trim() || 'Клиент';
        const fullName = from.username ? `${namePart} (@${from.username})` : namePart;
        const { error: upsertError } = await supabase.from('clients').upsert({
          owner_id: master.user_id,
          telegram_id: from.id.toString(),
          full_name: fullName
        }, { onConflict: 'owner_id, telegram_id' });

        if (upsertError) {
          console.error('Client upsert error during /start:', upsertError);
        } else {
          console.log(`Client ${fullName} upserted successfully.`);
        }

        const servicesKeyboard = await getServicesKeyboard(masterId);

        if (servicesKeyboard.length === 0) {
          await sendTelegramMessage(chat.id, `👋 Привет! Вы записываетесь к мастеру <b>${escapeHtml(master.full_name)}</b>.\n\nК сожалению, пока нет настроенных услуг для записи. Пожалуйста, свяжитесь напрямую.`);
        } else {
          await sendTelegramMessage(chat.id, `👋 Привет! Вы записываетесь к специалисту <b>${escapeHtml(master.full_name)}</b> (${escapeHtml(master.specialization || '')}).\n\nВыберите действие:`, {
            inline_keyboard: [
                ...servicesKeyboard,
                [{ text: '👤 Мои записи / Перенос', callback_data: `my_bookings:${masterId}` }]
            ]
          });
        }
      }
    } else if (body.callback_query) {
      const { id, data, message, from } = body.callback_query;
      const chatId = message.chat.id;

      try {
        const [action, ...params] = data.split(':');

        // Always ensure client exists (in case they use old buttons or direct links)
        const { data: serviceForClient } = await supabase.from('services').select('master_id').eq('id', params[0]).single();
        if (serviceForClient) {
          const { data: master } = await supabase.from('masters').select('user_id').eq('id', serviceForClient.master_id).single();
          if (master) {
              const namePart = `${from.first_name || ''} ${from.last_name || ''}`.trim() || 'Клиент';
              const fullName = from.username ? `${namePart} (@${from.username})` : namePart;
              const { error: upsertError } = await supabase.from('clients').upsert({
                owner_id: master.user_id,
                telegram_id: from.id.toString(),
                full_name: fullName
              }, { onConflict: 'owner_id, telegram_id' });

              if (upsertError) {
                console.error('Client upsert error during callback:', upsertError);
              } else {
                console.log(`Client ${fullName} upserted successfully via callback.`);
              }
          }
        }

        if (action === 'svc_list') {
          const [masterId] = params;
          const { data: master } = await supabase.from('masters').select('full_name, specialization').eq('id', masterId).single();
          if (master) {
             const servicesKeyboard = await getServicesKeyboard(masterId);
             await sendTelegramMessage(chatId, `🏃 Запись к специалисту <b>${escapeHtml(master.full_name)}</b>\n\nВыберите услугу:`, {
                inline_keyboard: [
                    ...servicesKeyboard,
                    [{ text: '👤 Мои записи / Перенос', callback_data: `my_bookings:${masterId}` }]
                ]
             });
          }
        } else if (action === 'tr_appr') {
           const [sessionId] = params;
           await supabase.from('sessions').update({ status: 'confirmed' }).eq('id', sessionId);
           await sendTelegramMessage(chatId, '✅ Запись подтверждена. Клиент получит уведомление.');

           // Trigger client notification
           const notifyUrl = `${url.origin}/api/notify`;
           console.log(`Bot: Triggering notification for session ${sessionId} confirmed`);
           fetch(notifyUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, status: 'confirmed' })
           }).then(r => console.log(`Bot: Notify response status ${r.status}`))
             .catch(e => console.error('Notify error from bot:', e));

        } else if (action === 'tr_rejt') {
           const [sessionId] = params;
           await supabase.from('sessions').update({ status: 'rejected' }).eq('id', sessionId);
           await sendTelegramMessage(chatId, '❌ Запись отклонена.');

           const { data: sessionData } = await supabase.from('sessions').select('client:clients!client_id(telegram_id), master:masters!master_id(full_name)').eq('id', sessionId).single();
           if (sessionData && (sessionData.client as any)?.telegram_id) {
              await sendTelegramMessage((sessionData.client as any).telegram_id, `❌ <b>Ваша заявка отклонена мастером ${(sessionData.master as any)?.full_name}.</b>`);
           }
        } else if (action === 'tr_rsch') {
           const [sessionId] = params;
           await supabase.from('sessions').update({ status: 'rejected' }).eq('id', sessionId);
           await sendTelegramMessage(chatId, '📅 Предложение о переносе отправлено клиенту.');

           const { data: sessionData } = await supabase.from('sessions').select('service_id, client:clients!client_id(telegram_id), master:masters!master_id(full_name)').eq('id', sessionId).single();
           if (sessionData && (sessionData.client as any)?.telegram_id) {
              const message = `❌ <b>Мастер ${(sessionData.master as any)?.full_name} отклонил вашу текущую заявку, но предлагает выбрать другое время!</b>\n\nПожалуйста, выберите подходящую дату для записи:`;
              await sendTelegramMessage((sessionData.client as any).telegram_id, message, {
                  inline_keyboard: await getDatesKeyboard(sessionData.service_id)
              });
           }
        } else if (action === 'rate_init') {
           const [sessionId] = params;
           const { data: session } = await supabase.from('sessions').select('master:masters!master_id(full_name)').eq('id', sessionId).single();

           if (session) {
                await supabase.from('clients').update({ last_bot_state: 'waiting_for_rating', last_session_id: sessionId }).eq('telegram_id', from.id.toString());

                await sendTelegramMessage(chatId, `⭐ Пожалуйста, оцените ваш визит к специалисту <b>${escapeHtml((session.master as any).full_name)}</b>:`, {
                    inline_keyboard: [
                        [
                            { text: '1 ⭐', callback_data: `rate_val:${sessionId}:1` },
                            { text: '2 ⭐', callback_data: `rate_val:${sessionId}:2` },
                            { text: '3 ⭐', callback_data: `rate_val:${sessionId}:3` },
                            { text: '4 ⭐', callback_data: `rate_val:${sessionId}:4` },
                            { text: '5 ⭐', callback_data: `rate_val:${sessionId}:5` }
                        ]
                    ]
                });
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

                await supabase.from('clients').update({ last_bot_state: 'waiting_for_comment', last_session_id: sessionId }).eq('telegram_id', from.id.toString());

                await sendTelegramMessage(chatId, '⭐ <b>Оценка сохранена!</b>\n\nТеперь вы можете написать текстовый отзыв или отправить /skip, чтобы пропустить этот шаг.');
           }
        } else if (action === 'my_bookings') {
          const [masterId] = params;
          const { data: master } = await supabase.from('masters').select('user_id').eq('id', masterId).single();
          if (master) {
              const { data: client } = await supabase.from('clients').select('id').eq('owner_id', master.user_id).eq('telegram_id', from.id.toString()).single();

              if (!client) {
                 await sendTelegramMessage(chatId, '❌ У вас пока нет записей к этому специалисту.');
              } else {
                 const { data: sessions } = await supabase.from('sessions')
                    .select('id, start_time, service:services!service_id(name)')
                    .eq('client_id', client.id)
                    .gte('start_time', new Date().toISOString())
                    .order('start_time');

                 if (!sessions || sessions.length === 0) {
                    await sendTelegramMessage(chatId, '📅 У вас нет предстоящих записей.');
                 } else {
                    let msg = '<b>Ваши предстоящие записи:</b>\n\n';
                    const buttons = [];

                    for (const s of sessions) {
                        const d = new Date(s.start_time);
                        const label = `${d.toLocaleDateString('ru-RU')} ${s.start_time.split('T')[1].slice(0, 5)} — ${(s.service as any)?.name}`;
                        msg += `• ${label}\n`;
                        buttons.push([{ text: `🔄 Перенести ${s.start_time.split('T')[1].slice(0, 5)}`, callback_data: `reschedule:${s.id}` }]);
                    }

                    await sendTelegramMessage(chatId, msg, { inline_keyboard: buttons });
                 }
              }
          }
        } else if (action === 'reschedule') {
           const [sessionId] = params;
           const { data: session } = await supabase.from('sessions').select('service_id').eq('id', sessionId).single();
           if (session) {
                await sendTelegramMessage(chatId, '📅 Выберите новую дату для переноса:', {
                    inline_keyboard: await getDatesKeyboard(session.service_id)
                });
                // In a real app, we would store that this interaction is a reschedule for sessionId
           }
        } else if (action === 'svc') {
          const [serviceId] = params;
          const { data: service } = await supabase.from('services').select('id').eq('id', serviceId).single();
          if (!service) {
             await sendTelegramMessage(chatId, '❌ Ошибка: Услуга не найдена или была удалена.');
          } else {
            await sendTelegramMessage(chatId, '📅 Выберите удобную дату:', {
              inline_keyboard: await getDatesKeyboard(serviceId)
            });
          }
        } else if (action === 'date') {
          const [serviceId, date] = params;
          const { data: service } = await supabase.from('services').select('master_id').eq('id', serviceId).single();

          if (!service) {
            await sendTelegramMessage(chatId, '❌ Ошибка: Услуга не найдена.');
          } else {
            const timesKeyboard = await getTimesKeyboard(service.master_id, serviceId, date);
            if (timesKeyboard.length === 0 || (timesKeyboard.length === 1 && timesKeyboard[0][0].callback_data === 'none')) {
              await sendTelegramMessage(chatId, `❌ К сожалению, на <b>${date}</b> нет доступного времени для записи. Пожалуйста, выберите другую дату.`, {
                inline_keyboard: await getDatesKeyboard(serviceId)
              });
            } else {
              await sendTelegramMessage(chatId, `🕒 Выберите время на <b>${date}</b>:`, {
                inline_keyboard: timesKeyboard
              });
            }
          }
        } else if (action === 'book') {
          const [serviceId, date, time] = params;
          const { data: service } = await supabase.from('services').select('master_id, duration, venue_id').eq('id', serviceId).single();

          if (!service) {
            await sendTelegramMessage(chatId, '❌ Ошибка: Услуга не найдена.');
          } else {
            const { data: master } = await supabase.from('masters').select('user_id, full_name, telegram_id').eq('id', service.master_id).single();
            if (master) {
                const { data: client } = await supabase.from('clients')
                  .select('id')
                  .eq('owner_id', master.user_id)
                  .eq('telegram_id', from.id.toString())
                  .single();

                if (client) {
                  // Fetch additional fields if needed (client object might be from a different select if we are in book flow)
                  const { data: fullClient } = await supabase.from('clients').select('id, moyklass_id').eq('id', client.id).single();
                  const currentMoyKlassId = fullClient?.moyklass_id;

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
                    console.error('Session insert error:', sessErr);
                    await sendTelegramMessage(chatId, '❌ Ошибка при создании записи. Пожалуйста, попробуйте позже.');
                    return;
                  }

                  // Notify Master & Venue Owner
                  const { data: clientData } = await supabase.from('clients').select('full_name').eq('id', client.id).single();
                  const { data: svcData } = await supabase.from('services').select('name').eq('id', serviceId).single();

                  const notificationMsg = `🆕 <b>Новая заявка!</b>\n\n` +
                    `Клиент: <b>${escapeHtml(clientData?.full_name || 'Неизвестно')}</b>\n` +
                    `Услуга: <b>${escapeHtml(svcData?.name || 'Услуга')}</b>\n` +
                    `Дата: <b>${date}</b>\n` +
                    `Время: <b>${time}</b>\n\n` +
                    `Выберите действие:`;

                  const inlineKeyboard = [
                    [
                        { text: '✅ Подтвердить', callback_data: `tr_appr:${session.id}` },
                        { text: '❌ Отклонить', callback_data: `tr_rejt:${session.id}` }
                    ],
                    [{ text: '📅 Предложить перенос', callback_data: `tr_rsch:${session.id}` }]
                  ];

                  if (master.telegram_id) {
                     await sendTelegramMessage(master.telegram_id, notificationMsg, { inline_keyboard: inlineKeyboard });
                  }

                  // Notify Venue Owner if different
                  if (service.venue_id) {
                    const { data: venue } = await supabase.from('venues').select('owner_id, name, telegram_id').eq('id', service.venue_id).single();
                    if (venue && venue.owner_id !== master.user_id) {
                      if (venue.telegram_id) {
                        const venueMsg = `🏢 <b>Заявка на вашей площадке (${escapeHtml(venue.name)})</b>\n\n${notificationMsg}`;
                        await sendTelegramMessage(venue.telegram_id, venueMsg, { inline_keyboard: inlineKeyboard });
                      }
                    }
                  }

                  const namePart = `${from.first_name || ''} ${from.last_name || ''}`.trim() || 'Клиент';
                  const clientFullName = from.username ? `${namePart} (@${from.username})` : namePart;

                  await supabase.from('events').insert({
                    profile_id: master.user_id,
                    type: 'booking',
                    message: `Новая заявка от ${clientFullName}`
                  });

                  await sendTelegramMessage(chatId, `✅ <b>Заявка отправлена!</b>\n\nМастер получит уведомление и подтвердит вашу запись. Ожидайте сообщения.`);
                } else {
                  await sendTelegramMessage(chatId, '❌ Ошибка: Клиент не найден. Попробуйте перезапустить бот через ссылку мастера.');
                }
            }
          }
        }
      } catch (err) {
        console.error('Callback error:', err);
      } finally {
        await answerCallbackQuery(id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in bot API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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

  // 1. Fetch master schedule
  let { data: config } = await supabase.from('schedule_config')
    .select('start_hour, end_hour, is_active')
    .eq('master_id', masterId)
    .eq('day_of_week', dayOfWeek)
    .maybeSingle();

  if (!config) {
    // Default schedule if not configured
    config = {
        start_hour: '09:00',
        end_hour: '20:00',
        is_active: dayOfWeek !== 0 // Sunday is off by default
    };
  }

  if (!config.is_active) return [[{ text: 'В этот день нет записи', callback_data: 'none' }]];

  let start = parseInt(config.start_hour.split(':')[0]);
  let end = parseInt(config.end_hour.split(':')[0]);

  // 2. Fetch service info to check venue
  const { data: service } = await supabase.from('services').select('is_group, venue_id').eq('id', serviceId).single();

  // 3. Intersect with venue schedule if exists
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

      // Tighten the window
      start = Math.max(start, vStart);
      end = Math.min(end, vEnd);

      if (start >= end) return [[{ text: 'Нет пересечения времени мастера и площадки', callback_data: 'none' }]];
    }
  }

  // Fetch info about the selected service (to get is_group flag)
  const isSelectedGroup = service?.is_group || false;

  // Fetch existing sessions and blocks
  const { data: sessions } = await supabase.from('sessions')
    .select('start_time, service:services!service_id(is_group)')
    .eq('master_id', masterId)
    .filter('start_time', 'gte', `${date}T00:00:00`)
    .filter('start_time', 'lte', `${date}T23:59:59`);

  const { data: blocks } = await supabase.from('blocked_slots')
    .select('start_hour, end_hour, all_day')
    .eq('master_id', masterId)
    .eq('date', date);

  const bookedTimes = (sessions || []).map(s => s.start_time.split('T')[1].slice(0, 5));

  const times = [];
  for (let h = start; h < end; h++) {
    const time = `${h.toString().padStart(2, '0')}:00`;

    // Logic for slot availability:
    // 1. If the selected service is NOT group: the slot must be completely empty.
    // 2. If the selected service IS group: the slot is available if there are NO individual sessions.

    const existingSessionsAtTime = (sessions || []).filter(s => s.start_time.split('T')[1].slice(0, 5) === time);
    const hasIndividualSession = existingSessionsAtTime.some(s => !(s.service as any)?.is_group);
    const hasAnySession = existingSessionsAtTime.length > 0;

    let isBooked = false;
    if (!isSelectedGroup) {
      isBooked = hasAnySession;
    } else {
      isBooked = hasIndividualSession;
    }

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

  // Group times into rows of 4
  const rows = [];
  for (let i = 0; i < times.length; i += 4) {
    rows.push(times.slice(i, i + 4));
  }
  return rows;
}
