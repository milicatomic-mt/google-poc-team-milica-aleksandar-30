import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { getQRSession, updateQRSession, uploadImageToSession } from '@/lib/qr-session';
import RibbedSphere from '@/components/RibbedSphere';

const MobileUploadScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionToken = searchParams.get('session');
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const validateSession = async () => {
      if (!sessionToken) {
        setIsValidSession(false);
        toast.error('Invalid QR code - no session found');
        return;
      }

      try {
        const session = await getQRSession(sessionToken);
        if (!session) {
          setIsValidSession(false);
          toast.error('QR code expired or invalid');
        } else {
          setIsValidSession(true);
          if (session.uploaded_image_url) {
            setUploadedImage(session.uploaded_image_url);
          }
        }
      } catch (error) {
        setIsValidSession(false);
        toast.error('Error validating QR code');
      }
    };

    validateSession();
  }, [sessionToken]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionToken) return;

    // Basic validation
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image too large. Please use images under 10MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to storage
      const imageUrl = await uploadImageToSession(file, sessionToken);
      
      // Update session with uploaded image (but don't mark as displayed yet)
      await updateQRSession(sessionToken, {
        uploaded_image_url: imageUrl,
        status: 'uploaded'
      });

      setUploadedImage(imageUrl);
      toast.success('Image sent to screen!');
      
      // Show success message but don't auto-close
      // User can close manually or navigate back
    } catch (error) {
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };


  if (isValidSession === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Invalid QR Code</h1>
          <p className="text-muted-foreground">
            This QR code is either invalid or has expired. Please scan a new one.
          </p>
          <Button onClick={() => window.close()} variant="outline">
            Close
          </Button>
        </div>
      </div>
    );
  }

  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Validating QR code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6">
              <RibbedSphere className="w-full h-full" />
            </div>
            <span className="font-semibold text-foreground">Upload from Mobile</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.close()}
            className="rounded-full shadow-sm"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          
          {!uploadedImage ? (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Upload a Photo</h1>
                <p className="text-muted-foreground">
                  Select an image from your device to send to the main screen
                </p>
              </div>

              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center space-y-4">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-foreground font-medium">Tap to select image</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG, WEBP • Max 10MB
                  </p>
                </div>
                
                <Button 
                  onClick={handleFileSelect}
                  disabled={isUploading}
                  className="w-full"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <h1 className="text-2xl font-bold text-foreground">Image Sent!</h1>
                <p className="text-muted-foreground">
                  Your image has been sent to the main screen
                </p>
              </div>

              <div className="bg-card rounded-lg p-4 space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={uploadedImage}
                    alt="Uploaded image"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="text-center space-y-2 bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                  <p className="text-green-800 font-medium">
                    Image sent to main screen!
                  </p>
                  <p className="text-green-600 text-sm">
                    You can close this tab or upload another image
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default MobileUploadScreen;