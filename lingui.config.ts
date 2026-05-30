import type { LinguiConfig } from '@lingui/conf';
import { formatter } from '@lingui/format-po';

const config: LinguiConfig = {
  locales: ['ru', 'en'],
  sourceLocale: 'ru',
  catalogs: [
    {
      path: '<rootDir>/locales/{locale}',
      include: ['<rootDir>/src'],
    },
  ],
  format: formatter({ explicitIdAsDefault: true }),
};

export default config;
