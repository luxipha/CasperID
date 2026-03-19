
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone } from 'lucide-react';
import { CasperIDModal } from '../../../sdk/packages/react/src/CasperIDModal';
import '../../../sdk/packages/react/src/index.css';
import type { Screen } from '../../../sdk/packages/react/src/types';

// Safe way to access import.meta.env to avoid lint errors
const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

interface BusinessApp {
    app_id: string;
    name: string;
    environment: 'sandbox' | 'production';
}

async function fetchWithAuth(path: string, opts: RequestInit = {}) {
    const cookie = document.cookie;
    const sessionToken = cookie.match(/casperid_session=([^;]+)/)?.[1]
        || localStorage.getItem('casperid_token')
        || '';
    return fetch(`${API_BASE}${path}`, {
        ...opts,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
            ...opts.headers
        }
    });
}

const SDKDesign: React.FC = () => {
    const [apps, setApps] = useState<BusinessApp[]>([]);
    const [selectedAppId, setSelectedAppId] = useState<string>('');
    const [isLoadingApps, setIsLoadingApps] = useState(true);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

    const [primaryColor, setPrimaryColor] = useState('#8651e1');
    const [borderRadius, setBorderRadius] = useState('12');
    const [fontFamily, setFontFamily] = useState('Inter');
    const [logoUrl, setLogoUrl] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [isDark, setIsDark] = useState(false);
    const [language, setLanguage] = useState('EN');
    const [layout, setLayout] = useState<'auto' | 'modal' | 'fullscreen'>('auto');
    const [platform, setPlatform] = useState<'desktop' | 'mobile'>('desktop');
    const [showError, setShowError] = useState(false);

    // Load apps list on mount
    const loadApps = useCallback(async () => {
        setIsLoadingApps(true);
        try {
            const res = await fetchWithAuth('/api/business/apps');
            if (!res.ok) throw new Error();
            const data = await res.json();
            const appList: BusinessApp[] = data.apps || [];
            setApps(appList);
            if (appList.length > 0) setSelectedAppId(appList[0].app_id);
        } catch {
            // silently fail — user may not have apps yet
        } finally {
            setIsLoadingApps(false);
        }
    }, []);

    useEffect(() => { loadApps(); }, [loadApps]);

    // Load saved SDK config when the selected app changes
    useEffect(() => {
        if (!selectedAppId) {
            setIsLoadingConfig(false);
            return;
        }
        setIsLoadingConfig(true);
        fetchWithAuth(`/api/business/apps/${selectedAppId}/sdk-config`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.sdk_config) {
                    const cfg = data.sdk_config;
                    if (cfg.primary_color) setPrimaryColor(cfg.primary_color);
                    if (cfg.border_radius) setBorderRadius(cfg.border_radius);
                    if (cfg.font_family) setFontFamily(cfg.font_family);
                    if (cfg.logo_url) setLogoUrl(cfg.logo_url);
                    if (cfg.mode) setIsDark(cfg.mode === 'dark');
                    if (cfg.layout) setLayout(cfg.layout);
                    if (cfg.platform) setPlatform(cfg.platform);
                    if (cfg.language) setLanguage(cfg.language);
                }
            })
            .catch(() => { }) // silently fail
            .finally(() => setIsLoadingConfig(false));
    }, [selectedAppId]);

    const handleSaveConfig = async () => {
        if (!selectedAppId) return;
        setIsSaving(true);
        try {
            const res = await fetchWithAuth(`/api/business/apps/${selectedAppId}/sdk-config`, {
                method: 'PATCH',
                body: JSON.stringify({
                    primary_color: primaryColor,
                    border_radius: borderRadius,
                    font_family: fontFamily,
                    logo_url: logoUrl,
                    mode: isDark ? 'dark' : 'light',
                    layout,
                    platform,
                    language
                })
            });
            if (!res.ok) throw new Error();
            setSaveStatus('saved');
        } catch {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    // SDK screen order — matches the flow in CasperIDModal
    const SCREEN_ORDER: Screen[] = [
        'AuthSelection',
        'Login',
        'PinVerification',
        'SecurityUpgrade',
        'FaceScan',
        'VerifyIdentityChoice',
        'DocumentScan',
        'ReviewData',
        'MintingIdentity',
        'IdentityVerified',
        'PermissionsRequest',
    ];

    const configCode = `{
  "apiKey": "YOUR_API_KEY",
  "theme": {
    "primaryColor": "${primaryColor}",
    "borderRadius": "${borderRadius}px",
    "fontFamily": "${fontFamily}",
    "mode": "${isDark ? 'dark' : 'light'}"
  },
  "layout": "${layout}",
  "platform": "${platform}",
  "logo": "${logoUrl}",
  "language": "${language}"
} `;

    return (
        <div className="flex flex-col gap-8 max-w-7xl mx-auto">
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-text-main text-3xl font-black tracking-tight">SDK Design Playground</h2>
                    <p className="text-text-muted">Customize the look and feel of your CasperID verification flow.</p>
                </div>
                {/* App Selector */}
                <div className="flex items-center gap-3 shrink-0">
                    {isLoadingApps ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : apps.length > 0 ? (
                        <select
                            value={selectedAppId}
                            onChange={(e) => setSelectedAppId(e.target.value)}
                            className="rounded-xl border border-border-muted bg-white px-3 py-2.5 text-sm font-bold text-text-main focus:outline-none focus:border-primary shadow-sm"
                        >
                            {apps.map(app => (
                                <option key={app.app_id} value={app.app_id}>{app.name} ({app.environment})</option>
                            ))}
                        </select>
                    ) : (
                        <span className="text-xs text-text-muted italic">No apps yet — create one in API Management</span>
                    )}
                    <button
                        onClick={handleSaveConfig}
                        disabled={isSaving || !selectedAppId}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50 ${saveStatus === 'saved' ? 'bg-green-500 text-white' :
                            saveStatus === 'error' ? 'bg-red-500 text-white' :
                                'bg-primary text-white hover:bg-primary/90'
                            }`}
                    >
                        <span className="material-symbols-outlined !text-sm">
                            {saveStatus === 'saved' ? 'check_circle' : saveStatus === 'error' ? 'error' : 'save'}
                        </span>
                        {isSaving ? 'Saving…' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save Config'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Controls */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-white rounded-2xl border border-border-muted p-6 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-text-main">Theme Customization</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-main">Primary Color</label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="h-10 w-20 rounded-lg border border-border-muted cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="flex-1 rounded-lg border border-border-muted bg-background-light px-3 text-sm font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-main">Border Radius</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="24"
                                        value={borderRadius}
                                        onChange={(e) => setBorderRadius(e.target.value)}
                                        className="w-full accent-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-main">Default Language</label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full rounded-lg border border-border-muted bg-background-light p-2 text-sm"
                                    >
                                        <option value="EN">English</option>
                                        <option value="ES">Spanish</option>
                                        <option value="FR">French</option>
                                        <option value="DE">German</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-main">Layout Mode</label>
                                    <select
                                        value={layout}
                                        onChange={(e) => setLayout(e.target.value as any)}
                                        className="w-full rounded-lg border border-border-muted bg-background-light p-2.5 text-sm"
                                    >
                                        <option value="auto">Auto (Responsive)</option>
                                        <option value="modal">Strict Modal (Pop-up)</option>
                                        <option value="fullscreen">Strict Fullscreen</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-main">Target Platform</label>
                                    <div className="flex bg-background-light rounded-xl p-1 border border-border-muted max-w-[200px]">
                                        <button
                                            onClick={() => setPlatform('desktop')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${platform === 'desktop' ? 'bg-white shadow-sm text-primary' : 'text-text-muted hover:text-text-main'}`}
                                        >
                                            <Monitor className="w-4 h-4" />
                                            Desktop
                                        </button>
                                        <button
                                            onClick={() => setPlatform('mobile')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${platform === 'mobile' ? 'bg-white shadow-sm text-primary' : 'text-text-muted hover:text-text-main'}`}
                                        >
                                            <Smartphone className="w-4 h-4" />
                                            Mobile
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-main">Font Family</label>
                                <select
                                    value={fontFamily}
                                    onChange={(e) => setFontFamily(e.target.value)}
                                    className="w-full rounded-lg border border-border-muted bg-background-light p-2.5 text-sm"
                                >
                                    <option value="Inter">Inter (Sans-serif)</option>
                                    <option value="Roboto">Roboto</option>
                                    <option value="Space Grotesk">Space Grotesk</option>
                                    <option value="Fira Code">Fira Code (Mono)</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-background-light rounded-xl">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-text-main">Dark Mode</span>
                                    <span className="text-xs text-text-muted">Enable dark theme</span>
                                </div>
                                <button
                                    onClick={() => setIsDark(!isDark)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${isDark ? 'bg-primary' : 'bg-border-muted'}`}
                                >
                                    <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${isDark ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-red-700">Preview Error State</span>
                                    <span className="text-xs text-red-600">Test how errors look</span>
                                </div>
                                <button
                                    onClick={() => setShowError(!showError)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${showError ? 'bg-red-500' : 'bg-red-200'}`}
                                >
                                    <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${showError ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-border-muted p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-text-main">Initialization Code</h3>
                            <button
                                onClick={() => navigator.clipboard.writeText(configCode)}
                                className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined !text-sm">content_copy</span> Copy
                            </button>
                        </div>
                        <pre className="bg-background-dark text-white p-4 rounded-xl text-xs font-mono overflow-x-auto">
                            {configCode}
                        </pre>
                    </div>
                </div>

                {/* Live SDK Preview */}
                <div className={`lg:col-span-7 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border-muted p-8 min-h-[680px] gap-6 transition-colors duration-500 ${isDark ? 'bg-slate-900' : 'bg-background-light/50'}`}>
                    {/* "Live Preview" badge */}
                    <div className="flex items-center gap-2 self-start">
                        <div className={`w-2 h-2 rounded-full ${isLoadingConfig ? 'bg-amber-500' : 'bg-green-500'} animate-pulse`} />
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">
                            {isLoadingConfig ? 'Loading Config...' : 'Live SDK Preview'}
                        </span>
                    </div>

                    {isLoadingConfig ? (
                        /* Loading skeleton while config is being fetched */
                        <div className="flex flex-col items-center justify-center gap-4 py-20">
                            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm text-text-muted">Loading your saved configuration...</p>
                        </div>
                    ) : (
                        <>
                            {/* Real CasperIDModal in previewMode, scaled to phone proportions */}
                            <div
                                style={{
                                    width: 380,
                                    height: 1000,
                                    transform: 'scale(0.7)',
                                    transformOrigin: 'top center',
                                    marginBottom: -300,
                                }}
                            >
                                <CasperIDModal
                                    isOpen={true}
                                    apiKey={selectedAppId || 'preview'}
                                    previewMode={true}
                                    initialScreen={SCREEN_ORDER[activeStep] ?? 'AuthSelection'}
                                    logoUrl={logoUrl}
                                    apiBaseUrl={API_BASE}
                                    platform={platform}
                                    theme={{
                                        primaryColor,
                                        borderRadius,
                                        fontFamily,
                                        mode: isDark ? 'dark' : 'light',
                                        layout,
                                    }}
                                    onClose={() => { }}
                                />
                            </div>

                            {/* Screen navigation dots */}
                            <div className="flex gap-2 flex-wrap justify-center max-w-sm">
                                {SCREEN_ORDER.map((screenName, i) => (
                                    <button
                                        key={screenName}
                                        title={screenName}
                                        onClick={() => setActiveStep(i)}
                                        className={`h-2 rounded-full transition-all ${activeStep === i ? 'w-6 bg-primary' : 'w-2 bg-border-muted hover:bg-primary/30'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-text-muted">
                                {SCREEN_ORDER[activeStep]} screen &mdash; click dots to navigate
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SDKDesign;

