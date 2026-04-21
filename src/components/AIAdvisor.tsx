import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, X, Send, Bot, User, 
  ChevronRight, AlertTriangle, TrendingUp, TrendingDown,
  Info
} from 'lucide-react';
import { KPIStats, OperatorStats } from '../types';
import { askGemini, generateAutoAnalysis } from '../services/geminiService';
import { cn } from '../lib/utils';

interface AIAdvisorProps {
  kpis: KPIStats | null;
  operators: OperatorStats[];
}

export default function AIAdvisor({ kpis, operators }: AIAdvisorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hola, soy tu consultor logístico IA. ¿En qué puedo ayudarte hoy con los datos del almacén?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || !kpis) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);
    
    const response = await askGemini(userMsg, { kpis, operators });
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Sparkles className="w-6 h-6 text-amber-400" />
      </motion.button>

      {/* Chat Panels */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-8 w-[450px] max-h-[700px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 flex flex-col overflow-hidden z-[101]"
          >
            {/* Header */}
            <div className="p-6 bg-black text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold tracking-tight">AI Logistics Advisor</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ready to analyze</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex gap-3",
                  m.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    m.role === 'assistant' ? "bg-black text-white" : "bg-white text-black border border-gray-100"
                  )}>
                    {m.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                    m.role === 'assistant' 
                      ? "bg-white shadow-sm border border-gray-100 text-[#1d1d1f]" 
                      : "bg-[#1c7ed6] text-white"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-1 items-center h-10">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Pregunta a la IA sobre KPIs, operarios o costes..."
                  className="w-full bg-gray-100 rounded-[20px] py-4 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 ring-[#1c7ed6]/20 resize-none h-[56px] transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 top-2 w-10 h-10 bg-black text-white rounded-[14px] flex items-center justify-center hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-lg shadow-black/10"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-4 text-[10px] text-gray-400 text-center font-medium uppercase tracking-widest">
                Gemini Pro · SAP EWM Specialist
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
