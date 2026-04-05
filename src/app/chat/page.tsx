"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Lang = "en" | "kn" | "hi";
type Phase = "intro" | "chat";

interface Message {
  role: "user" | "assistant";
  text: string;
  sources?: string[];
}

const IDLE_TIMEOUT = 180000; // 3 minutes
const IDLE_CHECK_INTERVAL = 10000; // check every 10s

export default function ChatPage() {
  // Intro state
  const [phase, setPhase] = useState<Phase>("intro");
  const [visitorName, setVisitorName] = useState("");
  const [visitorAge, setVisitorAge] = useState("");

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<Lang>("en");
  const [sessionId, setSessionId] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);

  // Idle tracking
  const lastActivityRef = useRef(Date.now());
  const isTypingRef = useRef(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sendingRef = useRef(false);

  // Keep sendingRef in sync
  useEffect(() => { sendingRef.current = sending; }, [sending]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Full reset — go back to intro
  const resetConversation = useCallback(() => {
    setPhase("intro");
    setVisitorName("");
    setVisitorAge("");
    setMessages([]);
    setInput("");
    setSessionId("");
    setSending(false);
    setListening(false);
    isTypingRef.current = false;
    lastActivityRef.current = Date.now();
  }, []);

  // Smart idle auto-reset: only if not typing, not sending, not listening
  useEffect(() => {
    if (phase !== "chat") return;

    idleTimerRef.current = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current;
      if (idle > IDLE_TIMEOUT && !isTypingRef.current && !sendingRef.current) {
        resetConversation();
      }
    }, IDLE_CHECK_INTERVAL);

    return () => { if (idleTimerRef.current) clearInterval(idleTimerRef.current); };
  }, [phase, resetConversation]);

  // Start chat after intro
  const startChat = () => {
    if (!visitorName.trim()) return;
    setPhase("chat");
    lastActivityRef.current = Date.now();
    const ageNote = visitorAge ? ` I see you are ${visitorAge} years old.` : "";
    setMessages([
      {
        role: "assistant",
        text: `Namaste, ${visitorName.trim()}!${ageNote} I am Swami Vivekananda. Ask me anything about my life, teachings, philosophy, or spiritual path. I am here to guide you.`,
      },
    ]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;
    resetActivity();

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
          visitor_name: visitorName.trim(),
          visitor_age: visitorAge || undefined,
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
      resetActivity();
    }
  };

  const toggleVoice = () => {
    resetActivity();
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

  // ─── INTRO SCREEN ───
  if (phase === "intro") {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center p-8"
        style={{ background: 'linear-gradient(170deg, #1a0f0a 0%, #2a1810 30%, #1c1008 100%)' }}
      >
        {/* Ambient */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(212,163,79,0.05) 0%, transparent 60%)',
        }} />
        {/* Vivekananda watermark */}
        <div className="absolute top-0 right-0 bottom-0 w-[45%] pointer-events-none opacity-[0.06]" style={{
          backgroundImage: 'url(/images/vivekananda-portrait.jpg)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right center',
          backgroundSize: 'auto 85%',
          maskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)',
          filter: 'sepia(0.4) brightness(1.2)',
        }} />

        <div className="text-center w-full max-w-md relative z-10">
          {/* Portrait */}
          <div
            className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-8"
            style={{ border: '2px solid rgba(212,163,79,0.3)', boxShadow: '0 0 50px rgba(212,163,79,0.12)' }}
          >
            <img src="/images/vivekananda-portrait.jpg" alt="Swami Vivekananda" className="w-full h-full object-cover" style={{ filter: 'sepia(0.1)' }} />
          </div>

          <h1
            className="text-4xl font-semibold mb-2"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
          >
            Speak with Swamiji
          </h1>
          <p className="text-base mb-10" style={{ color: '#9B8A72' }}>
            Ask anything about his life, teachings, and wisdom
          </p>

          <div className="space-y-4">
            <input
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="Your name"
              className="w-full px-6 py-4 rounded-xl text-center text-base focus:outline-none transition-all duration-300"
              style={{
                background: 'rgba(255,245,230,0.04)',
                border: '1px solid rgba(212,163,79,0.1)',
                color: '#F5EDE0',
              }}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'rgba(212,163,79,0.4)'; }}
              onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'rgba(212,163,79,0.1)'; }}
              onKeyDown={(e) => e.key === "Enter" && startChat()}
            />
            <input
              type="number"
              value={visitorAge}
              onChange={(e) => setVisitorAge(e.target.value)}
              placeholder="Your age (optional)"
              className="w-full px-6 py-4 rounded-xl text-center text-base focus:outline-none transition-all duration-300"
              style={{
                background: 'rgba(255,245,230,0.04)',
                border: '1px solid rgba(212,163,79,0.1)',
                color: '#F5EDE0',
              }}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'rgba(212,163,79,0.4)'; }}
              onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'rgba(212,163,79,0.1)'; }}
              onKeyDown={(e) => e.key === "Enter" && startChat()}
            />
            <button
              onClick={startChat}
              disabled={!visitorName.trim()}
              className="w-full py-4 rounded-xl font-medium text-base transition-all duration-300 disabled:opacity-30 active:scale-[0.98]"
              style={{
                background: 'rgba(212,163,79,0.12)',
                color: '#E8C06A',
                border: '1px solid rgba(212,163,79,0.3)',
              }}
            >
              Begin Conversation
            </button>
          </div>

          <p className="italic text-sm mt-8" style={{ fontFamily: '"Cormorant Garamond", serif', color: 'rgba(212,163,79,0.3)' }}>
            &ldquo;Talk to yourself once in a day, otherwise you may miss meeting an excellent person in this world.&rdquo;
          </p>
        </div>
      </div>
    );
  }

  // ─── CHAT SCREEN ───
  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        background: 'linear-gradient(170deg, #1a0f0a 0%, #2a1810 30%, #1c1008 100%)',
      }}
      onClick={resetActivity}
    >
      {/* Warm ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 30% 20%, rgba(212,163,79,0.04) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(123,45,38,0.05) 0%, transparent 50%)',
      }} />
      {/* Vivekananda watermark */}
      <div className="absolute top-0 right-0 bottom-0 w-[40%] pointer-events-none opacity-[0.04]" style={{
        backgroundImage: 'url(/images/vivekananda-portrait.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right center',
        backgroundSize: 'auto 70%',
        maskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)',
        filter: 'sepia(0.4) brightness(1.2)',
      }} />

      {/* Header */}
      <header className="shrink-0 px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full overflow-hidden shrink-0"
            style={{ border: '1.5px solid rgba(212,163,79,0.3)', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
          >
            <img src="/images/vivekananda-portrait.jpg" alt="Swami Vivekananda" className="w-full h-full object-cover" style={{ filter: 'sepia(0.15)' }} />
          </div>
          <div>
            <h1 className="text-lg font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0' }}>
              Ask Vivekananda
            </h1>
            <p className="text-[11px]" style={{ color: '#9B8A72' }}>
              Talking with {visitorName}{visitorAge ? `, age ${visitorAge}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          {(["en", "kn", "hi"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={(e) => { e.stopPropagation(); resetActivity(); setLang(l); }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-300"
              style={{
                background: lang === l ? 'rgba(212,163,79,0.12)' : 'transparent',
                color: lang === l ? '#E8C06A' : '#9B8A72',
                border: lang === l ? '1px solid rgba(212,163,79,0.3)' : '1px solid rgba(255,245,230,0.08)',
              }}
            >
              {l === "en" ? "EN" : l === "kn" ? "\u0C95\u0CA8" : "\u0939\u093F"}
            </button>
          ))}

          {/* Reset button */}
          <button
            onClick={(e) => { e.stopPropagation(); resetConversation(); }}
            className="ml-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 active:scale-95"
            style={{
              background: 'rgba(180,60,60,0.1)',
              color: '#c88',
              border: '1px solid rgba(180,60,60,0.2)',
            }}
            title="New conversation"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 relative z-10">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
            style={{ animationDelay: '0s', animationDuration: '0.3s' }}
          >
            <div
              className="max-w-[80%] rounded-2xl px-5 py-4"
              style={{
                background: msg.role === "user"
                  ? 'rgba(212,163,79,0.1)'
                  : 'rgba(255,245,230,0.04)',
                border: msg.role === "user"
                  ? '1px solid rgba(212,163,79,0.2)'
                  : '1px solid rgba(212,163,79,0.08)',
                backdropFilter: 'blur(10px)',
                borderBottomRightRadius: msg.role === "user" ? '6px' : '16px',
                borderBottomLeftRadius: msg.role === "assistant" ? '6px' : '16px',
              }}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0" style={{ border: '1px solid rgba(212,163,79,0.2)' }}>
                    <img src="/images/vivekananda-portrait.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: '#C8A882' }}>
                    Vivekananda
                  </span>
                </div>
              )}
              <p
                className="text-sm leading-relaxed"
                style={{ color: msg.role === "user" ? '#F5EDE0' : '#D9CBBA', lineHeight: '1.7' }}
              >
                {msg.text}
              </p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2" style={{ borderTop: '1px solid rgba(212,163,79,0.08)' }}>
                  <p className="text-[10px]" style={{ color: '#9B8A72' }}>
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
                background: 'rgba(255,245,230,0.04)',
                border: '1px solid rgba(212,163,79,0.08)',
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
      <div className="shrink-0 px-6 py-4 relative z-10">
        <div
          className="rounded-2xl p-3 flex gap-3 items-end"
          style={{
            background: 'rgba(255,245,230,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(212,163,79,0.12)',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); toggleVoice(); }}
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
            style={{
              background: listening ? 'rgba(180,50,50,0.15)' : 'rgba(212,163,79,0.1)',
              border: listening ? '2px solid rgba(180,50,50,0.35)' : '2px solid rgba(212,163,79,0.25)',
              boxShadow: listening ? '0 0 24px rgba(180,50,50,0.2)' : 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={listening ? '#c44' : '#D4A34F'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>

          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => {
                e.stopPropagation();
                setInput(e.target.value);
                resetActivity();
                isTypingRef.current = e.target.value.length > 0;
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  isTypingRef.current = false;
                  sendMessage(input);
                }
              }}
              onBlur={() => { isTypingRef.current = false; }}
              placeholder="Ask a question about Swami Vivekananda..."
              rows={1}
              className="w-full px-4 py-3 rounded-xl resize-none focus:outline-none text-sm"
              style={{
                background: 'rgba(255,245,230,0.04)',
                color: '#F5EDE0',
                border: '1px solid rgba(212,163,79,0.08)',
              }}
              onFocus={() => { resetActivity(); isTypingRef.current = input.length > 0; }}
            />
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); isTypingRef.current = false; sendMessage(input); }}
            disabled={!input.trim() || sending}
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 active:scale-95 disabled:opacity-30"
            style={{
              background: 'rgba(212,163,79,0.1)',
              border: '2px solid rgba(212,163,79,0.25)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4A34F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 mt-2 text-[10px]" style={{ color: 'rgba(155,138,114,0.5)' }}>
          <span>Speak or Type</span>
          <span style={{ color: 'rgba(212,163,79,0.2)' }}>&middot;</span>
          <span>Auto-resets after 3 min idle</span>
        </div>
      </div>
    </div>
  );
}
