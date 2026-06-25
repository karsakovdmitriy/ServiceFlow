import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '@/lib/telegram';
import { sendMaxMessage } from '@/lib/max';

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
