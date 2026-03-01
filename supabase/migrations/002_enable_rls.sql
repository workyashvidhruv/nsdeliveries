-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penalties ENABLE ROW LEVEL SECURITY;

-- USERS policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Allow insert for new user creation (triggered by auth)
CREATE POLICY "Service role can insert users"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- DELIVERY REQUESTS policies
-- Anyone authenticated can see open requests (public info only)
CREATE POLICY "Authenticated users can see open requests"
  ON public.delivery_requests FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      status = 'open' OR
      requester_id = auth.uid() OR
      deliverer_id = auth.uid()
    )
  );

-- Authenticated users can create requests
CREATE POLICY "Authenticated users can create requests"
  ON public.delivery_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Allow updates (for accepting, verifying, cancelling)
CREATE POLICY "Allow delivery request updates"
  ON public.delivery_requests FOR UPDATE
  USING (auth.role() = 'authenticated');

-- TRANSACTIONS policies
-- Users can see their own transactions
CREATE POLICY "Users can see own transactions"
  ON public.transactions FOR SELECT
  USING (
    auth.uid() = requester_id OR
    auth.uid() = deliverer_id
  );

-- Allow insert for transaction creation
CREATE POLICY "Allow transaction creation"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow updates (for admin payout processing)
CREATE POLICY "Allow transaction updates"
  ON public.transactions FOR UPDATE
  USING (auth.role() = 'authenticated');

-- PENALTIES policies
-- Users can see their own penalties
CREATE POLICY "Users can see own penalties"
  ON public.penalties FOR SELECT
  USING (auth.uid() = user_id);

-- Allow insert for penalty creation
CREATE POLICY "Allow penalty creation"
  ON public.penalties FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
