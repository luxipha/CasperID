import React from 'react';
import { Fingerprint, Puzzle, ChevronRight, Smartphone, ShieldCheck, RefreshCw } from 'lucide-react';

interface SDKPreviewProps {
    primaryColor: string;
    borderRadius: string;
    fontFamily: string;
    isDark: boolean;
    logoUrl?: string;
    platform?: 'desktop' | 'mobile';
    language?: string;
}

// Simple translation helper for the preview
const translations: Record<string, Record<string, string>> = {
    EN: {
        welcome_back: "Welcome back",
        auth_subtitle: "Secure your Web3 identity with our premium authentication layer.",
        sign_in_with_extension: "Sign in with Extension",
        sign_in_with_otp: "Sign in with OTP",
        extension_detected: "Extension Detected",
        secure_wallet: "Secure Wallet",
        two_factor_auth: "Two-Factor Auth",
        fully_audited: "FULLY AUDITED",
        non_custodial: "NON-CUSTODIAL",
    },
    ES: {
        welcome_back: "Bienvenido de nuevo",
        auth_subtitle: "Asegure su identidad Web3 con nuestra capa de autenticación premium.",
        sign_in_with_extension: "Iniciar sesión con extensión",
        sign_in_with_otp: "Iniciar sesión con OTP",
        extension_detected: "Extensión detectada",
        secure_wallet: "Billetera segura",
        two_factor_auth: "Autenticación de dos factores",
        fully_audited: "TOTALMENTE AUDITADO",
        non_custodial: "SIN CUSTODIA",
    },
    FR: {
        welcome_back: "Bon retour",
        auth_subtitle: "Sécurisez votre identité Web3 avec notre couche d'authentification premium.",
        sign_in_with_extension: "Connexion avec l'extension",
        sign_in_with_otp: "Connexion avec OTP",
        extension_detected: "Extension détectée",
        secure_wallet: "Portefeuille sécurisé",
        two_factor_auth: "Authentification à deux facteurs",
        fully_audited: "ENTIÈREMENT AUDITÉ",
        non_custodial: "NON FONGIBLE",
    },
    DE: {
        welcome_back: "Willkommen zurück",
        auth_subtitle: "Sichern Sie Ihre Web3-Identität mit unserer Premium-Authentifizierungsschicht.",
        sign_in_with_extension: "Mit Erweiterung anmelden",
        sign_in_with_otp: "Mit OTP anmelden",
        extension_detected: "Erweiterung erkannt",
        secure_wallet: "Sichere Wallet",
        two_factor_auth: "Zwei-Faktor-Authentifizierung",
        fully_audited: "VOLLSTÄNDIG GEPRÜFT",
        non_custodial: "NON-CUSTODIAL",
    },
};

