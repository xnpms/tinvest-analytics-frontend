import { apiFetch } from './api';

export interface TinvestAccount {
  accountId: string;
  name: string;
  status: number;
  type: number;
  openedDate: string;
  accessLevel: number;
  createdAt: string;
  updatedAt: string;
  balanceRub?: number;
}

export interface TinvestAccountsResponse {
  accounts: TinvestAccount[];
}

export interface SyncJobResponse {
  success: boolean;
  jobId: string | null;
}

export interface AccountSyncProgress {
  status: number;
  syncedCount: number;
  totalCount: number;
  progress: number;
  error: string | null;
  updatedAt: number;
}

export interface SyncProgressMessage {
  jobId: string;
  accounts: Record<string, AccountSyncProgress>;
}

export const saveToken = (token: string): Promise<TinvestAccountsResponse> =>
  apiFetch<TinvestAccountsResponse>('/api/v1/onboarding/token', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

export const selectAccounts = (accountIds: string[]): Promise<SyncJobResponse> =>
  apiFetch<SyncJobResponse>('/api/v1/onboarding/accounts', {
    method: 'POST',
    body: JSON.stringify({ account_ids: accountIds }),
  });

const ACCOUNTS_SESSION_KEY = 'tinvest_onboarding_accounts';

export const storeAccounts = (accounts: TinvestAccount[]): void => {
  sessionStorage.setItem(ACCOUNTS_SESSION_KEY, JSON.stringify(accounts));
};

export const getStoredAccounts = (): TinvestAccount[] | null => {
  const raw = sessionStorage.getItem(ACCOUNTS_SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearStoredAccounts = (): void => {
  sessionStorage.removeItem(ACCOUNTS_SESSION_KEY);
};
