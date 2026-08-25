'use client';

import { TextAlignStart } from 'lucide-react';
import { UserProfileMenu } from './user-profile-menu';
import { useSidebar } from './sidebar-provider';

export function Header() {
  const { collapsed, toggleCollapsed, openMobile } = useSidebar();

  return (
    <header className="ui-app-header">
      <div className="ui-app-header-start">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={openMobile}
          className="ui-app-header-mobile-toggle cursor-pointer"
        >
          <TextAlignStart aria-hidden="true" size={20} />
        </button>
        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={toggleCollapsed}
          className="ui-app-header-desktop-toggle cursor-pointer"
        >
          <TextAlignStart aria-hidden="true" size={20} />
        </button>
      </div>
      <UserProfileMenu />
    </header>
  );
}
