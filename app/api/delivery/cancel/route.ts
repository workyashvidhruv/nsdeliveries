import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { requestId } = await request.json();

  const { data: delivery, error } = await supabase
    .from('delivery_requests')
    .select('*')
    .eq('id', requestId)
    .eq('requester_id', user.id)
    .eq('status', 'open')
    .single();

  if (error || !delivery) {
    return NextResponse.json({ error: 'Request not found or cannot be cancelled' }, { status: 404 });
  }

  await supabase
    .from('delivery_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId);

  return NextResponse.json({ success: true });
}
