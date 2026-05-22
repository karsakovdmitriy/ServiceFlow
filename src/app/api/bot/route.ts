import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper to get supabase client
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: replyMarkup,
      parse_mode: 'HTML'
    })
  });
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log('Bot Update:', JSON.stringify(body, null, 2));

    if (body.message) {
      const { chat, text, from } = body.message;

      if (text?.startsWith('/start')) {
        const parts = text.split(' ');
        let trainerId = parts[1];

        if (!trainerId) {
          await sendTelegramMessage(chat.id, '👋 Привет! Чтобы записаться к тренеру, используйте специальную ссылку от вашего тренера.');
          return NextResponse.json({ ok: true });
        }

        // Fetch trainer info
        const { data: trainer } = await supabase.from('trainers').select('full_name, specialization').eq('id', trainerId).single();

        if (!trainer) {
          await sendTelegramMessage(chat.id, '❌ Тренер не найден.');
          return NextResponse.json({ ok: true });
        }

        // Upsert client
        await supabase.from('clients').upsert({
          trainer_id: trainerId,
          telegram_id: from.id.toString(),
          full_name: `${from.first_name} ${from.last_name || ''}`.trim()
        }, { onConflict: 'trainer_id, telegram_id' });

        await sendTelegramMessage(chat.id, `👋 Привет! Вы записываетесь к тренеру <b>${trainer.full_name}</b> (${trainer.specialization}).\n\nВыберите услугу:`, {
          inline_keyboard: await getServicesKeyboard(trainerId)
        });
      }
    } else if (body.callback_query) {
      const { id, data, message, from } = body.callback_query;
      const chatId = message.chat.id;

      const [action, ...params] = data.split(':');

      if (action === 'svc') {
        const [trainerId, serviceId] = params;
        // Selected service, now show dates
        await sendTelegramMessage(chatId, '📅 Выберите удобную дату:', {
          inline_keyboard: await getDatesKeyboard(trainerId, serviceId)
        });
      } else if (action === 'date') {
        const [trainerId, serviceId, date] = params;
        // Selected date, show times
        await sendTelegramMessage(chatId, `🕒 Выберите время на <b>${date}</b>:`, {
          inline_keyboard: await getTimesKeyboard(trainerId, serviceId, date)
        });
      } else if (action === 'book') {
        const [trainerId, serviceId, date, time] = params;

        // Finalize booking
        const { data: client } = await supabase.from('clients')
          .select('id')
          .eq('trainer_id', trainerId)
          .eq('telegram_id', from.id.toString())
          .single();

        const { data: service } = await supabase.from('services').select('duration').eq('id', serviceId).single();

        if (client && service) {
          const startTime = `${date}T${time}:00`;
          const end = new Date(`${date}T${time}:00`);
          end.setMinutes(end.getMinutes() + service.duration);
          const endTime = end.toISOString().replace('.000Z', '+00:00'); // Simple ISO with offset

          await supabase.from('sessions').insert({
            trainer_id: trainerId,
            client_id: client.id,
            service_id: serviceId,
            start_time: startTime,
            end_time: endTime,
            status: 'pending'
          });

          await sendTelegramMessage(chatId, `✅ <b>Заявка отправлена!</b>\n\nТренер получит уведомление и подтвердит вашу запись. Ожидайте сообщения.`);
        }
      }

      await answerCallbackQuery(id);
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
    callback_data: `svc:${trainerId}:${s.id}`
  }]));
}

async function getDatesKeyboard(trainerId: string, serviceId: string) {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    dates.push([{
      text: d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' }),
      callback_data: `date:${trainerId}:${serviceId}:${dateStr}`
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
        callback_data: `book:${trainerId}:${serviceId}:${date}:${time}`
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
