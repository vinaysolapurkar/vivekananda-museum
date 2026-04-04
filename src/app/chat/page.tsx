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
      text: "🙏 Namaste! I am the living wisdom of Swami Vivekananda. Ask me anything about his life, teachings, philosophy, or spiritual path. I am here to guide you.",
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset idle timer
  const resetIdle = useCallback(() => setLastTouch(Date.now()), []);

  // Auto-return to home after 90s of inactivity
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
          text: data.answer || "The wisdom of the masters teaches us that truth is one — it appears differently to different minds. Please rephrase your question and I shall try again.",
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
      // Fallback: use browser's speech synthesis
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
      style={{ background: 'linear-gradient(160deg, #0D1447 0%, #1A237E 40%, #1A237E 100%)' }}
      onClick={resetIdle}
    >
      {/* Header */}
      <header className="shrink-0 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Vivekananda portrait placeholder */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-saffron/40 to-saffron/10 border-2 border-saffron/40 flex items-center justify-center">
            <span className="text-3xl">🙏</span>
          </div>
          <div>
            <h1 
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Ask Vivekananda
            </h1>
            <p className="text-white/50 text-sm">Speak or type your question</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex gap-2">
          {(["en", "kn", "hi"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={(e) => { e.stopPropagation(); resetIdle(); setLang(l); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
                lang === l
                  ? "border-saffron text-saffron bg-saffron/10"
                  : "border-white/20 text-white/60 hover:border-white/40"
              }`}
            >
              {l === "en" ? "🇬🇧 English" : l === "kn" ? "🇮🇳 ಕನ್ನಡ" : "🇮🇳 हिन्दी"}
            </button>
          ))}
        </div>
      </header>

      {/* Language indicator bar */}
      <div className="shrink-0 flex items-center gap-3 px-8 pb-4">
        <div className={`h-1 rounded-full transition-all duration-500 ${lang === 'en' ? 'w-24 bg-blue-400' : lang === 'kn' ? 'w-24 bg-orange-400' : 'w-24 bg-green-400'}`} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
            style={{ animationDuration: '300ms' }}
          >
            <div
              className={`max-w-[75%] rounded-3xl px-6 py-4 ${
                msg.role === "user"
                  ? "text-white rounded-br-md"
                  : "text-white/90 rounded-bl-md"
              }`}
              style={{
                background: msg.role === "user" 
                  ? 'linear-gradient(135deg, #FF8F00, #FF6F00)'
                  : 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                border: msg.role === "assistant" ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-saffron/30 flex items-center justify-center text-sm">
                    🙏
                  </div>
                  <span className="text-saffron text-xs font-semibold tracking-wide uppercase">Vivekananda</span>
                </div>
              )}
              <p 
                className="text-base leading-relaxed"
                style={{ lineHeight: '1.7' }}
              >
                {msg.text}
              </p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-white/10">
                  <p className="text-white/40 text-xs">
                    📖 {msg.sources.slice(0, 2).join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {sending && (
          <div className="flex justify-start">
            <div 
              className="rounded-3xl rounded-bl-md px-6 py-4"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}
            >
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ background: '#FF8F00', animationDelay: '0ms' }} />
                <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ background: '#FF8F00', animationDelay: '150ms' }} />
                <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ background: '#FF8F00', animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEnd} />
      </div>

      {/* Input area */}
      <div className="shrink-0 px-8 py-6">
        <div 
          className="rounded-3xl p-3 flex gap-3 items-end"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          {/* Voice button */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleVoice(); }}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shrink-0 transition-all ${
              listening
                ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50"
                : "bg-saffron text-white hover:bg-saffron-dark active:scale-95"
            }`}
            style={{ boxShadow: listening ? '0 0 30px rgba(239,68,68,0.5)' : '0 4px 20px rgba(255,143,0,0.4)' }}
          >
            {listening ? '🔴' : '🎤'}
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
              className="w-full px-5 py-4 rounded-2xl bg-white/10 text-white placeholder:text-white/40 resize-none focus:outline-none text-base"
              style={{ 
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
              }}
              onFocus={resetIdle}
            />
          </div>

          {/* Send button */}
          <button
            onClick={(e) => { e.stopPropagation(); sendMessage(input); }}
            disabled={!input.trim() || sending}
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shrink-0 transition-all bg-primary text-white hover:bg-primary-light disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            style={{ boxShadow: '0 4px 20px rgba(26,35,126,0.4)' }}
          >
            ➤
          </button>
        </div>

        {/* Hint */}
        <div className="flex items-center justify-center gap-2 mt-3 text-white/30 text-xs">
          <span>🎤 Speak</span>
          <span>•</span>
          <span>✏️ Type</span>
          <span>•</span>
          <span>⏱ Returns to home in 90s</span>
        </div>
      </div>
    </div>
  );
}
