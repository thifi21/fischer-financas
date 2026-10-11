/**
 * Fischer Finanças 2026
 * Desenvolvido por Thiago Fischer
 *
 * @type {import('next').NextConfig}
 */

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'

// Content-Security-Policy
// - 'unsafe-inline' em scripts: necessário para os scripts inline do layout (tema/SW) e do Next.
// - 'unsafe-eval' apenas em desenvolvimento (React refresh).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://economia.awesomeapi.com.br',
    'https://open.er-api.com',
    'https://brapi.dev',
    'https://api.bcb.gov.br',
    ...(isDev ? ['ws://localhost:*', 'http://localhost:*'] : []),
  ].join(' '),
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

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
          // Força HTTPS (somente em produção)
          ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
          // Política de conteúdo: mitiga XSS e exfiltração de dados
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

module.exports = nextConfig
