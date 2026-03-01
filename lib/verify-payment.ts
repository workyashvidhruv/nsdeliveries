const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const BASE_USDC_ADDRESS = (process.env.BASE_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913').toLowerCase();
const PLATFORM_WALLET = (process.env.NEXT_PUBLIC_PLATFORM_WALLET || '').toLowerCase();

// ERC-20 Transfer(address indexed from, address indexed to, uint256 value)
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daf4d2b9ff8307d8721428aadc25ae50463';

interface VerifyResult {
  valid: boolean;
  error?: string;
}

export async function verifyUsdcPayment(
  txHash: string,
  expectedAmountCents: number
): Promise<VerifyResult> {
  if (!PLATFORM_WALLET) {
    return { valid: false, error: 'Platform wallet not configured' };
  }

  const res = await fetch(BASE_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    }),
  });

  const { result, error: rpcError } = await res.json();

  if (rpcError) {
    return { valid: false, error: 'RPC error: ' + rpcError.message };
  }

  if (!result) {
    return {
      valid: false,
      error: 'Transaction not found — it may still be confirming. Wait a moment and try again.',
    };
  }

  // Check transaction succeeded
  if (result.status !== '0x1') {
    return { valid: false, error: 'Transaction failed on-chain' };
  }

  // USDC has 6 decimals: $2.00 = 200 cents = 2_000_000 raw units
  // cents * 10_000 = raw USDC units
  const expectedRaw = BigInt(expectedAmountCents) * BigInt(10_000);

  // Pad platform wallet to 32 bytes for topic matching
  const paddedWallet = '0x' + PLATFORM_WALLET.slice(2).padStart(64, '0');

  // Search logs for a USDC Transfer to the platform wallet
  for (const log of result.logs || []) {
    if (log.address.toLowerCase() !== BASE_USDC_ADDRESS) continue;
    if (!log.topics || log.topics[0] !== TRANSFER_TOPIC) continue;
    if (log.topics[2]?.toLowerCase() !== paddedWallet) continue;

    // Data field contains the transfer amount as a 256-bit hex value
    const received = BigInt(log.data);

    if (received >= expectedRaw) {
      return { valid: true };
    }

    const receivedUsd = Number(received) / 1_000_000;
    const expectedUsd = expectedAmountCents / 100;
    return {
      valid: false,
      error: `Expected $${expectedUsd.toFixed(2)} USDC but received $${receivedUsd.toFixed(2)}`,
    };
  }

  return {
    valid: false,
    error: 'No USDC transfer to the escrow wallet found in this transaction',
  };
}
