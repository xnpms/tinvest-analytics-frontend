import type { ReactNode } from 'react';

export interface AppLayoutProps {
  children: ReactNode;
  email?: string;
  headerLeft?: ReactNode;
}

export interface NavItem {
  href: string;
  icon: ReactNode;
  label: string;
}
