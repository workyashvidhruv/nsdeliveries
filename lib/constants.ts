export const APP_NAME = 'NS Community Deliveries';
export const COMMISSION_RATE = 0.05; // 5%
export const MIN_PAYMENT_CENTS = 200; // $2.00
export const MAX_PAYMENT_CENTS = 2000; // $20.00
export const DELIVERY_TIMEOUT_MINUTES = 10;
export const PENALTY_MINUTES = 5;
export const OTP_LENGTH = 4;

export const FOOD_TYPES = ['vegan', 'vegetarian', 'chicken', 'beef'] as const;
export type FoodType = typeof FOOD_TYPES[number];

export const FOOD_TYPE_LABELS: Record<FoodType, string> = {
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  chicken: 'Chicken',
  beef: 'Beef',
};

export const FOOD_TYPE_EMOJI: Record<FoodType, string> = {
  vegan: '🌱',
  vegetarian: '🥗',
  chicken: '🍗',
  beef: '🥩',
};

export const DELIVERY_STATUS = ['open', 'accepted', 'delivered', 'cancelled', 'expired'] as const;
export type DeliveryStatus = typeof DELIVERY_STATUS[number];

export const PAYOUT_METHODS = ['crypto'] as const;
export type PayoutMethod = typeof PAYOUT_METHODS[number];

export const CRYPTO_CHAINS = [
  { id: 'solana', name: 'Solana', token: 'USDC' },
  { id: 'ethereum', name: 'Ethereum', token: 'USDC' },
  { id: 'base', name: 'Base', token: 'USDC' },
  { id: 'polygon', name: 'Polygon', token: 'USDC' },
  { id: 'arbitrum', name: 'Arbitrum', token: 'USDC' },
] as const;
