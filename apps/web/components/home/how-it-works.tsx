function StepIcon({ children }: Readonly<{ children: string }>) {
  return (
    <span
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold text-foreground"
      aria-hidden
    >
      {children}
    </span>
  );
}

const STEPS = [
  {
    title: 'Discover Auctions',
    description: 'Browse products and find auctions that interest you.',
    icon: '1',
  },
  {
    title: 'Place Your Bid',
    description: 'Compete with other bidders by placing valid bids.',
    icon: '2',
  },
  {
    title: 'Win the Auction',
    description: 'Become the highest bidder when the auction closes.',
    icon: '3',
  },
] as const;

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading" className="space-y-4">
      <div>
        <h2
          id="how-it-works-heading"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          How It Works
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Three simple steps from browsing to winning.
        </p>
      </div>

      <ol className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.title} className="rounded-lg border border-border bg-card p-5">
            <StepIcon>{step.icon}</StepIcon>
            <h3 className="mt-3 text-base font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
