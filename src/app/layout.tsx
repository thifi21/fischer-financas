import type { Metadata } from 'next'
import '../styles/globals.css'

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
      <body>{children}</body>
    </html>
  )
}
