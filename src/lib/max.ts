const BOT_TOKEN = process.env.MAX_BOT_TOKEN;

export function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendMaxMessage(chatId: string | number, text: string, replyMarkup?: any) {
  if (!BOT_TOKEN) {
    console.warn('MAX_BOT_TOKEN is not defined');
    return;
  }

  const payload: any = {
    chat_id: chatId,
    text,
    format: 'html'
  };

  if (replyMarkup && replyMarkup.inline_keyboard) {
    payload.attachments = [
      {
        type: 'inline_keyboard',
        payload: {
          buttons: replyMarkup.inline_keyboard.map((row: any[]) =>
            row.map(btn => ({
              type: btn.url ? 'link' : 'callback',
              text: btn.text,
              url: btn.url,
              payload: btn.callback_data
            }))
          )
        }
      }
    ];
  }

  try {
    const response = await fetch(`https://platform-api2.max.ru/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': BOT_TOKEN
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('MAX API Error:', JSON.stringify(data, null, 2));
      console.error('Payload was:', JSON.stringify(payload, null, 2));
    }

    return data;
  } catch (error) {
    console.error('Error sending MAX message:', error);
  }
}

export async function answerMaxCallback(callbackQueryId: string, text?: string) {
  if (!BOT_TOKEN) return;

  try {
    await fetch(`https://platform-api2.max.ru/answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': BOT_TOKEN
      },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text
      })
    });
  } catch (error) {
    console.error('Error answering MAX callback query:', error);
  }
}

export function getMaxBotUsername() {
    return process.env.NEXT_PUBLIC_MAX_BOT_USERNAME || 'TrainerSpaceBot';
}

export function getMasterMaxDeepLink(masterId: string) {
    return `https://max.ru/${getMaxBotUsername()}?start=${masterId}`;
}
