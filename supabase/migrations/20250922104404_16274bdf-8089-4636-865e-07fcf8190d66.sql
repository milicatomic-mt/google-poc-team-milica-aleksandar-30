-- Create a table for download sessions to avoid QR code data limits
CREATE TABLE public.download_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  campaign_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 hour')
);

-- Enable Row Level Security
ALTER TABLE public.download_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read non-expired sessions (for download)
CREATE POLICY "Anyone can read non-expired download sessions" 
ON public.download_sessions 
FOR SELECT 
USING (expires_at > now());

-- Create policy to allow anyone to create download sessions
CREATE POLICY "Anyone can create download sessions" 
ON public.download_sessions 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_download_sessions_token ON public.download_sessions(session_token);
CREATE INDEX idx_download_sessions_expires ON public.download_sessions(expires_at);