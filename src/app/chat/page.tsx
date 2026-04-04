"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

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
      text: "Namaste! I am here to share the wisdom and life of Swami Vivekananda. Ask me anything about his teachings, travels, or philosophy.",
    },
  ]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<Lang>("en");
  const [sessionId, setSessionId] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;

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
          text: data.answer || "I could not find an answer to that question.",
          sources: data.sources,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const toggleVoice = () => {
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
      alert("Speech recognition not supported in this browser");
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

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div className="flex flex-col h-screen bg-surface-dark">
      {/* Header */}
      <header className="bg-primary text-text-light px-4 py-3 flex items-center justify-between shrink-0">
        <Link href="/" className="text-saffron text-2xl">←</Link>
        <div className="text-center">
          <h1 className="text-lg font-heading font-semibold">Ask Vivekananda</h1>
          <div className="flex gap-2 justify-center mt-1">
            {(["en", "kn", "hi"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-0.5 rounded text-xs ${
                  lang === l ? "bg-saffron text-white" : "bg-white/10 text-white/60"
                }`}
              >
                {l === "en" ? "EN" : l === "kn" ? "KN" : "HI"}
              </button>
            ))}
          </div>
        </div>
        <div className="w-8" />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-text-light rounded-br-md"
                  : "bg-white text-text-dark rounded-bl-md shadow-sm"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-saffron flex items-center justify-center text-xs text-white font-bold">
                    V
                  </div>
                  <span className="text-xs text-text-muted font-medium">Vivekananda</span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-text-muted">
                    Sources: {msg.sources.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-border p-3 shrink-0">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <button
            onClick={toggleVoice}
            className={`touch-target w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors shrink-0 ${
              listening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-surface text-primary hover:bg-border"
            }`}
          >
            🎤
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Type your question..."
            className="flex-1 px-4 py-3 border border-border rounded-xl bg-surface text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || sending}
            className="touch-target w-12 h-12 rounded-full bg-saffron text-white flex items-center justify-center text-xl disabled:opacity-40 hover:bg-saffron-dark transition-colors shrink-0"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
