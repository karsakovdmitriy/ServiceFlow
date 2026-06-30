import https from 'https';

const BOT_TOKEN = process.env.MAX_BOT_TOKEN;

/**
 * Robust request helper for MAX API using native https to bypass CA certificate issues.
 * Russian platforms often use local CAs not present in default trust stores.
 */
async function maxRequest(path: string, method: string, payload: any) {
  if (!BOT_TOKEN) {
    console.warn('MAX_BOT_TOKEN is not defined');
    return null;
  }

  const data = JSON.stringify(payload);
  const options = {
    hostname: 'platform-api2.max.ru',
    port: 443,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': BOT_TOKEN,
      'Content-Length': Buffer.byteLength(data)
    },
    // Bypass certificate validation
    rejectUnauthorized: false
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsedBody = body ? JSON.parse(body) : {};
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedBody);
          } else {
            console.error(`MAX API Error (${res.statusCode}):`, JSON.stringify(parsedBody, null, 2));
            resolve(parsedBody);
          }
        } catch (e) {
          resolve({ error: 'Failed to parse response' });
        }
      });
    });

    req.on('error', (error) => {
      console.error('MAX API Connection Error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

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
    return await maxRequest(`/messages?${paramName}=${chatId}`, 'POST', payload);
  } catch (error) {
    console.error('Error sending MAX message:', error);
  }
}

export async function answerMaxCallback(callbackId: string, text?: string) {
  try {
    await maxRequest(`/answers?callback_id=${encodeURIComponent(callbackId)}`, 'POST', {
      callback_id: callbackId,
      notification: text
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
