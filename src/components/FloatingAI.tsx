'use client';

import { useState, useEffect } from 'react';

export default function FloatingAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am Vault-AI. I am here to guide you through the Carbon Clarity dMRV process. How can I help you today?' }
  ]);

  const questions = [
    { q: 'What is a Hardened Audit?', a: 'A Hardened Audit is a record that has passed GPS verification and time-stamping protocols. These are the only records certified for carbon credits.' },
    { q: 'How do we prove the savings?', a: 'Proof is established via dMRV: (1) GPS Geofencing confirms the agent is on-site. (2) Baseline Comparison proves wood saved vs traditional fires. (3) fNRB factors (90%) convert wood to CO2 credits.' },
    { q: 'How is Carbon calculated?', a: 'We use the UN CDM AMS-II.G methodology. Each scan avoids approx. 54.45kg of CO2 by reducing non-renewable biomass consumption.' },
    { q: 'Where is my payout?', a: 'Payouts are processed quarterly into your registered MTN or Telecel Mobile Money wallet based on your total Points.' },
  ];

  const handleAsk = (q: string, a: string) => {
    setMessages(prev => [
      ...prev,
      { role: 'user', text: q },
      { role: 'assistant', text: a }
    ]);
  };

  return (
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[320px] bg-surf border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gdim p-4 flex items-center gap-3 border-b border-green-custom/10">
            <div className="w-8 h-8 rounded-full bg-green-custom flex items-center justify-center text-black font-bold text-[12px]">
              AI
            </div>
            <div>
              <div className="text-[13px] font-bold text-green-custom">Vault-AI Assistant</div>
              <div className="text-[10px] text-muted flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-custom animate-pulse"></div>
                Live Protocol Guidance
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="ml-auto text-muted hover:text-text">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div className="p-4 h-[300px] overflow-y-auto flex flex-col gap-4 bg-surf/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-[12px] leading-relaxed ${m.role === 'user' ? 'bg-blue-custom text-white rounded-tr-none' : 'bg-surf2 border border-border rounded-tl-none text-text'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-surf border-t border-border">
            <div className="text-[10px] text-muted uppercase font-bold mb-2">Common Questions</div>
            <div className="flex flex-col gap-2">
              {questions.map((item, i) => (
                <button 
                  key={i}
                  onClick={() => handleAsk(item.q, item.a)}
                  className="text-left text-[11px] p-2 rounded-lg bg-surf2 border border-border hover:border-green-custom transition-colors"
                >
                  {item.q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 ${isOpen ? 'bg-surf border border-border' : 'bg-green-custom text-black'}`}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
      </button>
    </div>
  );
}
