import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '@/lib/telegram';

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
        client:clients!client_id(telegram_id),
        service:services!service_id(name, venues!venue_id(name, address)),
        trainer:trainers!trainer_id(full_name)
      `)
      .eq('id', sessionId)
      .single();

    if (error || !sessionData) {
      console.error('Notify: Session lookup error:', error);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const clientTelegramId = (sessionData.client as any)?.telegram_id;

    if (clientTelegramId) {
      const date = new Date(sessionData.start_time);
      const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      const timeStr = sessionData.start_time.split('T')[1].slice(0, 5);

      const venueInfo = (sessionData.service as any)?.venues;
      const venueText = venueInfo ? `\nПлощадка: <b>${venueInfo.name}</b>${venueInfo.address ? ` (${venueInfo.address})` : ''}` : '';

      let message = '';
      if (status === 'completed') {
        message = `💪 <b>Как прошла тренировка?</b>\n\n` +
          `Надеемся, вам понравилось занятие с тренером <b>${(sessionData.trainer as any)?.full_name}</b>!\n\n` +
          `Будем рады вашему отзыву. Также вы уже можете записаться на следующую тренировку через меню бота.`;
      } else {
        message = `✅ <b>Ваша запись подтверждена!</b>\n\n` +
          `Тренер: <b>${(sessionData.trainer as any)?.full_name}</b>\n` +
          `Услуга: <b>${(sessionData.service as any)?.name}</b>${venueText}\n` +
          `Дата: <b>${dateStr}</b>\n` +
          `Время: <b>${timeStr}</b>\n\n` +
          `Ждем вас на тренировке!`;
      }

      await sendTelegramMessage(clientTelegramId, message);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, message: 'No telegram ID' });
  } catch (error) {
    console.error('Error in notify API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
