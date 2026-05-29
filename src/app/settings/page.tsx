'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLingui } from '@lingui/react';
import { AppLayout } from '@/components/AppLayout';
import { useLocale } from '@/context/LocaleContext';
import { LogoutIcon, Spinner } from '@/components/icons';
import { TokenModal } from '@/components/TokenModal';
import { apiFetch } from '@/lib/api';
import { getUserState } from '@/lib/user';
import type { TinvestAccount } from '@/lib/onboarding';

const SettingsPage = () => {
  const router = useRouter();
  const { i18n } = useLingui();
  const { locale, changeLocale } = useLocale();
  const [isReady, setIsReady] = useState(false);
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
        setIsReady(true);
      } catch {

      }
    };
    void init();
  }, [router]);

  const handleTokenSuccess = (_accounts: TinvestAccount[]) => {
    setIsTokenModalOpen(false);
    router.push('/onboarding/accounts');
  };

  const handleOpenTokenModal = () => setIsTokenModalOpen(true);
  const handleCloseTokenModal = () => setIsTokenModalOpen(false);

  const handleLocaleToggle = () => {
    changeLocale(locale === 'ru' ? 'en' : 'ru');
  };

  const handleLogout = async () => {
    await apiFetch('/api/auth/logout', { method: 'GET' }).catch(() => {});
    router.push('/login');
  };

  if (!isReady) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-bg-dark'>
        <Spinner className='h-8 w-8 text-primary' />
      </div>
    );
  }

  return (
    <AppLayout headerLeft={<h1 className='font-display text-lg font-semibold text-text-light'>{i18n._('nav_settings')}</h1>}>
      <div className='flex-1 overflow-auto p-6'>
        <div className='max-w-lg space-y-4'>
          <div className='rounded-xl bg-card-dark p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-text-light'>{i18n._('t_invest_api_token')}</p>
                <p className='mt-0.5 text-xs text-text-muted'>{i18n._('api_token_description')}</p>
              </div>

              <button
                onClick={handleOpenTokenModal}
                className='ml-4 shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors'
              >
                {i18n._('change_btn')}
              </button>
            </div>
          </div>

          {/* Язык и выход — только на мобилке, на десктопе доступны из сайдбара */}
          <div className='rounded-xl bg-card-dark divide-y divide-white/5 md:hidden'>
            <button
              onClick={handleLocaleToggle}
              className='flex w-full items-center gap-3 px-5 py-4 text-sm font-medium text-text-light transition-colors hover:bg-white/5'
            >
              <span className='text-base leading-none'>🌐</span>
              <span className='flex-1 text-left'>{i18n._('settings_language')}</span>
              <span className='text-text-muted'>{i18n._('lang_toggle')}</span>
            </button>

            <button
              onClick={handleLogout}
              className='flex w-full items-center gap-3 px-5 py-4 text-sm font-medium text-error transition-colors hover:bg-white/5'
            >
              <LogoutIcon />
              {i18n._('sign_out')}
            </button>
          </div>
        </div>
      </div>

      <TokenModal
        open={isTokenModalOpen}
        onClose={handleCloseTokenModal}
        onSuccess={handleTokenSuccess}
      />
    </AppLayout>
  );
};

export default SettingsPage;
