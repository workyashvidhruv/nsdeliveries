import { createClient } from '@/lib/supabase/server';
import { verifyUsdcPayment } from '@/lib/verify-payment';
import { NextResponse } from 'next/server';
import { MIN_PAYMENT_CENTS, MAX_PAYMENT_CENTS, FOOD_TYPES } from '@/lib/constants';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { foodType, description, amount, buildingWing, roomNumber, txSignature } = body;

  if (!FOOD_TYPES.includes(foodType)) {
    return NextResponse.json({ error: 'Invalid food type' }, { status: 400 });
  }
  if (amount < MIN_PAYMENT_CENTS || amount > MAX_PAYMENT_CENTS) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }
  if (!buildingWing || !roomNumber) {
    return NextResponse.json({ error: 'Building wing and room number required' }, { status: 400 });
  }
  if (!txSignature || typeof txSignature !== 'string' || txSignature.trim().length < 20) {
    return NextResponse.json({ error: 'Valid transaction signature required' }, { status: 400 });
  }

  const sig = txSignature.trim();

  // Check this tx hasn't already been used for another request
  const { data: existing } = await supabase
    .from('delivery_requests')
    .select('id')
    .eq('payment_tx_hash', sig)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'This transaction has already been used' }, { status: 400 });
  }

  // Verify payment on-chain
  const verification = await verifyUsdcPayment(sig, amount);
  if (!verification.valid) {
    return NextResponse.json({ error: verification.error }, { status: 400 });
  }

  const { data: deliveryRequest, error } = await supabase
    .from('delivery_requests')
    .insert({
      requester_id: user.id,
      food_type: foodType,
      description: description || null,
      payment_amount: amount,
      building_wing: buildingWing,
      room_number: roomNumber,
      status: 'open',
      payment_tx_hash: sig,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ requestId: deliveryRequest.id });
}
