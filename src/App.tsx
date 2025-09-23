import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScreenSaver from "./components/ScreenSaver";
import UploadScreen from "./components/UploadScreen";
import CampaignPromptScreen from "./components/CampaignPromptScreen";
import CatalogPromptScreen from "./components/CatalogPromptScreen";
import GenerateCampaignScreen from "./components/GenerateCampaignScreen";
import CampaignResultsScreen from "./components/CampaignResultsScreen";
import CatalogResultsScreen from "./components/CatalogResultsScreen";
import MobileUploadScreen from "./components/MobileUploadScreen";
import QRDownloadScreen from "./components/QRDownloadScreen";
import DownloadContentScreen from "./components/DownloadContentScreen";
import PreviewResultsScreen from "./components/PreviewResultsScreen";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ScreenSaver />} />
          <Route path="/welcome" element={<Index />} />
          <Route path="/campaign-prompt" element={<CampaignPromptScreen />} />
          <Route path="/catalog-prompt" element={<CatalogPromptScreen />} />
          <Route path="/generate-campaign" element={<GenerateCampaignScreen />} />
          <Route path="/campaign-results" element={<CampaignResultsScreen />} />
          <Route path="/upload/:type" element={<UploadScreen />} />
          <Route path="/mobile-upload" element={<MobileUploadScreen />} />
          <Route path="/catalog-results" element={<CatalogResultsScreen />} />
          <Route path="/preview-results" element={<PreviewResultsScreen />} />
          <Route path="/qr-download" element={<QRDownloadScreen />} />
          <Route path="/download-content" element={<DownloadContentScreen />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
