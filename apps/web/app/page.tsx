import { Page } from '@shared/ui/components';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Page>
      <main className="mx-auto max-w-5xl">
        <section className="py-16 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
            Learning Management System
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Learn. Grow. Achieve.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Learn new skills, explore courses, track your progress, and build your
            knowledge with our simple and powerful learning platform.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/register"
              className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="rounded-md border border-border px-6 py-3 font-medium text-foreground transition hover:bg-muted"
            >
              Log In
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="grid gap-6 py-12 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Explore Courses</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Discover courses designed to help you develop practical skills and expand
              your knowledge.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Learn at Your Pace</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Study whenever and wherever you want while keeping track of your learning
              progress.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Track Your Progress</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete lessons and quizzes and see how far you&apos;ve progressed through
              your courses.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="my-12 rounded-xl bg-muted px-6 py-12 text-center">
          <h2 className="text-2xl font-bold text-foreground">Ready to start learning?</h2>

          <p className="mt-3 text-muted-foreground">
            Create your account and start exploring your learning journey.
          </p>

          <Link
            href="/register"
            className="mt-6 inline-block rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
          >
            Create Your Account
          </Link>
        </section>
      </main>
    </Page>
  );
}
