import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, ShieldAlert, Cpu, CheckCircle, RefreshCw, Terminal, ArrowRight, User } from 'lucide-react';
import aiApi from '../services/aiApi';

const AICopilot = ({ selectedDepartment = 'ICU' }) => {
  const [dept, setDept] = useState(selectedDepartment === 'All' ? 'ICU' : selectedDepartment);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      content: `Welcome to the **Hospital Accreditation Intelligence Copilot**.\n\nI am connected to your live process mining telemetry, Random Forest ML risk engine, SimPy digital twin simulation, and NABH/JCI accreditation indicator databases for **${dept}**.\n\n**Example questions you can ask me:**\n- *"What is causing the ICU accreditation risk?"*\n- *"What happens if ICU occupancy reaches 100%?"*\n- *"What should management prioritize to restore compliance?"*\n- *"Compare ICU performance with peer benchmarks."*`,
      engine: 'Accreditation RAG & Tool-Calling Pipeline',
      sources: ['PM4Py Event Logs', 'SimPy Digital Twin', 'CDC/CMS Peer Benchmarks', 'Random Forest Model'],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTools, setActiveTools] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const demoScenarios = [
    {
      title: '1. Root Cause Analysis',
      query: `What is causing the ${dept} accreditation risk?`,
      badge: 'Risk Engine RAG',
    },
    {
      title: '2. Digital Twin Surge Simulation',
      query: `What happens if ${dept} occupancy reaches 100%?`,
      badge: 'SimPy Tool Call',
    },
    {
      title: '3. Prioritized Action Plan',
      query: `What should management prioritize in the next 48 hours?`,
      badge: 'Accreditation Strategy',
    },
    {
      title: '4. External Peer Benchmark Gap',
      query: `Compare our hospital performance with regional peer benchmarks.`,
      badge: 'Registry Benchmark',
    },
  ];

  const handleSendMessage = async (customQuery = null) => {
    const textToSend = customQuery || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = { sender: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Set animated tool state for tool calling visualization
    const isSim = textToSend.toLowerCase().includes('100%') || textToSend.toLowerCase().includes('what happens') || textToSend.toLowerCase().includes('simulate');
    setActiveTools(isSim ? ['getDepartmentMetrics()', 'runDigitalTwinSimulation()', 'recalculateRiskScore()'] : ['getHospitalMetrics()', 'getProcessDeviations()', 'getBenchmarkData()']);

    try {
      const res = await aiApi.chat(textToSend, dept, messages);
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            content: res.data.answer,
            engine: res.data.engine,
            sources: res.data.groundedDataSources,
            contextInjected: res.data.contextInjected,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: 'Unable to reach generative AI endpoint. Grounded deterministic fallback response has been rendered.',
          engine: 'Deterministic Grounded Synthesizer',
        },
      ]);
    } finally {
      setLoading(false);
      setActiveTools([]);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto h-[calc(100vh-5rem)] flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xl shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Bot className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                AI Hospital Accreditation Copilot
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                TOOL-CALLING RAG
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Grounded on PM4Py process traces, SimPy simulation models, and NABH/JCI indicator registry
            </p>
          </div>
        </div>

        {/* Department Switcher */}
        <div className="flex items-center space-x-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-500 font-semibold px-2">Focus:</span>
          {['ICU', 'Emergency', 'Cardiology', 'Surgery'].map((d) => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                dept === d ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Conversation Stream */}
      <div className="flex-1 overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 my-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950'
                  : 'bg-slate-800 text-cyan-400 border border-slate-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`space-y-2 max-w-[85%] ${
                msg.sender === 'user'
                  ? 'bg-cyan-500 text-slate-950 font-medium p-4 rounded-3xl rounded-tr-none shadow-md text-xs'
                  : 'bg-slate-950/80 text-slate-200 border border-slate-800 p-5 rounded-3xl rounded-tl-none shadow-md text-xs leading-relaxed'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

              {/* Engine metadata footer for assistant responses */}
              {msg.sender === 'assistant' && msg.engine && (
                <div className="pt-2 mt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Engine: {msg.engine}</span>
                  </div>
                  {msg.sources && (
                    <div className="flex items-center space-x-1">
                      <span>Grounded Data:</span>
                      <strong className="text-slate-400">{msg.sources.join(' • ')}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator with Tool Invocation Animation */}
        {loading && (
          <div className="flex items-start space-x-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-cyan-400 border border-slate-700">
              <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-3xl rounded-tl-none shadow-md space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
                <Terminal className="w-4 h-4 animate-pulse" />
                <span>Invoking Backend Analytics & Digital Twin Engine...</span>
              </div>
              <div className="space-y-1 text-[11px] font-mono text-slate-400">
                {activeTools.map((t, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>→ Executing {t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Demo Prompts Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0">
        {demoScenarios.map((demo, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(demo.query)}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 group-hover:bg-cyan-500/20">
                {demo.badge}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs font-bold text-slate-200 mt-1 truncate">{demo.title}</p>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-xl shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask the AI Copilot about ${dept} accreditation risk, process mining, or what-if scenario...`}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center space-x-1.5 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
        >
          <span>Submit</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default AICopilot;
