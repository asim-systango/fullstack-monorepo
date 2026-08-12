export default function HomePage() {
  return (
    <main className="mx-auto max-w-content px-6 py-12">
      <p className="text-sm text-muted-foreground">Medium-inspired theme</p>
      <h1 className="mt-2 text-4xl leading-tight">Your story starts here</h1>
      <p className="mt-4 font-serif text-lg leading-relaxed text-body">
        UI uses <span className="font-sans">Inter</span>; article content uses{' '}
        <span className="font-serif italic">Source Serif 4</span> — matching Medium&apos;s
        sans UI + serif reading experience.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-pill bg-brand px-5 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
        >
          New list
        </button>
        <button
          type="button"
          className="rounded-pill border border-border-strong bg-background px-5 py-2 text-sm font-medium text-foreground"
        >
          Follow
        </button>
        <span className="inline-flex items-center rounded-pill bg-surface-muted px-3 py-1 text-sm text-muted-foreground">
          Tag
        </span>
        <span className="inline-flex items-center rounded-pill bg-accent-yellow px-3 py-1 text-sm font-medium text-foreground">
          Welcome offer
        </span>
      </div>
    </main>
  );
}
