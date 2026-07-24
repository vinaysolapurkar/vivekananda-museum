"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MuseumIcon from "@/components/MuseumIcon";
import { useLang } from "@/components/LanguageProvider";
import { LANGS } from "@/lib/i18n";

type Phase = "intro" | "chat";

interface Message {
  role: "user" | "assistant";
  text: string;
  sources?: string[];
}

const IDLE_TIMEOUT = 180000; // 3 minutes
const IDLE_CHECK_INTERVAL = 10000; // check every 10s

export default function ChatPage() {
  const { lang, setLang, t } = useLang();
  const kf = lang === "en" ? undefined : "var(--font-kannada)";

  // Intro state
  const [phase, setPhase] = useState<Phase>("intro");
  const [visitorName, setVisitorName] = useState("");
  const [visitorAge, setVisitorAge] = useState("");

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
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
    const ageNote = visitorAge ? ` ${t("chat.iSee")} ${visitorAge} ${t("chat.yearsOld")}` : "";
    setMessages([
      {
        role: "assistant",
        text: `${t("chat.namaste")}, ${visitorName.trim()}!${ageNote} ${t("chat.greetingBody")}`,
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
          text: data.answer || t("chat.fallbackAnswer"),
          sources: data.sources,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: t("chat.errorCosmic") },
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
      const utterance = new SpeechSynthesisUtterance(t("chat.speechUnavailable"));
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
        className="fixed inset-0 flex flex-col items-center justify-center p-8 overflow-hidden"
        style={{ background: 'var(--bg-hero)' }}
      >
        {/* Diya glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--diya-glow)' }} />
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

        <div className="text-center w-full max-w-md relative z-10 animate-fade-in-up">
          {/* Portrait */}
          <div
            className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-7"
            style={{ border: '2px solid var(--hairline-strong)', boxShadow: '0 0 60px rgba(224,123,46,0.16)' }}
          >
            <img src="/images/vivekananda-portrait.jpg" alt="Swami Vivekananda" className="w-full h-full object-cover" style={{ filter: 'sepia(0.1)' }} />
          </div>

          <p className="m-eyebrow mb-3" style={{ fontFamily: kf }}>{t("app.title")}</p>
          <h1
            className="text-5xl font-medium mb-3"
            style={{ color: 'var(--ivory)', textShadow: '0 2px 12px rgba(0,0,0,0.3)', fontFamily: kf }}
          >
            {t("mod.chat.title")}
          </h1>
          <p className="text-base mb-10" style={{ color: 'var(--ink-muted)', fontFamily: kf }}>
            {t("chat.introSub")}
          </p>

          <div className="space-y-4">
            <input
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder={t("common.yourName")}
              className="w-full px-6 py-4 rounded-2xl text-center text-base focus:outline-none transition-all duration-300"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--hairline)',
                color: 'var(--ivory)',
                fontFamily: kf,
              }}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--hairline-strong)'; }}
              onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--hairline)'; }}
              onKeyDown={(e) => e.key === "Enter" && startChat()}
            />
            <input
              type="number"
              value={visitorAge}
              onChange={(e) => setVisitorAge(e.target.value)}
              placeholder={t("common.agePlaceholder")}
              className="w-full px-6 py-4 rounded-2xl text-center text-base focus:outline-none transition-all duration-300"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--hairline)',
                color: 'var(--ivory)',
                fontFamily: kf,
              }}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--hairline-strong)'; }}
              onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--hairline)'; }}
              onKeyDown={(e) => e.key === "Enter" && startChat()}
            />
            <button
              onClick={startChat}
              disabled={!visitorName.trim()}
              className="m-btn m-btn-primary w-full !min-h-[54px] text-base disabled:opacity-30 disabled:pointer-events-none"
              style={{ fontFamily: kf }}
            >
              <MuseumIcon name="lotus" size={18} />
              {t("chat.beginConversation")}
            </button>
          </div>

          <div className="m-divider mt-9 mb-4"><span>✦</span></div>
          <p className="italic text-sm px-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-faint)' }}>
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
      style={{ background: 'var(--background)' }}
      onClick={resetActivity}
    >
      <style>{`@keyframes dotPulse { 0%, 60%, 100% { opacity: 0.25; transform: scale(0.85); } 30% { opacity: 1; transform: scale(1); } }`}</style>
      {/* Warm ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--diya-glow)' }} />
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
      <header className="shrink-0 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 relative z-10"
        style={{ background: 'var(--bg-hero)', borderBottom: '1px solid var(--hairline)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0"
            style={{ border: '1.5px solid var(--hairline-strong)', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
          >
            <img src="/images/vivekananda-portrait.jpg" alt="Swami Vivekananda" className="w-full h-full object-cover" style={{ filter: 'sepia(0.15)' }} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold leading-tight whitespace-nowrap" style={{ color: 'var(--ivory)', fontFamily: kf }}>
              {t("mod.chat.title")}
            </h1>
            <p className="text-[11px] truncate" style={{ color: 'var(--ink-muted)', fontFamily: kf }}>
              {t("chat.talkingWith")} {visitorName}{visitorAge ? `, ${t("chat.age")} ${visitorAge}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language selector */}
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={(e) => { e.stopPropagation(); resetActivity(); setLang(l.code); }}
              className={`m-chip !min-h-[36px] !px-3 text-xs ${lang === l.code ? "m-chip-active" : ""}`}
              style={l.code === "en" ? undefined : { fontFamily: "var(--font-kannada)" }}
            >
              {l.short}
            </button>
          ))}

          {/* Reset button */}
          <button
            onClick={(e) => { e.stopPropagation(); resetConversation(); }}
            className="m-btn m-btn-ghost ml-1 !min-h-[36px] !px-4 text-xs"
            title={t("chat.newConversation")}
            style={{ fontFamily: kf }}
          >
            {t("chat.reset")}
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 relative z-10">
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
                  ? 'rgba(224,123,46,0.10)'
                  : 'var(--bg-raised)',
                border: msg.role === "user"
                  ? '1px solid rgba(224,123,46,0.28)'
                  : '1px solid var(--hairline)',
                boxShadow: msg.role === "assistant" ? '0 2px 16px rgba(0,0,0,0.22)' : 'none',
                borderBottomRightRadius: msg.role === "user" ? '6px' : '16px',
                borderBottomLeftRadius: msg.role === "assistant" ? '6px' : '16px',
              }}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0" style={{ border: '1px solid var(--hairline-strong)' }}>
                    <img src="/images/vivekananda-portrait.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-medium tracking-[0.18em] uppercase" style={{ color: 'var(--gold)' }}>
                    Swami Vivekananda
                  </span>
                </div>
              )}
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--ivory)', lineHeight: '1.7', fontFamily: kf }}
              >
                {msg.text}
              </p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2" style={{ borderTop: '1px solid var(--hairline)' }}>
                  <p className="text-[10px]" style={{ color: 'var(--ink-faint)', fontFamily: kf }}>
                    {t("chat.sources")}: {msg.sources.slice(0, 2).map((s: any) => typeof s === 'string' ? s : s.title || s.name || JSON.stringify(s)).join(", ")}
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
                background: 'var(--bg-raised)',
                border: '1px solid var(--hairline)',
                borderBottomLeftRadius: '6px',
              }}
            >
              <div className="flex gap-2">
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: 'var(--gold)',
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
      <div className="shrink-0 px-6 pb-4 pt-2 relative z-10">
        <div
          className="m-card !rounded-2xl p-3 flex gap-3 items-end"
          style={{ background: 'var(--bg-raised)', backdropFilter: 'blur(20px)' }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); toggleVoice(); }}
            aria-label={t("chat.speakAria")}
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 active:scale-95"
            style={{
              background: listening ? 'rgba(224,123,46,0.18)' : 'var(--card-bg)',
              border: listening ? '1.5px solid var(--saffron)' : '1px solid var(--hairline)',
              boxShadow: listening ? '0 0 24px rgba(224,123,46,0.25)' : 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={listening ? 'var(--saffron)' : 'var(--gold)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
              placeholder={t("chat.inputPlaceholder")}
              rows={1}
              className="w-full px-4 py-3 rounded-xl resize-none focus:outline-none text-sm"
              style={{
                background: 'var(--card-bg)',
                color: 'var(--ivory)',
                border: '1px solid var(--hairline)',
                fontFamily: kf,
              }}
              onFocus={() => { resetActivity(); isTypingRef.current = input.length > 0; }}
            />
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); isTypingRef.current = false; sendMessage(input); }}
            disabled={!input.trim() || sending}
            aria-label={t("chat.send")}
            className="m-btn m-btn-primary !min-h-[48px] !px-0 w-12 shrink-0 !rounded-full disabled:opacity-30 disabled:pointer-events-none"
          >
            <MuseumIcon name="arrowRight" size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 mt-2 text-[10px] tracking-[0.08em]" style={{ color: 'var(--ink-faint)', fontFamily: kf }}>
          <span>{t("chat.speakOrType")}</span>
          <span style={{ color: 'var(--hairline-strong)' }}>&middot;</span>
          <span>{t("chat.autoReset")}</span>
        </div>
      </div>
    </div>
  );
}
