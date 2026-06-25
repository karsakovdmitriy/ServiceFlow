import { NextResponse } from 'next/server';
import { MoyKlassClient } from '@/lib/moyklass';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    if (!apiKey) return NextResponse.json({ error: 'API key is required' }, { status: 400 });

    const trimmedKey = apiKey.trim();
    console.log(`MoyKlass Test: Checking key [${trimmedKey.substring(0, 4)}...${trimmedKey.substring(trimmedKey.length - 4)}] (length: ${trimmedKey.length})`);

    const client = new MoyKlassClient(trimmedKey);

    // Attempt to get mapping data to verify connectivity and key
    const [filials, managers, teachers, classes, rooms] = await Promise.all([
      client.getFilials(),
      client.getManagers(),
      client.getTeachers(),
      client.getClasses(),
      client.getRooms()
    ]);

    // Combine managers and teachers as MoyKlass uses both for different purposes
    const allStaff = [...managers];
    teachers.forEach((t: any) => {
        if (!allStaff.find(s => s.id === t.id)) {
            allStaff.push(t);
        }
    });

    console.log(`MoyKlass Test: Success. Filials: ${filials?.length}, Staff: ${allStaff.length}, Classes: ${classes?.length}, Rooms: ${rooms?.length}`);

    return NextResponse.json({
      success: true,
      filials,
      managers: allStaff,
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
