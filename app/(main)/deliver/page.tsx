import { createClient } from '@/lib/supabase/server';
import { DeliveryBoard } from '@/components/delivery-board';
import type { PublicDeliveryRequest } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DeliverPage() {
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from('delivery_requests')
    .select('id, requester_id, food_type, description, payment_amount, building_wing, status, created_at')
    .eq('status', 'open')
    .order('payment_amount', { ascending: false });

  return (
    <div className="w-full max-w-2xl mx-auto space-y-10 sm:space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Delivery Board</h1>
        <p className="text-[var(--secondary-foreground)] text-base sm:text-lg">
          Accept a delivery and earn money
        </p>
      </div>

      <DeliveryBoard initialRequests={(requests as PublicDeliveryRequest[]) || []} />
    </div>
  );
}
