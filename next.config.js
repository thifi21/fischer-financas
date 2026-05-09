/**
 * Fischer Finanças 2026
 * Desenvolvido por Thiago Fischer
 *
 * @type {import('next').NextConfig}
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aumenta limite de upload para comprovantes (padrão 4MB → 10MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // ── Cabeçalhos de segurança HTTP ──────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Impede que o site seja exibido dentro de iframes (clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Evita sniffing de MIME type
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Limita informações de referência em requisições cross-origin
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Desabilita funcionalidades sensíveis desnecessárias
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
