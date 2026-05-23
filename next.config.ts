import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      '*.po': {
        loaders: ['@lingui/loader'],
        as: '*.js',
      },
    },
  },
  webpack: (config: Configuration) => {
    config.module?.rules?.push({
      test: /\.po$/,
      use: ['@lingui/loader'],
    });
    return config;
  },
};

export default nextConfig;
