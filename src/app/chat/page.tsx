"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Lang = "en" | "kn" | "hi";

interface Message {
  role: "user" | "assistant";
  text: string;
  sources?: string[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Namaste! I am the living wisdom of Swami Vivekananda. Ask me anything about his life, teachings, philosophy, or spiritual path. I am here to guide you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<Lang>("en");
  const [sessionId, setSessionId] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [lastTouch, setLastTouch] = useState(Date.now());
  const messagesEnd = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const resetIdle = useCallback(() => setLastTouch(Date.now()), []);

  useEffect(() => {
    idleTimerRef.current = setInterval(() => {
      if (Date.now() - lastTouch > 90000) {
        window.location.href = '/';
      }
    }, 30000);
    return () => { if (idleTimerRef.current) clearInterval(idleTimerRef.current); };
  }, [lastTouch]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;
    resetIdle();

    const userMsg: Message = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text.trim(),
          lang,
          session_id: sessionId || undefined,
        }),
      });
      const data = await res.json();
      if (data.session_id) setSessionId(data.session_id);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer || "The wisdom of the masters teaches us that truth is one \u2014 it appears differently to different minds. Please rephrase your question and I shall try again.",
          sources: data.sources,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "A disturbance in the cosmic energy. Please try again in a moment." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const toggleVoice = () => {
    resetIdle();
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      const utterance = new SpeechSynthesisUtterance("Speech recognition is not available. Please type your question.");
      utterance.lang = lang === "kn" ? "kn-IN" : lang === "hi" ? "hi-IN" : "en-US";
      window.speechSynthesis.speak(utterance);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === "kn" ? "kn-IN" : lang === "hi" ? "hi-IN" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setInput(text);
      sendMessage(text);
    };

    recognition.onend = () => { setListening(false); };
    recognition.onerror = () => { setListening(false); };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        background: '#0A0E27',
      }}
      onClick={resetIdle}
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 30% 20%, rgba(212,163,79,0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(212,163,79,0.02) 0%, transparent 50%)'
      }} />
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + (i % 2)}px`,
              height: `${1 + (i % 2)}px`,
              left: `${(i * 41 + 17) % 100}%`,
              top: `${(i * 29 + 11) % 100}%`,
              background: i % 4 === 0 ? '#D4A34F' : '#F5F0E8',
              opacity: 0.1 + (i % 3) * 0.05,
              animation: `starTwinkle ${4 + (i % 5)}s ease-in-out ${(i % 6) * 0.7}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="shrink-0 px-8 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          {/* Vivekananda avatar */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(212,163,79,0.1)',
              border: '2px solid rgba(212,163,79,0.3)',
            }}
          >
            <span
              className="text-2xl font-light"
              style={{ fontFamily: '"Cormorant Garamond", serif', color: '#E8B84B' }}
            >
              V
            </span>
          </div>
          <div>
            <h1
              className="text-xl font-semibold"
              style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5F0E8' }}
            >
              Ask Vivekananda
            </h1>
            <p className="text-xs" style={{ color: '#8B8FA3' }}>Speak or type your question</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex gap-2">
          {(["en", "kn", "hi"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={(e) => { e.stopPropagation(); resetIdle(); setLang(l); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300"
              style={{
                background: lang === l ? 'rgba(212,163,79,0.15)' : 'transparent',
                color: lang === l ? '#E8B84B' : '#8B8FA3',
                border: lang === l ? '1px solid rgba(212,163,79,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {l === "en" ? "EN" : l === "kn" ? "\u0C95\u0CA8" : "\u0939\u093F"}
            </button>
          ))}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-5 relative z-10">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
            style={{ animationDelay: '0s', animationDuration: '0.3s' }}
          >
            <div
              className="max-w-[75%] rounded-2xl px-5 py-4"
              style={{
                background: msg.role === "user"
                  ? 'rgba(212,163,79,0.12)'
                  : 'rgba(255,255,255,0.04)',
                border: msg.role === "user"
                  ? '1px solid rgba(212,163,79,0.2)'
                  : '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(10px)',
                borderBottomRightRadius: msg.role === "user" ? '6px' : '16px',
                borderBottomLeftRadius: msg.role === "assistant" ? '6px' : '16px',
              }}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-light"
                    style={{
                      background: 'rgba(212,163,79,0.15)',
                      color: '#D4A34F',
                      fontFamily: '"Cormorant Garamond", serif',
                    }}
                  >
                    V
                  </div>
                  <span className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: '#D4A34F' }}>
                    Vivekananda
                  </span>
                </div>
              )}
              <p
                className="text-sm leading-relaxed"
                style={{ color: msg.role === "user" ? '#F5F0E8' : 'rgba(245,240,232,0.85)', lineHeight: '1.7' }}
              >
                {msg.text}
              </p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px]" style={{ color: '#8B8FA3' }}>
                    Sources: {msg.sources.slice(0, 2).join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl px-5 py-4"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderBottomLeftRadius: '6px',
              }}
            >
              <div className="flex gap-2">
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: '#D4A34F',
                      animation: `dotPulse 1.4s ease-in-out ${d * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEnd} />
      </div>

      {/* Input area */}
      <div className="shrink-0 px-8 py-5 relative z-10">
        <div
          className="rounded-2xl p-3 flex gap-3 items-end"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Voice button */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleVoice(); }}
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
            style={{
              background: listening ? 'rgba(220,60,60,0.2)' : 'rgba(212,163,79,0.12)',
              border: listening ? '2px solid rgba(220,60,60,0.4)' : '2px solid rgba(212,163,79,0.3)',
              boxShadow: listening ? '0 0 24px rgba(220,60,60,0.3)' : 'none',
              animation: listening ? 'pulseGold 2s ease-in-out infinite' : 'none',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={listening ? '#dc3c3c' : '#D4A34F'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>

          {/* Text input */}
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => { e.stopPropagation(); setInput(e.target.value); resetIdle(); }}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
              }}
              placeholder="Ask a question about Swami Vivekananda..."
              rows={1}
              className="w-full px-4 py-3.5 rounded-xl resize-none focus:outline-none text-sm"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: '#F5F0E8',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onFocus={resetIdle}
            />
          </div>

          {/* Send button */}
          <button
            onClick={(e) => { e.stopPropagation(); sendMessage(input); }}
            disabled={!input.trim() || sending}
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 active:scale-95 disabled:opacity-30"
            style={{
              background: 'rgba(212,163,79,0.12)',
              border: '2px solid rgba(212,163,79,0.3)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A34F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        {/* Hint */}
        <div className="flex items-center justify-center gap-3 mt-3 text-[10px]" style={{ color: 'rgba(139,143,163,0.4)' }}>
          <span>Speak</span>
          <span style={{ color: 'rgba(212,163,79,0.2)' }}>&middot;</span>
          <span>Type</span>
          <span style={{ color: 'rgba(212,163,79,0.2)' }}>&middot;</span>
          <span>Returns to home in 90s</span>
        </div>
      </div>
    </div>
  );
}
