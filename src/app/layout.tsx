import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Outfit } from 'next/font/google'
import QueryProvider from '@/components/QueryProvider'
import '../styles/globals.css'

const mainFont = Outfit({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Família Fischer — Finanças 2026',
  description: 'Controle financeiro familiar inteligente',
  manifest: '/manifest.json',
  themeColor: '#1e3a8a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fischer Finanças',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/*
          Aplica tema ANTES da primeira pintura para evitar flash.
          Padrão: CLARO. Só ativa dark se o usuário tiver salvo explicitamente.
          NÃO usa prefers-color-scheme — a preferência do sistema não interfere.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('fischer-dark') === 'true') {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={mainFont.className}>
        <QueryProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </QueryProvider>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SW registrado em:', reg.scope);
                  }).catch(function(err) {
                    console.error('Falha SW:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
