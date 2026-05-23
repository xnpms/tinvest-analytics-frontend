import type { FC } from 'react';

export const Logo: FC = () => (
  <div className='flex items-center gap-3'>
    <svg fill='none' height='36' viewBox='0 0 24 24' width='36' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 2L2 7L12 12L22 7L12 2Z'
        stroke='#7C6FEA'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
      />
      <path
        d='M2 17L12 22L22 17'
        stroke='#7C6FEA'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
      />
      <path
        d='M2 12L12 17L22 12'
        stroke='#7C6FEA'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
      />
    </svg>
    <h1 className='font-display text-3xl font-bold text-text-light'>Investa</h1>
  </div>
);
