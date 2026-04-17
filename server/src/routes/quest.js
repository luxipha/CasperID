const express = require('express');
const router = express.Router();
const { UserAccount, Notification, Credential } = require('../database/models');
const { requireAuth } = require('../middleware/auth');
const { rateLimitMiddleware } = require('../utils/rate-limiter');
const { QUESTS } = require('../constants/quests');

/**
 * Verify if user has actually completed the quest task
 */
const verifyQuestCompletion = async (questId, user) => {
    switch (questId) {
        case 'tour_complete':
            if (user.onboarding_completed || user.tour_completed) {
                return { eligible: true };
            }
            return { eligible: false, reason: 'Complete the onboarding tour first' };

        case 'layer_2_verify':
            if (user.tier === 'layer_2' || user.tier === 'layer_3') {
                return { eligible: true };
            }
            const l2Cred = await Credential.findOne({ wallet: user.wallet, tier: { $in: ['layer_2', 'layer_3'] } });
            if (l2Cred) return { eligible: true };
            return { eligible: false, reason: 'Complete liveness verification first' };

        case 'layer_3_verify':
            if (user.tier === 'layer_3') {
                return { eligible: true };
            }
            const l3Cred = await Credential.findOne({ wallet: user.wallet, tier: 'layer_3' });
            if (l3Cred) return { eligible: true };
            return { eligible: false, reason: 'Complete Layer 3 KYC verification' };

        case 'profile_complete':
            const { UserProfile } = require('../database/models');
            const profile = await UserProfile.findOne({ wallet: user.wallet });
            if (profile && profile.first_name && profile.headline) {
                return { eligible: true };
            }
            return { eligible: false, reason: 'Complete your profile (name & headline)' };

        case 'cid_register':
            if (user.cns_name && user.wallet) {
                const { walletToHuman } = require('../utils/wallet-to-human');
                const { humanId } = walletToHuman(user.wallet);
                const cnsRoot = user.cns_name.replace(/\.cid$/i, '');
                if (cnsRoot !== humanId) {
                    return { eligible: true };
                }
            }
            return { eligible: false, reason: 'Register a premium .cid name' };

        case 'persona_create_3':
            if (user.context_dids && user.context_dids.length >= 3) {
                return { eligible: true };
            }
            const count = user.context_dids?.length || 0;
            return { eligible: false, reason: `Create ${3 - count} more Contextual IDs` };

        case 'wallet_connect':
            if (user.linked_wallets && user.linked_wallets.length > 0) {
                return { eligible: true };
            }
            return { eligible: false, reason: 'Connect an external wallet' };

        case 'view_data_controls':
            if (user.viewed_data_controls) return { eligible: true };
            return { eligible: false, reason: 'Visit the Data Controls page' };

        case 'view_activity_logs':
            if (user.viewed_activity_logs) return { eligible: true };
            return { eligible: false, reason: 'Visit the Activity Logs page' };

        case 'app_login':
            if (user.app_logins_count > 0) return { eligible: true };
            return { eligible: false, reason: 'Login to an app using CasperID' };

        case 'earn_10k_xp':
            if ((user.points || 0) >= 10000) return { eligible: true };
            return { eligible: false, reason: `Earn ${10000 - (user.points || 0)} more XP` };

        case 'zk_proof_generate':
            if (user.zk_verified) return { eligible: true };
            return { eligible: false, reason: 'Generate a ZK proof' };

        case 'extension_install':
            if (user.extension_installed) return { eligible: true };
            return { eligible: false, reason: 'Install the Chrome extension' };

        case 'casperid_connect_login':
            if (user.casperid_connect_used) return { eligible: true };
            return { eligible: false, reason: 'Login via CasperID Connect extension' };

        case 'profile_share':
            if (user.profile_shares_count >= 1) return { eligible: true };
            return { eligible: false, reason: 'Share your profile and get a view' };

        case 'x_brag':
            if (user.x_shared) return { eligible: true };
            return { eligible: false, reason: 'Share your CID on X (Twitter)' };

        case 'community_join':
            if (user.community_joined) return { eligible: true };
            return { eligible: false, reason: 'Join the CasperID community on X' };

        case 'oauth_login':
            if (user.app_logins_count > 0) return { eligible: true };
            return { eligible: false, reason: 'Use CasperID to login to another platform' };

        default:
            console.warn(`[Quest] Unknown quest type: ${questId}`);
            return { eligible: false, reason: 'Quest verification not configured' };
    }
};

