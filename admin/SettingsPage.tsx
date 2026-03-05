import React, { useEffect, useState } from 'react';
import { fetchAutomationTokenStatus, fetchSettings, rotateAutomationToken, updateSettings } from '../services/api';

const SettingsPage: React.FC = () => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [tokenStatus, setTokenStatus] = useState<{ source: 'db' | 'env' | null; configured: boolean; last_rotated_at?: string | null } | null>(
    null
  );
  const [generatedToken, setGeneratedToken] = useState('');
  const [rotating, setRotating] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy');

  useEffect(() => {
    fetchSettings().then(setValues).catch(() => setValues({}));
    fetchAutomationTokenStatus().then(setTokenStatus).catch(() => setTokenStatus(null));
  }, []);

  const update = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }));

  const onSave = async () => {
    const updated = await updateSettings(values);
    setValues(updated);
  };

  const onRotateToken = async () => {
    setRotating(true);
    try {
      const next = await rotateAutomationToken();
      setGeneratedToken(next.token);
      const status = await fetchAutomationTokenStatus();
      setTokenStatus(status);
      setCopyLabel('Copy');
    } finally {
      setRotating(false);
    }
  };

  const onCopyToken = async () => {
    if (!generatedToken) return;
    try {
      await navigator.clipboard.writeText(generatedToken);
      setCopyLabel('Copied');
      setTimeout(() => setCopyLabel('Copy'), 1500);
    } catch {
      setCopyLabel('Copy failed');
      setTimeout(() => setCopyLabel('Copy'), 1500);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Settings</h1>
        <button onClick={onSave} className="bg-primary text-white px-4 py-2 rounded-lg text-sm">Save</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm" placeholder="GA4 Measurement ID" value={values.ga4_measurement_id || ''} onChange={(e) => update('ga4_measurement_id', e.target.value)} />
        <input className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm" placeholder="Site Name (AR)" value={values.site_name_ar || ''} onChange={(e) => update('site_name_ar', e.target.value)} />
        <input className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm" placeholder="Site Name (EN)" value={values.site_name_en || ''} onChange={(e) => update('site_name_en', e.target.value)} />
        <input className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm" placeholder="Default Language" value={values.default_language || ''} onChange={(e) => update('default_language', e.target.value)} />
      </div>
      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-bold">Automation Token</h2>
          <button onClick={onRotateToken} disabled={rotating} className="bg-primary text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60">
            {rotating ? 'Generating...' : tokenStatus?.configured ? 'Regenerate Token' : 'Generate Token'}
          </button>
        </div>
        <p className="text-xs opacity-80 mb-2">
          Source: <span className="font-semibold">{tokenStatus?.source || 'none'}</span>
          {tokenStatus?.last_rotated_at ? ` | Last rotated: ${new Date(tokenStatus.last_rotated_at).toLocaleString()}` : ''}
        </p>
        <p className="text-xs opacity-80 mb-3">Token يظهر مرة واحدة بعد التوليد. انسخه مباشرة إلى Opal secrets.</p>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            readOnly
            value={generatedToken}
            placeholder="اضغط Generate Token لإظهار التوكن"
            className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono"
          />
          <button onClick={onCopyToken} disabled={!generatedToken} className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-sm disabled:opacity-60">
            {copyLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
