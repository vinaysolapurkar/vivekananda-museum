"use client";

import { useState, useEffect } from "react";

interface Settings {
  [key: string]: string;
}

const btnPrimary: React.CSSProperties = { minHeight: 40, fontSize: "0.85rem", padding: "0 1.1rem" };
const labelStyle: React.CSSProperties = { color: "var(--ink-muted)" };

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveSetting = async (key: string, value: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setMsg(`Setting "${key}" updated!`);
      }
    } catch {
      setMsg("Error saving setting");
    } finally {
      setSaving(false);
    }
  };

  const changePin = async () => {
    if (newPin.length !== 6) {
      setMsg("PIN must be 6 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setMsg("PINs do not match");
      return;
    }
    await saveSetting("admin_pin", newPin);
    setNewPin("");
    setConfirmPin("");
    setMsg("PIN updated! (Note: takes effect after restart with new ADMIN_PIN env var)");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "var(--saffron)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="m-eyebrow mb-1">Administration</p>
      <h1 className="text-3xl mb-6" style={{ color: "var(--ivory)" }}>Settings</h1>

      {msg && (
        <div className="mb-4 px-4 py-2 rounded-lg text-sm" style={{ background: "rgba(212, 163, 79, 0.1)", border: "1px solid var(--hairline)", color: "var(--gold)" }}>{msg}</div>
      )}

      {/* PIN Change */}
      <div className="m-card p-6 mb-6">
        <h2 className="text-xl mb-4" style={{ color: "var(--ivory)" }}>Change Admin PIN</h2>
        <div className="space-y-3">
          <input
            type="password"
            maxLength={6}
            placeholder="New PIN (6 digits)"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
            className="w-full px-3 py-2 font-mono"
          />
          <input
            type="password"
            maxLength={6}
            placeholder="Confirm PIN"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
            className="w-full px-3 py-2 font-mono"
          />
          <button
            onClick={changePin}
            disabled={saving}
            className="m-btn m-btn-primary disabled:opacity-50"
            style={btnPrimary}
          >
            Update PIN
          </button>
        </div>
      </div>

      {/* Language Settings */}
      <div className="m-card p-6 mb-6">
        <h2 className="text-xl mb-4" style={{ color: "var(--ivory)" }}>Default Language</h2>
        <select
          value={settings.default_language || "en"}
          onChange={(e) => saveSetting("default_language", e.target.value)}
          className="w-full px-3 py-2"
        >
          <option value="en">English</option>
          <option value="kn">Kannada</option>
          <option value="hi">Hindi</option>
        </select>
      </div>

      {/* Kiosk Settings */}
      <div className="m-card p-6 mb-6">
        <h2 className="text-xl mb-4" style={{ color: "var(--ivory)" }}>Kiosk Settings</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1" style={labelStyle}>
              Inactivity timeout (seconds)
            </label>
            <input
              type="number"
              value={settings.kiosk_inactivity_timeout || "300"}
              onChange={(e) => saveSetting("kiosk_inactivity_timeout", e.target.value)}
              className="w-full px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={labelStyle}>
              Default slide duration (seconds)
            </label>
            <input
              type="number"
              value={settings.default_slide_duration || "10"}
              onChange={(e) => saveSetting("default_slide_duration", e.target.value)}
              className="w-full px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Quiz Settings */}
      <div className="m-card p-6">
        <h2 className="text-xl mb-4" style={{ color: "var(--ivory)" }}>Quiz Settings</h2>
        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>
            Certificate Vivekananda Quote
          </label>
          <textarea
            rows={3}
            value={
              settings.certificate_quote ||
              "Arise, awake, and stop not till the goal is reached."
            }
            onChange={(e) => saveSetting("certificate_quote", e.target.value)}
            className="w-full px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
}
