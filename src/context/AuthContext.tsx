'use client';

import type { FC } from 'react';
import { createContext, useContext } from 'react';
import { register, login } from '@/lib/auth';
import type { AuthContextType, AuthProviderProps } from './AuthContext.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => (
  <AuthContext.Provider value={{ register, login }}>
    {children}
  </AuthContext.Provider>
);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
