const express = require('express');
const router = express.Router();
const { UserAccount, Notification, Quest, Credential } = require('../database/models');
const { requireAuth, adminAuth } = require('../middleware/auth');
const { rateLimitMiddleware } = require('../utils/rate-limiter');

/**
 * Seed initial quests if none exist
 */
const seedQuests = async () => {
    try {
        const count = await Quest.countDocuments();
        if (count === 0) {
            const initialQuests = [
                { quest_id: 'tour_complete', title: 'Complete Onboarding Tour', points: 100, icon: 'map' },
                { quest_id: 'layer_2_verify', title: 'Complete Liveness Check', points: 500, icon: 'face' },
                { quest_id: 'cid_register', title: 'Register .cid Name', points: 300, icon: 'badge' },
                { quest_id: 'persona_create', title: 'Create your first Persona', points: 200, icon: 'person_add' }
            ];
            await Quest.insertMany(initialQuests);
            console.log('✅ [QuestRoute] Initial quests seeded');
        }
    } catch (err) {
        console.error('❌ [QuestRoute] Seeding failed:', err);
    }
};
seedQuests();

/**
 * Verify if user has actually completed the quest task
 * @param {string} questId - The quest identifier
 * @param {object} user - The user account document
 * @returns {Promise<{eligible: boolean, reason?: string}>}
 */
const verifyQuestCompletion = async (questId, user) => {
    switch (questId) {
        case 'tour_complete':
            // Check if user has completed onboarding tour (tracked in user account)
            if (user.onboarding_completed || user.tour_completed) {
                return { eligible: true };
            }
            return { eligible: false, reason: 'Complete the onboarding tour first' };

        case 'layer_2_verify':
            // Check if user has a verified credential with liveness check
            const credential = await Credential.findOne({
                wallet: user.wallet,
                'verification_data.liveness_verified': true
            });
            if (credential) {
                return { eligible: true };
            }
            return { eligible: false, reason: 'Complete liveness verification first' };

        case 'cid_register':
            // Check if user has registered a .cid name
            if (user.cns_name || user.cid_name) {
                return { eligible: true };
            }
            return { eligible: false, reason: 'Register a .cid name first' };

        case 'persona_create':
            // Check if user has created at least one persona
            if (user.personas && user.personas.length > 0) {
                return { eligible: true };
            }
            return { eligible: false, reason: 'Create a persona first' };

        default:
            // For unknown quests, check if there's a generic completion flag
            console.warn(`[Quest] Unknown quest type: ${questId}`);
            return { eligible: false, reason: 'Quest verification not configured' };
    }
};

/**
 * @route GET /api/quest/eligibility
 * @desc Check which quests the user is eligible to claim
 */
