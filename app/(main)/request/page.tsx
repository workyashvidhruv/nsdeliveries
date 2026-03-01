'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, type Address } from 'viem';
import { base } from 'wagmi/chains';
import { FoodTypeSelector } from '@/components/food-type-selector';
import { AmountSlider } from '@/components/amount-slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MIN_PAYMENT_CENTS } from '@/lib/constants';
import type { FoodType } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

const PLATFORM_WALLET = process.env.NEXT_PUBLIC_PLATFORM_WALLET || '';
const USDC_ADDRESS = process.env.NEXT_PUBLIC_BASE_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

export default function RequestPage() {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [foodType, setFoodType] = useState<FoodType | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(MIN_PAYMENT_CENTS);
  const [buildingWing, setBuildingWing] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [txHash, setTxHash] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  const handleProceedToPayment = () => {
    if (!foodType) { setError('Please select a food type'); return; }
    if (!buildingWing) { setError('Please enter your building wing'); return; }
    if (!roomNumber) { setError('Please enter your room number'); return; }
    setError('');
    setStep('payment');
  };

  const submitRequest = async (hash: string) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/delivery/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodType,
          description: description || null,
          amount,
          buildingWing,
          roomNumber,
          txSignature: hash,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        router.push(`/request/${data.requestId}/status`);
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!PLATFORM_WALLET) {
      setError('Platform wallet not configured');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // USDC has 6 decimals: amount is in cents, so divide by 100 for dollars
      const usdcAmount = parseUnits((amount / 100).toString(), 6);

      const hash = await writeContractAsync({
        address: USDC_ADDRESS as Address,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [PLATFORM_WALLET as Address, usdcAmount],
        chainId: base.id,
      });

      setTxHash(hash);
      // Auto-submit with the captured tx hash
      await submitRequest(hash);
    } catch (err: any) {
      if (err?.message?.includes('User rejected') || err?.message?.includes('denied')) {
        setError('Transaction was cancelled');
      } else {
        setError(err?.shortMessage || err?.message || 'Payment failed');
      }
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!txHash.trim()) {
      setError('Paste your transaction hash to continue');
      return;
    }
    await submitRequest(txHash.trim());
  };

  if (step === 'payment') {
    const usdcAmount = (amount / 100).toFixed(2);

    return (
      <div className="w-full max-w-2xl mx-auto space-y-8 sm:space-y-12 px-0">
        <div className="text-center w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Pay to Post Request</h1>
          <p className="text-[var(--secondary-foreground)] mt-3 text-base sm:text-lg">
            {usdcAmount} USDC on Base
          </p>
        </div>

        <Card className="space-y-6 w-full">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--secondary-foreground)]">Amount</span>
            <span className="text-xl font-bold text-[var(--foreground)]">{usdcAmount} USDC</span>
          </div>

          {!manualMode ? (
            <div className="space-y-4">
              {!isConnected ? (
                <div className="space-y-3">
                  {connectors.map((connector) => (
                    <Button
                      key={connector.uid}
                      onClick={async () => {
                        setError('');
                        try {
                          await connectAsync({ connector });
                        } catch (err: any) {
                          setError(err?.shortMessage || err?.message || 'Failed to connect wallet');
                        }
                      }}
                      className="w-full"
                      size="lg"
                    >
                      Connect {connector.name}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--secondary-foreground)]">Wallet</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[var(--foreground)]">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </span>
                      <button
                        onClick={() => disconnect()}
                        className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handlePay}
                    loading={loading}
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : `Pay ${usdcAmount} USDC`}
                  </Button>
                </div>
              )}

              <button
                onClick={() => setManualMode(true)}
                className="w-full text-xs text-[var(--muted)] hover:text-[var(--secondary-foreground)] transition-colors pt-2"
              >
                Already paid? Paste transaction hash manually
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {PLATFORM_WALLET && (
                <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                  <p className="text-sm font-medium text-[var(--secondary-foreground)]">Send USDC to this address</p>
                  <p className="text-sm font-mono text-[var(--foreground)] bg-white/5 p-4 rounded-md break-all border border-[var(--border)] select-all">
                    {PLATFORM_WALLET}
                  </p>
                </div>
              )}

              <Input
                id="txHash"
                label="Transaction Hash"
                placeholder="0x..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
              />

              <Button
                onClick={handleManualSubmit}
                loading={loading}
                className="w-full"
                size="lg"
                disabled={!txHash.trim() || loading}
              >
                {loading ? 'Verifying...' : 'Verify & Post Request'}
              </Button>

              <button
                onClick={() => { setManualMode(false); setError(''); }}
                className="w-full text-xs text-[var(--muted)] hover:text-[var(--secondary-foreground)] transition-colors"
              >
                Back to wallet payment
              </button>
            </div>
          )}

          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

          <Button variant="ghost" onClick={() => { setStep('details'); setError(''); setManualMode(false); }} className="w-full">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 sm:space-y-12 px-0">
      <div className="text-center w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Request a Delivery</h1>
        <p className="text-[var(--secondary-foreground)] mt-3 text-base sm:text-lg">
          What are you craving?
        </p>
      </div>

      <Card className="space-y-10 w-full">
        <div className="space-y-4">
          <label className="text-sm font-medium text-[var(--secondary-foreground)]">
            Food Type
          </label>
          <FoodTypeSelector value={foodType} onChange={setFoodType} />
        </div>

        <Input
          id="description"
          label="Toppings / Special Instructions"
          placeholder="Extra cheese, no onions, etc."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="space-y-4">
          <label className="text-sm font-medium text-[var(--secondary-foreground)]">
            Delivery Tip
          </label>
          <AmountSlider value={amount} onChange={setAmount} />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Input
            id="buildingWing"
            label="Building Wing *"
            placeholder="e.g. Wing A"
            value={buildingWing}
            onChange={(e) => setBuildingWing(e.target.value)}
          />
          <Input
            id="roomNumber"
            label="Room Number *"
            placeholder="e.g. 1234"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <Button onClick={handleProceedToPayment} className="w-full mt-2" size="lg">
          Continue to Payment — {formatCurrency(amount)}
        </Button>
      </Card>
    </div>
  );
}
