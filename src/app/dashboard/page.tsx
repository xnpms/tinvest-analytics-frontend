'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLingui } from '@lingui/react';
import { AppLayout } from '@/components/AppLayout';
import { useLocale } from '@/context/LocaleContext';
import { TokenModal } from '@/components/TokenModal';
import { Spinner } from '@/components/icons';
import { getUserState } from '@/lib/user';
import { getDashboardSummary, type DashboardSummary } from '@/lib/dashboard';
import { PortfolioChart } from '@/components/PortfolioChart';
import type { TinvestAccount } from '@/lib/onboarding';

const DashboardPage = () => {
  const router = useRouter();
  const { i18n } = useLingui();
  useLocale();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

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

        setEmail(state.email);

        if (state.onboardingStep === 'token_missing') {
          const alreadyShown = sessionStorage.getItem('token_modal_shown');
          if (!alreadyShown) {
            sessionStorage.setItem('token_modal_shown', '1');
            setIsTokenModalOpen(true);
          }
          setIsLoading(false);
          return;
        }

        const data = await getDashboardSummary();
        setSummary(data);
      } catch {
        // 401 обрабатывается глобально в apiFetch
      } finally {
        setIsLoading(false);
      }
    };
    void init();
  }, [router]);

  const handleTokenSuccess = (_accounts: TinvestAccount[]) => {
    sessionStorage.removeItem('token_modal_shown');
    setIsTokenModalOpen(false);
    router.push('/onboarding/accounts');
  };

  const handleCloseTokenModal = () => setIsTokenModalOpen(false);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-bg-dark'>
        <Spinner className='h-8 w-8 text-primary' />
      </div>
    );
  }

  const firstName = email.split('@')[0] ?? email;
  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <AppLayout email={email} headerLeft={<p className='text-sm text-text-muted'>{today}</p>}>
      <div className='flex-1 overflow-auto p-6'>
        <h1 className='font-display text-2xl font-bold text-text-light'>
          {i18n._('hello_user', { firstName })}
        </h1>
        <p className='mt-0.5 text-sm text-text-muted'>
          {i18n._('dashboard_subtitle')}
        </p>

        {summary ? (
          <>
            <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
              <StatCard
                label={i18n._('portfolio_value_label')}
                value={formatRub(summary.totalValueRub)}
                sub={i18n._('total_across_accounts')}
                accent='blue'
              />
              <StatCard
                label={i18n._('unrealized_pnl')}
                value={formatRub(summary.unrealizedPnlRub)}
                sub={i18n._('open_positions')}
                accent={summary.unrealizedPnlRub >= 0 ? 'green' : 'red'}
              />
              <StatCard
                label={i18n._('twr_return')}
                value={`${summary.twrPercent >= 0 ? '+' : ''}${summary.twrPercent.toFixed(2)}%`}
                sub={i18n._('time_weighted_return')}
                accent={summary.twrPercent >= 0 ? 'green' : 'red'}
              />
              <StatCard
                label={i18n._('dividends_label')}
                value={formatRub(summary.dividendsRub)}
                sub={i18n._('all_time')}
                accent='purple'
              />
            </div>

            <div className='mt-3 rounded-xl bg-card-dark p-4'>
              <PortfolioChart />
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>

      <TokenModal
        open={isTokenModalOpen}
        onClose={handleCloseTokenModal}
        onSuccess={handleTokenSuccess}
      />
    </AppLayout>
  );
};

export default DashboardPage;

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  accent: 'blue' | 'green' | 'red' | 'purple';
}

const StatCard: FC<StatCardProps> = ({ label, value, sub, accent }) => {
  const accentColors = {
    blue:   'bg-primary/10 text-primary',
    green:  'bg-emerald-500/10 text-emerald-400',
    red:    'bg-error/10 text-error',
    purple: 'bg-violet-500/10 text-violet-400',
  };

  const dotColors = {
    blue:   'bg-primary',
    green:  'bg-emerald-400',
    red:    'bg-error',
    purple: 'bg-violet-400',
  };

  return (
    <div className='rounded-xl bg-card-dark p-4'>
      <div className='flex items-center justify-between'>
        <p className='text-sm text-text-muted'>{label}</p>
        <span className={`h-2 w-2 rounded-full ${dotColors[accent]}`} />
      </div>
      <p className={`mt-2 font-display text-xl font-bold ${accentColors[accent].split(' ')[1]}`}>
        {value}
      </p>
      <p className='mt-0.5 text-xs text-text-muted'>{sub}</p>
    </div>
  );
};

const EmptyState: FC = () => {
  const { i18n } = useLingui();
  return (
    <div className='mt-8 flex flex-col items-center justify-center rounded-xl bg-card-dark py-16 text-center'>
      <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
          <path d='M12 2L2 7L12 12L22 7L12 2Z' stroke='#007AFF' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
          <path d='M2 17L12 22L22 17' stroke='#007AFF' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
          <path d='M2 12L12 17L22 12' stroke='#007AFF' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
        </svg>
      </div>
      <p className='text-sm font-medium text-text-light'>{i18n._('data_not_ready')}</p>
      <p className='mt-1 text-xs text-text-muted'>{i18n._('snapshots_building')}</p>
    </div>
  );
};

const formatRub = (value: number): string =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
