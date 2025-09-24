-- Add generated_video_url column to campaign_results table
ALTER TABLE public.campaign_results 
ADD COLUMN generated_video_url TEXT;