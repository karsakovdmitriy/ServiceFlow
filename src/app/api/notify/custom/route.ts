import { NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(request: Request) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 });
  }

  try {
    const { chatId, message } = await request.json();

    if (!chatId || !message) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    await sendTelegramMessage(chatId, message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in notify custom API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
