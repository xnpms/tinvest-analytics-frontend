import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Генерирует статические файлы в out/ (как dist/)
  trailingSlash: true, // Для nginx (опционально, для SPA routes)
  reactCompiler: true,
};

export default nextConfig;
