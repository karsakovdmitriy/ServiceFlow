const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function sendTelegramMessage(chatId: string | number, text: string, replyMarkup?: any) {
  if (!BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN is not defined');
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_markup: replyMarkup,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Telegram API Error:', err);
    }

    return response.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  if (!BOT_TOKEN) return;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text
      })
    });
  } catch (error) {
    console.error('Error answering callback query:', error);
  }
}

export function getBotUsername() {
    // In a real app, you might fetch this once or keep in env
    return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'TrainerSpaceBot';
}

export function getTrainerDeepLink(trainerId: string) {
    return `https://t.me/${getBotUsername()}?start=${trainerId}`;
}
