import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onSwitchMode: (mode: 'login' | 'register') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode,
  onSwitchMode,
}) => {
  const { register, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Пароли не совпадают');
          setIsLoading(false);
          return;
        }
        await register(email, password);
      } else {
        await login(email, password);
      }
      // После успешного запроса закрыть модалку
      onClose();
    } catch (err) {
      setError('Ошибка при выполнении запроса');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='relative w-full max-w-sm rounded-xl bg-gray-800 p-8 shadow-lg'>
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-white'
        >
          ✕
        </button>

        {/* Logo */}
        <div className='mb-8 flex items-center justify-center gap-3'>
          <h1 className='text-3xl font-bold text-white'>Tinvest</h1>
        </div>

        {/* Title */}
        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-white'>
            {mode === 'login' ? 'Добро пожаловать' : 'Создать аккаунт'}
          </h2>
          <p className='mt-2 text-sm text-gray-400'>
            {mode === 'login'
              ? 'Войдите, чтобы получить доступ к панели управления.'
              : 'Зарегистрируйтесь, чтобы начать.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
          {/* Email */}
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-white'
            >
              Email или Имя пользователя
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='mt-1 block w-full rounded-lg border-2 border-transparent bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none'
              placeholder='you@example.com'
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className='flex items-center justify-between'>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-white'
              >
                Пароль
              </label>
              {mode === 'login' && (
                <a href='#' className='text-sm text-blue-500 hover:underline'>
                  Забыли пароль?
                </a>
              )}
            </div>
            <div className='relative mt-1'>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='block w-full rounded-lg border-2 border-transparent bg-gray-700 p-3 pr-10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none'
                placeholder='Введите ваш пароль'
                required
              />
              <button
                type='button'
                className='absolute inset-y-0 right-0 pr-3 text-gray-400'
              >
                <span className='text-xl'>visibility_off</span>
              </button>
            </div>
          </div>

          {/* Confirm Password for Register */}
          {mode === 'register' && (
            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-white'
              >
                Подтвердите пароль
              </label>
              <input
                id='confirmPassword'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='mt-1 block w-full rounded-lg border-2 border-transparent bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none'
                placeholder='Подтвердите ваш пароль'
                required
              />
            </div>
          )}

          {/* Error */}
          {error && <p className='text-sm text-red-500'>{error}</p>}

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isLoading}
            className='flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
          >
            {isLoading ? (
              <>
                <svg
                  className='mr-2 h-5 w-5 animate-spin'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    fill='currentColor'
                  ></path>
                </svg>
                {mode === 'login' ? 'Вход...' : 'Регистрация...'}
              </>
            ) : mode === 'login' ? (
              'Войти'
            ) : (
              'Зарегистрироваться'
            )}
          </button>
        </form>

        {/* Switch Mode */}
        <div className='mt-8 text-center'>
          <p className='text-sm text-gray-400'>
            {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
            <button
              onClick={() =>
                onSwitchMode(mode === 'login' ? 'register' : 'login')
              }
              className='font-semibold text-blue-500 hover:underline'
            >
              {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
