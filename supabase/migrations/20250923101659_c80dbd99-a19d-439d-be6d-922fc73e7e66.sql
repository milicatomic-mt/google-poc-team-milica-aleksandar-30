-- Add generated_images column to campaign_results table to store related images
ALTER TABLE public.campaign_results 
ADD COLUMN generated_images JSONB DEFAULT '[]'::jsonb;

-- Add generated_images column to catalog_results table as well
ALTER TABLE public.catalog_results 
ADD COLUMN generated_images JSONB DEFAULT '[]'::jsonb;

-- Create index for better performance on generated_images queries
CREATE INDEX idx_campaign_results_generated_images ON public.campaign_results USING GIN (generated_images);
CREATE INDEX idx_catalog_results_generated_images ON public.catalog_results USING GIN (generated_images);