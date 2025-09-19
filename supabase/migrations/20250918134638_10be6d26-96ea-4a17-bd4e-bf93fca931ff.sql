-- Revert database changes - Remove authentication requirements and make data publicly accessible

-- Remove RLS policies from campaign_results
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaign_results;
DROP POLICY IF EXISTS "Users can create their own campaigns" ON public.campaign_results;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaign_results;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.campaign_results;

-- Remove RLS policies from catalog_results  
DROP POLICY IF EXISTS "Users can view their own catalogs" ON public.catalog_results;
DROP POLICY IF EXISTS "Users can create their own catalogs" ON public.catalog_results;
DROP POLICY IF EXISTS "Users can update their own catalogs" ON public.catalog_results;
DROP POLICY IF EXISTS "Users can delete their own catalogs" ON public.catalog_results;

-- Clean up QR session policies
DROP POLICY IF EXISTS "Public can create QR sessions" ON public.qr_sessions;
DROP POLICY IF EXISTS "Enable session creation for all users" ON public.qr_sessions;
DROP POLICY IF EXISTS "Allow session creation" ON public.qr_sessions;
DROP POLICY IF EXISTS "Deny direct SELECT access" ON public.qr_sessions;
DROP POLICY IF EXISTS "Deny direct UPDATE access" ON public.qr_sessions;
DROP POLICY IF EXISTS "Deny direct DELETE access" ON public.qr_sessions;

-- Disable RLS on all tables to make them publicly accessible
ALTER TABLE public.campaign_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_sessions DISABLE ROW LEVEL SECURITY;

-- Make user_id columns nullable and remove defaults since auth is not required
ALTER TABLE public.campaign_results ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.catalog_results ALTER COLUMN user_id DROP NOT NULL;