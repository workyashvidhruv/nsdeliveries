'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OtpDisplay } from '@/components/otp-display';
import { Countdown } from '@/components/ui/countdown';
import { Button } from '@/components/ui/button';
import { FOOD_TYPE_LABELS, FOOD_TYPE_EMOJI } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import type { DeliveryRequest } from '@/lib/types';

export default function RequestStatusPage() {
  const params = useParams();
  const requestId = params.id as string;
  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [loading, setLoading] = useState(true);
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

    // Real-time subscription
    const channel = supabase
      .channel(`request-${requestId}`)
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

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="animate-spin h-10 w-10 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--muted)]">Request not found</p>
      </div>
    );
  }

  const statusConfig = {
    open: { label: 'Finding a deliverer...', variant: 'warning' as const, icon: '🔍' },
    accepted: { label: 'Deliverer is on the way!', variant: 'info' as const, icon: '🚴' },
    delivered: { label: 'Delivered!', variant: 'success' as const, icon: '✅' },
    cancelled: { label: 'Cancelled', variant: 'danger' as const, icon: '❌' },
    expired: { label: 'Expired', variant: 'danger' as const, icon: '⏰' },
  };

  const status = statusConfig[request.status];

  return (
    <div className="space-y-10">
      <div className="text-center pt-6">
        <span className="text-5xl sm:text-6xl">{status.icon}</span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-6">{status.label}</h1>
      </div>

      <Card className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">{FOOD_TYPE_EMOJI[request.food_type]}</span>
            <span className="font-medium text-base sm:text-lg">{FOOD_TYPE_LABELS[request.food_type]}</span>
          </div>
          <Badge variant={status.variant}>{request.status}</Badge>
        </div>

        {request.description && (
          <p className="text-sm text-[var(--muted)]">{request.description}</p>
        )}

        <div className="flex items-center justify-between text-sm pt-4 border-t border-[var(--border)]">
          <span className="text-[var(--secondary-foreground)]">Amount paid</span>
          <span className="font-semibold text-[var(--success)]">{formatCurrency(request.payment_amount)}</span>
        </div>
      </Card>

      {request.status === 'accepted' && request.otp_code && (
        <Card className="space-y-8">
          <OtpDisplay code={request.otp_code} />
          {request.delivery_deadline && (
            <div className="text-center pt-4 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--secondary-foreground)] mb-3 mt-4">Delivery deadline</p>
              <Countdown deadline={request.delivery_deadline} />
            </div>
          )}
        </Card>
      )}

      {request.status === 'open' && (
        <Card>
          <div className="text-center space-y-5 py-6">
            <div className="animate-pulse flex justify-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
            </div>
            <p className="text-sm text-[var(--muted)]">
              Waiting for someone to accept your delivery request...
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await fetch('/api/delivery/cancel', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ requestId }),
                });
              }}
            >
              Cancel Request
            </Button>
          </div>
        </Card>
      )}

      {request.status === 'delivered' && (
        <Card>
          <div className="text-center space-y-4 py-6">
            <p className="text-xl sm:text-2xl font-semibold text-[var(--success)]">
              Delivery completed!
            </p>
            <p className="text-sm text-[var(--muted)]">
              Thank you for using NS Community Deliveries
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
