-- Create index for campaigns with generated videos
CREATE INDEX IF NOT EXISTS idx_campaign_results_video_generated 
ON public.campaign_results (created_at DESC) 
WHERE generated_video_url IS NOT NULL;

-- Create index for recent catalogs
CREATE INDEX IF NOT EXISTS idx_catalog_results_recent 
ON public.catalog_results (created_at DESC);

-- Optimize existing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_results_created_at 
ON public.campaign_results (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_catalog_results_created_at 
ON public.catalog_results (created_at DESC);