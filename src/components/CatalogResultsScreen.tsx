import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Copy, CheckCircle, AlertCircle, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { saveCatalogRequest, generateCatalog } from '@/lib/database';
import type { CatalogEnrichmentRequest, CatalogEnrichmentResponse } from '@/types/api';
import RibbedSphere from '@/components/RibbedSphere';

const CatalogResultsScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const catalogData = location.state as CatalogEnrichmentRequest & { uploadedImage: string };

  const [isGenerating, setIsGenerating] = useState(true);
  const [catalogResults, setCatalogResults] = useState<CatalogEnrichmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState("Preparing catalog generation...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!catalogData?.uploadedImage) {
      navigate('/');
      return;
    }

    const generateCatalogContent = async () => {
      try {
        setIsGenerating(true);
        setError(null);

        // Simulate loading steps with progress updates
        const loadingSteps = [
          { text: "Preparing catalog generation...", progress: 0 },
          { text: "Analyzing product image...", progress: 25 },
          { text: "Generating SEO-optimized content...", progress: 50 },
          { text: "Creating features and descriptions...", progress: 75 },
          { text: "Finalizing catalog content...", progress: 90 }
        ];

        // Update loading steps
        for (let i = 0; i < loadingSteps.length; i++) {
          setCurrentAction(loadingSteps[i].text);
          setProgress(loadingSteps[i].progress);
          await new Promise(resolve => setTimeout(resolve, 1200)); // Wait 1.2s between steps
        }

        // Save the catalog request to database first
        const catalogRequest: CatalogEnrichmentRequest = {
          image: catalogData.uploadedImage,
          category: catalogData.category,
          tone: catalogData.tone,
          platform: catalogData.platform,
          brand: catalogData.brand
        };

        const savedRequest = await saveCatalogRequest(catalogRequest);

        // Generate the catalog content using AI
        const results = await generateCatalog(savedRequest.id, catalogRequest);

        // Final progress update
        setCurrentAction("Complete!");
        setProgress(100);

        setCatalogResults(results);
        toast.success('Catalog content generated successfully!');

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to generate catalog content');
        toast.error('Failed to generate catalog content. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    };

    generateCatalogContent();
  }, [catalogData, navigate]);

  const handleBack = () => {
    navigate('/upload/catalog', { state: { uploadedImage: catalogData.uploadedImage } });
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard!`);
      
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleStartOver = () => {
    navigate('/');
  };

  if (isGenerating) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-background">
        <video 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-50 z-0" 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="/background-video.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 flex min-h-screen flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Animated Sphere - 200x200px */}
              <div className="w-[200px] h-[200px] animate-fade-in">
                <RibbedSphere className="w-full h-full" />
              </div>

              {/* Loading Text */}
              <div className="text-center animate-fade-in animation-delay-300 min-h-[80px] flex flex-col justify-center">
                <p className="text-2xl font-semibold text-foreground mb-2">
                  {currentAction}
                </p>
                <p className="text-lg text-muted-foreground">
                  Creating your comprehensive catalog content
                </p>
              </div>

              {/* Progress Bar - Fixed position */}
              <div className="w-80 animate-fade-in animation-delay-500">
                <div className="relative overflow-hidden rounded-full">
                  <Progress 
                    value={progress} 
                    className="h-1 bg-muted"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer pointer-events-none rounded-full"></div>
                </div>
                <div className="flex justify-center items-center mt-2 text-sm text-muted-foreground">
                  <span>{progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Catalog Generation Failed</h2>
          <p className="text-muted-foreground mb-4">Unable to generate catalog content. Please try again.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
          <Button onClick={handleBack} variant="outline" className="ml-2">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
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
        {/* Title, Subtitle and Download Button */}
        <div className="container-padding pt-8 pb-4">
          <div className="max-w-4xl mx-auto flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Catalog Enrichment Preview
              </h2>
              <p className="text-xl text-muted-foreground font-medium">
                Your enriched catalog is ready to publish
              </p>
            </div>
            <Button
              variant="default"
              className="tap-target focus-ring bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-2 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 container-padding pt-4 pb-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Product Image Preview */}
            <Card className="card-elegant backdrop-blur-md bg-white/20 border-white/30 border-2 shadow-elegant-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-48 h-48 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={catalogData.uploadedImage}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {catalogResults?.product_title}
                    </h3>
                    {catalogData.category && (
                      <Badge variant="default" className="mb-2 bg-primary text-primary-foreground">
                        {catalogData.category}
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(catalogResults?.product_title || '', 'Product Title')}
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                  >
                    {copiedField === 'Product Title' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Description */}
            <Card className="card-elegant backdrop-blur-md bg-white/20 border-white/30 border-2 shadow-elegant-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Product Description</CardTitle>
                  <Button
                    onClick={() => copyToClipboard(catalogResults?.description || '', 'Description')}
                    variant="outline"
                    size="sm"
                  >
                    {copiedField === 'Description' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {catalogResults?.description}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Features */}
              <Card className="card-elegant backdrop-blur-md bg-white/20 border-white/30 border-2 shadow-elegant-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Key Features</CardTitle>
                    <Button
                      onClick={() => copyToClipboard(catalogResults?.features.join(', ') || '', 'Features')}
                      variant="outline"
                      size="sm"
                    >
                      {copiedField === 'Features' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {catalogResults?.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-foreground">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0"></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* SEO Metadata */}
              <Card className="card-elegant backdrop-blur-md bg-white/20 border-white/30 border-2 shadow-elegant-lg">
                <CardHeader className="pb-3">
                  <CardTitle>SEO Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-foreground">Keywords</h4>
                      <Button
                        onClick={() => copyToClipboard(catalogResults?.seo_metadata.keywords.join(', ') || '', 'Keywords')}
                        variant="outline"
                        size="sm"
                      >
                        {copiedField === 'Keywords' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {catalogResults?.seo_metadata.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-primary text-primary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-foreground">Tags</h4>
                      <Button
                        onClick={() => copyToClipboard(catalogResults?.seo_metadata.tags.join(', ') || '', 'Tags')}
                        variant="outline"
                        size="sm"
                      >
                        {copiedField === 'Tags' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {catalogResults?.seo_metadata.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-primary text-primary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alt Text */}
            <Card className="card-elegant backdrop-blur-md bg-white/20 border-white/30 border-2 shadow-elegant-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Image Alt Text</CardTitle>
                  <Button
                    onClick={() => copyToClipboard(catalogResults?.alt_text || '', 'Alt Text')}
                    variant="outline"
                    size="sm"
                  >
                    {copiedField === 'Alt Text' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground italic">
                  "{catalogResults?.alt_text}"
                </p>
              </CardContent>
            </Card>

            {/* Short Marketing Copy (if available) */}
            {catalogResults?.short_marketing_copy && (
              <Card className="card-elegant backdrop-blur-md bg-white/20 border-white/30 border-2 shadow-elegant-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Short Marketing Copy</CardTitle>
                    <Button
                      onClick={() => copyToClipboard(catalogResults.short_marketing_copy || '', 'Marketing Copy')}
                      variant="outline"
                      size="sm"
                    >
                      {copiedField === 'Marketing Copy' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground font-medium">
                    {catalogResults.short_marketing_copy}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="container-padding pb-8 pt-4">
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={handleStartOver}
              variant="outline"
              size="lg"
              className="px-8 rounded-full"
            >
              Create New Catalog
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CatalogResultsScreen;