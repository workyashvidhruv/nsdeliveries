-- Enable Realtime for delivery_requests table
-- This allows the delivery board and status pages to update in real-time

ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_requests;
