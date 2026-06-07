CREATE TABLE public.meeting_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_time TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.meeting_bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meeting_bookings TO authenticated;
GRANT ALL ON public.meeting_bookings TO service_role;

ALTER TABLE public.meeting_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert meeting bookings"
  ON public.meeting_bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read meeting bookings"
  ON public.meeting_bookings FOR SELECT
  USING (true);