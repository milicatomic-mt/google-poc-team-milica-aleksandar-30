-- Remove generated_images column from catalog_results table as it's not needed for catalog
ALTER TABLE public.catalog_results DROP COLUMN IF EXISTS generated_images;