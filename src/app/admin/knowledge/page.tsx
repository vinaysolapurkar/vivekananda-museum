"use client";

import { useState, useEffect, useRef } from "react";
import MuseumIcon from "@/components/MuseumIcon";

interface Doc {
  id: number;
  title: string;
  document_type: string;
  content: string;
  is_active: number;
  created_at: string;
}

const btnPrimary: React.CSSProperties = { minHeight: 40, fontSize: "0.85rem", padding: "0 1.1rem" };
const btnSmall: React.CSSProperties = { minHeight: 30, fontSize: "0.75rem", padding: "0 0.7rem" };
const btnDanger: React.CSSProperties = { ...btnSmall, background: "#9B3D34", color: "var(--ivory)" };

export default function AdminKnowledge() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [addingText, setAddingText] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = () => {
    setLoading(true);
    fetch("/api/chat/documents")
      .then((r) => r.json())
      .then((d) => setDocs(d.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, []);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", file.name.replace(/\.[^.]+$/, ""));
    try {
      const res = await fetch("/api/chat/upload", { method: "POST", body: fd });
      if (res.ok) {
        setMsg("Document uploaded and indexed!");
        fetchDocs();
      } else {
        const d = await res.json();
        setMsg(d.error || "Upload failed");
      }
    } catch {
      setMsg("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const addText = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setUploading(true);
    try {
      const fd = new FormData();
      const blob = new Blob([newContent], { type: "text/plain" });
      const file = new File([blob], `${newTitle}.txt`, { type: "text/plain" });
      fd.append("file", file);
      fd.append("title", newTitle);
      const res = await fetch("/api/chat/upload", { method: "POST", body: fd });
      if (res.ok) {
        setMsg("Content added!");
        setNewTitle("");
        setNewContent("");
        setAddingText(false);
        fetchDocs();
      }
    } catch {
      setMsg("Failed to add");
    } finally {
      setUploading(false);
    }
  };

  const deleteDoc = async (id: number) => {
    if (!confirm("Delete this document?")) return;
    await fetch("/api/chat/documents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchDocs();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="m-eyebrow mb-1">Speak with Swamiji</p>
          <h1 className="text-3xl" style={{ color: "var(--ivory)" }}>Chat Knowledge Base</h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
            Documents the AI chatbot uses to answer questions about Vivekananda
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAddingText(true)} className="m-btn m-btn-ghost" style={btnPrimary}>
            + Add Text
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="m-btn m-btn-primary disabled:opacity-50"
            style={btnPrimary}
          >
            {uploading ? "Uploading..." : "+ Upload PDF/TXT"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2 rounded-lg text-sm" style={{ background: "rgba(212, 163, 79, 0.1)", border: "1px solid var(--hairline)", color: "var(--gold)" }}>{msg}</div>
      )}

      {/* Add text form */}
      {addingText && (
        <div className="m-card p-6 mb-6">
          <h3 className="text-xl mb-4" style={{ color: "var(--ivory)" }}>
            Add Knowledge Entry
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Title (e.g., Chicago Speech 1893)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm"
            />
            <textarea
              rows={6}
              placeholder="Paste the content here... The chatbot will use this to answer visitor questions."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full px-4 py-2.5 text-sm"
            />
            <div className="flex gap-2">
              <button onClick={addText} disabled={uploading} className="m-btn m-btn-primary disabled:opacity-50" style={btnPrimary}>
                Save
              </button>
              <button onClick={() => setAddingText(false)} className="m-btn m-btn-ghost" style={btnPrimary}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "var(--saffron)", borderTopColor: "transparent" }} />
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--ink-muted)" }}>
          <p className="text-lg mb-2">No documents yet</p>
          <p className="text-sm">Upload PDFs or add text entries for the chatbot to learn from</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div key={doc.id} className="m-card p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(224, 123, 46, 0.12)", border: "1px solid var(--hairline)", color: "var(--saffron)" }}>
                <MuseumIcon name="scroll" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: "var(--ivory)" }}>{doc.title}</p>
                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--ink-muted)" }}>
                  {doc.content?.substring(0, 150)}...
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--gold)" }}>
                  {doc.document_type.toUpperCase()} &middot; Added {doc.created_at?.split("T")[0]}
                </p>
              </div>
              <button onClick={() => deleteDoc(doc.id)} className="m-btn shrink-0" style={btnDanger}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
