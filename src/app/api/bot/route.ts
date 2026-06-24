import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage, answerCallbackQuery, escapeHtml } from '@/lib/telegram';
import { MoyKlassClient } from '@/lib/moyklass';

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

      // Handle direct messages to trainer and Review comments
      if (text) {
         const { data: client } = await supabase.from('clients').select('id, trainer_id, full_name, last_bot_state, last_session_id').eq('telegram_id', from.id.toString()).limit(1).single();

         if (client) {
            if (client.last_bot_state === 'waiting_for_comment' && client.last_session_id) {
               // This is a review comment
               await supabase.from('reviews').update({ comment: text }).eq('session_id', client.last_session_id);
               await supabase.from('clients').update({ last_bot_state: null, last_session_id: null }).eq('id', client.id);

               await sendTelegramMessage(chat.id, '✅ <b>Спасибо за ваш отзыв!</b> Он очень важен для нас.');

               // Log review event
               await supabase.from('events').insert({
                 trainer_id: client.trainer_id,
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
                    trainer_id: client.trainer_id,
                    client_id: client.id,
                    sender_type: 'client',
                    text
                });

                await supabase.from('events').insert({
                trainer_id: client.trainer_id,
                type: 'message',
                message: `Новое сообщение от ${client.full_name}`
                });

                // Notify trainer about message
                const { data: trainer } = await supabase.from('trainers').select('telegram_id').eq('id', client.trainer_id).single();
                if (trainer?.telegram_id) {
                    await sendTelegramMessage(trainer.telegram_id, `💬 <b>Новое сообщение от ${escapeHtml(client.full_name)}:</b>\n\n${escapeHtml(text)}`);
                }
            }
         }
      }

      if (text?.startsWith('/start')) {
        const parts = text.split(' ');
        let trainerId = parts[1];

        if (!trainerId) {
          const { data: previousClients } = await supabase.from('clients')
            .select('trainer_id, trainers:trainers!trainer_id(full_name)')
            .eq('telegram_id', from.id.toString());

          if (previousClients && previousClients.length > 0) {
            // Filter unique trainers
            const seen = new Set();
            const uniqueTrainers = previousClients.filter(pc => {
              if (seen.has(pc.trainer_id)) return false;
              seen.add(pc.trainer_id);
              return true;
            });

            const trainerButtons = uniqueTrainers.map(pc => ([{
              text: `🏃 Записаться к ${escapeHtml((pc.trainers as any).full_name)}`,
              callback_data: `svc_list:${pc.trainer_id}`
            }]));

            await sendTelegramMessage(chat.id, '👋 <b>С возвращением!</b>\n\nВыберите тренера из вашей истории для новой записи:', {
              inline_keyboard: trainerButtons
            });
          } else {
            await sendTelegramMessage(chat.id, '👋 Привет! Чтобы записаться к тренеру, используйте специальную ссылку от вашего тренера.');
          }
          return NextResponse.json({ ok: true });
        }

        // Handle Trainer Linking
        if (trainerId.startsWith('link_')) {
          const actualTrainerId = trainerId.replace('link_', '');

          // Validate UUID format for linking
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(actualTrainerId)) {
            await sendTelegramMessage(chat.id, '❌ Некорректная ссылка для привязки.');
            return NextResponse.json({ ok: true });
          }

          const { data: trainer, error: trainerError } = await supabase.from('trainers').select('full_name').eq('id', actualTrainerId).single();

          if (trainerError || !trainer) {
             await sendTelegramMessage(chat.id, '❌ Ошибка при привязке: Тренер не найден.');
             return NextResponse.json({ ok: true });
          }

          await supabase.from('trainers').update({ telegram_id: from.id.toString() }).eq('id', actualTrainerId);
          await sendTelegramMessage(chat.id, `✅ <b>Аккаунт успешно привязан!</b>\n\nТеперь вы (${escapeHtml(trainer.full_name)}) будете получать уведомления о новых записях в этот чат.`);

          await supabase.from('events').insert({
            trainer_id: actualTrainerId,
            type: 'system',
            message: 'Telegram аккаунт успешно привязан'
          });

          return NextResponse.json({ ok: true });
        }

        // Handle Venue Booking
        if (trainerId.startsWith('v_')) {
           const venueId = trainerId.replace('v_', '');
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
        if (!uuidRegex.test(trainerId)) {
          await sendTelegramMessage(chat.id, '❌ Некорректная ссылка (неверный ID тренера).');
          return NextResponse.json({ ok: true });
        }

        // Fetch trainer info
        const { data: trainer, error: trainerError } = await supabase.from('trainers').select('full_name, specialization').eq('id', trainerId).single();

        if (trainerError || !trainer) {
          console.error('Trainer lookup error:', trainerError);
          await sendTelegramMessage(chat.id, '❌ Тренер не найден. Проверьте правильность ссылки.');
          return NextResponse.json({ ok: true });
        }

        // Upsert client
        const namePart = `${from.first_name || ''} ${from.last_name || ''}`.trim() || 'Клиент';
        const fullName = from.username ? `${namePart} (@${from.username})` : namePart;
        const { error: upsertError } = await supabase.from('clients').upsert({
          trainer_id: trainerId,
          telegram_id: from.id.toString(),
          full_name: fullName
        }, { onConflict: 'trainer_id, telegram_id' });

        if (upsertError) {
          console.error('Client upsert error during /start:', upsertError);
        } else {
          console.log(`Client ${fullName} upserted successfully.`);
        }

        const servicesKeyboard = await getServicesKeyboard(trainerId);

        if (servicesKeyboard.length === 0) {
          await sendTelegramMessage(chat.id, `👋 Привет! Вы записываетесь к тренеру <b>${escapeHtml(trainer.full_name)}</b>.\n\nК сожалению, у тренера пока нет настроенных услуг для записи. Пожалуйста, свяжитесь с ним напрямую.`);
        } else {
          await sendTelegramMessage(chat.id, `👋 Привет! Вы записываетесь к тренеру <b>${escapeHtml(trainer.full_name)}</b> (${escapeHtml(trainer.specialization || '')}).\n\nВыберите действие:`, {
            inline_keyboard: [
                ...servicesKeyboard,
                [{ text: '👤 Мои записи / Перенос', callback_data: `my_bookings:${trainerId}` }]
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
        const { data: serviceForClient } = await supabase.from('services').select('trainer_id').eq('id', params[0]).single();
        if (serviceForClient) {
          const namePart = `${from.first_name || ''} ${from.last_name || ''}`.trim() || 'Клиент';
          const fullName = from.username ? `${namePart} (@${from.username})` : namePart;
          const { error: upsertError } = await supabase.from('clients').upsert({
            trainer_id: serviceForClient.trainer_id,
            telegram_id: from.id.toString(),
            full_name: fullName
          }, { onConflict: 'trainer_id, telegram_id' });

          if (upsertError) {
            console.error('Client upsert error during callback:', upsertError);
          } else {
            console.log(`Client ${fullName} upserted successfully via callback.`);
          }
        }

        if (action === 'svc_list') {
          const [trainerId] = params;
          const { data: trainer } = await supabase.from('trainers').select('full_name, specialization').eq('id', trainerId).single();
          if (trainer) {
             const servicesKeyboard = await getServicesKeyboard(trainerId);
             await sendTelegramMessage(chatId, `🏃 Запись к тренеру <b>${escapeHtml(trainer.full_name)}</b>\n\nВыберите услугу:`, {
                inline_keyboard: [
                    ...servicesKeyboard,
                    [{ text: '👤 Мои записи / Перенос', callback_data: `my_bookings:${trainerId}` }]
                ]
             });
          }
        } else if (action === 'tr_appr') {
           const [sessionId] = params;
           await supabase.from('sessions').update({ status: 'confirmed' }).eq('id', sessionId);
           await sendTelegramMessage(chatId, '✅ Запись подтверждена. Клиент получит уведомление.');

           // Trigger client notification
           const notifyUrl = `${url.origin}/api/notify`;
           fetch(notifyUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, status: 'confirmed' })
           }).catch(e => console.error('Notify error from bot:', e));

        } else if (action === 'tr_rejt') {
           const [sessionId] = params;
           await supabase.from('sessions').update({ status: 'rejected' }).eq('id', sessionId);
           await sendTelegramMessage(chatId, '❌ Запись отклонена.');

           const { data: sessionData } = await supabase.from('sessions').select('client:clients!client_id(telegram_id), trainer:trainers!trainer_id(full_name)').eq('id', sessionId).single();
           if (sessionData && (sessionData.client as any)?.telegram_id) {
              await sendTelegramMessage((sessionData.client as any).telegram_id, `❌ <b>Ваша заявка отклонена тренером ${(sessionData.trainer as any)?.full_name}.</b>`);
           }
        } else if (action === 'tr_rsch') {
           const [sessionId] = params;
           await supabase.from('sessions').update({ status: 'rejected' }).eq('id', sessionId);
           await sendTelegramMessage(chatId, '📅 Предложение о переносе отправлено клиенту.');

           const { data: sessionData } = await supabase.from('sessions').select('client:clients!client_id(telegram_id), trainer:trainers!trainer_id(full_name)').eq('id', sessionId).single();
           if (sessionData && (sessionData.client as any)?.telegram_id) {
              const message = `❌ <b>Тренер ${(sessionData.trainer as any)?.full_name} отклонил вашу заявку.</b>\n\nНо он предлагает вам выбрать другое время! Пожалуйста, воспользуйтесь меню бота для повторной записи.`;
              await sendTelegramMessage((sessionData.client as any).telegram_id, message);
           }
        } else if (action === 'rate_init') {
           const [sessionId] = params;
           const { data: session } = await supabase.from('sessions').select('trainer:trainers!trainer_id(full_name)').eq('id', sessionId).single();

           if (session) {
                await supabase.from('clients').update({ last_bot_state: 'waiting_for_rating', last_session_id: sessionId }).eq('telegram_id', from.id.toString());

                await sendTelegramMessage(chatId, `⭐ Пожалуйста, оцените вашу тренировку с тренером <b>${escapeHtml((session.trainer as any).full_name)}</b>:`, {
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
           const { data: session } = await supabase.from('sessions').select('trainer_id, client_id').eq('id', sessionId).single();

           if (session) {
                await supabase.from('reviews').upsert({
                    trainer_id: session.trainer_id,
                    client_id: session.client_id,
                    session_id: sessionId,
                    rating: parseInt(rating)
                }, { onConflict: 'session_id' });

                await supabase.from('clients').update({ last_bot_state: 'waiting_for_comment', last_session_id: sessionId }).eq('telegram_id', from.id.toString());

                await sendTelegramMessage(chatId, '⭐ <b>Оценка сохранена!</b>\n\nТеперь вы можете написать текстовый отзыв или отправить /skip, чтобы пропустить этот шаг.');
           }
        } else if (action === 'my_bookings') {
          const [trainerId] = params;
          const { data: client } = await supabase.from('clients').select('id').eq('trainer_id', trainerId).eq('telegram_id', from.id.toString()).single();

          if (!client) {
             await sendTelegramMessage(chatId, '❌ У вас пока нет записей к этому тренеру.');
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
          const { data: service } = await supabase.from('services').select('trainer_id').eq('id', serviceId).single();

          if (!service) {
            await sendTelegramMessage(chatId, '❌ Ошибка: Услуга не найдена.');
          } else {
            const timesKeyboard = await getTimesKeyboard(service.trainer_id, serviceId, date);
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
          const { data: service } = await supabase.from('services').select('trainer_id, duration, venue_id').eq('id', serviceId).single();

          if (!service) {
            await sendTelegramMessage(chatId, '❌ Ошибка: Услуга не найдена.');
          } else {
            const { data: client } = await supabase.from('clients')
              .select('id')
              .eq('trainer_id', service.trainer_id)
              .eq('telegram_id', from.id.toString())
              .single();

            if (client) {
              const startTime = `${date}T${time}:00`;
              const end = new Date(`${date}T${time}:00`);
              end.setMinutes(end.getMinutes() + service.duration);
              const endTime = end.toISOString().replace('.000Z', '+00:00');

              const { data: session, error: sessErr } = await supabase.from('sessions').insert({
                trainer_id: service.trainer_id,
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

              // Notify Trainer & Venue Owner
              const { data: clientData } = await supabase.from('clients').select('full_name').eq('id', client.id).single();
              const { data: svcData } = await supabase.from('services').select('name').eq('id', serviceId).single();
              const { data: trainer } = await supabase.from('trainers').select('telegram_id, full_name').eq('id', service.trainer_id).single();

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

              if (trainer?.telegram_id) {
                 await sendTelegramMessage(trainer.telegram_id, notificationMsg, { inline_keyboard: inlineKeyboard });
              }

              // Notify Venue Owner if different
              if (service.venue_id) {
                const { data: venue } = await supabase.from('venues').select('trainer_id, name').eq('id', service.venue_id).single();
                if (venue && venue.trainer_id !== service.trainer_id) {
                  const { data: venueOwner } = await supabase.from('trainers').select('telegram_id').eq('id', venue.trainer_id).single();
                  if (venueOwner?.telegram_id) {
                    const venueMsg = `🏢 <b>Заявка на вашей площадке (${escapeHtml(venue.name)})</b>\n\n${notificationMsg}`;
                    await sendTelegramMessage(venueOwner.telegram_id, venueMsg, { inline_keyboard: inlineKeyboard });
                  }
                }
              }

              const namePart = `${from.first_name || ''} ${from.last_name || ''}`.trim() || 'Клиент';
              const clientFullName = from.username ? `${namePart} (@${from.username})` : namePart;

              await supabase.from('events').insert({
                trainer_id: service.trainer_id,
                type: 'booking',
                message: `Новая заявка от ${clientFullName}`
              });

              await sendTelegramMessage(chatId, `✅ <b>Заявка отправлена!</b>\n\nТренер получит уведомление и подтвердит вашу запись. Ожидайте сообщения.`);

              // MoyKlass Sync
              const { data: trainerProfile } = await supabase.from('trainers').select('moyklass_api_key, moyklass_filial_id, moyklass_enabled').eq('id', service.trainer_id).single();
              if (trainerProfile?.moyklass_enabled && trainerProfile?.moyklass_api_key) {
                try {
                  const mk = new MoyKlassClient(trainerProfile.moyklass_api_key);
                  const contact = from.username ? `@${from.username}` : (from.id.toString());

                  let mkUser = await mk.findUserByContact(contact);
                  if (!mkUser) {
                    mkUser = await mk.createUser({
                      name: clientData?.full_name || 'Клиент из Telegram',
                      phone: from.id.toString() // Using TG ID as placeholder if no phone
                    });
                  }

                  if (mkUser) {
                    const lessons = await mk.getLessons({
                      from: date,
                      to: date,
                      filialId: trainerProfile.moyklass_filial_id
                    });

                    // Match lesson by time (rough matching)
                    const lesson = lessons.find((l: any) => l.date === date && l.beginTime?.startsWith(time));
                    if (lesson) {
                      await mk.createRecord(lesson.id, mkUser.id);
                      console.log('MoyKlass: Record created for lesson', lesson.id);
                    }
                  }
                } catch (mkErr) {
                  console.error('MoyKlass Sync Error:', mkErr);
                }
              }

            } else {
              await sendTelegramMessage(chatId, '❌ Ошибка: Клиент не найден. Попробуйте перезапустить бот через ссылку тренера.');
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

async function getServicesKeyboard(trainerId: string) {
  const supabase = getSupabase();
  const { data: services } = await supabase.from('services').select('id, name, price, venues!venue_id(name)').eq('trainer_id', trainerId);
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

async function getTimesKeyboard(trainerId: string, serviceId: string, date: string) {
  const supabase = getSupabase();
  const dayOfWeek = new Date(date).getDay();

  // 1. Fetch trainer schedule
  const { data: config } = await supabase.from('schedule_config')
    .select('start_hour, end_hour, is_active')
    .eq('trainer_id', trainerId)
    .eq('day_of_week', dayOfWeek)
    .single();

  if (!config || !config.is_active) return [[{ text: 'В этот день нет записи', callback_data: 'none' }]];

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
    .eq('trainer_id', trainerId)
    .filter('start_time', 'gte', `${date}T00:00:00`)
    .filter('start_time', 'lte', `${date}T23:59:59`);

  const { data: blocks } = await supabase.from('blocked_slots')
    .select('start_hour, end_hour, all_day')
    .eq('trainer_id', trainerId)
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
