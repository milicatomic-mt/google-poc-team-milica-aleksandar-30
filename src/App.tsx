import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Error caught by boundary
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScreenSaver from "./components/ScreenSaver";
import UploadScreen from "./components/UploadScreen";
import CampaignPromptScreen from "./components/CampaignPromptScreen";
import CatalogPromptScreen from "./components/CatalogPromptScreen";
import GenerateCampaignScreen from "./components/GenerateCampaignScreen";
import WebCreativePreview from "./components/WebCreativePreview";
import BannerAdsPreview from "./components/BannerAdsPreview";
import VideoScriptsPreview from "./components/VideoScriptsPreview";
import EmailTemplatesPreview from "./components/EmailTemplatesPreview";

import CatalogResultsScreen from "./components/CatalogResultsScreen";
import MobileUploadScreen from "./components/MobileUploadScreen";
import DownloadContentScreen from "./components/DownloadContentScreen";
import PreviewResultsScreen from "./components/PreviewResultsScreen";
import OptimizedGallery from "./components/OptimizedGallery";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => (
  <ErrorBoundary>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<ScreenSaver />} />
            <Route path="/gallery" element={<OptimizedGallery />} />
            <Route path="/welcome" element={<Index />} />
            <Route path="/campaign-prompt" element={<CampaignPromptScreen />} />
            <Route path="/catalog-prompt" element={<CatalogPromptScreen />} />
            <Route path="/generate-campaign" element={<GenerateCampaignScreen />} />
            
            <Route path="/upload/:type" element={<UploadScreen />} />
            <Route path="/mobile-upload" element={<MobileUploadScreen />} />
            <Route path="/catalog-results" element={<CatalogResultsScreen />} />
            <Route path="/preview-results" element={<PreviewResultsScreen />} />
            <Route path="/web-creative" element={<WebCreativePreview />} />
            <Route path="/banner-ads" element={<BannerAdsPreview />} />
            <Route path="/video-scripts" element={<VideoScriptsPreview />} />
            <Route path="/email-templates" element={<EmailTemplatesPreview />} />
            <Route path="/download-content" element={<DownloadContentScreen />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
  </ErrorBoundary>
);

export default App;
