-- Create table for cross-device sessions
CREATE TABLE public.qr_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  uploaded_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'uploaded', 'displayed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour')
);

-- Enable Row Level Security
ALTER TABLE public.qr_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies - sessions are public for this use case
CREATE POLICY "Anyone can view sessions" 
ON public.qr_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create sessions" 
ON public.qr_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update sessions" 
ON public.qr_sessions 
FOR UPDATE 
USING (true);

-- Enable realtime for this table
ALTER TABLE public.qr_sessions REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_sessions;

-- Create storage bucket for temporary uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES ('qr-uploads', 'qr-uploads', true, 10485760);

-- Create storage policies
CREATE POLICY "Anyone can upload to qr-uploads" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'qr-uploads');

CREATE POLICY "Anyone can view qr-uploads" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'qr-uploads');

-- Clean up expired sessions function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.qr_sessions 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically delete expired sessions
CREATE OR REPLACE FUNCTION public.schedule_cleanup()
RETURNS trigger AS $$
BEGIN
  -- This would typically be handled by a scheduled job
  -- For now, we'll clean up on insert
  PERFORM public.cleanup_expired_sessions();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_on_insert
AFTER INSERT ON public.qr_sessions
EXECUTE FUNCTION public.schedule_cleanup();