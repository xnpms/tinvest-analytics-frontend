'use client';

import type { FC, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLingui } from '@lingui/react';
import { Logo } from '@/components/Logo';
import { Spinner, CheckIcon, LockIcon, ChevronDownIcon } from '@/components/icons';
import {
  getStoredAccounts,
  clearStoredAccounts,
  selectAccounts,
  type TinvestAccount,
} from '@/lib/onboarding';

const ACCOUNT_STATUS_CLOSED = 3;
const DEFAULT_SELECT_THRESHOLD = 1000;

const isHidden = (account: TinvestAccount): boolean =>
  account.status === ACCOUNT_STATUS_CLOSED || (account.balanceRub !== undefined && account.balanceRub < 0);

const isPreSelected = (account: TinvestAccount): boolean => {
  if (isHidden(account)) {
    return false;
  }
  if (account.balanceRub === undefined) {
    return true;
  }
  return account.balanceRub > DEFAULT_SELECT_THRESHOLD;
};

const formatBalance = (balance: number): string =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(balance);

interface AccountRowProps {
  account: TinvestAccount;
  isSelected: boolean;
  typeLabel: string;
  onToggle: (accountId: string) => void;
}

const AccountRow: FC<AccountRowProps> = ({ account, isSelected, typeLabel, onToggle }) => {
  const { i18n } = useLingui();
  const isClosed = account.status === ACCOUNT_STATUS_CLOSED;
  const isNegativeBalance = account.balanceRub !== undefined && account.balanceRub < 0;
  const handleToggle = () => onToggle(account.accountId);

  return (
    <button
      type='button'
      onClick={handleToggle}
      className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors ${
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-transparent bg-input-dark hover:border-border'
      }`}
    >
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          isSelected ? 'border-primary bg-primary text-white' : 'border-text-muted'
        }`}
      >
        {isSelected && <CheckIcon />}
      </div>

      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium text-text-light'>{account.name}</p>
        <p className='text-xs text-text-muted'>
          {typeLabel} · {account.accountId}
        </p>
        {account.balanceRub !== undefined && (
          <p className={`text-xs mt-0.5 ${isNegativeBalance ? 'text-error' : 'text-text-muted'}`}>
            {formatBalance(account.balanceRub)}
          </p>
        )}
      </div>

      {isClosed && (
        <div className='group relative shrink-0 text-text-muted'>
          <LockIcon />
          <div className='pointer-events-none absolute right-0 bottom-6 z-10 w-max rounded-lg bg-[#0d0d1a] px-3 py-1.5 text-xs text-text-light opacity-0 shadow-lg transition-opacity group-hover:opacity-100'>
            {i18n._('account_closed')}
          </div>
        </div>
      )}
    </button>
  );
};

const AccountsPage = () => {
  const router = useRouter();
  const { i18n } = useLingui();
  const [accounts, setAccounts] = useState<TinvestAccount[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isHiddenExpanded, setIsHiddenExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const accountTypeLabels: Record<number, string> = {
    0: i18n._('account_type_undefined'),
    1: i18n._('account_type_brokerage'),
    2: i18n._('account_type_iis'),
    3: i18n._('account_type_piggy_bank'),
    4: i18n._('account_type_money_market'),
    5: i18n._('account_type_debit_card'),
    6: i18n._('account_type_savings'),
  };

  useEffect(() => {
    const stored = getStoredAccounts();
    if (!stored || stored.length === 0) {
      router.replace('/dashboard');
      return;
    }
    const unique = stored.filter(
      (a, idx, arr) => arr.findIndex((b) => b.accountId === a.accountId) === idx
    );
    setAccounts(unique);
    setSelected(new Set(unique.filter(isPreSelected).map((a) => a.accountId)));
  }, [router]);

  const toggleAccount = (accountId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  const handleToggleHidden = () => setIsHiddenExpanded((v) => !v);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selected.size === 0) {
      setError(i18n._('select_at_least_one'));
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const selectedAccounts = accounts.filter((a) => selected.has(a.accountId));
      const ids = selectedAccounts.map((a) => a.accountId).filter((id): id is string => id != null);

      if (ids.length === 0) {
        setError(i18n._('failed_get_account_ids'));

        return;
      }

      const { jobId } = await selectAccounts(ids);
      clearStoredAccounts();
      if (jobId !== null) {
        sessionStorage.setItem('tinvest_sync_job_id', jobId);
      }
      router.push('/onboarding/syncing');
    } catch (err) {
      setError(err instanceof Error ? err.message : i18n._('account_selection_error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (accounts.length === 0) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-bg-dark'>
        <Spinner className='h-8 w-8 text-primary' />
      </div>
    );
  }

  const mainAccounts = accounts.filter((a) => !isHidden(a));
  const hiddenAccounts = accounts.filter((a) => isHidden(a));

  return (
    <div className='relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-bg-dark'>
      <div className='flex w-full max-w-sm flex-col items-center'>
        <Logo />

        <div className='glowing-card w-full rounded-xl bg-card-dark p-8 mt-8'>
          <div className='text-center'>
            <h2 className='font-display text-2xl font-semibold tracking-tight text-text-light'>
              {i18n._('select_accounts_heading')}
            </h2>
            <p className='mt-2 text-sm text-text-muted'>
              {i18n._('select_accounts_subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className='mt-8'>
            <div className='space-y-3'>
              {mainAccounts.map((account) => (
                <AccountRow
                  key={account.accountId}
                  account={account}
                  isSelected={selected.has(account.accountId)}
                  typeLabel={accountTypeLabels[account.type] ?? i18n._('account_label')}
                  onToggle={toggleAccount}
                />
              ))}
            </div>

            {hiddenAccounts.length > 0 && (
              <div className='mt-3'>
                <button
                  type='button'
                  onClick={handleToggleHidden}
                  className='flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-text-muted hover:text-text-light transition-colors'
                >
                  <span>
                    {i18n._('hidden_accounts')}
                    <span className='ml-1.5 rounded-full bg-input-dark px-1.5 py-0.5 text-xs'>
                      {hiddenAccounts.length}
                    </span>
                  </span>
                  <span className={`transition-transform duration-200 ${isHiddenExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon />
                  </span>
                </button>

                {isHiddenExpanded && (
                  <div className='mt-2 space-y-3'>
                    {hiddenAccounts.map((account) => (
                      <AccountRow
                        key={account.accountId}
                        account={account}
                        isSelected={selected.has(account.accountId)}
                        typeLabel={accountTypeLabels[account.type] ?? i18n._('account_label')}
                        onToggle={toggleAccount}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && <p className='mt-4 text-sm text-error'>{error}</p>}

            <button
              type='submit'
              disabled={isLoading || selected.size === 0}
              className='mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-primary px-4 text-base font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50'
            >
              {isLoading ? (
                <>
                  <Spinner className='h-5 w-5 text-white' />
                  <span className='ml-3'>{i18n._('starting')}</span>
                </>
              ) : (
                selected.size > 0
                  ? i18n._('synchronize_count', { count: selected.size })
                  : i18n._('synchronize')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
