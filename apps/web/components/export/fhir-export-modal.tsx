'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Button,
  Spinner,
} from '@shared/ui/components';
import { Download, FileCode, FileText, CheckCircle2, Copy } from 'lucide-react';

interface FhirExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
}

export function FhirExportModal({
  open,
  onOpenChange,
  appointmentId,
}: Readonly<FhirExportModalProps>) {
  const [activeTab, setActiveTab] = useState<'fhir' | 'hl7'>('fhir');
  const [fhirContent, setFhirContent] = useState<string>('');
  const [hl7Content, setHl7Content] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!open || !appointmentId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/appointments/${appointmentId}/fhir`, {
        headers: { Accept: 'application/json' },
      }),
      fetch(`/api/appointments/${appointmentId}/hl7`, {
        headers: { Accept: 'text/plain' },
      }),
    ])
      .then(async ([fhirRes, hl7Res]) => {
        if (!isMounted) return;

        if (!fhirRes.ok) {
          throw new Error('Failed to load FHIR R4 record');
        }

        const fhirData = await fhirRes.json();
        const fhirJson = JSON.stringify(fhirData.data || fhirData, null, 2);

        let hl7Text = '';
        if (hl7Res.ok) {
          const rawHl7 = await hl7Res.text();
          try {
            const parsed = JSON.parse(rawHl7);
            hl7Text = parsed.data || parsed;
          } catch {
            hl7Text = rawHl7;
          }
        }

        setFhirContent(fhirJson);
        setHl7Content(hl7Text || 'MSH|^~\\&|PULSECARE_EMR|HOSPITAL...');
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Error fetching export records');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, appointmentId]);

  const handleCopy = () => {
    const textToCopy = activeTab === 'fhir' ? fhirContent : hl7Content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const isFhir = activeTab === 'fhir';
    const content = isFhir ? fhirContent : hl7Content;
    const mimeType = isFhir ? 'application/json' : 'text/plain';
    const extension = isFhir ? 'json' : 'hl7';
    const filename = `clinical-record-${appointmentId.slice(0, 8)}.${extension}`;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderModalBody = () => {
    if (isLoading) {
      return (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <Spinner size="md" className="text-primary" />
          <p className="text-xs text-muted-foreground">
            Generating standard healthcare export bundle...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {error}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {activeTab === 'fhir'
              ? 'FHIR R4 Patient & Encounter Resource Bundle'
              : 'HL7 v2.5 ORU^R01 Clinical Data Message'}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Raw
              </>
            )}
          </button>
        </div>
        <pre className="p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] max-h-72 overflow-auto whitespace-pre-wrap break-all border border-slate-800">
          {activeTab === 'fhir' ? fhirContent : hl7Content}
        </pre>
      </div>
    );
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-primary" />
          Clinical Record Interoperability Export
        </DialogTitle>
      </DialogHeader>
      <DialogBody className="space-y-4">
        {/* Format selector tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('fhir')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'fhir'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <FileCode className="w-4 h-4" /> HL7 FHIR R4 (JSON)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hl7')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'hl7'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <FileText className="w-4 h-4" /> HL7 v2.5 (ORU^R01)
          </button>
        </div>

        {renderModalBody()}
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
          Close
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleDownload}
          disabled={isLoading || Boolean(error)}
          className="gap-1.5"
        >
          <Download className="w-4 h-4" /> Download File
        </Button>
      </DialogFooter>
    </Modal>
  );
}
