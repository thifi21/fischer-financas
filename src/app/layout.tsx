import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Outfit } from 'next/font/google'
import '../styles/globals.css'

const mainFont = Outfit({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Família Fischer — Finanças 2026',
  description: 'Controle financeiro familiar',
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
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
