import type { TinvestAccount } from '@/lib/onboarding';

export interface TokenModalProps {
  open: boolean;
  onClose?: () => void;
  onSuccess: (accounts: TinvestAccount[]) => void;
}
