'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLingui } from '@lingui/react';
import { apiFetch } from '@/lib/api';
import { useLocale } from '@/context/LocaleContext';
import {
  DashboardIcon,
  PortfolioIcon,
  SettingsIcon,
  LogoutIcon,
  SunIcon,
  MoonIcon,
} from './icons';
import type { AppLayoutProps } from './AppLayout.types';

const ThemeToggle: FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const handleToggle = () => {
    const html = document.documentElement;
    const next = !html.classList.contains('dark');
    html.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {

    }
    setIsDark(next);
  };

  return (
    <button
      role='switch'
      aria-checked={isDark}
      onClick={handleToggle}
      className={`relative h-7 w-14 rounded-full p-0 overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-slate-700' : 'bg-amber-100'
      }`}
    >
      <span
        className={`absolute left-1.5 top-1/2 -translate-y-1/2 text-amber-500 transition-opacity duration-200 ${
          isDark ? 'opacity-35' : 'opacity-100'
        }`}
      >
        <SunIcon size={13} />
      </span>

      <span
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-blue-200 transition-opacity duration-200 ${
          isDark ? 'opacity-100' : 'opacity-35'
        }`}
      >
        <MoonIcon size={13} />
      </span>

      <span
        className={`absolute left-0 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          isDark ? 'translate-x-8' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

export const LocaleToggle: FC = () => {
  const { i18n } = useLingui();
  const { locale, changeLocale } = useLocale();

  const handleToggle = () => changeLocale(locale === 'ru' ? 'en' : 'ru');

  return (
    <button
      onClick={handleToggle}
      className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full'
    >
      <span className='text-base leading-none'>🌐</span>
      {i18n._('lang_toggle')}
    </button>
  );
};

interface AvatarProps {
  email: string;
}

const Avatar: FC<AvatarProps> = ({ email }) => {
  const initial = (email.split('@')[0] ?? email).charAt(0).toUpperCase();
  return (
    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white'>
      {initial}
    </div>
  );
};

export const AppLayout: FC<AppLayoutProps> = ({ children, email, headerLeft }) => {
  const { i18n } = useLingui();
  const { locale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/dashboard', icon: <DashboardIcon />, label: i18n._('nav_dashboard') },
    { href: '/portfolio', icon: <PortfolioIcon />, label: i18n._('nav_portfolio') },
    { href: '/settings', icon: <SettingsIcon />, label: i18n._('nav_settings') },
  ];

  const handleLogout = async () => {
    await apiFetch('/api/auth/logout', { method: 'GET' }).catch(() => {});
    router.push('/login');
  };

  return (
    <div className='flex h-screen bg-bg-dark overflow-hidden'>
      {/* Сайдбар — только десктоп */}
      <aside className='hidden md:flex w-44 shrink-0 flex-col bg-sidebar py-6 px-3'>
        <Link href='/dashboard' className='flex items-center gap-2.5 px-2 mb-8'>
          <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0'>
            <svg viewBox='0 0 24 24' fill='none' className='w-4 h-4'>
              <path d='M12 2L2 7L12 12L22 7L12 2Z' stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
              <path d='M2 17L12 22L22 17' stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
              <path d='M2 12L12 17L22 12' stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
            </svg>
          </div>
          <span className='text-[18px] font-bold text-white tracking-tight'>Investa</span>
        </Link>

        <nav className='flex flex-col gap-1'>
          {navItems.map((item) => {
            const isActive = pathname.replace(/\/$/, '') === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className='mt-auto' />

        <LocaleToggle />

        <button
          onClick={handleLogout}
          className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors mt-1'
        >
          <LogoutIcon />
          {i18n._('sign_out')}
        </button>
      </aside>

      <div className='flex flex-1 flex-col overflow-hidden'>
        <header className='flex h-14 md:h-16 shrink-0 items-center justify-between border-b border-border bg-card-dark px-4 md:px-8'>
          <div className='flex items-center gap-3'>
            {/* Лого только на мобилке, на десктопе — в сайдбаре */}
            <Link href='/dashboard' className='flex items-center gap-2 md:hidden'>
              <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary'>
                <svg viewBox='0 0 24 24' fill='none' className='h-3.5 w-3.5'>
                  <path d='M12 2L2 7L12 12L22 7L12 2Z' stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
                  <path d='M2 17L12 22L22 17' stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
                  <path d='M2 12L12 17L22 12' stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
                </svg>
              </div>
              <span className='text-sm font-bold tracking-tight text-white'>Investa</span>
            </Link>

            <div className='hidden md:block'>{headerLeft}</div>
          </div>

          <div className='flex items-center gap-2 md:gap-3'>
            <ThemeToggle />

            {email && <Avatar email={email} />}
          </div>
        </header>

        {/* pb-16 на мобилке — отступ под нижнее меню */}
        <main className='flex flex-1 flex-col overflow-auto pb-16 md:pb-0'>{children}</main>
      </div>

      {/* Нижнее меню — только мобилка */}
      <nav
        className='fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-sidebar md:hidden'
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map((item) => {
          const isActive = pathname.replace(/\/$/, '') === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};