"use client";

import { useState, useEffect } from "react";

interface Station {
  id: number;
  number: number;
  title_en: string;
  title_kn: string;
  title_hi: string;
  description_en: string;
  description_kn: string;
  description_hi: string;
  gallery_zone: string;
  audio_en_url: string;
  audio_kn_url: string;
  audio_hi_url: string;
}

const defaultStation = {
  number: 0, title_en: "", title_kn: "", title_hi: "",
  description_en: "", description_kn: "", description_hi: "", gallery_zone: "",
};

const zones = [
  "Childhood & Early Life", "Spiritual Quest", "Chicago Parliament of Religions",
  "Back to India & Work", "Founding of Ramakrishna Mission", "Teachings & Philosophy", "Last Days & Legacy",
];

const langLabels: Record<string, string> = { en: "English", kn: "ಕನ್ನಡ", hi: "हिन्दी" };

const btnPrimary: React.CSSProperties = { minHeight: 40, fontSize: "0.85rem", padding: "0 1.1rem" };
const btnSmall: React.CSSProperties = { minHeight: 34, fontSize: "0.8rem", padding: "0 0.85rem" };
const btnDanger: React.CSSProperties = { ...btnSmall, background: "#9B3D34", color: "var(--ivory)" };
const labelStyle: React.CSSProperties = { color: "var(--ink-muted)" };

