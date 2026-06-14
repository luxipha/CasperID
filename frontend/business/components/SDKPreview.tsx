import React from 'react';
import { ArrowRight, Check, LockKeyhole, ShieldCheck } from 'lucide-react';

interface SDKPreviewProps {
    primaryColor: string;
    borderRadius: string;
    fontFamily: string;
    isDark: boolean;
    logoUrl?: string;
    appName?: string;
    platform?: 'desktop' | 'mobile';
    language?: string;
}

const translations: Record<string, Record<string, string>> = {
    EN: {
        eyebrow: 'Authorization request',
        title: 'Authorize',
        subtitle: 'This application is requesting access through CasperID.',
        identity: 'Confirm your CasperID identity',
        verification: 'Share your verification result',
        privacy: 'Your passkey and identity documents stay with CasperID.',
        continue: 'Continue securely',
        cancel: 'Not now',
        secured: 'Secured by CasperID',
    },
    ES: {
        eyebrow: 'Solicitud de autorización',
        title: 'Autorizar',
        subtitle: 'Esta aplicación solicita acceso mediante CasperID.',
        identity: 'Confirme su identidad de CasperID',
        verification: 'Comparta su resultado de verificación',
        privacy: 'Su clave de acceso y documentos permanecen con CasperID.',
        continue: 'Continuar de forma segura',
        cancel: 'Ahora no',
        secured: 'Protegido por CasperID',
    },
    FR: {
        eyebrow: "Demande d'autorisation",
        title: 'Autoriser',
        subtitle: "Cette application demande un accès via CasperID.",
        identity: 'Confirmez votre identité CasperID',
        verification: 'Partagez votre résultat de vérification',
        privacy: "Votre passkey et vos documents restent chez CasperID.",
        continue: 'Continuer en toute sécurité',
        cancel: 'Pas maintenant',
        secured: 'Sécurisé par CasperID',
    },
    DE: {
        eyebrow: 'Autorisierungsanfrage',
        title: 'Autorisieren',
        subtitle: 'Diese Anwendung fordert Zugriff über CasperID an.',
        identity: 'CasperID-Identität bestätigen',
        verification: 'Verifizierungsergebnis teilen',
        privacy: 'Passkey und Dokumente verbleiben bei CasperID.',
        continue: 'Sicher fortfahren',
        cancel: 'Nicht jetzt',
        secured: 'Gesichert durch CasperID',
    },
};

const SDKPreview: React.FC<SDKPreviewProps> = ({
    primaryColor,
    borderRadius,
    fontFamily,
    isDark,
    logoUrl,
    appName = 'Your application',
    platform = 'desktop',
    language = 'EN',
}) => {
    const copy = translations[language] || translations.EN;
    const background = isDark ? '#0b0813' : '#f6f7fb';
    const card = isDark ? '#171222' : '#ffffff';
    const text = isDark ? '#ffffff' : '#17152b';
    const muted = isDark ? '#a8a1b8' : '#667085';
    const border = isDark ? 'rgba(255,255,255,.12)' : '#e5e7eb';
    const radius = `${borderRadius}px`;

    return (
        <div
            className="flex h-full min-h-[620px] w-full flex-col p-6"
            style={{ backgroundColor: background, color: text, fontFamily }}
        >
            <div className="mb-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>
                <span>{copy.secured}</span>
                <LockKeyhole className="h-4 w-4" style={{ color: primaryColor }} />
            </div>

            <div
                className="my-auto border p-6 shadow-xl"
                style={{ backgroundColor: card, borderColor: border, borderRadius: radius }}
            >
                <div className="mb-6 flex items-center justify-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center border bg-white shadow-sm" style={{ borderColor: border, borderRadius: radius }}>
                        {logoUrl
                            ? <img src={logoUrl} alt={`${appName} logo`} className="h-10 w-10 object-contain" />
                            : <span className="text-lg font-black" style={{ color: primaryColor }}>{appName.slice(0, 1).toUpperCase()}</span>
                        }
                    </div>
                    <ArrowRight className="h-5 w-5" style={{ color: muted }} />
                    <div className="flex h-16 w-16 items-center justify-center border bg-white shadow-sm" style={{ borderColor: primaryColor, borderRadius: radius }}>
                        <ShieldCheck className="h-8 w-8" style={{ color: primaryColor }} />
                    </div>
                </div>

                <div className="mb-6 text-center">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: primaryColor }}>{copy.eyebrow}</p>
                    <h3 className="text-2xl font-black">{copy.title} {appName}</h3>
                    <p className="mt-2 text-sm leading-6" style={{ color: muted }}>{copy.subtitle}</p>
                </div>

                <div className="mb-6 space-y-3">
                    {[copy.identity, copy.verification].map(item => (
                        <div key={item} className="flex items-center gap-3 border p-3 text-sm font-semibold" style={{ borderColor: border, borderRadius: radius }}>
                            <Check className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>

                <div className="mb-5 border p-3 text-xs leading-5" style={{ borderColor: `${primaryColor}55`, borderRadius: radius, color: muted }}>
                    {copy.privacy}
                </div>

                <button className="w-full px-4 py-3 text-sm font-bold text-white" style={{ backgroundColor: primaryColor, borderRadius: radius }}>
                    {copy.continue}
                </button>
                <button className="mt-2 w-full px-4 py-2 text-xs font-bold" style={{ color: muted }}>
                    {copy.cancel}
                </button>
            </div>

            <p className="mt-5 text-center text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: muted }}>
                {platform === 'mobile' ? 'Mobile redirect preview' : 'Desktop popup preview'}
            </p>
        </div>
    );
};

export default SDKPreview;
