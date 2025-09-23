export type CampaignCreationRequest = {
  image: string;             // URL or base64 of inspiration image
  campaign_prompt: string;   // Campaign description (e.g. "Launch campaign for new drink")
  target_audience?: string;  // Optional (e.g. "Gen Z athletes")
};

export type CatalogEnrichmentRequest = {
  image: string;          // URL or base64 of product image
  tone?: string;          // Optional brand tone (e.g. playful, luxury)
  platform?: string;      // Optional platform (Amazon, Shopify, etc.)
  category?: string;      // Optional product category
  brand?: string;         // Optional brand name
};

export type CatalogEnrichmentResponse = {
  product_title: string;       // Generated product title
  description: string;         // Main description
  features: string[];          // Key features
  alt_text: string;            // Alt text for images
  seo_metadata: {
    keywords: string[];        // SEO keywords
    tags: string[];            // SEO tags / categories
  };
  short_marketing_copy?: string; // Optional short marketing copy
};

export type CampaignCreationResponse = {
  video_scripts: {
    platform: string;   // e.g. "TikTok", "Instagram"
    script: string;     // generated script for the video
  }[];
  email_copy: {
    subject: string;    // email subject line
    body: string;       // email body content
  };
  banner_ads: {
    headline: string;   // banner headline
    cta: string;        // call-to-action text
  }[];
  landing_page_concept: {
    hero_text: string;  // main headline for landing page
    sub_text: string;   // subheading or description
    cta: string;        // call-to-action button
  };
  generated_images?: {
    url: string;        // public URL of generated image
    prompt: string;     // prompt used to generate the image
    filename: string;   // filename in storage
    generated_at: string; // timestamp of generation
  }[];
};