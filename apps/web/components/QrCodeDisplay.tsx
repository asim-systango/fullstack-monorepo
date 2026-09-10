'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@shared/ui/components';

interface QrCodeDisplayProps {
  payload: string;
  size?: number;
}

export function QrCodeDisplay({ payload, size = 200 }: QrCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    // Generate real, standard 2D ISO QR code matrix
    QRCode.toDataURL(
      payload,
      {
        width: size * 2,
        margin: 2,
        color: {
          dark: '#09090b',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (err, url) => {
        if (!mounted) return;
        if (err) {
          console.error('Failed to generate QR code:', err);
          setError(true);
        } else {
          setDataUrl(url);
          setError(false);
        }
      },
    );

    return () => {
      mounted = false;
    };
  }, [payload, size]);

  const handleCopy = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="group relative flex items-center justify-center rounded-xl border border-border/80 bg-white p-3 shadow-md"
        style={{ width: size + 24, height: size + 24 }}
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR Code for ${payload}`}
            width={size}
            height={size}
            className="rounded-md object-contain"
          />
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center p-2 text-xs text-rose-500">
            Failed to render QR Code
          </div>
        ) : (
          <div className="flex items-center justify-center text-xs text-muted-foreground animate-pulse">
            Generating QR...
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <code className="rounded-md bg-secondary/60 px-2 py-1 text-[11px] font-mono text-muted-foreground select-all">
          {payload.slice(0, 16)}...{payload.slice(-6)}
        </code>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-[11px]"
        >
          {copied ? 'Copied!' : 'Copy Payload'}
        </Button>
      </div>
    </div>
  );
}
