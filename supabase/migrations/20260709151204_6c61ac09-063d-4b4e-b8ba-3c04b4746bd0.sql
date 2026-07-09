-- Secure meeting_bookings: remove public read/delete access while keeping public booking insertion
DROP POLICY IF EXISTS "Anyone can read meeting bookings" ON public.meeting_bookings;
DROP POLICY IF EXISTS "Anyone can delete meeting bookings" ON public.meeting_bookings;