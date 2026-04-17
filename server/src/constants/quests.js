/**
 * Fixed quest definitions - no database needed
 */
const QUESTS = [
    // Onboarding
    { id: 'tour_complete', title: 'Complete Onboarding Tour', xp: 100, icon: 'map', category: 'onboarding' },
    // Verification
    { id: 'layer_2_verify', title: 'Complete Liveness Check', xp: 500, icon: 'face', category: 'verification' },
    { id: 'layer_3_verify', title: 'Complete Layer 3 Verification', xp: 1000, icon: 'verified_user', category: 'verification' },
    { id: 'profile_complete', title: 'Complete Your Profile', xp: 300, icon: 'person', category: 'onboarding' },
    // Identity
    { id: 'cid_register', title: 'Register Premium .cid Name', xp: 500, icon: 'badge', category: 'engagement' },
    { id: 'persona_create_3', title: 'Create 3 Contextual IDs', xp: 400, icon: 'group', category: 'engagement' },
    { id: 'wallet_connect', title: 'Connect External Wallet', xp: 200, icon: 'account_balance_wallet', category: 'engagement' },
    // Engagement
    { id: 'view_data_controls', title: 'View Data Controls', xp: 100, icon: 'tune', category: 'engagement' },
    { id: 'view_activity_logs', title: 'View Activity Logs', xp: 100, icon: 'history', category: 'engagement' },
    { id: 'app_login', title: 'Login to Another App via CasperID', xp: 300, icon: 'login', category: 'engagement' },
    // Advanced
    { id: 'earn_10k_xp', title: 'Earn 10,000 XP', xp: 1000, icon: 'emoji_events', category: 'advanced' },
    { id: 'zk_proof_generate', title: 'Generate ZK Proof', xp: 500, icon: 'security', category: 'advanced' },
    { id: 'extension_install', title: 'Download Chrome Extension', xp: 200, icon: 'extension', category: 'engagement' },
    { id: 'casperid_connect_login', title: 'Login to CasperID Connect', xp: 200, icon: 'link', category: 'engagement' },
    // Social
    { id: 'profile_share', title: 'Share Profile & Get Views', xp: 300, icon: 'share', category: 'social' },
    { id: 'x_brag', title: 'Share Your CID on X', xp: 200, icon: 'campaign', category: 'social' },
    { id: 'community_join', title: 'Join CasperID Community', xp: 150, icon: 'groups', category: 'social' },
    { id: 'oauth_login', title: 'Login with CasperID on Another Platform', xp: 300, icon: 'key', category: 'engagement' }
];

module.exports = { QUESTS };
