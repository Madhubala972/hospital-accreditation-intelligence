import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import aiApi from '../services/aiApi';

const AIAssistant = ({ currentDepartment = 'ICU' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      content: `Hello! I am your **Hospital Accreditation Intelligence Copilot**.\n\nI can analyze live process mining logs, evaluate NABH/JCI compliance gaps, trigger SimPy digital twin simulations, and provide evidence-grounded risk explanations for **${currentDepartment}**.\n\nHow can I assist your accreditation review?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    `What is causing the ${currentDepartment} accreditation risk?`,
    `What happens if ${currentDepartment} occupancy reaches 100%?`,
    `What should management prioritize right now?`,
    `Compare ${currentDepartment} with peer benchmarks`,
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = { sender: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.chat(textToSend, currentDepartment);
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            content: res.data.answer,
            engine: res.data.engine,
            sources: res.data.groundedDataSources,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: 'Unable to reach the AI analytics engine. The backend fallback decision-support synthesizer is active.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-2xl shadow-cyan-500/40 hover:scale-105 transition-all group"
        >
          <Bot className="w-5 h-5 text-slate-950" />
          <span className="text-xs uppercase tracking-wider">Accreditation Copilot</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-950 animate-ping" />
        </button>
      )}

      {/* Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-sm text-white">Accreditation Copilot</h3>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Grounded Decision-Support Assistant ({currentDepartment})
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[90%] ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500 text-slate-950 font-medium rounded-br-none shadow-md'
                      : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {msg.sender === 'assistant' && msg.engine && (
                  <span className="text-[9px] text-slate-500 mt-1 pl-1">
                    Grounded by: {msg.engine}
                  </span>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400 max-w-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Querying process logs & running simulation...</span>
              </div>
            )}
          </div>

          {/* Quick Suggested Prompts */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-1">
              Suggested Queries:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-[11px] font-medium border border-slate-700/60 transition-colors flex items-center space-x-1"
                >
                  <span>{p}</span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${currentDepartment} accreditation risk or what-if scenario...`}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 transition-colors font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
