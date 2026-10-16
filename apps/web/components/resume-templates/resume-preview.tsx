'use client';

import { ClassicTemplate } from './classic-template';
import { CompactTemplate } from './compact-template';
import { ModernTemplate } from './modern-template';
import type { ResumeViewModel, TemplateProps } from './types';

export function ResumePreview({ resume, className }: TemplateProps) {
  const key = String(resume.templateKey ?? 'classic').toLowerCase();

  if (key === 'modern') {
    return <ModernTemplate resume={resume} className={className} />;
  }
  if (key === 'compact') {
    return <CompactTemplate resume={resume} className={className} />;
  }
  return <ClassicTemplate resume={resume} className={className} />;
}

export type { ResumeViewModel };
