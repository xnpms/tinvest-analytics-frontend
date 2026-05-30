'use client';

import type { FC, ChangeEvent, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLingui } from '@lingui/react';
import { register } from '@/lib/auth';
import { getUserState, stepToRoute } from '@/lib/user';
import { Logo } from '@/components/Logo';
import { EyeIcon, EyeOffIcon, Spinner } from '@/components/icons';

const RegisterPage = () => {
  const { i18n } = useLingui();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const state = await getUserState();
        router.replace(stepToRoute(state.onboardingStep));
      } catch {

      }
    };
    void init();
  }, [router]);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handleTogglePassword = () => setIsPasswordVisible((v) => !v);
  const handleToggleConfirm = () => setIsConfirmVisible((v) => !v);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(i18n._('passwords_mismatch'));

      return;
    }
    setIsLoading(true);
    setError('');

    try {
      await register(email, password, confirmPassword);
      const state = await getUserState();
      router.push(stepToRoute(state.onboardingStep));
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : i18n._('registration_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-bg-dark'>
      <div className='flex w-full max-w-sm flex-col items-center'>
        <Logo />

        <div className='glowing-card w-full rounded-xl bg-card-dark p-8 mt-8'>
          <div className='text-center'>
            <h2 className='font-display text-2xl font-semibold tracking-tight text-text-light'>
              {i18n._('register_heading')}
            </h2>

            <p className='mt-2 text-sm text-text-muted'>
              {i18n._('register_page_subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
            <div className='flex flex-col'>
              <label htmlFor='email' className='mb-2 text-sm font-medium text-text-light'>
                Email
              </label>

              <input
                id='email'
                type='email'
                value={email}
                onChange={handleEmailChange}
                className='h-12 w-full rounded-lg border-2 border-transparent bg-input-dark p-3 text-base text-text-light placeholder:text-text-muted/60 focus:border-primary transition-colors'
                placeholder='you@example.com'
                required
                autoComplete='email'
              />
            </div>

            <PasswordField
              id='password'
              label={i18n._('password_label')}
              value={password}
              onChange={setPassword}
              isVisible={isPasswordVisible}
              onToggle={handleTogglePassword}
              placeholder={i18n._('min_8_chars')}
              hasError={!!error}
              autoComplete='new-password'
            />

            <PasswordField
              id='confirmPassword'
              label={i18n._('confirm_password_label_2')}
              value={confirmPassword}
              onChange={setConfirmPassword}
              isVisible={isConfirmVisible}
              onToggle={handleToggleConfirm}
              placeholder={i18n._('repeat_password_placeholder')}
              hasError={!!error}
              autoComplete='new-password'
            />

            {error && (
              <p className='text-sm text-error'>{error}</p>
            )}

            <button
              type='submit'
              disabled={isLoading}
              className='flex h-12 w-full items-center justify-center rounded-lg bg-primary px-4 text-base font-semibold text-white transition-colors hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-bg-dark disabled:opacity-80'
            >
              {isLoading ? (
                <>
                  <Spinner />
                  <span className='ml-3'>{i18n._('registering')}</span>
                </>
              ) : (
                i18n._('register_link')
              )}
            </button>
          </form>
        </div>

        <div className='mt-8 text-center'>
          <p className='text-sm text-text-muted'>
            {i18n._('already_has_account')}{' '}
            <Link href='/login' className='font-semibold text-primary hover:underline'>
              {i18n._('sign_in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  isVisible: boolean;
  onToggle: () => void;
  placeholder: string;
  hasError: boolean;
  autoComplete?: string;
}

const PasswordField: FC<PasswordFieldProps> = (props) => {
  const { i18n } = useLingui();
  const { id, label, value, onChange, isVisible, onToggle, placeholder, hasError, autoComplete } = props;
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);
  return (
  <div>
    <label htmlFor={id} className='mb-2 block text-sm font-medium text-text-light'>
      {label}
    </label>

    <div className='relative mt-1'>
      <input
        id={id}
        type={isVisible ? 'text' : 'password'}
        value={value}
        onChange={handleChange}
        className={`h-12 w-full rounded-lg border-2 bg-input-dark p-3 pr-11 text-base text-text-light placeholder:text-text-muted/60 focus:border-primary transition-colors ${
          hasError ? 'border-error' : 'border-transparent'
        }`}
        placeholder={placeholder}
        required
        autoComplete={autoComplete}
      />

      <button
        type='button'
        onClick={onToggle}
        className='absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-light transition-colors'
        aria-label={isVisible ? i18n._('hide_password') : i18n._('show_password')}
      >
        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  </div>
  );
};
