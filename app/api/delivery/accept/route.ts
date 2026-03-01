import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateOtp, getDeadlineFromNow } from '@/lib/utils';
import { DELIVERY_TIMEOUT_MINUTES } from '@/lib/constants';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { requestId } = await request.json();

  // Check for active penalties
  const { data: penalties } = await supabase
    .from('penalties')
    .select('penalty_until')
    .eq('user_id', user.id)
    .gt('penalty_until', new Date().toISOString())
    .limit(1);

  if (penalties && penalties.length > 0) {
    return NextResponse.json({ error: 'You have an active penalty. Please wait before accepting new deliveries.' }, { status: 403 });
  }

  const otp = generateOtp();
  const deadline = getDeadlineFromNow(DELIVERY_TIMEOUT_MINUTES);

  // Atomic lock: only update if status is still 'open'
  const { data, error } = await supabase
    .from('delivery_requests')
    .update({
      status: 'accepted',
      deliverer_id: user.id,
      accepted_at: new Date().toISOString(),
      otp_code: otp,
      delivery_deadline: deadline.toISOString(),
    })
    .eq('id', requestId)
    .eq('status', 'open')
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'This delivery has already been accepted by someone else' }, { status: 409 });
  }

  return NextResponse.json({ success: true });
}
