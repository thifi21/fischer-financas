'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Bot, Send, X, Mic, MessageSquare, Loader2, MicOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Ref para guardar a instância de SpeechRecognition
  const recognitionRef = useRef<any>(null)

  // Rolagem automática para o final do chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Configuração da Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'pt-BR'

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(prev => prev ? `${prev} ${transcript}` : transcript)
        }

        recognition.onerror = (event: any) => {
          console.error('Erro no reconhecimento de voz:', event.error)
          setIsListening(false)
          toast.error('Erro ao usar o microfone.')
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (e) {
          // Se já estiver escutando ou ocorrer erro
          console.error(e)
        }
      } else {
        toast.error('Seu navegador não suporta entrada de voz.')
      }
    }
  }

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao enviar mensagem')
      }

      const data = await response.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.resposta }])
    } catch (error: any) {
      toast.error(error.message)
      // Remove a mensagem do usuário em caso de erro, ou apenas notifica
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro ao tentar me conectar ao servidor. Tente novamente em instantes.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Botão Flutuante */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-colors group"
            >
              <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Janela de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 48px)' }}
          >
            {/* Header */}
            <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold leading-tight">Fischer AI</h3>
                  <p className="text-indigo-200 text-xs">Assistente Financeiro</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-indigo-200 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensagens */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 h-[400px] flex flex-col space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-3">
                  <Bot className="w-12 h-12 text-indigo-300" />
                  <p className="text-sm">Olá! Sou o Fischer AI. Pergunte-me qualquer coisa sobre finanças, análises ou sobre o sistema.</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-sm' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      {/* Simples formatação de quebras de linha. Para um projeto maior, use react-markdown */}
                      {msg.content.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          {i !== msg.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-sm shadow-sm flex space-x-2 items-center">
                    <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                    <span className="text-xs text-gray-500">Pensando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100">
              <form 
                onSubmit={sendMessage}
                className="flex items-center bg-gray-50 border border-gray-200 rounded-full p-1 pr-2"
              >
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                    isListening 
                      ? 'bg-red-100 text-red-500 hover:bg-red-200 animate-pulse' 
                      : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                  title={isListening ? "Parar de escutar" : "Falar"}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Escutando..." : "Digite sua mensagem..."}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 py-2 outline-none text-gray-700"
                />
                
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 text-white p-2 rounded-full transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
