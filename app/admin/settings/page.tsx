'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Settings, Power, MessageSquare, Bell } from 'lucide-react';

interface PopupSettingsData {
  popup_enabled: boolean;
  popup_title: string;
  popup_message: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PopupSettingsData>({
    popup_enabled: true,
    popup_title: 'Open Recruitment 2026',
    popup_message: 'Bergabung dengan Tim APM Polinema!',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();

        if (res.ok && data.data) {
          setSettings({
            popup_enabled: data.data.popup_enabled ?? true,
            popup_title: data.data.popup_title || 'Open Recruitment 2026',
            popup_message: data.data.popup_message || 'Bergabung dengan Tim APM Polinema!',
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan pengaturan');
      }

      setSuccess('Pengaturan berhasil disimpan!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-main">Pengaturan Website</h1>
          <p className="text-text-muted">Kelola pengaturan popup dan tampilan website</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Popup Recruitment Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-main">Popup Recruitment</h2>
              <p className="text-sm text-text-muted">Pengaturan popup rekrutmen yang muncul di homepage</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Toggle Popup */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${settings.popup_enabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <Power className={`w-5 h-5 ${settings.popup_enabled ? 'text-green-600' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className="font-medium text-text-main">Status Popup</p>
                  <p className="text-sm text-text-muted">
                    {settings.popup_enabled ? 'Popup aktif ditampilkan di homepage' : 'Popup tidak ditampilkan'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, popup_enabled: !s.popup_enabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.popup_enabled ? 'bg-primary' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.popup_enabled ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

            {/* Popup Title */}
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Judul Popup
              </label>
              <input
                type="text"
                value={settings.popup_title}
                onChange={(e) => setSettings(s => ({ ...s, popup_title: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Open Recruitment 2026"
              />
            </div>

            {/* Popup Message */}
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Pesan Popup
              </label>
              <textarea
                value={settings.popup_message}
                onChange={(e) => setSettings(s => ({ ...s, popup_message: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Bergabung dengan Tim APM Polinema!"
              />
            </div>

            {/* Preview Box */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-xs text-text-muted mb-2 uppercase tracking-wider font-medium">Preview</p>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-primary font-semibold mb-1">{settings.popup_title || 'Open Recruitment 2026'}</p>
                <p className="text-xs text-text-muted">{settings.popup_message || 'Bergabung dengan Tim APM Polinema!'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
