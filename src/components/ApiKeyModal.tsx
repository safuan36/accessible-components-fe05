import React, { useState, useEffect, useRef } from 'react';
import { X, Key, ShieldCheck, Check, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { AIProviderConfig, AIProvider } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIProviderConfig;
  onSaveConfig: (newConfig: AIProviderConfig) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [provider, setProvider] = useState<AIProvider>(config.provider);
  const [anthropicKey, setAnthropicKey] = useState(config.anthropicKey || '');
  const [geminiKey, setGeminiKey] = useState(config.geminiKey || '');
  const [anthropicModel, setAnthropicModel] = useState(config.anthropicModel || 'claude-3-5-sonnet-20241022');
  const [geminiModel, setGeminiModel] = useState(config.geminiModel || 'gemini-1.5-flash');

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setProvider(config.provider);
      setAnthropicKey(config.anthropicKey || '');
      setGeminiKey(config.geminiKey || '');
      setAnthropicModel(config.anthropicModel || 'claude-3-5-sonnet-20241022');
      setGeminiModel(config.geminiModel || 'gemini-1.5-flash');
      setTestStatus('idle');
      setTestMessage('');

      setTimeout(() => {
        const firstFocus = modalRef.current?.querySelector('button') as HTMLElement;
        firstFocus?.focus();
      }, 50);
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen, config]);

  // Escape to close & focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Testing API credentials...');

    if (provider === 'demo') {
      await new Promise((r) => setTimeout(r, 400));
      setTestStatus('success');
      setTestMessage('High-Fidelity Demo Simulation Engine is fully operational! (0ms external latency)');
      return;
    }

    if (provider === 'anthropic') {
      if (!anthropicKey.trim()) {
        setTestStatus('error');
        setTestMessage('Please enter an Anthropic API key.');
        return;
      }

      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey.trim(),
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: anthropicModel,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Ping' }]
          })
        });

        if (res.ok) {
          setTestStatus('success');
          setTestMessage(`Successfully authenticated with Anthropic ${anthropicModel}!`);
        } else {
          const errData = await res.json().catch(() => ({}));
          setTestStatus('error');
          setTestMessage(errData.error?.message || `HTTP ${res.status}: Authentication failed.`);
        }
      } catch (err: any) {
        setTestStatus('error');
        setTestMessage(err.message || 'Network connection error connecting to Anthropic API.');
      }
    } else if (provider === 'gemini') {
      if (!geminiKey.trim()) {
        setTestStatus('error');
        setTestMessage('Please enter a Google Gemini API key.');
        return;
      }

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(
          geminiKey.trim()
        )}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
            generationConfig: { maxOutputTokens: 10 }
          })
        });

        if (res.ok) {
          setTestStatus('success');
          setTestMessage(`Successfully authenticated with Google Gemini (${geminiModel})!`);
        } else {
          const errData = await res.json().catch(() => ({}));
          setTestStatus('error');
          setTestMessage(errData.error?.message || `HTTP ${res.status}: Authentication failed.`);
        }
      } catch (err: any) {
        setTestStatus('error');
        setTestMessage(err.message || 'Network error connecting to Google Gemini.');
      }
    }
  };

  const handleSave = () => {
    onSaveConfig({
      provider,
      anthropicKey: anthropicKey.trim() || undefined,
      geminiKey: geminiKey.trim() || undefined,
      anthropicModel,
      geminiModel
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-modal-title"
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <Key className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="api-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                AI Engine & API Configuration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose between Demo Simulator, Anthropic Claude, or Google Gemini
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close API configuration"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Security Notice */}
          <div className="flex items-start gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Client-Side BYOK Security Guarantee</p>
              <p className="mt-0.5 text-emerald-800/90 dark:text-emerald-300">
                API keys are stored strictly in your browser's local storage and sent directly to Anthropic/Google. No external intermediary or proxy ever sees your credentials.
              </p>
            </div>
          </div>

          {/* Provider Selector Cards */}
          <div>
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select AI Engine:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Demo Mode */}
              <button
                type="button"
                onClick={() => setProvider('demo')}
                className={`p-3 text-left rounded-2xl border transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  provider === 'demo'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Demo Engine</span>
                  {provider === 'demo' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Instant, high-fidelity curriculum generation. Zero API keys required.
                </p>
              </button>

              {/* Claude */}
              <button
                type="button"
                onClick={() => setProvider('anthropic')}
                className={`p-3 text-left rounded-2xl border transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  provider === 'anthropic'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Anthropic Claude</span>
                  {provider === 'anthropic' && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Claude 3.5 Sonnet / Haiku. Deep reasoning and cognitive mastery.
                </p>
              </button>

              {/* Gemini */}
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`p-3 text-left rounded-2xl border transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  provider === 'gemini'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Google Gemini</span>
                  {provider === 'gemini' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Gemini 1.5 / 2.0 Flash. Ultra-fast structured JSON response.
                </p>
              </button>
            </div>
          </div>

          {/* Provider Specific Inputs */}
          {provider === 'anthropic' && (
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="anthropic-key-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Anthropic API Key (sk-ant-...) *
                  </label>
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  id="anthropic-key-input"
                  type="password"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label htmlFor="anthropic-model-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Claude Model:
                </label>
                <select
                  id="anthropic-model-select"
                  value={anthropicModel}
                  onChange={(e) => setAnthropicModel(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended - Deepest pedagogical reasoning)</option>
                  <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Fastest response)</option>
                </select>
              </div>
            </div>
          )}

          {provider === 'gemini' && (
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="gemini-key-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Google Gemini API Key (AIza...) *
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Get Key (Free Tier)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  id="gemini-key-input"
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="gemini-model-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Gemini Model:
                </label>
                <select
                  id="gemini-model-select"
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended - Instant structured JSON)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-gen frontier)</option>
                </select>
              </div>
            </div>
          )}

          {/* Test Status Feedback */}
          {testMessage && (
            <div
              role="alert"
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testStatus === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              {testStatus === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
