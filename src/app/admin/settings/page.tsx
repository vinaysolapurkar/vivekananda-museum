"use client";

import { useState, useEffect } from "react";

interface Settings {
  [key: string]: string;
}

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
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-heading font-bold text-primary mb-6">Settings</h1>

      {msg && (
        <div className="mb-4 px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm">{msg}</div>
      )}

      {/* PIN Change */}
      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Change Admin PIN</h2>
        <div className="space-y-3">
          <input
            type="password"
            maxLength={6}
            placeholder="New PIN (6 digits)"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary font-mono"
          />
          <input
            type="password"
            maxLength={6}
            placeholder="Confirm PIN"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary font-mono"
          />
          <button
            onClick={changePin}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary-light transition-colors"
          >
            Update PIN
          </button>
        </div>
      </div>

      {/* Language Settings */}
      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Default Language</h2>
        <select
          value={settings.default_language || "en"}
          onChange={(e) => saveSetting("default_language", e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
        >
          <option value="en">English</option>
          <option value="kn">Kannada</option>
          <option value="hi">Hindi</option>
        </select>
      </div>

      {/* Kiosk Settings */}
      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Kiosk Settings</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">
              Inactivity timeout (seconds)
            </label>
            <input
              type="number"
              value={settings.kiosk_inactivity_timeout || "60"}
              onChange={(e) => saveSetting("kiosk_inactivity_timeout", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">
              Default slide duration (seconds)
            </label>
            <input
              type="number"
              value={settings.default_slide_duration || "10"}
              onChange={(e) => saveSetting("default_slide_duration", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Quiz Settings */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Quiz Settings</h2>
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Certificate Vivekananda Quote
          </label>
          <textarea
            rows={3}
            value={
              settings.certificate_quote ||
              "Arise, awake, and stop not till the goal is reached."
            }
            onChange={(e) => saveSetting("certificate_quote", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
}
