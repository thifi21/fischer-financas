'use client'

import { motion } from 'framer-motion'
import { formatBRL } from '@/lib/utils'

interface SankeyData {
  receitas: number
  cartoes: number
  fixas: number
  combustivel: number
  sobra: number
}

export default function SankeyFlow({ data }: { data: SankeyData }) {
  const totalSaidas = data.cartoes + data.fixas + data.combustivel
  const totalGeral = Math.max(data.receitas, totalSaidas + data.sobra)
  
  if (totalGeral === 0) return null

  // Proporções
  const h = 300
  const w = 600
  const nodeWidth = 100
  
  const getY = (valor: number) => (valor / totalGeral) * h
  
  const nodes = {
    receita: { x: 0, y: 0, h: getY(data.receitas), label: 'Receitas', color: '#22c55e' },
    cartoes: { x: w - nodeWidth, y: 0, h: getY(data.cartoes), label: 'Cartões', color: '#3b82f6' },
    fixas: { x: w - nodeWidth, y: getY(data.cartoes) + 10, h: getY(data.fixas), label: 'Fixas', color: '#f97316' },
    combustivel: { x: w - nodeWidth, y: getY(data.cartoes + data.fixas) + 20, h: getY(data.combustivel), label: '⛽', color: '#eab308' },
    sobra: { x: w - nodeWidth, y: getY(totalSaidas) + 30, h: getY(data.sobra), label: 'Reserva', color: '#a855f7' }
  }

  return (
    <div className="w-full overflow-x-auto py-4">
      <svg width={w} height={h + 50} viewBox={`0 0 ${w} ${h + 50}`} className="mx-auto">
        <defs>
          {Object.entries(nodes).map(([key, node]) => (
            <linearGradient key={`grad-${key}`} id={`grad-${key}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={nodes.receita.color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={node.color} stopOpacity="0.4" />
            </linearGradient>
          ))}
        </defs>

        {/* Caminhos (Links) */}
        {['cartoes', 'fixas', 'combustivel', 'sobra'].map((key) => {
          const target = nodes[key as keyof typeof nodes]
          const curY = key === 'cartoes' ? 0 : 
                       key === 'fixas' ? getY(data.cartoes) :
                       key === 'combustivel' ? getY(data.cartoes + data.fixas) :
                       getY(totalSaidas)

          const path = `M ${nodeWidth} ${curY + target.h / 2} 
                        C ${w / 2} ${curY + target.h / 2}, 
                          ${w / 2} ${target.y + target.h / 2}, 
                          ${w - nodeWidth} ${target.y + target.h / 2}`
          
          return (
            <g key={`link-${key}`}>
              <motion.path
                d={path}
                fill="none"
                stroke={`url(#grad-${key})`}
                strokeWidth={target.h}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              {/* Partículas de fluxo */}
              <motion.circle r="3" fill={target.color}>
                <animateMotion dur="3s" repeatCount="indefinite" path={path} />
              </motion.circle>
            </g>
          )
        })}

        {/* Nodes */}
        {Object.entries(nodes).map(([key, node]) => (
          <g key={`node-${key}`}>
            <rect
              x={node.x}
              y={node.y}
              width={nodeWidth}
              height={node.h}
              rx="4"
              fill={node.color}
              className="shadow-lg"
            />
            <text
              x={node.x + (node.x === 0 ? 5 : nodeWidth - 5)}
              y={node.y - 5}
              textAnchor={node.x === 0 ? "start" : "end"}
              className="text-[10px] font-bold fill-gray-500 dark:fill-gray-400 uppercase tracking-tighter"
            >
              {node.label}
            </text>
            <text
              x={node.x + (node.x === 0 ? 5 : nodeWidth - 5)}
              y={node.y + node.h + 15}
              textAnchor={node.x === 0 ? "start" : "end"}
              className="text-[11px] font-black fill-gray-900 dark:fill-white"
            >
              {formatBRL(key === 'receita' ? data.receitas : data[key as keyof SankeyData])}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
