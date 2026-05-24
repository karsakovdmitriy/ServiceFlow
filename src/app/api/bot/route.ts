import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  if (!BOT_TOKEN) return;

  const payload: any = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML'
  };

  if (replyMarkup && replyMarkup.inline_keyboard && replyMarkup.inline_keyboard.length > 0) {
    payload.reply_markup = replyMarkup;
  }

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Telegram API Error:', JSON.stringify(errorData, null, 2));
    console.error('Payload was:', JSON.stringify(payload, null, 2));
  }
}

async function answerCallbackQuery(callbackQueryId: string) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId })
  });
}

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

      if (text?.startsWith('/start')) {
        const parts = text.split(' ');
        let trainerId = parts[1];

        if (!trainerId) {
          await sendTelegramMessage(chat.id, '👋 Привет! Чтобы записаться к тренеру, используйте специальную ссылку от вашего тренера.');
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
        await supabase.from('clients').upsert({
          trainer_id: trainerId,
          telegram_id: from.id.toString(),
          full_name: fullName
        }, { onConflict: 'trainer_id, telegram_id' });

        const servicesKeyboard = await getServicesKeyboard(trainerId);

        if (servicesKeyboard.length === 0) {
          await sendTelegramMessage(chat.id, `👋 Привет! Вы записываетесь к тренеру <b>${escapeHtml(trainer.full_name)}</b>.\n\nК сожалению, у тренера пока нет настроенных услуг для записи. Пожалуйста, свяжитесь с ним напрямую.`);
        } else {
          await sendTelegramMessage(chat.id, `👋 Привет! Вы записываетесь к тренеру <b>${escapeHtml(trainer.full_name)}</b> (${escapeHtml(trainer.specialization || '')}).\n\nВыберите услугу:`, {
            inline_keyboard: servicesKeyboard
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
          await supabase.from('clients').upsert({
            trainer_id: serviceForClient.trainer_id,
            telegram_id: from.id.toString(),
            full_name: fullName
          }, { onConflict: 'trainer_id, telegram_id' });
        }

        if (action === 'svc') {
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
          const { data: service } = await supabase.from('services').select('trainer_id, duration').eq('id', serviceId).single();

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

              await supabase.from('sessions').insert({
                trainer_id: service.trainer_id,
                client_id: client.id,
                service_id: serviceId,
                start_time: startTime,
                end_time: endTime,
                status: 'pending'
              });

              await sendTelegramMessage(chatId, `✅ <b>Заявка отправлена!</b>\n\nТренер получит уведомление и подтвердит вашу запись. Ожидайте сообщения.`);
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
  const { data: services } = await supabase.from('services').select('id, name, price').eq('trainer_id', trainerId);
  return (services || []).map(s => ([{
    text: `${s.name} — ${s.price} ₽`,
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
  const { data: config } = await supabase.from('schedule_config')
    .select('start_hour, end_hour, is_active')
    .eq('trainer_id', trainerId)
    .eq('day_of_week', dayOfWeek)
    .single();

  if (!config || !config.is_active) return [[{ text: 'В этот день нет записи', callback_data: 'none' }]];

  const start = parseInt(config.start_hour.split(':')[0]);
  const end = parseInt(config.end_hour.split(':')[0]);

  // Fetch existing sessions and blocks
  const { data: sessions } = await supabase.from('sessions')
    .select('start_time')
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

    const isBooked = bookedTimes.includes(time);
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