const SDKPreview: React.FC<SDKPreviewProps> = ({
    primaryColor,
    borderRadius,
    fontFamily,
    isDark,
    logoUrl,
    platform = 'desktop',
    language = 'EN',
}) => {
    const t = (key: string) => {
        const lang = translations[language] || translations.EN;
        return lang[key] || translations.EN[key] || key;
    };

    // Compute CSS custom properties for the theme
    const themeStyle = {
        '--casperid-primary': primaryColor,
        '--casperid-radius': `${borderRadius}px`,
        '--casperid-font': fontFamily,
        '--bg-app': isDark ? '#0B0813' : '#f8fafc',
        '--text-primary': isDark ? '#ffffff' : '#0f172a',
        '--text-secondary': isDark ? '#94a3b8' : '#64748b',
        '--glass-bg': isDark ? 'rgba(14, 11, 22, 0.85)' : 'rgba(255, 255, 255, 0.75)',
        '--glass-border': isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    } as React.CSSProperties;

    const brandBg = primaryColor;
    const brandBg90 = `color-mix(in srgb, ${primaryColor} 90%, transparent)`;
    const brandBg20 = `color-mix(in srgb, ${primaryColor} 20%, transparent)`;
    const brandBg10 = `color-mix(in srgb, ${primaryColor} 10%, transparent)`;
    const brandBorder30 = `color-mix(in srgb, ${primaryColor} 30%, transparent)`;
    const brandShadow = `0 10px 25px -5px color-mix(in srgb, ${primaryColor} 30%, transparent)`;
    const textPrimary = isDark ? '#ffffff' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#64748b';
    const glassBg = isDark ? 'rgba(14, 11, 22, 0.85)' : 'rgba(255, 255, 255, 0.75)';
    const glassBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';

    return (
        <div
            className={`w-full h-full flex flex-col ${isDark ? 'dark' : 'light'}`}
            style={{
                ...themeStyle,
                fontFamily: fontFamily || 'Inter',
                backgroundColor: isDark ? '#0B0813' : '#f8fafc',
            }}
        >
            {/* Auth Selection Screen Preview */}
            <div className="flex-1 px-8 flex flex-col justify-center gap-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div
                            className="absolute inset-0 blur-2xl rounded-full"
                            style={{ backgroundColor: brandBg20 }}
                        />
                        <div
                            className="relative w-full h-full flex items-center justify-center rounded-2xl border backdrop-blur-[32px]"
                            style={{
                                backgroundColor: glassBg,
                                borderColor: brandBorder30,
                                borderRadius: `${borderRadius}px`,
                            }}
                        >
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                            ) : (
                                <Fingerprint className="w-10 h-10" style={{ color: primaryColor }} />
                            )}
                        </div>
                    </div>
                    <h1
                        className="text-2xl font-extrabold leading-tight tracking-tight"
                        style={{ color: textPrimary }}
                    >
                        {t('welcome_back')}
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                        {t('auth_subtitle')}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    {platform === 'desktop' && (
                        <button
                            className="w-full group relative overflow-hidden flex items-center gap-4 py-5 px-6 font-bold transition-all transform shadow-lg"
                            style={{
                                backgroundColor: brandBg,
                                color: 'white',
                                borderRadius: `${borderRadius}px`,
                                boxShadow: brandShadow,
                            }}
                        >
                            <div
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: `${Math.max(Number(borderRadius) - 4, 4)}px` }}
                            >
                                <Puzzle className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-base">{t('sign_in_with_extension')}</span>
                                <span
                                    className="text-[10px] uppercase tracking-widest"
                                    style={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgb(71, 85, 105)' }}
                                >
                                    {t('extension_detected')}
                                </span>
                            </div>
                            <ChevronRight className="ml-auto w-4 h-4 opacity-50" />
                        </button>
                    )}

                    <button
                        className="w-full group relative overflow-hidden flex items-center gap-4 py-5 px-6 font-bold transition-all transform border"
                        style={{
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(148, 163, 184, 0.05)',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgb(226, 232, 240)',
                            color: textPrimary,
                            borderRadius: `${borderRadius}px`,
                        }}
                    >
                        <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: brandBg10, borderRadius: `${Math.max(Number(borderRadius) - 4, 4)}px` }}
                        >
                            <Smartphone className="w-5 h-5" style={{ color: primaryColor }} />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-base">{t('sign_in_with_otp')}</span>
                            <span
                                className="text-[10px] uppercase tracking-widest font-bold"
                                style={{ color: primaryColor }}
                            >
                                {t('two_factor_auth')}
                            </span>
                        </div>
                        <ChevronRight className="ml-auto w-4 h-4 opacity-50" />
                    </button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div
                        className="p-4 flex flex-col items-center gap-2 text-center backdrop-blur-[32px] border transition-all duration-500"
                        style={{
                            backgroundColor: glassBg,
                            borderColor: glassBorder,
                            borderRadius: `${borderRadius}px`,
                        }}
                    >
                        <ShieldCheck className="w-5 h-5" style={{ color: primaryColor }} />
                        <span className="text-[10px] font-bold" style={{ color: textSecondary }}>
                            {t('fully_audited')}
                        </span>
                    </div>
                    <div
                        className="p-4 flex flex-col items-center gap-2 text-center backdrop-blur-[32px] border transition-all duration-500"
                        style={{
                            backgroundColor: glassBg,
                            borderColor: glassBorder,
                            borderRadius: `${borderRadius}px`,
                        }}
                    >
                        <RefreshCw className="w-5 h-5" style={{ color: primaryColor }} />
                        <span className="text-[10px] font-bold" style={{ color: textSecondary }}>
                            {t('non_custodial')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SDKPreview;
