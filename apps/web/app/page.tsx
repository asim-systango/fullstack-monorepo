import { ComponentShowcase } from '@/components/ui/component-showcase';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-content px-6 py-12">
      <p className="text-sm text-muted-foreground">Medium-inspired theme</p>
      <h1 className="mt-2 text-4xl leading-tight">Your story starts here</h1>
      <p className="mt-4 font-serif text-lg leading-relaxed text-body">
        UI uses <span className="font-sans">Inter</span>; article content uses{' '}
        <span className="font-serif italic">Source Serif 4</span>.
      </p>
      <ComponentShowcase />
    </main>
  );
}
