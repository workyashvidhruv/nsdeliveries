'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DeliveryCard } from '@/components/delivery-card';
import type { PublicDeliveryRequest } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface DeliveryBoardProps {
  initialRequests: PublicDeliveryRequest[];
}

export function DeliveryBoard({ initialRequests }: DeliveryBoardProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('delivery-board')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_requests',
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.status === 'open') {
            const newReq: PublicDeliveryRequest = {
              id: payload.new.id,
              requester_id: payload.new.requester_id,
              food_type: payload.new.food_type,
              description: payload.new.description,
              payment_amount: payload.new.payment_amount,
              building_wing: payload.new.building_wing,
              status: payload.new.status,
              created_at: payload.new.created_at,
            };
            setRequests((prev) => [newReq, ...prev]);
          } else if (payload.eventType === 'UPDATE' && payload.new.status !== 'open') {
            setRequests((prev) => prev.filter((r) => r.id !== payload.new.id));
          } else if (payload.eventType === 'DELETE') {
            setRequests((prev) => prev.filter((r) => r.id !== payload.old?.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleAccept = async (requestId: string) => {
    setAcceptingId(requestId);
    try {
      const res = await fetch('/api/delivery/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        router.push(`/deliver/${requestId}`);
      }
    } catch {
      alert('Failed to accept delivery');
    } finally {
      setAcceptingId(null);
    }
  };

  // Sort by payment amount descending (highest tip first)
  const sortedRequests = [...requests].sort((a, b) => b.payment_amount - a.payment_amount);

  if (sortedRequests.length === 0) {
    return (
      <div className="text-center py-12 flex flex-col items-center justify-center min-h-[16rem]">
        <p className="text-5xl sm:text-6xl mb-6">&#127869;</p>
        <p className="text-[var(--muted)] text-lg sm:text-xl">No delivery requests right now</p>
        <p className="text-[var(--muted)] text-sm mt-3">Check back in a bit!</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {sortedRequests.map((req) => (
        <DeliveryCard
          key={req.id}
          id={req.id}
          foodType={req.food_type}
          description={req.description}
          amount={req.payment_amount}
          buildingWing={req.building_wing}
          onAccept={handleAccept}
          accepting={acceptingId === req.id}
        />
      ))}
    </div>
  );
}
