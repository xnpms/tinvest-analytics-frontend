'use client';

import type { FC, ReactNode, ChangeEvent, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLingui } from '@lingui/react';
import { login, register } from '@/lib/auth';
import { getUserState, stepToRoute } from '@/lib/user';
import { EyeIcon, EyeOffIcon, Spinner } from '@/components/icons';

type Tab = 'login' | 'register';

const getStrengthLevel = (val: string): number => {
  let score = 0;
  if (val.length >= 6) {
    score++;
  }
  if (val.length >= 10) {
    score++;
  }
  if (/[A-Z]/.test(val) && /[0-9]/.test(val)) {
    score++;
  }
  if (/[^A-Za-z0-9]/.test(val)) {
    score++;
  }
  return score;
};

interface StrengthSegmentProps {
  index: number;
  score: number;
}

const StrengthSegment: FC<StrengthSegmentProps> = ({ index, score }) => {
  const cls =
    index >= score
      ? 'bg-border'
      : score <= 1
      ? 'bg-error'
      : score <= 2
      ? 'bg-accent-yellow'
      : 'bg-accent-green';
  return <div className={`flex-1 h-[3px] rounded-full transition-colors duration-300 ${cls}`} />;
};

const LoginPage = () => {
  const router = useRouter();
  const { i18n } = useLingui();
  const [activeTab, setActiveTab] = useState<Tab>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginPassVisible, setIsLoginPassVisible] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [isRegPassVisible, setIsRegPassVisible] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isRegLoading, setIsRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [passStrength, setPassStrength] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const init = async () => {
      try {
        const state = await getUserState(controller.signal);
        if (!controller.signal.aborted) {
          router.replace(stepToRoute(state.onboardingStep));
        }
      } catch {

      }
    };
    void init();
    return () => controller.abort();
  }, [router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginError('');
    try {
      await login(loginEmail, loginPassword);
      const state = await getUserState();
      router.push(stepToRoute(state.onboardingStep));
    } catch (err) {
      setLoginError(err instanceof Error && err.message ? err.message : i18n._('invalid_credentials'));
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPass) {
      setRegError(i18n._('passwords_mismatch'));
      return;
    }
    setIsRegLoading(true);
    setRegError('');
    try {
      await register(regEmail, regPassword, regConfirmPass);
      const state = await getUserState();
      router.push(stepToRoute(state.onboardingStep));
    } catch (err) {
      setRegError(err instanceof Error && err.message ? err.message : i18n._('registration_error'));
    } finally {
      setIsRegLoading(false);
    }
  };

  const handleSwitchToLogin = () => setActiveTab('login');
  const handleSwitchToRegister = () => setActiveTab('register');
  const handleLoginEmailChange = (e: ChangeEvent<HTMLInputElement>) => setLoginEmail(e.target.value);
  const handleLoginPasswordChange = (e: ChangeEvent<HTMLInputElement>) => setLoginPassword(e.target.value);
  const handleToggleLoginPass = () => setIsLoginPassVisible((v) => !v);
  const handleRegEmailChange = (e: ChangeEvent<HTMLInputElement>) => setRegEmail(e.target.value);
  const handleRegPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRegPassword(e.target.value);
    setPassStrength(getStrengthLevel(e.target.value));
  };
  const handleToggleRegPass = () => setIsRegPassVisible((v) => !v);
  const handleRegConfirmChange = (e: ChangeEvent<HTMLInputElement>) => setRegConfirmPass(e.target.value);
  const handleToggleTerms = () => setHasAcceptedTerms((v) => !v);

  return (
    <div className='relative min-h-screen flex items-center justify-center bg-bg-dark p-4 overflow-hidden'>
      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        <div className='absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-primary/20 blur-3xl animate-blob1' />
        <div className='absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full bg-accent-green/15 blur-3xl animate-blob2' />
      </div>

      <div className='relative z-10 flex w-full max-w-[920px] min-h-[500px] md:min-h-[580px] rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(124,111,234,0.18)] animate-fade-up'>

        {/* ── Left panel ── */}
        <div className='hidden md:flex w-80 shrink-0 flex-col bg-sidebar p-10 relative overflow-hidden'>
          <div className='pointer-events-none absolute -top-16 -left-16 w-64 h-64 rounded-full bg-primary/25 blur-2xl' />
          <div className='pointer-events-none absolute bottom-10 -right-20 w-56 h-56 rounded-full bg-accent-green/15 blur-2xl' />

          <div className='relative z-10 flex items-center gap-2.5 mb-12'>
            <div className='w-9 h-9 bg-primary rounded-[10px] flex items-center justify-center flex-shrink-0'>
              <svg viewBox='0 0 24 24' fill='none' className='w-5 h-5'>
                <path d='M12 2L2 7L12 12L22 7L12 2Z' stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
                <path d='M2 17L12 22L22 17' stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
                <path d='M2 12L12 17L22 12' stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
              </svg>
            </div>
            <span className='text-[22px] font-bold text-white tracking-tight'>Investa</span>
          </div>

          <div className='relative z-10 mb-8'>
            <h2 className='text-[26px] font-bold text-white leading-snug mb-3'>
              {i18n._('marketing_heading')}
            </h2>
            <p className='text-sm text-white/50 leading-relaxed'>
              {i18n._('marketing_subheading')}
            </p>
          </div>

          <div className='relative z-10 flex flex-col gap-3 mb-auto'>
            <MiniCard icon='💰' label={i18n._('portfolio_value_label')} value='₽3 396 000' change='+4.5%' positive />
            <MiniCard icon='📈' label={i18n._('return_twr_label')} value='+12.3%' change='+2.1%' positive />
            <MiniCard icon='🎯' label={i18n._('dividends_label')} value='₽46 600' change='+8.2%' positive />
          </div>

          <div className='relative z-10 mt-8 pt-6 border-t border-white/8 text-xs text-white/30 text-center'>
            {i18n._('copyright')}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className='flex-1 bg-card-dark flex flex-col justify-center px-8 md:px-12 py-10'>
          <div className='max-w-sm w-full mx-auto'>

            <div className='md:hidden flex items-center gap-2.5 mb-8'>
              <div className='w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center'>
                <svg viewBox='0 0 24 24' fill='none' className='w-4 h-4'>
                  <path d='M12 2L2 7L12 12L22 7L12 2Z' stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
                  <path d='M2 17L12 22L22 17' stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
                  <path d='M2 12L12 17L22 12' stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
                </svg>
              </div>
              <span className='text-xl font-bold text-text-light tracking-tight'>Investa</span>
            </div>

            <div className='flex bg-bg-dark rounded-xl p-1 gap-1 mb-9'>
              <TabBtn active={activeTab === 'login'} onClick={handleSwitchToLogin}>
                {i18n._('sign_in')}
              </TabBtn>
              <TabBtn active={activeTab === 'register'} onClick={handleSwitchToRegister}>
                {i18n._('sign_up')}
              </TabBtn>
            </div>

            {/* ─── Login form ─── */}
            {activeTab === 'login' && (
              <div>
                <div className='mb-7'>
                  <h1 className='text-[26px] font-bold text-text-light tracking-tight mb-1.5'>
                    {i18n._('welcome_heading')}
                  </h1>
                  <p className='text-sm text-text-muted'>
                    {i18n._('no_account')}{' '}
                    <button
                      type='button'
                      onClick={handleSwitchToRegister}
                      className='text-primary font-medium hover:opacity-70 transition-opacity'
                    >
                      {i18n._('register_link')}
                    </button>
                  </p>
                </div>

                <form onSubmit={handleLogin} className='space-y-4'>
                  <FormField label='Email'>
                    <FieldIcon>
                      <EmailSvg />
                    </FieldIcon>
                    <input
                      type='email'
                      value={loginEmail}
                      onChange={handleLoginEmailChange}
                      className='field-input border-border'
                      placeholder='you@example.com'
                      required
                      autoComplete='email'
                    />
                  </FormField>

                  <div>
                    <div className='flex items-center justify-between mb-1.5'>
                      <label className='text-[13px] font-semibold text-text-light'>{i18n._('password_label')}</label>
                      <a href='#' className='text-[13px] font-medium text-primary hover:opacity-70 transition-opacity'>
                        {i18n._('forgot_password')}
                      </a>
                    </div>
                    <div className='relative'>
                      <FieldIcon>
                        <LockSvg />
                      </FieldIcon>
                      <input
                        type={isLoginPassVisible ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={handleLoginPasswordChange}
                        className={`field-input pr-11 ${loginError ? 'border-error' : 'border-border'}`}
                        placeholder={i18n._('password_placeholder')}
                        required
                        autoComplete='current-password'
                      />
                      <EyeBtn show={isLoginPassVisible} onToggle={handleToggleLoginPass} />
                    </div>
                    {loginError && <p className='mt-1.5 text-[13px] text-error'>{loginError}</p>}
                  </div>

                  <SubmitBtn loading={isLoginLoading} loadingText={i18n._('loading')}>
                    {i18n._('sign_in')}
                  </SubmitBtn>
                </form>
              </div>
            )}

            {/* ─── Register form ─── */}
            {activeTab === 'register' && (
              <div>
                <div className='mb-7'>
                  <h1 className='text-[26px] font-bold text-text-light tracking-tight mb-1.5'>
                    {i18n._('register_heading')}
                  </h1>
                  <p className='text-sm text-text-muted'>
                    {i18n._('already_has_account')}{' '}
                    <button
                      type='button'
                      onClick={handleSwitchToLogin}
                      className='text-primary font-medium hover:opacity-70 transition-opacity'
                    >
                      {i18n._('sign_in')}
                    </button>
                  </p>
                </div>

                <form onSubmit={handleRegister} className='space-y-4'>
                  <FormField label='Email'>
                    <FieldIcon><EmailSvg /></FieldIcon>
                    <input
                      type='email'
                      value={regEmail}
                      onChange={handleRegEmailChange}
                      className='field-input border-border'
                      placeholder='you@example.com'
                      required
                      autoComplete='email'
                    />
                  </FormField>

                  <div>
                    <label className='block text-[13px] font-semibold text-text-light mb-1.5'>
                      {i18n._('password_label')}
                    </label>
                    <div className='relative'>
                      <FieldIcon><LockSvg /></FieldIcon>
                      <input
                        type={isRegPassVisible ? 'text' : 'password'}
                        value={regPassword}
                        onChange={handleRegPasswordChange}
                        className='field-input border-border pr-11'
                        placeholder={i18n._('strong_password_placeholder')}
                        required
                        autoComplete='new-password'
                      />
                      <EyeBtn show={isRegPassVisible} onToggle={handleToggleRegPass} />
                    </div>
                    <div className='flex gap-1 mt-2'>
                      {[0, 1, 2, 3].map((i) => (
                        <StrengthSegment key={i} index={i} score={passStrength} />
                      ))}
                    </div>
                  </div>

                  <FormField label={i18n._('confirm_password_label')}>
                    <FieldIcon><LockSvg /></FieldIcon>
                    <input
                      type='password'
                      value={regConfirmPass}
                      onChange={handleRegConfirmChange}
                      className='field-input border-border'
                      placeholder={i18n._('repeat_password_placeholder')}
                      required
                      autoComplete='new-password'
                    />
                  </FormField>

                  <label className='flex items-center gap-2 cursor-pointer'>
                    <div
                      onClick={handleToggleTerms}
                      className={`relative w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                        hasAcceptedTerms ? 'bg-primary border-primary' : 'bg-card-dark border-border'
                      }`}
                    >
                      {hasAcceptedTerms && (
                        <svg viewBox='0 0 24 24' fill='none' className='w-3 h-3'>
                          <polyline points='20 6 9 17 4 12' stroke='white' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' />
                        </svg>
                      )}
                    </div>
                    <span className='text-[13px] text-text-muted'>
                      {i18n._('agree_with')}{' '}
                      <span className='text-primary cursor-pointer'>{i18n._('terms_and_policy')}</span>
                    </span>
                  </label>

                  {regError && <p className='text-[13px] text-error'>{regError}</p>}

                  <SubmitBtn loading={isRegLoading} disabled={!hasAcceptedTerms} loadingText={i18n._('loading')}>
                    {i18n._('sign_up')}
                  </SubmitBtn>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

/* ─── Shared sub-components ─── */

interface TabBtnProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

const TabBtn: FC<TabBtnProps> = ({ active, onClick, children }) => (
  <button
    type='button'
    onClick={onClick}
    className={`flex-1 py-2.5 rounded-[9px] text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-card-dark text-text-light font-semibold shadow-[0_2px_8px_rgba(124,111,234,0.08)]'
        : 'text-text-muted hover:text-text-light'
    }`}
  >
    {children}
  </button>
);

interface FormFieldProps {
  label: string;
  children: ReactNode;
}

const FormField: FC<FormFieldProps> = ({ label, children }) => (
  <div className='flex-1'>
    <label className='block text-[13px] font-semibold text-text-light mb-1.5'>{label}</label>
    <div className='relative'>{children}</div>
  </div>
);

interface FieldIconProps {
  children: ReactNode;
}

const FieldIcon: FC<FieldIconProps> = ({ children }) => (
  <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none z-10'>
    {children}
  </span>
);

interface EyeBtnProps {
  show: boolean;
  onToggle: () => void;
}

const EyeBtn: FC<EyeBtnProps> = ({ show, onToggle }) => {
  const { i18n } = useLingui();
  return (
    <button
      type='button'
      onClick={onToggle}
      className='absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-muted hover:text-primary transition-colors'
      aria-label={show ? i18n._('hide') : i18n._('show')}
    >
      {show ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
};

interface SubmitBtnProps {
  loading: boolean;
  loadingText: string;
  disabled?: boolean;
  children: ReactNode;
}

const SubmitBtn: FC<SubmitBtnProps> = ({ loading, loadingText, disabled, children }) => (
  <button
    type='submit'
    disabled={loading || disabled}
    className='w-full h-[46px] flex items-center justify-center rounded-xl bg-primary text-white text-[15px] font-semibold shadow-[0_4px_16px_rgba(124,111,234,0.35)] hover:bg-primary-dark hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(124,111,234,0.4)] active:translate-y-0 transition-all disabled:opacity-60 disabled:translate-y-0 mt-1'
  >
    {loading ? (
      <>
        <Spinner className='h-5 w-5 text-white mr-2.5' />
        {loadingText}
      </>
    ) : (
      children
    )}
  </button>
);

interface MiniCardProps {
  icon: string;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

const MiniCard: FC<MiniCardProps> = ({ icon, label, value, change, positive }) => (
  <div className='bg-white/6 border border-white/10 rounded-xl p-3.5 flex items-center gap-3 backdrop-blur-sm hover:bg-white/10 transition-colors'>
    <div className='w-9 h-9 rounded-[10px] bg-primary/30 flex items-center justify-center text-base shrink-0'>
      {icon}
    </div>
    <div className='flex-1 min-w-0'>
      <p className='text-[11px] text-white/45 mb-0.5'>{label}</p>
      <p className='text-[15px] font-semibold text-white'>{value}</p>
    </div>
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
      positive ? 'text-accent-green bg-accent-green/15' : 'text-error bg-error/15'
    }`}>
      {change}
    </span>
  </div>
);

const EmailSvg: FC = () => (
  <svg className='w-[17px] h-[17px]' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' />
    <polyline points='22,6 12,13 2,6' />
  </svg>
);

const LockSvg: FC = () => (
  <svg className='w-[17px] h-[17px]' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <rect x='3' y='11' width='18' height='11' rx='2' ry='2' />
    <path d='M7 11V7a5 5 0 0 1 10 0v4' />
  </svg>
);
