"use client";

import { useState, useEffect, useRef } from "react";

interface Doc {
  id: number;
  title: string;
  document_type: string;
  content: string;
  is_active: number;
  created_at: string;
}

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
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#2C1810' }}>
            Chat Knowledge Base
          </h1>
          <p className="text-sm" style={{ color: '#8B7B6B' }}>
            Documents the AI chatbot uses to answer questions about Vivekananda
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAddingText(true)}
            className="px-4 py-2 rounded-lg font-medium text-sm" 
            style={{ background: '#5B7B5E', color: 'white' }}
          >
            + Add Text
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
            style={{ background: '#E07B2E', color: 'white' }}
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
        <div className="mb-4 px-4 py-2 rounded-lg text-sm" style={{ background: '#5B7B5E20', color: '#5B7B5E' }}>{msg}</div>
      )}

      {/* Add text form */}
      {addingText && (
        <div className="card-spiritual p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#2C1810' }}>
            Add Knowledge Entry
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Title (e.g., Chicago Speech 1893)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg text-sm"
              style={{ borderColor: '#E8D8C8' }}
            />
            <textarea
              rows={6}
              placeholder="Paste the content here... The chatbot will use this to answer visitor questions."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg text-sm"
              style={{ borderColor: '#E8D8C8' }}
            />
            <div className="flex gap-2">
              <button onClick={addText} disabled={uploading} className="px-6 py-2 rounded-lg font-medium text-sm text-white" style={{ background: '#7B2D26' }}>
                Save
              </button>
              <button onClick={() => setAddingText(false)} className="px-6 py-2 rounded-lg text-sm border" style={{ borderColor: '#E8D8C8', color: '#8B7B6B' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E07B2E', borderTopColor: 'transparent' }} />
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#8B7B6B' }}>
          <p className="text-lg mb-2">No documents yet</p>
          <p className="text-sm">Upload PDFs or add text entries for the chatbot to learn from</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div key={doc.id} className="card-spiritual p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: '#E07B2E15', color: '#E07B2E' }}>
                {doc.document_type === 'pdf' ? '📄' : '📝'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: '#2C1810' }}>{doc.title}</p>
                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#8B7B6B' }}>
                  {doc.content?.substring(0, 150)}...
                </p>
                <p className="text-xs mt-1" style={{ color: '#C8963E' }}>
                  {doc.document_type.toUpperCase()} &middot; Added {doc.created_at?.split('T')[0]}
                </p>
              </div>
              <button
                onClick={() => deleteDoc(doc.id)}
                className="px-3 py-1.5 text-xs rounded-lg border hover:bg-red-50 shrink-0"
                style={{ borderColor: '#E8D8C8', color: '#C06520' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
