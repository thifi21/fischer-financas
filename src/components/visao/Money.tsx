/**
 * Valor monetário no estilo "R$ 5.304,28" com prefixo e centavos menores.
 */
export function Money({ value, size = 'lg', className = '' }: {
  value: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const negativo = value < 0
  const [inteiro, centavos] = Math.abs(value).toFixed(2).split('.')
  const inteiroFmt = Number(inteiro).toLocaleString('pt-BR')
  const tamanhos = {
    sm: { main: 'text-base', sub: 'text-[10px]', pre: 'text-xs' },
    md: { main: 'text-2xl',  sub: 'text-xs',     pre: 'text-base' },
    lg: { main: 'text-3xl',  sub: 'text-sm',     pre: 'text-xl' },
    xl: { main: 'text-5xl',  sub: 'text-lg',     pre: 'text-3xl' },
  }[size]
  return (
    <span className={`inline-flex items-baseline gap-1 font-bold tracking-tight tabular-nums ${className}`}>
      <span className={`${tamanhos.pre} opacity-40 font-semibold`}>{negativo ? '−R$' : 'R$'}</span>
      <span className={tamanhos.main}>{inteiroFmt}</span>
      <span className={`${tamanhos.sub} opacity-50 font-semibold -ml-0.5`}>,{centavos}</span>
    </span>
  )
}

