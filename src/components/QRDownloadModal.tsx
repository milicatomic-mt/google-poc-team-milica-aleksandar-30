import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { createQRDownloadSession } from '@/lib/qr-download-session';

interface QRDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignData: any;
  title?: string;
}

const QRDownloadModal: React.FC<QRDownloadModalProps> = ({ 
  isOpen, 
  onClose, 
  campaignData,
  title = "Download All Content" 
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [sessionToken, setSessionToken] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && campaignData && !qrUrl) {
      generateQRCode();
    }
  }, [isOpen, campaignData]);

  const generateQRCode = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const result = await createQRDownloadSession(campaignData);
      setQrUrl(result.qrUrl);
      setSessionToken(result.sessionToken);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      toast.success('Download link copied to clipboard!');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDirectDownload = () => {
    if (qrUrl) {
      window.open(qrUrl, '_blank');
    }
  };

  const resetModal = () => {
    setCopied(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetModal();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-gray-900">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            {isGenerating ? (
              <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : qrUrl ? (
              <QRCodeSVG 
                value={qrUrl}
                size={256}
                level="M"
                includeMargin={true}
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded">
                <span className="text-gray-500">Failed to generate QR code</span>
              </div>
            )}
          </div>

          {/* Scan me text */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Scan me
            </h3>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 font-medium">
              Scan with your phone to download
            </p>
            <p className="text-xs text-gray-500">
              Contains all generated images and content in a ZIP file
            </p>
          </div>

          {/* Session Info */}
          {sessionToken && (
            <div className="text-xs text-gray-400 text-center">
              Session expires in 1 hour
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRDownloadModal;