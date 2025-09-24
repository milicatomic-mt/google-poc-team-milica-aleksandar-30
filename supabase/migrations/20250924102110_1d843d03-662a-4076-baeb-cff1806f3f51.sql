-- Ensure generated_video_url column exists in campaign_results table
ALTER TABLE public.campaign_results 
ADD COLUMN IF NOT EXISTS generated_video_url TEXT;