export default function AdminStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [editing, setEditing] = useState<Partial<Station> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  const fetchStations = () => {
    setLoading(true);
    fetch("/api/audio/stations?all=true")
      .then((r) => r.json())
      .then((d) => setStations(d.stations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStations(); }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true); setMsg("");
    try {
      const isNew = !editing.id;
      const res = await fetch(isNew ? "/api/audio/stations" : `/api/audio/stations/${editing.number}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (res.ok) { setMsg("Saved!"); setEditing(null); fetchStations(); }
      else { const d = await res.json(); setMsg(d.error || "Failed"); }
    } catch { setMsg("Error saving"); }
    finally { setSaving(false); }
  };

  const deleteStation = async (s: Station) => {
    if (!confirm(`Delete station ${s.number}?`)) return;
    await fetch(`/api/audio/stations/${s.number}`, { method: "DELETE" });
    fetchStations();
  };

  const uploadAudio = async (stationNumber: number, lang: string, file: File) => {
    setMsg(`Uploading ${lang.toUpperCase()} audio for station ${stationNumber}...`);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("station_number", String(stationNumber));
    fd.append("lang", lang);
    const res = await fetch("/api/audio/upload", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      setMsg(`✓ Uploaded ${lang.toUpperCase()} (${(data.size / 1024).toFixed(1)} KB)`);
      fetchStations();
    } else {
      const d = await res.json().catch(() => ({}));
      setMsg(`✗ Upload failed: ${d.error || "Unknown error"}`);
    }
  };

  const deleteAudio = async (stationNumber: number, lang: string) => {
    if (!confirm(`Delete ${lang.toUpperCase()} audio for station ${stationNumber}?`)) return;
    // Update DB to clear audio URL
    await fetch(`/api/audio/stations/${stationNumber}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [`audio_${lang}_url`]: "" }),
    });
    setMsg(`Deleted ${lang.toUpperCase()} audio`);
    fetchStations();
  };

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px",
    width: "100%",
    fontSize: "14px",
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="m-eyebrow mb-1">Audio Guide</p>
          <h1 className="text-3xl" style={{ color: "var(--ivory)" }}>Audio Stations</h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
            Manage numbered stations for the audio guide
          </p>
        </div>
        <button onClick={() => setEditing({ ...defaultStation })} className="m-btn m-btn-primary" style={btnPrimary}>
          + Add Station
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2 rounded-lg text-sm" style={{
          background: msg.startsWith("✗") ? "rgba(155, 61, 52, 0.18)" : "rgba(212, 163, 79, 0.1)",
          border: "1px solid var(--hairline)",
          color: msg.startsWith("✗") ? "#D9776B" : "var(--gold)",
        }}>{msg}</div>
      )}

      {/* Edit Form */}
      {editing && (
        <div className="m-card p-6 mb-6">
          <h2 className="text-xl mb-4" style={{ color: "var(--ivory)" }}>
            {editing.id ? `Edit Station ${editing.number}` : "New Station"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Station Number</label>
              <input type="number" value={editing.number || ""} style={inputStyle}
                onChange={(e) => setEditing({ ...editing, number: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Gallery Zone</label>
              <select value={editing.gallery_zone || ""} style={inputStyle}
                onChange={(e) => setEditing({ ...editing, gallery_zone: e.target.value })}>
                <option value="">Select zone</option>
                {zones.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Title (English)</label>
              <input type="text" value={editing.title_en || ""} style={inputStyle}
                onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Title (ಕನ್ನಡ)</label>
              <input type="text" value={editing.title_kn || ""} style={inputStyle}
                onChange={(e) => setEditing({ ...editing, title_kn: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Title (हिन्दी)</label>
              <input type="text" value={editing.title_hi || ""} style={inputStyle}
                onChange={(e) => setEditing({ ...editing, title_hi: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Description (English)</label>
              <textarea rows={3} value={editing.description_en || ""} style={{ ...inputStyle, resize: "vertical" as const }}
                onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Description (ಕನ್ನಡ)</label>
              <textarea rows={3} value={editing.description_kn || ""} style={{ ...inputStyle, resize: "vertical" as const }}
                onChange={(e) => setEditing({ ...editing, description_kn: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving} className="m-btn m-btn-primary disabled:opacity-50" style={btnPrimary}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditing(null)} className="m-btn m-btn-ghost" style={btnPrimary}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stations List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "var(--saffron)", borderTopColor: "transparent" }} />
        </div>
      ) : stations.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--ink-muted)" }}>
          <p className="text-lg mb-2">No stations yet</p>
          <p className="text-sm">Add your first station to start building the audio guide</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stations.map((s) => (
            <div key={s.id} className="m-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                    style={{ background: "rgba(224, 123, 46, 0.14)", border: "1px solid var(--hairline-strong)", color: "var(--saffron)" }}>
                    {s.number}
                  </span>
                  <div>
                    <p className="font-semibold" style={{ color: "var(--ivory)" }}>{s.title_en || "Untitled"}</p>
                    {s.title_kn && <p className="text-xs" style={{ color: "var(--ink-muted)" }}>{s.title_kn}</p>}
                    <p className="text-xs mt-0.5" style={{ color: "var(--gold)" }}>{s.gallery_zone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(s)} className="m-btn m-btn-ghost" style={btnSmall}>
                    Edit
                  </button>
                  <button onClick={() => deleteStation(s)} className="m-btn" style={btnDanger}>
                    Delete
                  </button>
                </div>
              </div>

              {/* Audio per language */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["en", "kn", "hi"] as const).map((lang) => {
                  const key = `audio_${lang}_url` as keyof Station;
                  const audioUrl = s[key] as string;
                  const hasAudio = !!audioUrl;

                  return (
                    <div key={lang} className="rounded-xl p-3" style={{
                      background: hasAudio ? "rgba(122, 158, 125, 0.08)" : "var(--card-bg)",
                      border: `1px solid ${hasAudio ? "rgba(122, 158, 125, 0.3)" : "var(--hairline)"}`,
                    }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold" style={{ color: hasAudio ? "#7A9E7D" : "var(--ink-muted)" }}>
                          {langLabels[lang]}
                        </span>
                        <span className="text-xs" style={{ color: hasAudio ? "#7A9E7D" : "var(--ink-faint)" }}>
                          {hasAudio ? "✓ Uploaded" : "No audio"}
                        </span>
                      </div>

                      {hasAudio && (
                        <div className="mb-2">
                          {/* Audio player */}
                          <audio
                            src={audioUrl}
                            controls
                            className="w-full h-8"
                            style={{ borderRadius: "8px" }}
                            onPlay={() => setPlayingUrl(audioUrl)}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => deleteAudio(s.number, lang)}
                              className="text-xs px-2 py-1 rounded"
                              style={{ background: "rgba(155, 61, 52, 0.2)", color: "#D9776B" }}
                            >
                              Delete audio
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Upload button */}
                      <label className="block cursor-pointer text-center py-2 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          background: hasAudio ? "transparent" : "rgba(224, 123, 46, 0.1)",
                          color: "var(--saffron)",
                          border: `1px dashed ${hasAudio ? "var(--hairline)" : "rgba(224, 123, 46, 0.4)"}`,
                        }}>
                        {hasAudio ? "Replace audio" : "Upload audio"}
                        <input
                          type="file"
                          accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadAudio(s.number, lang, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