router.get('/eligibility', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.user_id;
        const user = await UserAccount.findOne({ user_id: userId });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const allQuests = await Quest.find({ active: true });
        const eligibility = {};

        for (const quest of allQuests) {
            if (user.completed_quests?.includes(quest.quest_id)) {
                eligibility[quest.quest_id] = { eligible: false, reason: 'Already claimed', claimed: true };
            } else {
                const result = await verifyQuestCompletion(quest.quest_id, user);
                eligibility[quest.quest_id] = { ...result, claimed: false };
            }
        }

        res.json({ success: true, eligibility });
    } catch (error) {
        console.error('[Quest] Eligibility check failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route POST /api/quest/claim
 * @desc Claim points for a completed quest (requires authentication & task verification)
 */
router.post('/claim', requireAuth, rateLimitMiddleware('quest_claim'), async (req, res) => {
    try {
        const { questId } = req.body;
        // Use authenticated user ID - prevents spoofing
        const userId = req.user.userId || req.user.user_id;

        if (!questId) {
            return res.status(400).json({ success: false, error: 'Quest ID required' });
        }

        const quest = await Quest.findOne({ quest_id: questId, active: true });
        if (!quest) {
            return res.status(404).json({ success: false, error: 'Quest not found or inactive' });
        }

        const user = await UserAccount.findOne({ user_id: userId });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (user.completed_quests && user.completed_quests.includes(questId)) {
            return res.status(400).json({ success: false, error: 'Quest already claimed' });
        }

        // CRITICAL: Verify the user actually completed the task
        const verification = await verifyQuestCompletion(questId, user);
        if (!verification.eligible) {
            return res.status(403).json({
                success: false,
                error: verification.reason || 'Quest requirements not met'
            });
        }

        // Use atomic operation to prevent race conditions
        // $nin is more explicit for array membership check than $ne
        const updatedUser = await UserAccount.findOneAndUpdate(
            {
                user_id: userId,
                // Ensure quest not already in completed list (double-check)
                $or: [
                    { completed_quests: { $exists: false } },
                    { completed_quests: { $nin: [questId] } }
                ]
            },
            {
                $inc: { points: quest.points },
                $addToSet: { completed_quests: questId } // $addToSet prevents duplicates
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ success: false, error: 'Quest already claimed or user not found' });
        }

        // Create notification (non-blocking)
        Notification.create({
            recipientWallet: user.wallet || 'internal',
            type: 'quest_complete',
            message: `🎉 You earned ${quest.points} XP for completing '${quest.title}'!`,
            metadata: { questId, points: quest.points }
        }).catch(err => console.error('Notification failed:', err));

        res.json({
            success: true,
            totalPoints: updatedUser.points,
            pointsEarned: quest.points
        });
    } catch (error) {
        console.error('[Quest] Claim failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route POST /api/quest/complete-tour
 * @desc Mark the onboarding tour as completed (called when tour finishes)
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
 * @route GET /api/quest/status
 * @desc Get quest status for authenticated user
 */
router.get('/status', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.user_id;

        const [user, allQuests] = await Promise.all([
            UserAccount.findOne({ user_id: userId }),
            Quest.find({ active: true })
        ]);

        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        // Build eligibility info for each quest
        const questsWithEligibility = await Promise.all(
            allQuests.map(async (q) => {
                const isCompleted = user.completed_quests?.includes(q.quest_id);
                let eligible = false;
                let reason = null;

                if (!isCompleted) {
                    const verification = await verifyQuestCompletion(q.quest_id, user);
                    eligible = verification.eligible;
                    reason = verification.reason;
                }

                return {
                    id: q.quest_id,
                    title: q.title,
                    xp: q.points,
                    icon: q.icon,
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
            availableQuests: questsWithEligibility
        });
    } catch (error) {
        console.error('[Quest] Status fetch failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// Admin CRUD Routes (Protected)
// ============================================

router.get('/admin/list', adminAuth, async (req, res) => {
    try {
        const quests = await Quest.find().sort({ created_at: -1 });
        res.json({ success: true, quests });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/admin/add', adminAuth, async (req, res) => {
    try {
        const { quest_id, title, description, points, icon } = req.body;

        // Validate required fields
        if (!quest_id || !title || points === undefined) {
            return res.status(400).json({ success: false, error: 'quest_id, title, and points are required' });
        }

        // Sanitize points to prevent abuse
        const sanitizedPoints = Math.min(Math.max(0, parseInt(points, 10)), 10000);

        const quest = new Quest({
            quest_id,
            title,
            description,
            points: sanitizedPoints,
            icon
        });
        await quest.save();
        res.json({ success: true, quest });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/admin/update/:id', adminAuth, async (req, res) => {
    try {
        const { points, ...otherFields } = req.body;

        // Sanitize points if being updated
        const updateData = { ...otherFields };
        if (points !== undefined) {
            updateData.points = Math.min(Math.max(0, parseInt(points, 10)), 10000);
        }

        const quest = await Quest.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!quest) {
            return res.status(404).json({ success: false, error: 'Quest not found' });
        }
        res.json({ success: true, quest });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/admin/delete/:id', adminAuth, async (req, res) => {
    try {
        const quest = await Quest.findByIdAndDelete(req.params.id);
        if (!quest) {
            return res.status(404).json({ success: false, error: 'Quest not found' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
