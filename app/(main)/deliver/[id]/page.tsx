'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Countdown } from '@/components/ui/countdown';
import { OtpInput } from '@/components/otp-input';
import { FOOD_TYPE_LABELS, FOOD_TYPE_EMOJI } from '@/lib/constants';
import { formatCurrency, calculateCommission } from '@/lib/utils';
import type { DeliveryRequest } from '@/lib/types';

export default function ActiveDeliveryPage() {
  const params = useParams();
  const requestId = params.id as string;
  const router = useRouter();
  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchRequest = async () => {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (!error && data) {
        setRequest(data as DeliveryRequest);
      }
      setLoading(false);
    };

    fetchRequest();

    const channel = supabase
      .channel(`delivery-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'delivery_requests',
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
          setRequest(payload.new as DeliveryRequest);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, supabase]);

  const handleVerifyOtp = async (code: string) => {
    setVerifying(true);
    setOtpError('');

    try {
      const res = await fetch('/api/delivery/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, otpCode: code }),
      });
      const data = await res.json();

      if (data.error) {
        setOtpError(data.error);
      }
    } catch {
      setOtpError('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 flex justify-center">
        <div className="animate-spin h-10 w-10 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 text-center">
        <p className="text-[var(--muted)]">Delivery not found</p>
      </div>
    );
  }

  const { netPayout } = calculateCommission(request.payment_amount);

  if (request.status === 'delivered') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <div className="text-center pt-6 space-y-4">
          <span className="text-5xl sm:text-6xl">🎉</span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Delivery Complete!</h1>
          <p className="text-[var(--success)] text-xl sm:text-2xl font-semibold mb-2">
            You earned {formatCurrency(netPayout)}
          </p>
          <p className="text-sm text-[var(--muted)]">
            Your payout will be sent to your wallet shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="space-y-5">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Active Delivery</h1>
        {request.delivery_deadline && (
          <div>
            <p className="text-sm text-[var(--secondary-foreground)] mb-2">Time remaining</p>
            <Countdown deadline={request.delivery_deadline} />
          </div>
        )}
      </div>

      <Card className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">{FOOD_TYPE_EMOJI[request.food_type]}</span>
            <span className="font-medium text-base sm:text-lg">{FOOD_TYPE_LABELS[request.food_type]}</span>
          </div>
          <Badge variant="info">In Progress</Badge>
        </div>

        {request.description && (
          <p className="text-sm text-[var(--muted)]">{request.description}</p>
        )}

        <div className="p-6 rounded-[12px] bg-white/5 border border-white/10 space-y-2">
          <p className="text-sm text-[var(--secondary-foreground)]">Deliver to:</p>
          <p className="text-2xl font-bold">
            {request.building_wing}, Room {request.room_number}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm pt-4 border-t border-[var(--border)]">
          <span className="text-[var(--secondary-foreground)]">Your earnings</span>
          <span className="font-semibold text-[var(--success)]">{formatCurrency(netPayout)}</span>
        </div>
      </Card>

      <Card>
        <OtpInput onSubmit={handleVerifyOtp} loading={verifying} error={otpError} />
      </Card>
    </div>
  );
}
