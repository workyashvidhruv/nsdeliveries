-- NS Community Deliveries - Database Schema
-- Run this in your Supabase SQL Editor

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ns_name TEXT UNIQUE NOT NULL,
  discord_id TEXT,
  phone TEXT NOT NULL,
  building_wing TEXT,
  room_number TEXT,
  payout_method TEXT CHECK (payout_method IN ('stripe', 'crypto')),
  crypto_chain TEXT,
  crypto_wallet TEXT,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Delivery requests table
CREATE TABLE IF NOT EXISTS public.delivery_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.users(id),
  food_type TEXT NOT NULL CHECK (food_type IN ('vegan', 'vegetarian', 'chicken', 'beef')),
  description TEXT,
  payment_amount INTEGER NOT NULL CHECK (payment_amount >= 200),
  building_wing TEXT NOT NULL,
  room_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'delivered', 'cancelled', 'expired')),
  deliverer_id UUID REFERENCES public.users(id),
  accepted_at TIMESTAMPTZ,
  otp_code TEXT,
  otp_verified BOOLEAN DEFAULT false,
  delivery_deadline TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_request_id UUID NOT NULL REFERENCES public.delivery_requests(id),
  requester_id UUID NOT NULL REFERENCES public.users(id),
  deliverer_id UUID NOT NULL REFERENCES public.users(id),
  gross_amount INTEGER NOT NULL,
  commission_amount INTEGER NOT NULL,
  net_payout INTEGER NOT NULL,
  payout_method TEXT NOT NULL CHECK (payout_method IN ('stripe', 'crypto')),
  payout_status TEXT NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_payment_intent_id TEXT,
  crypto_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Penalties table
CREATE TABLE IF NOT EXISTS public.penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  delivery_request_id UUID NOT NULL REFERENCES public.delivery_requests(id),
  reason TEXT NOT NULL DEFAULT 'late_delivery',
  penalty_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_delivery_requests_status ON public.delivery_requests(status);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_requester ON public.delivery_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_deliverer ON public.delivery_requests(deliverer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_deliverer ON public.transactions(deliverer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payout_status ON public.transactions(payout_status);
CREATE INDEX IF NOT EXISTS idx_penalties_user ON public.penalties(user_id);
CREATE INDEX IF NOT EXISTS idx_penalties_until ON public.penalties(penalty_until);

-- Auto-create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, ns_name, phone, discord_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'ns_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.raw_user_meta_data->>'discord_id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_delivery_requests_updated_at
  BEFORE UPDATE ON public.delivery_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
