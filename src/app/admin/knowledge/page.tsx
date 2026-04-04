"use client";

import { useState, useEffect } from "react";

interface Document {
  id: number;
  title: string;
  document_type: string;
  file_url: string;
  indexed_at: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminKnowledge() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");

  const fetchDocs = () => {
    setLoading(true);
    fetch("/api/chat/info")
      .then((r) => r.json())
      .then(() => {
        // The info endpoint doesn't list docs, so let's query directly
        // For now we'll use a simple approach
        return fetch("/api/chat/health");
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch actual documents from a direct query approach
    fetch("/api/chat/upload", { method: "GET" })
      .then((r) => r.json())
      .then((d) => setDocs(d.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, []);

  const upload = async () => {
    if (!file || !title) return;
    setUploading(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title);
      const res = await fetch("/api/chat/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setMsg("Document uploaded and indexed!");
        setTitle("");
        setFile(null);
        fetchDocs();
      } else {
        setMsg(data.error || "Upload failed");
      }
    } catch {
      setMsg("Error uploading");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-heading font-bold text-primary mb-6">Knowledge Base</h1>

      {msg && (
        <div className="mb-4 px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm">{msg}</div>
      )}

      {/* Upload Form */}
      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Upload Document</h2>
        <p className="text-sm text-text-muted mb-4">
          Upload PDFs of Vivekananda&apos;s works to power the AI chatbot.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
          />
          <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg hover:border-primary transition-colors">
            <span className="text-text-muted text-sm">
              {file ? file.name : "Choose PDF file..."}
            </span>
            <input
              type="file"
              accept=".pdf,.txt,.doc"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
        <button
          onClick={upload}
          disabled={!file || !title || uploading}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary-light transition-colors"
        >
          {uploading ? "Uploading..." : "Upload & Index"}
        </button>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-text-muted">No documents in knowledge base yet.</p>
          <p className="text-sm text-text-muted mt-1">Upload PDFs above to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((d) => (
            <div key={d.id} className="bg-white border border-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-semibold text-text-dark">{d.title}</p>
                  <p className="text-xs text-text-muted">
                    {d.document_type.toUpperCase()} · {d.indexed_at ? "Indexed" : "Pending"}
                  </p>
                </div>
              </div>
              <span className={`w-2.5 h-2.5 rounded-full ${d.is_active ? "bg-accent" : "bg-border"}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
