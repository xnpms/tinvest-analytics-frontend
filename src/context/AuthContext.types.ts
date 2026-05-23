import type { ReactNode } from 'react';

export interface AuthContextType {
  register: (email: string, password: string, passwordConfirmation: string) => Promise<unknown>;
  login: (email: string, password: string) => Promise<unknown>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
