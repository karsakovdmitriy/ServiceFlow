import { NextResponse } from 'next/server';
import { MoyKlassClient } from '@/lib/moyklass';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    if (!apiKey) return NextResponse.json({ error: 'API key is required' }, { status: 400 });

    const client = new MoyKlassClient(apiKey);

    // Attempt to get filials to verify connectivity and key
    const filials = await client.getFilials();

    return NextResponse.json({ success: true, filials });
  } catch (error: any) {
    console.error('MoyKlass Test Connection Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Ошибка подключения к MoyKlass'
    }, { status: 500 });
  }
}
