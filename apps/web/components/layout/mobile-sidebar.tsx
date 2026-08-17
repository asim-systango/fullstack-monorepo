'use client';

import { Dialog, DialogHeader, DialogTitle } from '@shared/ui/components';
import { NavList } from './nav-list';
import { useSidebar } from './sidebar-provider';
import { BicepsFlexed } from 'lucide-react';

/** Mobile nav drawer — built on the shared `Dialog` for focus-trap + Escape handling. */
export function MobileSidebar() {
  const { mobileOpen, closeMobile } = useSidebar();

  return (
    <Dialog
      open={mobileOpen}
      onOpenChange={(open) => !open && closeMobile()}
      className="ui-mobile-drawer p-0"
    >
      <DialogHeader>
        <DialogTitle className="ui-app-brand flex items-center gap-1">
          <BicepsFlexed className="text-black" size={30} /> Fitness
        </DialogTitle>
      </DialogHeader>
      <nav aria-label="Primary">
        <NavList onNavigate={closeMobile} />
      </nav>
    </Dialog>
  );
}
