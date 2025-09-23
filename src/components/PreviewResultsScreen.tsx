import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Info, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import RibbedSphere from '@/components/RibbedSphere';

const PreviewResultsScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { uploadedImage } = location.state || {};

  const handleBack = () => {
    navigate(-1);
  };

  const handleStartOver = () => {
    navigate('/');
  };

  const handleOpenCategory = (category: string) => {
    // Navigate to specific category results
    console.log(`Opening ${category} results`);
  };

  return (
    <div className="min-h-screen bg-[#2c2c2c] p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="mr-4 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <div className="h-8 w-8 mr-3">
                <RibbedSphere className="w-full h-full" />
              </div>
              <h1 className="text-2xl font-bold text-white">Creative Assets Preview</h1>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <X className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exit to Homepage?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to exit? Your generated content preview will be lost.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleStartOver}>Exit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Banner Ads Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <div className="bg-gray-200 px-4 py-3 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center space-x-2">
                <h3 className="text-gray-800 font-medium">Banner Ads</h3>
                <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded-full">0</span>
                <Info className="h-4 w-4 text-gray-500" />
              </div>
              <Button 
                size="sm" 
                onClick={() => handleOpenCategory('Banner Ads')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4"
              >
                Open
              </Button>
            </div>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3 h-64">
                <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                  {uploadedImage && (
                    <img 
                      src={uploadedImage} 
                      alt="Banner variation 1"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                  {uploadedImage && (
                    <img 
                      src={uploadedImage} 
                      alt="Banner variation 2"
                      className="w-full h-full object-cover rounded-lg opacity-80"
                    />
                  )}
                </div>
                <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                  {uploadedImage && (
                    <img 
                      src={uploadedImage} 
                      alt="Banner variation 3"
                      className="w-full h-full object-cover rounded-lg opacity-60"
                    />
                  )}
                </div>
                <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                  {uploadedImage && (
                    <img 
                      src={uploadedImage} 
                      alt="Banner variation 4"
                      className="w-full h-full object-cover rounded-lg opacity-40"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Web Creative Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <div className="bg-gray-200 px-4 py-3 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center space-x-2">
                <h3 className="text-gray-800 font-medium">Web Creative</h3>
                <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded-full">1</span>
                <Info className="h-4 w-4 text-gray-500" />
              </div>
              <Button 
                size="sm" 
                onClick={() => handleOpenCategory('Web Creative')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4"
              >
                Open
              </Button>
            </div>
            <CardContent className="p-4">
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                {uploadedImage && (
                  <img 
                    src={uploadedImage} 
                    alt="Web creative"
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Video Scripts Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <div className="bg-gray-200 px-4 py-3 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center space-x-2">
                <h3 className="text-gray-800 font-medium">Video Scripts</h3>
                <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded-full">1</span>
                <Info className="h-4 w-4 text-gray-500" />
              </div>
              <Button 
                size="sm" 
                onClick={() => handleOpenCategory('Video Scripts')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4"
              >
                Open
              </Button>
            </div>
            <CardContent className="p-4">
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                {uploadedImage && (
                  <img 
                    src={uploadedImage} 
                    alt="Video script preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Email Templates Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <div className="bg-gray-200 px-4 py-3 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center space-x-2">
                <h3 className="text-gray-800 font-medium">Email Templates</h3>
                <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded-full">2</span>
                <Info className="h-4 w-4 text-gray-500" />
              </div>
              <Button 
                size="sm" 
                onClick={() => handleOpenCategory('Email Templates')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4"
              >
                Open
              </Button>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3 h-64">
                <div className="h-[48%] bg-gray-100 rounded-lg flex items-center justify-center">
                  {uploadedImage && (
                    <img 
                      src={uploadedImage} 
                      alt="Email template 1"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="h-[48%] bg-gray-100 rounded-lg flex items-center justify-center">
                  {uploadedImage && (
                    <img 
                      src={uploadedImage} 
                      alt="Email template 2"
                      className="w-full h-full object-cover rounded-lg opacity-70"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <Button 
            onClick={handleStartOver}
            variant="outline"
            size="lg"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full px-8"
          >
            Create New Campaign
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreviewResultsScreen;