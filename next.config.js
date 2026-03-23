/**
 * Fischer Finanças 2026
 * Desenvolvido por Thiago Fischer
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Aumenta limite de upload para comprovantes (padrão 4MB → 10MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
