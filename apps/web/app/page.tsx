'use client';

import { ShellHeader } from '@/components/auth';
import { HeroSection, HomeMarketplace } from '@/components/home';
import { SiteFooter } from '@/components/layout/site-footer';
import { Page } from '@shared/ui/components';

export default function HomePage() {
  return (
    <Page>
      <ShellHeader title="Auction House" subtitle="Online Auction House" />
      <main>
        <HeroSection />
        <HomeMarketplace />
      </main>
      <SiteFooter />
    </Page>
  );
}
