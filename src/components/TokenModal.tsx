'use client';

import type { FC, CSSProperties, FormEvent, ChangeEvent } from 'react';
import { useState, useEffect } from 'react';
import { useLingui } from '@lingui/react';
import { Spinner, EyeIcon, EyeOffIcon, XIcon } from './icons';
import { saveToken, storeAccounts } from '@/lib/onboarding';
import type { TokenModalProps } from './TokenModal.types';

export const TokenModal: FC<TokenModalProps> = ({ open, onClose, onSuccess }) => {
  const { i18n } = useLingui();
  const [token, setToken] = useState('');
  const [isTokenVisible, setIsTokenVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setToken('');
      setIsTokenVisible(false);
      setError('');
    }
  }, [open]);

  useEffect(() => {
    if (!open || !onClose) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleToggleToken = () => setIsTokenVisible((v) => !v);
  const handleTokenChange = (e: ChangeEvent<HTMLInputElement>) => setToken(e.target.value);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { accounts } = await saveToken(token);
      storeAccounts(accounts);
      onSuccess(accounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : i18n._('invalid_token'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative z-10 w-full max-w-sm rounded-xl bg-card-dark p-8 glowing-card'>
        {onClose && (
          <button
            onClick={onClose}
            className='absolute right-4 top-4 text-text-muted hover:text-text-light transition-colors'
            aria-label={i18n._('close')}
          >
            <XIcon />
          </button>
        )}

        <div className='text-center'>
          <h2 className='font-display text-2xl font-semibold tracking-tight text-text-light'>
            {i18n._('token_modal_heading')}
          </h2>
          <p className='mt-2 text-sm text-text-muted'>
            {i18n._('token_modal_subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
          <div className='flex flex-col'>
            <div className='mb-2 flex items-center justify-between'>
              <label htmlFor='token-modal-input' className='text-sm font-medium text-text-light'>
                {i18n._('api_token_label')}
              </label>
              <a
                href='https://www.tbank.ru/invest/settings/'
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm font-medium text-primary hover:underline'
              >
                {i18n._('where_to_get')}
              </a>
            </div>
            <div className='relative'>
              <input
                id='token-modal-input'
                type='text'
                value={token}
                onChange={handleTokenChange}
                className={`h-12 w-full rounded-lg border-2 bg-input-dark p-3 pr-11 font-mono text-sm text-text-light placeholder:text-text-muted/60 focus:border-primary transition-colors ${
                  error ? 'border-error' : 'border-transparent'
                }`}
                style={isTokenVisible ? undefined : { WebkitTextSecurity: 'disc' } as CSSProperties}
                placeholder='t.xxxxxxxxxxxxxxxxxxxxxxxx'
                required
                spellCheck={false}
                autoComplete='off'
                autoFocus
              />
              <button
                type='button'
                onClick={handleToggleToken}
                className='absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-light transition-colors'
                aria-label={isTokenVisible ? i18n._('hide_token') : i18n._('show_token')}
              >
                {isTokenVisible ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {error && <p className='mt-2 text-sm text-error'>{error}</p>}
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='flex h-12 w-full items-center justify-center rounded-lg bg-primary px-4 text-base font-semibold text-white transition-colors hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-bg-dark disabled:opacity-80'
          >
            {isLoading ? (
              <>
                <Spinner className='h-5 w-5 text-white' />
                <span className='ml-3'>{i18n._('verifying')}</span>
              </>
            ) : (
              i18n._('continue_btn')
            )}
          </button>
        </form>

        <p className='mt-6 text-center text-xs text-text-muted'>
          {i18n._('token_security_note')}
        </p>
      </div>
    </div>
  );
};
