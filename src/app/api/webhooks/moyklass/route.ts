import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper to get supabase client
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
  return createClient(url, key);
}

export async function POST(request: Request) {
  const supabase = getSupabase();

  try {
    const body = await request.json();
    console.log('MoyKlass Webhook Received:', JSON.stringify(body, null, 2));

    const { event, object } = body;

    // Handle events as described in docs/INTEGRATION_MOYKLASS_TZ.md Section 5
    switch (event) {
      case 'user_changed':
        await handleUserChanged(supabase, object);
        break;
      case 'lesson_changed':
      case 'lesson_deleted':
        // These would typically trigger a refresh or local cache update
        console.log(`MoyKlass Event: ${event} for lesson ${object.id}`);
        break;
      case 'record_changed':
        await handleRecordChanged(supabase, object);
        break;
      default:
        console.log('MoyKlass: Unhandled event type:', event);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('MoyKlass Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleUserChanged(supabase: any, user: any) {
  // Update local client data based on MoyKlass update
  // user.id is the external moyklass_id
  const { error } = await supabase
    .from('clients')
    .update({
      full_name: user.name,
      email: user.email,
      phone: user.phone
    })
    .eq('moyklass_id', user.id);

  if (error) console.error('Error updating client from webhook:', error);
}

async function handleRecordChanged(supabase: any, record: any) {
    // If a record (booking) status changes in MoyKlass, we might want to sync it
    // record.lessonId, record.userId (moyklass_id), record.statusId
    console.log('MoyKlass Record Changed:', record);

    // Logic to find corresponding session and update status could go here
    // For now we just log it as per the baseline requirement
}
