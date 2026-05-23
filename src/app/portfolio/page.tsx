'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLingui } from '@lingui/react';
import { AppLayout } from '@/components/AppLayout';
import { useLocale } from '@/context/LocaleContext';
import { Spinner } from '@/components/icons';
import { getUserState } from '@/lib/user';
import { getInstrumentsPerformance } from '@/lib/portfolio';
import type { Instrument } from '@/lib/portfolio.types';
import { InstrumentsTable } from '@/components/InstrumentsTable';

const PortfolioPage = () => {
  const router = useRouter();
  const { i18n } = useLingui();
  useLocale();
  const [instruments, setInstruments] = useState<Instrument[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const state = await getUserState();

        if (state.onboardingStep === 'accounts_pending') {
          router.replace('/onboarding/accounts');
          return;
        }

        if (state.onboardingStep === 'syncing') {
          router.replace('/onboarding/syncing');
          return;
        }

        const data = await getInstrumentsPerformance();
        setInstruments(data);
      } catch {
        // 401 обрабатывается глобально в apiFetch
      } finally {
        setIsLoading(false);
      }
    };
    void init();
  }, [router]);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-bg-dark'>
        <Spinner className='h-8 w-8 text-primary' />
      </div>
    );
  }

  return (
    <AppLayout headerLeft={<h1 className='font-display text-lg font-semibold text-text-light'>{i18n._('nav_portfolio')}</h1>}>
      <div className='flex flex-1 flex-col overflow-hidden p-6'>
        <h1 className='font-display text-2xl font-bold text-text-light'>
          {i18n._('nav_portfolio')}
        </h1>

        <p className='mt-0.5 text-sm text-text-muted'>
          {i18n._('portfolio_subtitle')}
        </p>

        <div className='mt-4 flex min-h-0 flex-1 flex-col'>
          {instruments !== null && instruments.length > 0 ? (
            <InstrumentsTable instruments={instruments} />
          ) : (
            <PortfolioEmptyState />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default PortfolioPage;

const PortfolioEmptyState: FC = () => {
  const { i18n } = useLingui();
  return (
    <div className='flex flex-col items-center justify-center rounded-xl bg-card-dark py-16 text-center'>
      <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
          <path d='M3 3h18v18H3z' stroke='#007AFF' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M3 9h18M9 21V9' stroke='#007AFF' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
      </div>

      <p className='text-sm font-medium text-text-light'>{i18n._('portfolio_no_instruments')}</p>

      <p className='mt-1 text-xs text-text-muted'>{i18n._('portfolio_no_instruments_subtitle')}</p>
    </div>
  );
};