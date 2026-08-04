import React from 'react'
import { CheckCircle2, Clock, AlertCircle, Info, CreditCard, Tag } from 'lucide-react'

export type BadgeVariant = 'pago' | 'pendente' | 'vencido' | 'info' | 'parcela' | 'neutro'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  showIcon?: boolean
  className?: string
}

const config: Record<BadgeVariant, { cls: string; icon: React.ReactNode }> = {
  pago:     { cls: 'badge-pago',     icon: <CheckCircle2  size={11} /> },
  pendente: { cls: 'badge-pendente', icon: <Clock         size={11} /> },
  vencido:  { cls: 'badge-vencido',  icon: <AlertCircle   size={11} /> },
  info:     { cls: 'badge-info',     icon: <Info          size={11} /> },
  parcela:  { cls: 'badge-parcela',  icon: <CreditCard    size={11} /> },
  neutro:   { cls: 'badge-neutro',   icon: <Tag           size={11} /> },
}

export function Badge({ variant, children, showIcon = true, className = '' }: BadgeProps) {
  const { cls, icon } = config[variant]
  return (
    <span className={`${cls} ${className}`}>
      {showIcon && icon}
      {children}
    </span>
  )
}
