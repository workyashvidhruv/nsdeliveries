'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { COMMISSION_RATE } from '@/lib/constants';

interface PendingPayout {
  id: string;
  delivery_request_id: string;
  deliverer_id: string;
  net_payout: number;
  payout_method: string;
  payout_status: string;
  created_at: string;
  deliverer?: {
    ns_name: string;
    crypto_chain: string;
    crypto_wallet: string;
  };
}

export default function AdminPage() {
  const [payouts, setPayouts] = useState<PendingPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [txHash, setTxHash] = useState<Record<string, string>>({});
  const supabase = createClient();

  useEffect(() => {
    const fetchPayouts = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*, deliverer:users!transactions_deliverer_id_fkey(ns_name, crypto_chain, crypto_wallet)')
        .in('payout_status', ['pending', 'processing'])
        .order('created_at', { ascending: false });

      if (data) setPayouts(data as unknown as PendingPayout[]);
      setLoading(false);
    };
    fetchPayouts();
  }, [supabase]);

  const markCompleted = async (txId: string) => {
    const hash = txHash[txId];
    await supabase
      .from('transactions')
      .update({
        payout_status: 'completed',
        crypto_tx_hash: hash || null,
      })
      .eq('id', txId);

    setPayouts((prev) => prev.filter((p) => p.id !== txId));
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-[var(--secondary-foreground)] text-base">
          {payouts.length} pending payout{payouts.length !== 1 ? 's' : ''}
        </p>
        <div className="mt-6 p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--secondary-foreground)] space-y-2">
          <p className="font-medium text-[var(--foreground)]">How payouts work</p>
          <p>When a delivery is confirmed via OTP, the payout is automatically queued here. Send the USDC to the deliverer&apos;s wallet address, then click &quot;Mark Paid&quot;. Platform commission ({(COMMISSION_RATE * 100).toFixed(0)}%) is already deducted from the net payout shown.</p>
        </div>
      </div>

      {payouts.length === 0 ? (
        <Card>
          <p className="text-center text-[var(--muted)] py-10">No pending payouts</p>
        </Card>
      ) : (
        payouts.map((payout) => (
          <Card key={payout.id} className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{(payout as any).deliverer?.ns_name || 'Unknown'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={payout.payout_method === 'crypto' ? 'info' : 'default'}>
                    {payout.payout_method}
                  </Badge>
                  {payout.payout_status === 'processing' && (
                    <span className="text-xs text-[var(--warning)]">User requested payout</span>
                  )}
                </div>
              </div>
              <span className="text-lg font-bold text-[var(--success)]">
                {formatCurrency(payout.net_payout)}
              </span>
            </div>

            {payout.payout_method === 'crypto' && (payout as any).deliverer && (
              <div className="text-sm space-y-1">
                <p className="text-[var(--muted)]">
                  Chain: <span className="text-[var(--foreground)]">{(payout as any).deliverer.crypto_chain}</span>
                </p>
                <p className="text-[var(--muted)] break-all">
                  Wallet: <span className="text-[var(--foreground)] font-mono text-xs">{(payout as any).deliverer.crypto_wallet}</span>
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Input
                placeholder="Transaction hash (optional)"
                value={txHash[payout.id] || ''}
                onChange={(e) => setTxHash({ ...txHash, [payout.id]: e.target.value })}
                className="flex-1"
              />
              <Button size="sm" onClick={() => markCompleted(payout.id)}>
                Mark Paid
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
