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
  number: 0,
  title_en: "",
  title_kn: "",
  title_hi: "",
  description_en: "",
  description_kn: "",
  description_hi: "",
  gallery_zone: "",
};

const zones = [
  "Childhood & Early Life",
  "Spiritual Quest",
  "Chicago Parliament of Religions",
  "Back to India & Work",
  "Founding of Ramakrishna Mission",
  "Teachings & Philosophy",
  "Last Days & Legacy",
];

export default function AdminStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [editing, setEditing] = useState<Partial<Station> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchStations = () => {
    setLoading(true);
    fetch("/api/audio/stations")
      .then((r) => r.json())
      .then((d) => setStations(d.stations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStations(); }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setMsg("");
    try {
      const isNew = !editing.id;
      const res = await fetch(
        isNew ? "/api/audio/stations" : `/api/audio/stations/${editing.number}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        }
      );
      if (res.ok) {
        setMsg("Saved!");
        setEditing(null);
        fetchStations();
      } else {
        const d = await res.json();
        setMsg(d.error || "Failed to save");
      }
    } catch {
      setMsg("Error saving");
    } finally {
      setSaving(false);
    }
  };

  const deleteStation = async (station: Station) => {
    if (!confirm(`Delete station ${station.number}?`)) return;
    await fetch(`/api/audio/stations/${station.number}`, { method: "DELETE" });
    fetchStations();
  };

  const uploadAudio = async (stationNumber: number, lang: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("station_number", String(stationNumber));
    fd.append("lang", lang);
    const res = await fetch("/api/audio/upload", { method: "POST", body: fd });
    if (res.ok) {
      setMsg(`Audio uploaded for station ${stationNumber} (${lang})`);
      fetchStations();
    } else {
      setMsg("Upload failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-primary">Audio Stations</h1>
        <button
          onClick={() => setEditing({ ...defaultStation })}
          className="px-4 py-2 bg-saffron text-white rounded-lg font-medium hover:bg-saffron-dark transition-colors"
        >
          + Add Station
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2 bg-accent/10 text-accent-light rounded-lg text-sm">
          {msg}
        </div>
      )}

      {/* Edit/Create Form */}
      {editing && (
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">
            {editing.id ? `Edit Station ${editing.number}` : "New Station"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Station Number</label>
              <input
                type="number"
                value={editing.number || ""}
                onChange={(e) => setEditing({ ...editing, number: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Gallery Zone</label>
              <select
                value={editing.gallery_zone || ""}
                onChange={(e) => setEditing({ ...editing, gallery_zone: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">Select zone</option>
                {zones.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Title (English)</label>
              <input
                type="text"
                value={editing.title_en || ""}
                onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Title (Kannada)</label>
              <input
                type="text"
                value={editing.title_kn || ""}
                onChange={(e) => setEditing({ ...editing, title_kn: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Title (Hindi)</label>
              <input
                type="text"
                value={editing.title_hi || ""}
                onChange={(e) => setEditing({ ...editing, title_hi: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-muted mb-1">Description (English)</label>
              <textarea
                rows={3}
                value={editing.description_en || ""}
                onChange={(e) => setEditing({ ...editing, description_en: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-muted mb-1">Description (Kannada)</label>
              <textarea
                rows={3}
                value={editing.description_kn || ""}
                onChange={(e) => setEditing({ ...editing, description_kn: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-muted mb-1">Description (Hindi)</label>
              <textarea
                rows={3}
                value={editing.description_hi || ""}
                onChange={(e) => setEditing({ ...editing, description_hi: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={save}
              disabled={saving}
              className="px-6 py-2 bg-primary text-text-light rounded-lg font-medium disabled:opacity-50 hover:bg-primary-light transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setEditing(null)}
              className="px-6 py-2 border border-border rounded-lg text-text-muted hover:bg-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stations List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stations.length === 0 ? (
        <p className="text-center text-text-muted py-10">No stations yet. Add your first station above.</p>
      ) : (
        <div className="space-y-3">
          {stations.map((s) => (
            <div key={s.id} className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 bg-primary text-text-light rounded-lg flex items-center justify-center font-bold">
                    {s.number}
                  </span>
                  <div>
                    <p className="font-semibold text-text-dark">{s.title_en || "Untitled"}</p>
                    <p className="text-xs text-text-muted">{s.gallery_zone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(s)}
                    className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-surface transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteStation(s)}
                    className="px-3 py-1 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {/* Audio uploads */}
              <div className="mt-3 flex gap-3 flex-wrap">
                {(["en", "kn", "hi"] as const).map((lang) => {
                  const key = `audio_${lang}_url` as keyof Station;
                  const hasAudio = !!s[key];
                  return (
                    <label
                      key={lang}
                      className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        hasAudio
                          ? "bg-accent/10 text-accent border-accent/30"
                          : "bg-surface text-text-muted border-border hover:border-primary/30"
                      }`}
                    >
                      {hasAudio ? `✓ ${lang.toUpperCase()}` : `+ ${lang.toUpperCase()} audio`}
                      <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadAudio(s.number, lang, file);
                        }}
                      />
                    </label>
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
