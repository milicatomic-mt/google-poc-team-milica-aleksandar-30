import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, X, Package, Palette, Store, Tag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SimpleLoadingSpinner from '@/components/SimpleLoadingSpinner';

const CatalogDetailsScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { uploadedImage } = location.state || {};
  
  const [productCategory, setProductCategory] = useState<string>("");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [brandTone, setBrandTone] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [brand, setBrand] = useState<string>("");

  const handleBack = () => {
    navigate("/upload/catalog", { state: { uploadedImage } });
  };

  const handleContinue = () => {
    const catalogData = {
      uploadedImage,
      category: productCategory === 'custom' ? customCategory : productCategory,
      tone: brandTone,
      platform,
      brand
    };
    
    navigate("/catalog-results", { state: catalogData });
  };

  const predefinedCategories = [
    "Clothing & Apparel",
    "Electronics & Tech",
    "Home & Garden",
    "Beauty & Personal Care",
    "Sports & Outdoor",
    "Automotive",
    "Books & Media",
    "Food & Beverages",
    "Toys & Games",
    "Health & Wellness"
  ];

  const brandTones = [
    "Professional",
    "Minimalist", 
    "Luxury",
    "Playful",
    "Bold & Edgy",
    "Warm & Friendly",
    "Technical",
    "Eco-Conscious",
    "Premium",
    "Casual"
  ];

  const platforms = [
    "Shopify",
    "Amazon",
    "Google Shopping",
    "eBay",
    "Etsy",
    "WooCommerce",
    "BigCommerce",
    "Facebook Marketplace",
    "Instagram Shopping",
    "TikTok Shop"
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background Video */}
      <video 
        className="absolute inset-0 w-full h-full object-cover object-center opacity-50 z-0" 
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 flex min-h-screen flex-col overflow-y-auto">
        {/* Header */}
        <header className="container-padding pt-12 relative">
          {/* Logo and Flow Name - Top Left */}
          <div className="absolute top-12 left-8">
            <div className="flex items-center">
              <div className="h-8 w-8 mr-3">
                <SimpleLoadingSpinner className="w-full h-full" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">Catalog Enrichment</h1>
            </div>
          </div>
          
          {/* Exit Button - Top Right (aligned with logo) */}
          <div className="absolute top-12 right-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="tap-target focus-ring bg-white border-white/30 hover:bg-white/90 rounded-full h-8 px-3">
                  <X className="h-4 w-4 text-black" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Exit to Homepage?</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to exit? Any current progress will be lost.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" className="rounded-full">Cancel</Button>
                  <Button onClick={() => navigate('/')} className="rounded-full">Exit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Back Button - Centered Vertically on Left */}
        <div className="fixed top-1/2 left-8 transform -translate-y-1/2 z-20">
          <Button 
            variant="secondary" 
            onClick={handleBack}
            className="tap-target focus-ring bg-white border-white/30 hover:bg-white/90 rounded-full p-3"
            aria-label="Go back to upload screen"
          >
            <ArrowLeft className="h-5 w-5 text-black" />
          </Button>
        </div>


        {/* Title and Description */}
        <div className="text-center py-4">
          <p className="text-lg text-muted-foreground mb-1">Optional</p>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Additional Details
          </h2>
          <p className="text-xl text-muted-foreground font-medium mb-6">
            Provide additional details to get more targeted and relevant content for your product
          </p>
        </div>

        {/* Main Content - Scrollable */}
        <main className="flex-1 flex items-start justify-center container-padding pt-2 pb-8 overflow-y-auto">
          <div className="w-full max-w-4xl">
            <div className="grid grid-cols-2 gap-6">
              {/* Product Category */}
              <div>
                <Select value={productCategory} onValueChange={setProductCategory}>
                  <SelectTrigger className="h-16 text-lg bg-white/20 border-2 border-white/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-white/30 transition-all duration-200 focus:ring-2 focus:ring-primary/50">
                    <SelectValue placeholder="Select or enter category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-md border-white/20 z-50">
                    {predefinedCategories.map((category) => (
                      <SelectItem key={category} value={category} className="text-base py-4 hover:bg-primary/10">
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom" className="text-base py-4 font-medium hover:bg-primary/10">
                      Custom Category...
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {productCategory === 'custom' && (
                  <Input
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="h-16 text-lg bg-white/20 border-2 border-white/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-white/30 transition-all duration-200 placeholder:text-muted-foreground/70 mt-4"
                  />
                )}
              </div>

              {/* Brand Tone */}
              <div>
                <Select value={brandTone} onValueChange={setBrandTone}>
                  <SelectTrigger className="h-16 text-lg bg-white/20 border-2 border-white/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-white/30 transition-all duration-200 focus:ring-2 focus:ring-primary/50">
                    <SelectValue placeholder="Select brand tone" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-md border-white/20 z-50">
                    {brandTones.map((tone) => (
                      <SelectItem key={tone} value={tone} className="text-base py-4 hover:bg-primary/10">
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Platform/Channel */}
              <div>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="h-16 text-lg bg-white/20 border-2 border-white/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-white/30 transition-all duration-200 focus:ring-2 focus:ring-primary/50">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-md border-white/20 z-50">
                    {platforms.map((plat) => (
                      <SelectItem key={plat} value={plat} className="text-base py-4 hover:bg-primary/10">
                        {plat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand Name */}
              <div>
                <Input
                  id="brand"
                  placeholder="Enter brand name"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="h-16 text-lg bg-white/20 border-2 border-white/40 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-white/30 transition-all duration-200 placeholder:text-muted-foreground/70 placeholder:text-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </main>

        {/* Footer with Navigation */}
        <footer className="mt-auto container-padding pb-8 flex-shrink-0">
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={handleContinue}
              className="tap-target focus-ring w-96 px-12 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300 rounded-full"
              aria-label="Generate catalog content with product details"
            >
              Generate Catalog Content
            </Button>
          </div>
        </footer>
      </div>

      {/* Accessibility */}
      <div className="sr-only">
        <h2>Product Details (Optional)</h2>
        <p>Provide additional product details to enhance your catalog content generation</p>
      </div>
    </div>
  );
};

export default CatalogDetailsScreen;