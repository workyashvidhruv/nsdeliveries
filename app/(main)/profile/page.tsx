'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
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
    <div className="space-y-10 sm:space-y-12 w-full max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Profile</h1>
        <p className="text-[var(--secondary-foreground)] mt-3 text-base sm:text-lg">
          Manage your account settings
        </p>
      </div>

      <Card className="space-y-6">
        <h2 className="font-semibold text-lg sm:text-xl">Delivery earnings</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs sm:text-sm text-[var(--muted)] uppercase tracking-wide">Total earned</p>
            <p className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-1">{formatCurrency(earnings.total)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-[var(--muted)] uppercase tracking-wide">Processing</p>
            <p className="text-xl sm:text-2xl font-bold text-[var(--warning)] mt-1">{formatCurrency(earnings.processing)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-[var(--muted)] uppercase tracking-wide">Paid out</p>
            <p className="text-xl sm:text-2xl font-bold text-[var(--success)] mt-1">{formatCurrency(earnings.paid)}</p>
          </div>
        </div>
        <p className="text-sm text-[var(--muted)]">
          After each delivery, your earnings are automatically sent to your wallet below (minus 5% platform fee). Make sure your wallet is set up to receive payouts.
        </p>
      </Card>

      <Card className="space-y-8">
        <h2 className="font-semibold text-lg sm:text-xl">Personal Info</h2>
        <Input
          id="nsName"
          label="NS Name"
          value={profile.ns_name}
          onChange={(e) => setProfile({ ...profile, ns_name: e.target.value })}
        />
        <Input
          id="phone"
          label="Phone Number"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        />
        <Input
          id="discord"
          label="Discord ID (optional)"
          value={profile.discord_id}
          onChange={(e) => setProfile({ ...profile, discord_id: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-5">
          <Input
            id="wing"
            label="Building Wing"
            placeholder="e.g. Wing A"
            value={profile.building_wing}
            onChange={(e) => setProfile({ ...profile, building_wing: e.target.value })}
          />
          <Input
            id="room"
            label="Room Number"
            placeholder="e.g. 1234"
            value={profile.room_number}
            onChange={(e) => setProfile({ ...profile, room_number: e.target.value })}
          />
        </div>
      </Card>

      <Card className="space-y-8">
        <div>
          <h2 className="font-semibold text-lg sm:text-xl">Crypto Wallet</h2>
          <p className="text-sm text-[var(--muted)] mt-2">Set up your wallet to receive delivery earnings in USDC. Payouts are sent automatically after each delivery.</p>
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--secondary-foreground)] mb-3 block">Chain</label>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {CRYPTO_CHAINS.map((chain) => (
              <button
                key={chain.id}
                type="button"
                onClick={() => setProfile({ ...profile, crypto_chain: chain.id })}
                className={cn(
                  'px-4 py-3 rounded-[var(--radius-sm)] text-sm font-medium border-2 transition-colors duration-200',
                  profile.crypto_chain === chain.id
                    ? 'border-white bg-white/5 text-white'
                    : 'border-[var(--border)] text-[var(--secondary-foreground)] hover:border-[var(--muted)]'
                )}
              >
                {chain.name}
              </button>
            ))}
          </div>
        </div>
        <Input
          id="wallet"
          label="Wallet Address"
          placeholder="Enter your wallet address"
          value={profile.crypto_wallet}
          onChange={(e) => setProfile({ ...profile, crypto_wallet: e.target.value })}
        />
      </Card>

      {message && (
        <p className={cn('text-sm text-center py-2', message.includes('Failed') || message.includes('failed') ? 'text-[var(--danger)]' : 'text-[var(--success)]')}>
          {message}
        </p>
      )}

      <div className="space-y-4 pt-4">
        <Button onClick={handleSave} loading={saving} className="w-full" size="lg">
          Save Profile
        </Button>

        <Button variant="ghost" onClick={handleSignOut} className="w-full">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
