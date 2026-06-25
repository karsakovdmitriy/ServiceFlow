import { NextResponse } from 'next/server';
import { MoyKlassClient } from '@/lib/moyklass';

export async function POST(request: Request) {
  try {
    const { apiKey, profileId } = await request.json();
    if (!apiKey) return NextResponse.json({ error: 'API key is required' }, { status: 400 });

    const trimmedKey = apiKey.trim();
    console.log(`MoyKlass Test: Checking key [${trimmedKey.substring(0, 4)}...${trimmedKey.substring(trimmedKey.length - 4)}] (length: ${trimmedKey.length})`);

    const client = new MoyKlassClient(trimmedKey, profileId);

    // Attempt to get mapping data to verify connectivity and key
    const [filials, managers, classes, rooms] = await Promise.all([
      client.getFilials(),
      client.getManagers(),
      client.getClasses(),
      client.getRooms()
    ]);

    console.log(`MoyKlass Test: Success. Filials: ${filials?.length}, Staff: ${managers?.length}, Classes: ${classes?.length}, Rooms: ${rooms?.length}`);

    return NextResponse.json({
      success: true,
      filials,
      managers,
      classes,
      rooms
    });
  } catch (error: any) {
    console.error('MoyKlass Test Connection Error:', error.message);
    return NextResponse.json({
      success: false,
      message: error.message || 'Ошибка подключения к MoyKlass'
    }, { status: 500 });
  }
}
