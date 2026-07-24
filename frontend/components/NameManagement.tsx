import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { notifyError, notifySuccess } from '../utils/notify';

interface CidName {
    name: string;
    type: 'markov' | 'premium' | 'subdomain';
    isPremium: boolean;
    contextType: string;
    did: string;
}

interface NameCheckResult {
    available: boolean;
    reason?: string;
}

interface NameManagementProps {
    onRegisterCID?: () => void;
}

/**
 * Name Management Dashboard
 * Test component for CNS (CasperID Name Service) functionality
 */
const NameManagement: React.FC<NameManagementProps> = ({ onRegisterCID }) => {
    const [myNames, setMyNames] = useState<CidName[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Name check state
    const [checkName, setCheckName] = useState('');
    const [checkResult, setCheckResult] = useState<NameCheckResult | null>(null);
    const [checking, setChecking] = useState(false);

    // Registration state
    const [registerName, setRegisterName] = useState('');
    const [registering, setRegistering] = useState(false);
    const [registerResult, setRegisterResult] = useState<string | null>(null);

    // Resolve state
    const [resolveName, setResolveName] = useState('');
    const [resolveResult, setResolveResult] = useState<any>(null);
    const [resolving, setResolving] = useState(false);

    // Routing state
    const [routes, setRoutes] = useState<any[]>([]);
    const [selectedNameRoute, setSelectedNameRoute] = useState<string | null>(null);
    const [routingConfig, setRoutingConfig] = useState<any>({
        target_type: 'master_profile',
        target_id: '',
        redirect_url: ''
    });

    // Sub-name creation state (L2+)
    const [subNamePrefix, setSubNamePrefix] = useState('');
    const [subNameParent, setSubNameParent] = useState('');
    const [subNameContext, setSubNameContext] = useState('gaming');
    const [creatingSubName, setCreatingSubName] = useState(false);
    const [userTier, setUserTier] = useState('layer_1');

    useEffect(() => {
        fetchMyNames();
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const data = await apiService.getCnsRoutes();
            if (data.success) setRoutes(data.routes);
        } catch (err) { console.error('Fetch routes err:', err); }
    };

    const fetchMyNames = async () => {
        try {
            setLoading(true);
            const data = await apiService.getMyNames();

            if (data.success) {
                setMyNames(data.names || []);
            } else {
                setError(data.error || 'Failed to fetch names');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckName = async () => {
        if (!checkName.trim()) return;

        setChecking(true);
        setCheckResult(null);

        try {
            const data = await apiService.checkCnsAvailability(checkName);

            setCheckResult({
                available: data.available,
                reason: data.reason
            });
        } catch (err) {
            setCheckResult({ available: false, reason: 'Check failed' });
        } finally {
            setChecking(false);
        }
    };

    const handleRegister = async () => {
        if (!registerName.trim()) return;

        if (onRegisterCID) {
            onRegisterCID();
            return;
        }

        setRegistering(true);
        setRegisterResult(null);

        try {
            const data = await apiService.registerCns(registerName, 1); // Default 1 year

            if (data.success) {
                const txMsg = data.txHash ? ` (TX: ${data.txHash.slice(0, 10)}...)` : '';
                setRegisterResult(`✅ Registered: ${data.name}${txMsg}`);
                setRegisterName('');
                fetchMyNames(); // Refresh
            } else {
                setRegisterResult(`❌ ${data.error}`);
            }
        } catch (err) {
            setRegisterResult('❌ Registration failed');
        } finally {
            setRegistering(false);
        }
    };

    const handleResolve = async () => {
        if (!resolveName.trim()) return;

        setResolving(true);
        setResolveResult(null);

        try {
            const data = await apiService.resolveCnsName(resolveName);
            setResolveResult(data);
        } catch (err) {
            setResolveResult({ success: false, error: 'Resolve failed' });
        } finally {
            setResolving(false);
        }
    };

    const handleSaveRoute = async () => {
        if (!selectedNameRoute) return;

        try {
            const data = await apiService.saveCnsRoute(selectedNameRoute, routingConfig);
            if (data.success) {
                notifySuccess('Routing preference saved!');
                setSelectedNameRoute(null);
                fetchRoutes();
            } else {
                notifyError(data.error);
            }
        } catch (err) {
            notifyError('Failed to save routing preference');
        }
    };

    const openRoutingPanel = (name: string) => {
        const existing = routes.find(r => r.name === name);
        setSelectedNameRoute(name);
        setRoutingConfig({
            target_type: existing?.target_type || 'master_profile',
            target_id: existing?.target_id || '',
            redirect_url: existing?.redirect_url || ''
        });
    };

    const handleCreateSubName = async () => {
        if (!subNamePrefix.trim() || !subNameParent) return;

        setCreatingSubName(true);
        try {
            const data = await apiService.createSubName(subNameParent, subNamePrefix.toLowerCase(), subNameContext);
            if (data.success) {
                notifySuccess(`Created ${data.subName}`);
                setSubNamePrefix('');
                fetchMyNames();
            } else {
                notifyError(data.error);
            }
        } catch (err) {
            notifyError('Failed to create sub-name');
        } finally {
            setCreatingSubName(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>🌐 Name Management</h1>
            <p style={styles.subtitle}>Manage your .cid identity names</p>

            {/* Register Premium CID CTA */}
            {onRegisterCID && (
                <section style={styles.ctaSection}>
                    <div style={styles.ctaContent}>
                        <div style={styles.ctaIcon}>✨</div>
                        <div style={styles.ctaText}>
                            <h3 style={styles.ctaTitle}>Claim Your Premium .CID Domain</h3>
                            <p style={styles.ctaSubtitle}>Upgrade to a human-readable identity like alice.cid</p>
                        </div>
                        <button onClick={onRegisterCID} style={styles.ctaButton}>
                            Register Now
                        </button>
                    </div>
                </section>
            )}

            {/* My Names Section */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Your Names</h2>
                {loading ? (
                    <p style={styles.loading}>Loading...</p>
                ) : error ? (
                    <p style={styles.error}>{error}</p>
                ) : myNames.length === 0 ? (
                    <p style={styles.empty}>No names found. Sign in to see your names.</p>
                ) : (
                    <div style={styles.namesList}>
                        {myNames.map((name, index) => (
                            <div key={index} style={styles.nameCard}>
                                <div style={styles.nameBadge}>
                                    {name.isPremium ? '⭐' : '🆓'}
                                </div>
                                <div style={styles.nameInfo}>
                                    <span style={styles.nameText}>{name.name}</span>
                                    <span style={styles.nameType}>
                                        {name.type} • {name.contextType}
                                    </span>
                                </div>
                                <div style={styles.nameDid}>
                                    {name.did?.slice(0, 10)}...
                                </div>
                                <button
                                    onClick={() => openRoutingPanel(name.name)}
                                    style={styles.manageBtn}
                                >
                                    ⚙️ Route
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Routing Switchboard Modal/Panel */}
                {selectedNameRoute && (
                    <div style={styles.routingPanel}>
                        <h3 style={styles.panelTitle}>
                            Manage Routing: <span style={{ color: '#6c5ce7' }}>{selectedNameRoute}</span>
                        </h3>
                        <p style={styles.hint}>Choose how this name resolves in the browser</p>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Target Type</label>
                            <select
                                value={routingConfig.target_type}
                                onChange={(e) => setRoutingConfig({ ...routingConfig, target_type: e.target.value })}
                                style={styles.select}
                            >
                                <option value="master_profile">Primary Public Profile (Full Data)</option>
                                <option value="context_did">Context DID (Selective Disclosure)</option>
                                <option value="wallet_only">Wallet Address Only (L1 Privacy)</option>
                                <option value="redirect">External Redirect (URL)</option>
                            </select>
                        </div>

                        {routingConfig.target_type === 'context_did' && (
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Context Label</label>
                                <input
                                    type="text"
                                    value={routingConfig.target_id}
                                    onChange={(e) => setRoutingConfig({ ...routingConfig, target_id: e.target.value })}
                                    placeholder="e.g. professional or gaming"
                                    style={styles.input}
                                />
                            </div>
                        )}

                        {routingConfig.target_type === 'redirect' && (
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Redirect URL</label>
                                <input
                                    type="text"
                                    value={routingConfig.redirect_url}
                                    onChange={(e) => setRoutingConfig({ ...routingConfig, redirect_url: e.target.value })}
                                    placeholder="https://..."
                                    style={styles.input}
                                />
                            </div>
                        )}

                        <div style={styles.panelActions}>
                            <button onClick={() => setSelectedNameRoute(null)} style={styles.cancelBtn}>Cancel</button>
                            <button onClick={handleSaveRoute} style={styles.saveBtn}>Save Routing</button>
                        </div>
                    </div>
                )}
                <button onClick={fetchMyNames} style={styles.refreshBtn}>
                    🔄 Refresh
                </button>
            </section>

            {/* Check Availability Section */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Check Name Availability</h2>
                <div style={styles.inputGroup}>
                    <input
                        type="text"
                        value={checkName}
                        onChange={(e) => setCheckName(e.target.value)}
                        placeholder="Enter name (e.g., alice)"
                        style={styles.input}
                    />
                    <button
                        onClick={handleCheckName}
                        disabled={checking}
                        style={styles.button}
                    >
                        {checking ? 'Checking...' : 'Check'}
                    </button>
                </div>
                {checkResult && (
                    <div style={{
                        ...styles.result,
                        backgroundColor: checkResult.available ? '#d4edda' : '#f8d7da',
                        color: checkResult.available ? '#155724' : '#721c24'
                    }}>
                        {checkResult.available
                            ? `✅ "${checkName}.cid" is available!`
                            : `❌ Not available: ${checkResult.reason}`
                        }
                    </div>
                )}
            </section>

            {/* Register Premium Name Section */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Register Premium Name</h2>
                <p style={styles.hint}>Claim your unique .cid handle (requires sign-in)</p>
                <div style={styles.inputGroup}>
                    <input
                        type="text"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="Your premium name"
                        style={styles.input}
                    />
                    <button
                        onClick={handleRegister}
                        disabled={registering}
                        style={{ ...styles.button, backgroundColor: '#6c5ce7' }}
                    >
                        {registering ? 'Registering...' : 'Register'}
                    </button>
                </div>
                {registerResult && (
                    <div style={styles.result}>{registerResult}</div>
                )}
            </section>

            {/* Resolve Name Section */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Resolve Any Name</h2>
                <div style={styles.inputGroup}>
                    <input
                        type="text"
                        value={resolveName}
                        onChange={(e) => setResolveName(e.target.value)}
                        placeholder="e.g., alice.cid or work.alice.cid"
                        style={styles.input}
                    />
                    <button
                        onClick={handleResolve}
                        disabled={resolving}
                        style={{ ...styles.button, backgroundColor: '#00b894' }}
                    >
                        {resolving ? 'Resolving...' : 'Resolve'}
                    </button>
                </div>
                {resolveResult && (
                    <pre style={styles.jsonResult}>
                        {JSON.stringify(resolveResult, null, 2)}
                    </pre>
                )}
            </section>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 700,
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #6c5ce7, #00b894)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        color: '#666',
        marginBottom: '32px',
    },
    section: {
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    },
    sectionTitle: {
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '16px',
        color: '#333',
    },
    inputGroup: {
        display: 'flex',
        gap: '12px',
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        fontSize: '1rem',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    button: {
        padding: '12px 24px',
        fontSize: '1rem',
        fontWeight: 600,
        color: '#fff',
        backgroundColor: '#0984e3',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
    },
    result: {
        marginTop: '16px',
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: '#f0f0f0',
    },
    jsonResult: {
        marginTop: '16px',
        padding: '16px',
        backgroundColor: '#1e1e1e',
        color: '#00ff88',
        borderRadius: '8px',
        fontSize: '0.85rem',
        overflow: 'auto',
        maxHeight: '300px',
    },
    namesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '16px',
    },
    nameCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e9ecef',
    },
    nameBadge: {
        fontSize: '1.5rem',
    },
    nameInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    nameText: {
        fontWeight: 600,
        fontSize: '1.1rem',
        color: '#333',
    },
    nameType: {
        fontSize: '0.85rem',
        color: '#666',
    },
    nameDid: {
        fontSize: '0.75rem',
        color: '#999',
        fontFamily: 'monospace',
    },
    refreshBtn: {
        padding: '8px 16px',
        fontSize: '0.9rem',
        backgroundColor: '#f0f0f0',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    loading: {
        color: '#666',
        fontStyle: 'italic',
    },
    error: {
        color: '#dc3545',
    },
    empty: {
        color: '#666',
        fontStyle: 'italic',
    },
    hint: {
        fontSize: '0.85rem',
        color: '#888',
        marginBottom: '12px',
    },
    manageBtn: {
        padding: '6px 12px',
        fontSize: '0.85rem',
        backgroundColor: '#fff',
        border: '1px solid #ced4da',
        borderRadius: '6px',
        cursor: 'pointer',
        color: '#495057',
        fontWeight: 600,
    },
    routingPanel: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f1f3f5',
        borderRadius: '12px',
        border: '2px dashed #adb5bd',
    },
    panelTitle: {
        fontSize: '1.1rem',
        fontWeight: 700,
        marginBottom: '8px',
        color: '#212529',
    },
    formGroup: {
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: 600,
        color: '#495057',
    },
    select: {
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        fontSize: '0.95rem',
    },
    panelActions: {
        display: 'flex',
        gap: '12px',
        marginTop: '8px',
    },
    saveBtn: {
        padding: '10px 20px',
        backgroundColor: '#6c5ce7',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    cancelBtn: {
        padding: '10px 20px',
        backgroundColor: 'transparent',
        color: '#666',
        border: 'none',
        fontWeight: 600,
        cursor: 'pointer',
    },
    ctaSection: {
        background: 'linear-gradient(135deg, #6c5ce7 0%, #a855f7 100%)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 10px 40px rgba(108, 92, 231, 0.3)',
    },
    ctaContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap' as const,
    },
    ctaIcon: {
        fontSize: '2.5rem',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '16px',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        flex: 1,
        minWidth: '200px',
    },
    ctaTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#fff',
        marginBottom: '4px',
    },
    ctaSubtitle: {
        fontSize: '0.9rem',
        color: 'rgba(255,255,255,0.8)',
    },
    ctaButton: {
        padding: '14px 28px',
        fontSize: '1rem',
        fontWeight: 700,
        color: '#6c5ce7',
        backgroundColor: '#fff',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    },
};

export default NameManagement;
