import { apiFetch } from './api';

export type OnboardingStep = 'token_missing' | 'accounts_pending' | 'syncing' | 'ready';

export interface UserState {
  id: string;
  email: string;
  onboardingStep: OnboardingStep;
  hasBrokerToken: boolean;
}

export const getUserState = (signal?: AbortSignal): Promise<UserState> =>
  apiFetch<UserState>('/api/v1/user/state', signal ? { signal } : undefined);

export const stepToRoute = (step: OnboardingStep): string => {
  switch (step) {
    case 'token_missing':
      return '/dashboard';
    case 'accounts_pending':
      return '/onboarding/accounts';
    case 'syncing':
      return '/onboarding/syncing';
    case 'ready':
      return '/dashboard';
  }
};
