const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendTelegramMessage(chatId: string | number, text: string, replyMarkup?: any) {
  if (!BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN is not defined');
    return;
  }

  const payload: any = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML'
  };

  if (replyMarkup && replyMarkup.inline_keyboard && replyMarkup.inline_keyboard.length > 0) {
    payload.reply_markup = replyMarkup;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Telegram API Error:', JSON.stringify(data, null, 2));
      console.error('Payload was:', JSON.stringify(payload, null, 2));
    }

    return data;
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
    return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'TrainerSpaceBot';
}

export function getMasterDeepLink(masterId: string) {
    return `https://t.me/${getBotUsername()}?start=${masterId}`;
}

export function getTrainerDeepLink(trainerId: string) {
    return getMasterDeepLink(trainerId);
}
