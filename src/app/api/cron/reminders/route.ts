import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 });
  }

  const supabase = createClient(url, key);

  try {
    const now = new Date();

    // 1. Reminders for sessions starting in ~1 hour
    const reminderStart = new Date(now.getTime() + 55 * 60000);
    const reminderEnd = new Date(now.getTime() + 65 * 60000);

    const { data: upcoming } = await supabase
      .from('sessions')
      .select(`
        id,
        start_time,
        client:clients!client_id(telegram_id, full_name),
        service:services!service_id(name),
        trainer:trainers!trainer_id(full_name)
      `)
      .eq('status', 'confirmed')
      .gte('start_time', reminderStart.toISOString())
      .lte('start_time', reminderEnd.toISOString());

    if (upcoming) {
      for (const session of upcoming) {
        const clientTelegramId = (session.client as any)?.telegram_id;
        if (clientTelegramId) {
            const timeStr = session.start_time.split('T')[1].slice(0, 5);
            const message = `⏰ <b>Напоминание о тренировке!</b>\n\n` +
              `Через час у вас занятие с тренером <b>${(session.trainer as any)?.full_name}</b>.\n` +
              `Услуга: <b>${(session.service as any)?.name}</b>\n` +
              `Начало в: <b>${timeStr}</b>\n\n` +
              `Ждем вас!`;
            await sendTelegramMessage(clientTelegramId, message);
        }
      }
    }

    // 2. Follow-ups for sessions completed ~1 hour ago
    const followUpStart = new Date(now.getTime() - 65 * 60000);
    const followUpEnd = new Date(now.getTime() - 55 * 60000);

    const { data: completed } = await supabase
      .from('sessions')
      .select(`
        id,
        client:clients!client_id(telegram_id, full_name),
        trainer:trainers!trainer_id(full_name)
      `)
      .eq('status', 'completed')
      .gte('end_time', followUpStart.toISOString())
      .lte('end_time', followUpEnd.toISOString());

    if (completed) {
      for (const session of completed) {
        const clientTelegramId = (session.client as any)?.telegram_id;
        if (clientTelegramId) {
            const message = `💪 <b>Как прошла тренировка?</b>\n\n` +
              `Надеемся, вам понравилось занятие с тренером <b>${(session.trainer as any)?.full_name}</b>!\n\n` +
              `Будем рады вашему отзыву. Также вы уже можете записаться на следующую тренировку через меню бота.`;
            await sendTelegramMessage(clientTelegramId, message);
        }
      }
    }

    return NextResponse.json({ ok: true, reminders: upcoming?.length || 0, followUps: completed?.length || 0 });
  } catch (error) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