/**
 * @route GET /api/quest/status
 * @desc Get quest status for authenticated user
 */
router.get('/status', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.user_id;
        const user = await UserAccount.findOne({ user_id: userId });

        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        // Build status for each hardcoded quest
        const questsWithStatus = await Promise.all(
            QUESTS.map(async (q) => {
                const isCompleted = user.completed_quests?.includes(q.id);
                let eligible = false;
                let reason = null;

                if (!isCompleted) {
                    const verification = await verifyQuestCompletion(q.id, user);
                    eligible = verification.eligible;
                    reason = verification.reason;
                }

                return {
                    id: q.id,
                    title: q.title,
                    xp: q.xp,
                    icon: q.icon,
                    category: q.category,
                    completed: isCompleted,
                    eligible,
                    reason
                };
            })
        );

        res.json({
            success: true,
            points: user.points || 0,
            completedQuests: user.completed_quests || [],
            availableQuests: questsWithStatus
        });
    } catch (error) {
        console.error('[Quest] Status fetch failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route POST /api/quest/claim
 * @desc Claim points for a completed quest
 */
router.post('/claim', requireAuth, rateLimitMiddleware('quest_claim'), async (req, res) => {
    try {
        const { questId } = req.body;
        const userId = req.user.userId || req.user.user_id;

        if (!questId) {
            return res.status(400).json({ success: false, error: 'Quest ID required' });
        }

        const quest = QUESTS.find(q => q.id === questId);
        if (!quest) {
            return res.status(404).json({ success: false, error: 'Quest not found' });
        }

        const user = await UserAccount.findOne({ user_id: userId });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (user.completed_quests && user.completed_quests.includes(questId)) {
            return res.status(400).json({ success: false, error: 'Quest already claimed' });
        }

        // Verify the user actually completed the task
        const verification = await verifyQuestCompletion(questId, user);
        if (!verification.eligible) {
            return res.status(403).json({
                success: false,
                error: verification.reason || 'Quest requirements not met'
            });
        }

        // Atomic update
        const updatedUser = await UserAccount.findOneAndUpdate(
            {
                user_id: userId,
                $or: [
                    { completed_quests: { $exists: false } },
                    { completed_quests: { $nin: [questId] } }
                ]
            },
            {
                $inc: { points: quest.xp },
                $addToSet: { completed_quests: questId }
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ success: false, error: 'Quest already claimed' });
        }

        // Create notification
        Notification.create({
            user_id: userId,
            type: 'quest_complete',
            message: `🎉 You earned ${quest.xp} XP for completing '${quest.title}'!`,
            metadata: { questId, points: quest.xp }
        }).catch(err => console.error('Notification failed:', err));

        res.json({
            success: true,
            totalPoints: updatedUser.points,
            pointsEarned: quest.xp
        });
    } catch (error) {
        console.error('[Quest] Claim failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route POST /api/quest/complete-tour
 * @desc Mark the onboarding tour as completed
 */
router.post('/complete-tour', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.user_id;

        const result = await UserAccount.findOneAndUpdate(
            { user_id: userId },
            {
                tour_completed: true,
                tour_completed_at: new Date()
            },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, message: 'Tour marked as completed' });
    } catch (error) {
        console.error('[Quest] Tour completion failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route POST /api/quest/track-action
 * @desc Track user actions for quest eligibility
 */
router.post('/track-action', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.user_id;
        const { action } = req.body;

        const validActions = {
            'view_data_controls': { viewed_data_controls: true },
            'view_activity_logs': { viewed_activity_logs: true },
            'extension_installed': { extension_installed: true, extension_installed_at: new Date() },
            'profile_shared': { $inc: { profile_shares_count: 1 } },
            'app_login': { $inc: { app_logins_count: 1 } },
            'x_shared': { x_shared: true },
            'community_joined': { community_joined: true }
        };

        if (!action || !validActions[action]) {
            return res.status(400).json({ success: false, error: 'Invalid action' });
        }

        const update = validActions[action];
        const isIncrement = update.$inc;

        await UserAccount.findOneAndUpdate(
            { user_id: userId },
            isIncrement ? update : { $set: update }
        );

        res.json({ success: true, action });
    } catch (error) {
        console.error('[Quest] Track action failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
