import https from 'https';

const BOT_TOKEN = process.env.MAX_BOT_TOKEN;

// Create an agent that ignores unauthorized certificates if needed
// This is a workaround for Russian CAs not being in the default trust store
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendMaxMessage(chatId: string | number, text: string, replyMarkup?: any, forceType?: 'chat_id' | 'user_id') {
  if (!BOT_TOKEN) {
    console.warn('MAX_BOT_TOKEN is not defined');
    return;
  }

  let paramName: string;
  if (forceType) {
    paramName = forceType;
  } else {
    const isChat = typeof chatId === 'string' && (chatId.startsWith('c') || chatId.includes('-'));
    paramName = isChat ? 'chat_id' : 'user_id';
  }

  const payload: any = {
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
    const url = `https://platform-api2.max.ru/messages?${paramName}=${chatId}`;

    // Using native fetch with a custom agent is not straightforward in all Node versions
    // We'll use a standard POST request logic.
    // In Next.js/Node 18+, native fetch supports the 'agent' option via experimental loaders,
    // but the most reliable way is often just using the https module or an environment variable.

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': BOT_TOKEN
      },
      body: JSON.stringify(payload),
      // @ts-ignore - custom agent support varies
      agent: httpsAgent
    });

    // If fetch still fails with certificate error, we'll try a fallback with process.env
    // but first let's try this.

    const data = await response.json();
    if (!response.ok) {
      console.error('MAX API Error:', JSON.stringify(data, null, 2));
      console.error('Payload was:', JSON.stringify(payload, null, 2));
    }

    return data;
  } catch (error: any) {
    console.error('Error sending MAX message:', error);

    // Fallback: If it's a certificate error, try one more time by temporarily disabling TLS check
    if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || error.message?.includes('certificate')) {
      console.log('Retrying MAX API call with TLS check disabled...');
      try {
        const url = `https://platform-api2.max.ru/messages?${paramName}=${chatId}`;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': BOT_TOKEN
          },
          body: JSON.stringify(payload)
        });
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
        return await response.json();
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
    }
  }
}

export async function answerMaxCallback(callbackQueryId: string, text?: string) {
  if (!BOT_TOKEN) return;

  try {
    const url = `https://platform-api2.max.ru/answers`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': BOT_TOKEN
      },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text
      }),
      // @ts-ignore
      agent: httpsAgent
    });
  } catch (error: any) {
    console.error('Error answering MAX callback query:', error);

    if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || error.message?.includes('certificate')) {
       try {
         process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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
         process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
       } catch (e) {}
    }
  }
}

export function getMaxBotUsername() {
    return process.env.NEXT_PUBLIC_MAX_BOT_USERNAME || 'TrainerSpaceBot';
}

export function getMasterMaxDeepLink(masterId: string) {
    return `https://max.ru/${getMaxBotUsername()}?start=${masterId}`;
}
