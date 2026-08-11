'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, router]);
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-violet-500 selection:text-white relative overflow-hidden font-sans">
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[55rem] h-[30rem] bg-gradient-to-b from-violet-600/20 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-cyan-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-2/3 -left-20 w-96 h-96 bg-violet-600/10 blur-[150px] pointer-events-none" />

      {/* Modern Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header / Navigation */}
      <header className="relative z-30 border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-all duration-300">
              <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center font-bold text-violet-400 text-lg tracking-wider">
                S
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Systango<span className="text-violet-400 font-medium">.crm</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-9 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#solutions" className="hover:text-white transition-colors">
              Solutions
            </a>
            <a href="#enterprise" className="hover:text-white transition-colors">
              Enterprise
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to Dashboard &rarr;
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-300 hover:text-white transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-semibold text-zinc-300 mb-8 shadow-inner animate-in fade-in duration-500">
          <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-wider">
            New
          </span>
          <span className="text-zinc-300">
            Systango CRM 2.0 — Next-gen customer intelligence
          </span>
          <span className="text-zinc-600">|</span>
          <a
            href="#features"
            className="text-violet-400 hover:underline inline-flex items-center space-x-1"
          >
            <span>Explore features</span>
            <span>→</span>
          </a>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Accelerate Revenue Growth With{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">
            Smart Sales Intelligence
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto font-normal leading-relaxed">
          The unified customer relationship platform designed for high-velocity revenue
          teams. Streamline pipeline visibility, automate client workflows, and close
          deals faster.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-violet-600/25 hover:shadow-violet-600/40 transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>Access Workspace</span>
            <span>→</span>
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-semibold text-sm transition-all"
          >
            Request Enterprise Demo
          </a>
        </div>

        {/* Product UI Showcase Card */}
        <div className="mt-16 relative max-w-5xl mx-auto rounded-2xl p-1 bg-gradient-to-b from-zinc-700/50 via-zinc-800/20 to-transparent shadow-2xl shadow-violet-950/40">
          <div className="bg-zinc-950 rounded-[15px] p-6 md:p-8 border border-zinc-800/80 text-left overflow-hidden relative">
            {/* Header bar mock */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5 mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-zinc-500 pl-2">
                  systango.crm / dashboard
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                  ● Live Pipeline Sync
                </span>
              </div>
            </div>

            {/* Dashboard Mock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                <div className="text-xs font-medium text-zinc-400">Total ARR</div>
                <div className="text-xl font-bold text-white mt-1.5">$4,850,000</div>
                <div className="text-[11px] font-medium text-emerald-400 mt-1">
                  ↑ +24.8% vs last quarter
                </div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                <div className="text-xs font-medium text-zinc-400">Active Deals</div>
                <div className="text-xl font-bold text-violet-400 mt-1.5">
                  142 Opportunities
                </div>
                <div className="text-[11px] font-medium text-zinc-400 mt-1">
                  18 closing this week
                </div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                <div className="text-xs font-medium text-zinc-400">Win Rate</div>
                <div className="text-xl font-bold text-cyan-400 mt-1.5">68.4%</div>
                <div className="text-[11px] font-medium text-emerald-400 mt-1">
                  ↑ +5.2% industry avg
                </div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                <div className="text-xs font-medium text-zinc-400">Avg Cycle Time</div>
                <div className="text-xl font-bold text-white mt-1.5">14.2 Days</div>
                <div className="text-[11px] font-medium text-zinc-400 mt-1">
                  Automated follow-ups
                </div>
              </div>
            </div>

            {/* Visual Pipeline Lanes Mock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 pb-1 border-b border-zinc-800/60">
                  <span>Qualified Leads</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">8</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                  <div className="font-semibold text-white">
                    Acme Corp — Global Enterprise
                  </div>
                  <div className="text-zinc-400">$180,000 &bull; Tech Sector</div>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                  <div className="font-semibold text-white">NovaBridge Logistics</div>
                  <div className="text-zinc-400">$95,000 &bull; Supply Chain</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-violet-300 pb-1 border-b border-zinc-800/60">
                  <span>Proposal Sent</span>
                  <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">
                    5
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-violet-500/30 text-xs space-y-1">
                  <div className="font-semibold text-white">Apex FinTech Expansion</div>
                  <div className="text-zinc-400">$340,000 &bull; Finalizing T&amp;Cs</div>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                  <div className="font-semibold text-white">Starlight Media Group</div>
                  <div className="text-zinc-400">$120,000 &bull; Under Legal Review</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-300 pb-1 border-b border-zinc-800/60">
                  <span>Closed Won</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    12
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-emerald-500/30 text-xs space-y-1">
                  <div className="font-semibold text-white">
                    CloudScale Infrastructure
                  </div>
                  <div className="text-emerald-400 font-semibold">
                    $520,000 &bull; Closed Today
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="relative z-10 border-y border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white">$2.5B+</div>
            <div className="text-xs text-zinc-400 font-medium mt-1 uppercase tracking-wider">
              Pipeline Managed
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-violet-400">
              99.99%
            </div>
            <div className="text-xs text-zinc-400 font-medium mt-1 uppercase tracking-wider">
              Uptime SLA
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400">10k+</div>
            <div className="text-xs text-zinc-400 font-medium mt-1 uppercase tracking-wider">
              Active Sales Reps
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white">
              4.9 / 5.0
            </div>
            <div className="text-xs text-zinc-400 font-medium mt-1 uppercase tracking-wider">
              Customer Satisfaction
            </div>
          </div>
        </div>
      </section>

      {/* Core Enterprise Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-28">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
            Built for Modern Enterprise Teams
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
            Everything your sales team needs to win more deals
          </p>
          <p className="text-zinc-400 text-base mt-4">
            Unified tools designed to streamline pipeline operations, prevent deal
            slippage, and maintain strict data governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-8 hover:border-violet-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center text-xl font-bold mb-6">
              📈
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Visual Pipeline Control
            </h3>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
              Track deal progression, stage probabilities, and deal health in real time
              with customizable pipeline boards.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-8 hover:border-cyan-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl font-bold mb-6">
              🛡️
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Enterprise Multi-Tenancy
            </h3>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
              Cryptographically isolated tenant workspaces with strict role-based access
              control (RBAC) and audit trails.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-8 hover:border-indigo-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold mb-6">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Smart Revenue Analytics
            </h3>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
              Actionable insights on rep performance, win rates, conversion bottlenecks,
              and quarterly revenue forecasts.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-28">
        <div className="bg-gradient-to-r from-violet-950/60 via-zinc-900/80 to-indigo-950/60 border border-violet-500/30 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Ready to elevate your organization&apos;s sales engine?
            </h2>
            <p className="text-base text-zinc-300 leading-relaxed">
              Sign in to your Systango CRM workspace or get in touch with our team to set
              up a dedicated enterprise instance.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-violet-600/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                Sign In to Workspace →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/80 py-12 bg-zinc-950 text-zinc-400 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-400 text-sm">
              S
            </div>
            <span className="font-bold text-sm text-white">Systango CRM</span>
            <span className="text-zinc-600">&bull;</span>
            <span>Enterprise Customer Intelligence</span>
          </div>

          <div className="flex space-x-6 text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Security
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Support
            </a>
          </div>

          <div className="text-zinc-500">
            &copy; {new Date().getFullYear()} Systango Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
