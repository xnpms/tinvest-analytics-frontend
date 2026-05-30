'use client';

import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLingui } from '@lingui/react';
import { Logo } from '@/components/Logo';
import { getUserState } from '@/lib/user';
import { type AccountSyncProgress, type SyncProgressMessage } from '@/lib/onboarding';
import { camelizeKeys } from '@/lib/api';

const getWsUrl = (): string => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  if (typeof window === 'undefined') {
    return 'ws://localhost/ws';
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/ws`;
};

const STATUS_COLORS: Record<number, string> = {
  0: 'bg-text-muted/30',
  1: 'bg-primary',
  2: 'bg-emerald-500',
  3: 'bg-error',
};

const SyncingPage = () => {
  const router = useRouter();
  const { i18n } = useLingui();
  const [progress, setProgress] = useState<Record<string, AccountSyncProgress>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  const navigatedRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const rawJobId = sessionStorage.getItem('tinvest_sync_job_id');
    const jobId = rawJobId === 'null' ? null : rawJobId;

    const goToDashboard = () => {
      if (navigatedRef.current) {
        return;
      }

      navigatedRef.current = true;
      sessionStorage.removeItem('tinvest_sync_job_id');
      if (fallbackPollRef.current) {
        clearInterval(fallbackPollRef.current);
      }

      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }

      router.push('/dashboard');
    };

    const checkAndGo = async () => {
      try {
        const state = await getUserState();
        if (state.onboardingStep === 'ready') {
          goToDashboard();
        }
        // still syncing (post-processing) → poll keeps running
      } catch {

      }
    };

    const startFallbackPoll = () => {
      if (fallbackPollRef.current || navigatedRef.current) {
        return;
      }
      fallbackPollRef.current = setInterval(checkAndGo, 3000);
    };

    const stopFallbackPoll = () => {
      if (fallbackPollRef.current) {
        clearInterval(fallbackPollRef.current);
        fallbackPollRef.current = null;
      }
    };

    if (!jobId) {
      startFallbackPoll();
      return () => stopFallbackPoll();
    }

    const connect = () => {
      if (jobId === null) {
        goToDashboard();
      }

      if (navigatedRef.current) {
        return;
      }

      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        ws.send(JSON.stringify({ action: 'subscribe', job_id: jobId }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = camelizeKeys(JSON.parse(event.data)) as SyncProgressMessage;
          const acc = msg.accounts;

          // PHP empty array → JSON [] — no data yet, keep waiting
          if (!acc || typeof acc !== 'object' || Array.isArray(acc)) {
            return;
          }

          const entries = Object.entries(acc);
          if (entries.length === 0) {
            return;
          }

          // Got real data — WS is driving, cancel fallback poll
          stopFallbackPoll();
          setProgress(acc);

          const allFinished = entries.every(([, a]) => a.status === 2 || a.status === 3);
          if (!allFinished) {
            return;
          }

          const anyFailed = entries.some(([, a]) => a.status === 3);
          if (anyFailed) {
            sessionStorage.removeItem('tinvest_sync_job_id');
            setError(i18n._('sync_partial_error'));

            return;
          }
          // All accounts done per WS — single getUserState to confirm post-processing
          void checkAndGo();
        } catch {

        }
      };

      ws.onerror = () => setError(i18n._('sync_connection_error'));

      ws.onclose = () => {
        setIsConnected(false);
        if (navigatedRef.current) {
          return;
        }

        // Reconnect after 2s — handles ngrok/proxy timeouts and transient drops
        reconnectRef.current = setTimeout(() => {
          reconnectRef.current = null;
          connect();
        }, 2000);
      };
    };

    connect();

    return () => {
      navigatedRef.current = true; // stop reconnect loop on unmount
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
      if (fallbackPollRef.current) {
        clearInterval(fallbackPollRef.current);
      }
      wsRef.current?.close();
    };
  }, [router, i18n]);

  const accounts = Object.entries(progress);

  const statusLabels: Record<number, string> = {
    0: i18n._('sync_status_waiting'),
    1: i18n._('sync_status_syncing'),
    2: i18n._('sync_status_done'),
    3: i18n._('sync_status_error'),
  };

  return (
    <div className='relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-bg-dark'>
      <div className='flex w-full max-w-sm flex-col items-center'>
        <Logo />

        <div className='glowing-card w-full rounded-xl bg-card-dark p-8 mt-8'>
          <div className='text-center'>
            <h2 className='font-display text-2xl font-semibold tracking-tight text-text-light'>
              {i18n._('sync_heading')}
            </h2>

            <p className='mt-2 text-sm text-text-muted'>
              {isConnected ? i18n._('sync_loading') : i18n._('sync_connecting')}
            </p>
          </div>

          <div className='mt-8 space-y-4'>
            {accounts.length === 0 ? (
              <div className='flex justify-center py-4'>
                <PulsingDots />
              </div>
            ) : (
              accounts.map(([accountId, data]) => (
                <AccountProgress
                  key={accountId}
                  id={accountId}
                  data={data}
                  statusLabel={statusLabels[data.status] ?? ''}
                  operationsLabel={i18n._('operations_count', { syncedCount: data.syncedCount.toLocaleString() })}
                  accountIdLabel={i18n._('account_id_label', { id: accountId })}
                />
              ))
            )}
          </div>

          {error && (
            <p className='mt-4 text-sm text-error text-center'>{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncingPage;

interface AccountProgressProps {
  id: string;
  data: AccountSyncProgress;
  statusLabel: string;
  operationsLabel: string;
  accountIdLabel: string;
}

const AccountProgress: FC<AccountProgressProps> = ({ data, statusLabel, operationsLabel, accountIdLabel }) => {
  const statusColor = STATUS_COLORS[data.status] ?? 'bg-text-muted/30';

  return (
    <div className='rounded-lg bg-input-dark p-4'>
      <div className='mb-2 flex items-center justify-between'>
        <span className='text-sm font-medium text-text-light'>{accountIdLabel}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${statusColor}`}>
          {statusLabel}
        </span>
      </div>
      <div className='h-1.5 w-full overflow-hidden rounded-full bg-border'>
        <div
          className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
          style={{ width: `${data.progress}%` }}
        />
      </div>
      <div className='mt-1.5 flex justify-between text-xs text-text-muted'>
        <span>{operationsLabel}</span>
        <span>{data.progress}%</span>
      </div>
    </div>
  );
};

const PulsingDots: FC = () => (
  <div className='flex gap-2'>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className='h-2 w-2 rounded-full bg-primary animate-pulse'
        style={{ animationDelay: `${i * 150}ms` }}
      />
    ))}
  </div>
);
