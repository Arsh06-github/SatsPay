import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import Button from './Button';
import { parseBitcoinURI, isValidBitcoinAddress } from '../../utils/bitcoin';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onError,
  className = '',
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsScanning(true);
      
      // Create a canvas to read the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        try {
          // Get image data for QR code scanning
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          
          if (imageData) {
            // Use jsQR to scan for QR codes
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (qrCode) {
              console.log('QR code detected:', qrCode.data);
              
              // Parse Bitcoin URI or plain address
              const parsedURI = parseBitcoinURI(qrCode.data);
              
              if (parsedURI) {
                // Return the address (the component using this scanner can handle the full URI if needed)
                onScan(parsedURI.address);
              } else {
                onError?.('QR code does not contain a valid Bitcoin address or URI');
              }
            } else {
              onError?.('No QR code found in image');
            }
          } else {
            onError?.('Failed to process image data');
          }
          
          setIsScanning(false);
          
        } catch (error) {
          console.error('QR scan error:', error);
          onError?.('Failed to scan QR code');
          setIsScanning(false);
        }
      };
      
      img.onerror = () => {
        onError?.('Failed to load image');
        setIsScanning(false);
      };
      
      // Read the file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('File upload error:', error);
      onError?.('Failed to process file');
      setIsScanning(false);
    }
  };



  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleScanClick}
        disabled={isScanning}
        className="flex items-center space-x-2"
      >
        {isScanning ? (
          <>
            <div className="w-4 h-4 border-2 border-secondary-300 border-t-secondary-600 rounded-full animate-spin"></div>
            <span>Scanning...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12v4.01M12 12V7.99" />
            </svg>
            <span>Scan QR</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default QRScanner;