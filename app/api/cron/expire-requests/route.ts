import { createClient } from '@supabase/supabase-js';
import { PENALTY_MINUTES } from '@/lib/constants';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role for cron operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date().toISOString();

  // Find expired accepted requests
  const { data: expiredRequests } = await supabase
    .from('delivery_requests')
    .select('*')
    .eq('status', 'accepted')
    .lt('delivery_deadline', now);

  if (!expiredRequests || expiredRequests.length === 0) {
    return NextResponse.json({ expired: 0 });
  }

  let expiredCount = 0;

  for (const req of expiredRequests) {
    try {
      // Mark as expired
      await supabase
        .from('delivery_requests')
        .update({ status: 'expired' })
        .eq('id', req.id);

      // Apply penalty to deliverer
      if (req.deliverer_id) {
        const penaltyUntil = new Date(Date.now() + PENALTY_MINUTES * 60 * 1000).toISOString();
        await supabase
          .from('penalties')
          .insert({
            user_id: req.deliverer_id,
            delivery_request_id: req.id,
            reason: 'late_delivery',
            penalty_until: penaltyUntil,
          });
      }

      expiredCount++;
    } catch (err) {
      console.error(`Failed to expire request ${req.id}:`, err);
    }
  }

  // Also expire open requests older than 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const { data: staleRequests } = await supabase
    .from('delivery_requests')
    .select('id')
    .eq('status', 'open')
    .lt('created_at', twoHoursAgo);

  if (staleRequests) {
    for (const req of staleRequests) {
      try {
        await supabase
          .from('delivery_requests')
          .update({ status: 'expired' })
          .eq('id', req.id);
        expiredCount++;
      } catch (err) {
        console.error(`Failed to expire stale request ${req.id}:`, err);
      }
    }
  }

  return NextResponse.json({ expired: expiredCount });
}
