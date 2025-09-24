-- Create storage bucket for campaign assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-assets', 'campaign-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for campaign assets
CREATE POLICY "Anyone can view campaign assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'campaign-assets');

CREATE POLICY "Anyone can upload campaign assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'campaign-assets');

CREATE POLICY "Anyone can update campaign assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'campaign-assets');