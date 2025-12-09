// import Image from 'next/image';
'use client';

import { useState } from 'react';
import AuthModal from '../components/AuthModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login');

  return (
    <div className='flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-[#002]'>
      <main className='flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-[#002] sm:items-start'>
        <p>Tinvest Analytics</p>
        <div className='flex flex-col items-center gap-6 text-center sm:items-start sm:text-left'>
          <h1 className='max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50'>
            Тинькофф инвестиции
          </h1>
          <p className='max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400'>
            Управление вложениями и аналитика.
          </p>
        </div>
        <div className='flex flex-col gap-4 text-base font-medium sm:flex-row'>
          <button
            className='flex w-full items-center justify-center rounded-lg bg-white px-4 py-2 text-black hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white-500 disabled:opacity-50 cursor-pointer'
            onClick={() => {
              setModalMode('login');
              setIsModalOpen(true);
            }}
          >
            Войти
          </button>
          <button
            className='flex w-full items-center justify-center rounded-lg border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] cursor-pointer'
            onClick={() => {
              setModalMode('register');
              setIsModalOpen(true);
            }}
          >
            Зарегистрироваться
          </button>
        </div>
      </main>
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        onSwitchMode={setModalMode}
      />
    </div>
  );
}
