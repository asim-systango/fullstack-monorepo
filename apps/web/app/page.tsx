'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Clock3,
  Home,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import { BrandMark } from '@/components/layout';
import { ThemeToggle } from '@/components/theme';

const FEATURES = [
  {
    icon: Home,
    title: 'For diners',
    desc: 'Browse restaurants, track your order in real time, and pay with a clear price breakdown every time.',
  },
  {
    icon: UtensilsCrossed,
    title: 'For restaurant partners',
    desc: 'Manage your menu and fulfil orders from a live queue built for a busy kitchen.',
  },
  {
    icon: ShieldCheck,
    title: 'For platform teams',
    desc: 'Oversee every restaurant and order on the platform from a single, permissioned view.',
  },
];

export default function HomePage() {
  return (
    <div className="tg-root tg-landing">
      <header className="tg-landing-header">
        <BrandMark />
        <nav className="tg-landing-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#for-everyone">For partners</a>
        </nav>
        <div className="tg-landing-actions">
          <ThemeToggle />
          <Link href="/login" className="tg-btn tg-btn-primary tg-link-button">
            Sign in
          </Link>
        </div>
      </header>

      <main>
        <section className="tg-landing-hero">
          <div className="tg-hero-copy">
            <span className="tg-eyebrow">
              <Sparkles size={14} /> Your next favorite meal is here
            </span>
            <h1>
              Great food, delivered <em>to your door.</em>
            </h1>
            <p>
              Discover local favorites, order in a few taps, and follow your meal from the kitchen
              to your doorstep.
            </p>
            <div className="tg-hero-actions">
              <Link href="/login" className="tg-btn tg-btn-primary tg-hero-primary">
                Start ordering <ArrowRight size={17} />
              </Link>
              <Link href="/restaurants" className="tg-btn tg-btn-secondary tg-hero-secondary">
                Explore restaurants
              </Link>
            </div>
            <div className="tg-hero-proof">
              <div className="tg-avatar-stack" aria-hidden="true">
                <span>AM</span>
                <span>JK</span>
                <span>SR</span>
              </div>
              <div>
                <div className="tg-stars" aria-label="5 out of 5 stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={13} fill="currentColor" />
                  ))}
                </div>
                <small>Loved by hungry customers</small>
              </div>
            </div>
          </div>

          <div className="tg-hero-visual">
            <div className="tg-hero-image-wrap">
              <Image
                src="/tastygo-hero.webp"
                alt="A selection of pizza, sushi, salads, and fresh grain bowls"
                fill
                priority
                sizes="(max-width: 900px) 92vw, 48vw"
              />
            </div>
            <div className="tg-floating-card tg-delivery-card">
              <span className="tg-floating-icon">
                <Clock3 size={18} />
              </span>
              <div>
                <strong>25–35 min</strong>
                <small>Average delivery</small>
              </div>
            </div>
            <div className="tg-floating-card tg-rating-card">
              <span className="tg-floating-icon tg-floating-icon-green">
                <Check size={18} />
              </span>
              <div>
                <strong>Order confirmed</strong>
                <small>Your meal is being prepared</small>
              </div>
            </div>
          </div>
        </section>

        <section className="tg-trust-strip" aria-label="Service benefits">
          <span>
            <MapPin size={17} /> Local restaurants
          </span>
          <span>
            <Clock3 size={17} /> Fast delivery
          </span>
          <span>
            <ShieldCheck size={17} /> Secure checkout
          </span>
        </section>

        <section id="how-it-works" className="tg-landing-section">
          <div className="tg-section-heading">
            <span className="tg-kicker">Simple from start to finish</span>
            <h2>Cravings solved in three easy steps</h2>
            <p>Less searching, more enjoying. TastyGo keeps your order simple and transparent.</p>
          </div>
          <div className="tg-step-grid">
            {[
              ['01', 'Find your flavor', 'Browse nearby restaurants and filter by cuisine, rating, or delivery time.'],
              ['02', 'Build your order', 'Choose your favorites and see every fee before you check out.'],
              ['03', 'Track every step', 'Follow live status updates from confirmation through delivery.'],
            ].map(([number, title, description]) => (
              <article key={number} className="tg-step-card">
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="for-everyone" className="tg-role-section">
          <div className="tg-section-heading">
            <span className="tg-kicker">Built for the whole marketplace</span>
            <h2>One platform, every point of view</h2>
          </div>
          <div className="tg-role-grid">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="tg-card tg-role-card">
                  <div className="tg-role-icon">
                    <Icon size={21} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="tg-landing-cta">
          <div>
            <span className="tg-kicker">Dinner is only a few taps away</span>
            <h2>Ready to find something delicious?</h2>
          </div>
          <Link href="/login" className="tg-btn tg-cta-button">
            Order now <ArrowRight size={17} />
          </Link>
        </section>
      </main>

      <footer className="tg-landing-footer">
        <BrandMark />
        <p>Fresh choices. Clear prices. Happy deliveries.</p>
        <span>© 2026 TastyGo</span>
      </footer>
    </div>
  );
}
