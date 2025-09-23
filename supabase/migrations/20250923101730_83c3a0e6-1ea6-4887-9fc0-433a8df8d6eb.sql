-- Enable Row Level Security on campaign_results table
ALTER TABLE public.campaign_results ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on catalog_results table  
ALTER TABLE public.catalog_results ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on qr_sessions table
ALTER TABLE public.qr_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for campaign_results table
-- Allow public read access for generated campaigns (since this is a public marketing tool)
CREATE POLICY "Public read access for campaign results" 
ON public.campaign_results FOR SELECT 
USING (true);

-- Allow public insert for creating campaigns
CREATE POLICY "Public insert access for campaign results" 
ON public.campaign_results FOR INSERT 
WITH CHECK (true);

-- Allow public update for updating campaign results with AI generated content
CREATE POLICY "Public update access for campaign results" 
ON public.campaign_results FOR UPDATE 
USING (true);

-- Create RLS policies for catalog_results table
-- Allow public read access for generated catalogs
CREATE POLICY "Public read access for catalog results" 
ON public.catalog_results FOR SELECT 
USING (true);

-- Allow public insert for creating catalogs
CREATE POLICY "Public insert access for catalog results" 
ON public.catalog_results FOR INSERT 
WITH CHECK (true);

-- Allow public update for updating catalog results with AI generated content
CREATE POLICY "Public update access for catalog results" 
ON public.catalog_results FOR UPDATE 
USING (true);

-- Create RLS policies for qr_sessions table
-- Allow public read access for non-expired sessions
CREATE POLICY "Public read access for non-expired QR sessions" 
ON public.qr_sessions FOR SELECT 
USING (expires_at > now());

-- Allow public insert for creating QR sessions
CREATE POLICY "Public insert access for QR sessions" 
ON public.qr_sessions FOR INSERT 
WITH CHECK (true);

-- Allow public update for updating QR sessions
CREATE POLICY "Public update access for QR sessions" 
ON public.qr_sessions FOR UPDATE 
USING (expires_at > now());