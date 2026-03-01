import { createClient } from '@/lib/supabase/server';
import { calculateCommission } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { requestId, otpCode } = await request.json();

  const { data: delivery, error } = await supabase
    .from('delivery_requests')
    .select('*')
    .eq('id', requestId)
    .eq('deliverer_id', user.id)
    .eq('status', 'accepted')
    .single();

  if (error || !delivery) {
    return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
  }

  if (delivery.otp_code !== otpCode) {
    return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 });
  }

  try {
    const { commission, netPayout } = calculateCommission(delivery.payment_amount);

    // Update delivery status
    await supabase
      .from('delivery_requests')
      .update({
        status: 'delivered',
        otp_verified: true,
      })
      .eq('id', requestId);

    // Check if deliverer has a wallet set up
    const { data: deliverer } = await supabase
      .from('users')
      .select('crypto_wallet')
      .eq('id', user.id)
      .single();

    // Create transaction — auto-queue for payout if wallet exists
    await supabase
      .from('transactions')
      .insert({
        delivery_request_id: requestId,
        requester_id: delivery.requester_id,
        deliverer_id: user.id,
        gross_amount: delivery.payment_amount,
        commission_amount: commission,
        net_payout: netPayout,
        payout_method: 'crypto',
        payout_status: deliverer?.crypto_wallet ? 'processing' : 'pending',
      });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
