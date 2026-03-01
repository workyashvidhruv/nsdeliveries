import type { FoodType, DeliveryStatus, PayoutMethod } from './constants';

export interface User {
  id: string;
  ns_name: string;
  discord_id: string | null;
  phone: string;
  building_wing: string | null;
  room_number: string | null;
  payout_method: PayoutMethod | null;
  crypto_chain: string | null;
  crypto_wallet: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryRequest {
  id: string;
  requester_id: string;
  food_type: FoodType;
  description: string | null;
  payment_amount: number;
  building_wing: string;
  room_number: string;
  status: DeliveryStatus;
  deliverer_id: string | null;
  accepted_at: string | null;
  otp_code: string | null;
  otp_verified: boolean;
  delivery_deadline: string | null;
  payment_tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicDeliveryRequest {
  id: string;
  requester_id: string;
  food_type: FoodType;
  description: string | null;
  payment_amount: number;
  building_wing: string;
  status: DeliveryStatus;
  created_at: string;
}

export interface Transaction {
  id: string;
  delivery_request_id: string;
  requester_id: string;
  deliverer_id: string;
  gross_amount: number;
  commission_amount: number;
  net_payout: number;
  payout_method: PayoutMethod;
  payout_status: 'pending' | 'processing' | 'completed' | 'failed';
  crypto_tx_hash: string | null;
  created_at: string;
}
