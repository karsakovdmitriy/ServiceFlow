import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Logic to handle Telegram Webhook
    // 1. Authenticate the bot token (from environment or DB)
    // 2. Parse the message ( body.message )
    // 3. Handle commands: /start, "Записаться", etc.
    // 4. Interface with Supabase to check availability and create sessions

    const { message } = body;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

    let responseText = '';
    let replyMarkup = {};

    if (text === '/start') {
      responseText = '👋 Привет! Я помогу записаться на тренировку.\n\nВыберите действие:';
      replyMarkup = {
        keyboard: [
          [{ text: '📅 Записаться' }, { text: '👤 Мои записи' }],
          [{ text: '❓ Помощь' }]
        ],
        resize_keyboard: true
      };
    } else if (text === '📅 Записаться') {
      responseText = 'Отлично! Выберите удобный день:';
      // In a real app, these would be generated based on the trainer's schedule
      replyMarkup = {
        inline_keyboard: [
          [{ text: 'ПН 19 мая', callback_data: 'day_19' }, { text: 'ВТ 20 мая', callback_data: 'day_20' }],
          [{ text: 'СР 21 мая', callback_data: 'day_21' }, { text: 'ЧТ 22 мая', callback_data: 'day_22' }]
        ]
      };
    } else {
      responseText = 'Я получил ваше сообщение: ' + text;
    }

    // Here you would call fetch('https://api.telegram.org/bot<TOKEN>/sendMessage', ...)

    return NextResponse.json({
      method: 'sendMessage',
      chat_id: chatId,
      text: responseText,
      reply_markup: replyMarkup
    });
  } catch (error) {
    console.error('Error in bot API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
