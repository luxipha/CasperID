export interface ChromeStorageData {
    connected: boolean;
    userData: {
        wallet: string;
        humanId: string;
        cnsName: string;
        verified: boolean;
        tier: string;
        profile?: any;
    } | null;
    autoApprove: boolean;
    permissions: any[];
    currentJob?: {
        platform: string;
        url: string;
        title: string;
        company: string;
        description: string;
        matchResults?: any;
        coverLetter?: {
            subject: string;
            content: string;
            keyHighlights: string[];
            tone: string;
        };
    } | null;
}

export const getStorageData = (): Promise<ChromeStorageData> => {
    return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['connected', 'userData', 'autoApprove', 'permissions', 'currentJob'], (result: any) => {
                resolve({
                    connected: result.connected || false,
                    userData: result.userData || null,
                    autoApprove: result.autoApprove || false,
                    permissions: result.permissions || [],
                    currentJob: result.currentJob || null,
                });
            });
        } else {
            // Mock data for dev mode
            resolve({
                connected: true,
                userData: {
                    wallet: '0xAbC...123',
                    humanId: 'nete-tute-bona',
                    cnsName: 'netetutebona.cid',
                    verified: true,
                    tier: 'Layer 3',
                },
                autoApprove: false,
                permissions: [],
            });
        }
    });
};

export const setStorageData = (data: Partial<ChromeStorageData>): Promise<void> => {
    return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set(data, () => {
                resolve();
            });
        } else {
            console.log('Mock storage set:', data);
            resolve();
        }
    });
};
