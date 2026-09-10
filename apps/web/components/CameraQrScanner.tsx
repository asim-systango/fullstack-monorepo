'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Alert, Button } from '@shared/ui/components';

interface CameraQrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  autoStart?: boolean;
}

export function CameraQrScanner(props: Readonly<CameraQrScannerProps>) {
  const { onScanSuccess, autoStart = false } = props;
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const isCooldownRef = useRef<boolean>(false);
  const regionId = 'html5qr-code-full-region';

  const startScanner = async () => {
    setCameraError(null);

    try {
      if (!html5QrcodeRef.current) {
        html5QrcodeRef.current = new Html5Qrcode(regionId, {
          verbose: false,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        });
      }

      const scanConfig = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          return {
            width: Math.max(150, Math.floor(minEdge * 0.8)),
            height: Math.max(150, Math.floor(minEdge * 0.8)),
          };
        },
      };

      const handleScanSuccess = (decodedText: string) => {
        if (isCooldownRef.current) return;
        isCooldownRef.current = true;

        if (typeof window !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(200);
        }

        setLastScanned(decodedText);
        onScanSuccess(decodedText);

        setTimeout(() => {
          isCooldownRef.current = false;
        }, 3000);
      };

      // Try environment (back camera) first; if laptop/integrated webcam fails, try user (front camera) or boolean true
      try {
        await html5QrcodeRef.current.start(
          { facingMode: 'environment' },
          scanConfig,
          handleScanSuccess,
          () => {},
        );
      } catch {
        try {
          await html5QrcodeRef.current.start(
            { facingMode: 'user' },
            scanConfig,
            handleScanSuccess,
            () => {},
          );
        } catch {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0 && devices[0]?.id) {
            await html5QrcodeRef.current.start(
              devices[0].id,
              scanConfig,
              handleScanSuccess,
              () => {},
            );
          } else {
            throw new Error('No camera devices found on this system.');
          }
        }
      }

      setIsScanning(true);
    } catch (err: unknown) {
      console.error('Error starting live camera stream:', err);
      const errorMessage =
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as { message: string }).message === 'string'
          ? (err as { message: string }).message
          : 'Unable to start camera stream. Please check camera permissions in your browser settings.';
      setCameraError(errorMessage);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      try {
        await html5QrcodeRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  useEffect(() => {
    return () => {
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-4 rounded-xl border border-border/80 bg-secondary/20 p-4">
      {/* Styles for html5-qrcode video element */}
      <style>{`
        #${regionId} video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 0.75rem;
        }
        #${regionId} {
          border: none !important;
        }
      `}</style>

      {/* Viewfinder Container */}
      <div
        className={`relative overflow-hidden rounded-xl bg-slate-950 transition-all ${
          isScanning ? 'block h-72 sm:h-80' : 'hidden h-0'
        }`}
      >
        <div id={regionId} className="h-full w-full" />
        {isScanning && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-56 w-56 rounded-2xl border-2 border-dashed border-emerald-400" />
          </div>
        )}
      </div>

      {!isScanning ? (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 border border-dashed border-border/80 rounded-xl bg-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl">
            📷
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Camera Check-In Scanner</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click the button below to open your camera and scan attendee QR passes
              automatically.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={startScanner}
            className="text-xs font-bold px-6 py-2"
          >
            📷 Open Camera to Scan QR
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full animate-ping bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-foreground">
              Camera Active (Point at QR Code to Scan)
            </span>
          </div>
          <Button variant="danger" size="sm" onClick={stopScanner} className="text-xs">
            Close Camera
          </Button>
        </div>
      )}

      {cameraError && (
        <Alert tone="danger" title="Camera Access Info">
          <p className="mt-1 text-xs">{cameraError}</p>
          <div className="mt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={startScanner}
              className="text-xs"
            >
              Retry Camera Permission
            </Button>
          </div>
        </Alert>
      )}

      {lastScanned && (
        <div className="rounded-lg bg-emerald-500/10 p-2.5 text-center text-xs font-mono text-emerald-600 border border-emerald-500/30">
          ✓ Scanned: <strong>{lastScanned}</strong>
        </div>
      )}
    </div>
  );
}
