'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAccount, useConnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CRYPTO_CHAINS } from '@/lib/constants';
import { cn, formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    ns_name: '',
    phone: '',
    discord_id: '',
    building_wing: '',
    room_number: '',
    crypto_chain: '',
    crypto_wallet: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [earnings, setEarnings] = useState<{ total: number; processing: number; paid: number }>({ total: 0, processing: 0, paid: 0 });
  const supabase = createClient();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();

  useEffect(() => {
    if (isConnected && address) {
      setProfile((p) => ({ ...p, crypto_wallet: address, crypto_chain: p.crypto_chain || 'base' }));
    }
  }, [isConnected, address]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          ns_name: data.ns_name || '',
          phone: data.phone || '',
          discord_id: data.discord_id || '',
          building_wing: data.building_wing || '',
          room_number: data.room_number || '',
          crypto_chain: data.crypto_chain || '',
          crypto_wallet: data.crypto_wallet || '',
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [supabase, router]);

  useEffect(() => {
    const fetchEarnings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: txList } = await supabase
        .from('transactions')
        .select('net_payout, payout_status')
        .eq('deliverer_id', user.id);

      if (!txList?.length) return;

      const total = txList.reduce((sum, t) => sum + t.net_payout, 0);
      const processing = txList.filter((t) => t.payout_status === 'processing' || t.payout_status === 'pending').reduce((sum, t) => sum + t.net_payout, 0);
      const paid = txList.filter((t) => t.payout_status === 'completed').reduce((sum, t) => sum + t.net_payout, 0);
      setEarnings({ total, processing, paid });
    };
    fetchEarnings();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update({
        ns_name: profile.ns_name,
        phone: profile.phone,
        discord_id: profile.discord_id || null,
        building_wing: profile.building_wing || null,
        room_number: profile.room_number || null,
        payout_method: 'crypto',
        crypto_chain: profile.crypto_chain || null,
        crypto_wallet: profile.crypto_wallet || null,
      })
      .eq('id', user.id);

    if (error) {
      setMessage('Failed to save profile');
    } else {
      setMessage('Profile saved!');
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="animate-spin h-10 w-10 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto pt-4">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-[var(--secondary-foreground)] text-sm sm:text-base">
          Manage your account settings
        </p>
      </div>

      <Card className="space-y-5">
        <h2 className="font-semibold text-base">Delivery earnings</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Total earned</p>
            <p className="text-lg font-bold text-[var(--foreground)] mt-0.5">{formatCurrency(earnings.total)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Processing</p>
            <p className="text-lg font-bold text-[var(--warning)] mt-0.5">{formatCurrency(earnings.processing)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Paid out</p>
            <p className="text-lg font-bold text-[var(--success)] mt-0.5">{formatCurrency(earnings.paid)}</p>
          </div>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Earnings are sent to your wallet below (minus 5% platform fee).
        </p>
      </Card>

      <Card className="space-y-6">
        <h2 className="font-semibold text-base">Personal info</h2>
        <Input
          id="nsName"
          label="Name"
          value={profile.ns_name}
          onChange={(e) => setProfile({ ...profile, ns_name: e.target.value })}
        />
        <Input
          id="phone"
          label="Phone number"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        />
        <Input
          id="discord"
          label="Discord ID (optional)"
          value={profile.discord_id}
          onChange={(e) => setProfile({ ...profile, discord_id: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="wing"
            label="Building wing"
            placeholder="e.g. Wing A"
            value={profile.building_wing}
            onChange={(e) => setProfile({ ...profile, building_wing: e.target.value })}
          />
          <Input
            id="room"
            label="Room number"
            placeholder="e.g. 1234"
            value={profile.room_number}
            onChange={(e) => setProfile({ ...profile, room_number: e.target.value })}
          />
        </div>
      </Card>

      <Card className="space-y-6">
        <h2 className="font-semibold text-base">Crypto wallet</h2>
        <p className="text-sm text-[var(--muted)]">
          Connect your wallet to receive delivery earnings in USDC.
        </p>
        {isConnected && address ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Address</span>
              <span className="font-mono text-xs text-[var(--foreground)]">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--secondary-foreground)] mb-2 block">Payout chain</label>
              <div className="flex flex-wrap gap-2">
                {CRYPTO_CHAINS.map((chain) => (
                  <button
                    key={chain.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, crypto_chain: chain.id })}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
                      profile.crypto_chain === chain.id
                        ? 'border-white bg-white/5 text-white'
                        : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
                    )}
                  >
                    {chain.name}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-[var(--muted)]">Wallet is connected. Save profile to use this address for payouts.</p>
          </div>
        ) : (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={async () => {
              setMessage('');
              try {
                await connectAsync({ connector: connectors[0] });
              } catch (err: unknown) {
                setMessage(err instanceof Error ? err.message : 'Failed to connect wallet');
              }
            }}
          >
            Connect wallet
          </Button>
        )}
      </Card>

      {message && (
        <p className={cn('text-sm text-center py-1', message.includes('Failed') || message.includes('failed') ? 'text-[var(--danger)]' : 'text-[var(--success)]')}>
          {message}
        </p>
      )}

      <div className="space-y-3">
        <Button onClick={handleSave} loading={saving} className="w-full" size="lg">
          Save profile
        </Button>
        <Button variant="ghost" onClick={handleSignOut} className="w-full text-sm">
          Sign out
        </Button>
      </div>
    </div>
  );
}
