const express = require('express');
const router = express.Router();
const { UserAccount, Notification } = require('../database/models');

// Quest Definitions
const QUESTS = {
    'tour_complete': { points: 100, title: 'Identity Tour Complete' },
    'layer_2_verify': { points: 500, title: 'Liveness Master' },
    'cid_register': { points: 300, title: 'Name Owner' },
    'persona_create': { points: 200, title: 'Persona Architect' }
};

/**
 * @route POST /api/quest/claim
 * @desc Claim points for a completed quest
 */
router.post('/claim', async (req, res) => {
    try {
        const { questId, userId } = req.body;
        // userId can come from body or header for flexibility
        const targetUserId = userId || req.headers['x-user-id'];

        if (!targetUserId) {
            return res.status(400).json({ success: false, error: 'User ID required' });
        }

        const quest = QUESTS[questId];
        if (!quest) {
            return res.status(400).json({ success: false, error: 'Invalid quest ID' });
        }

        const user = await UserAccount.findOne({ user_id: targetUserId });
        if (!user) {
            console.error(`❌ [QuestRoute] User not found for ID: ${targetUserId}`);
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Check if quest already completed
        if (user.completed_quests && user.completed_quests.includes(questId)) {
            return res.status(400).json({ success: false, error: 'Quest already completed' });
        }

        // Add points and mark quest as complete
        user.points = (user.points || 0) + quest.points;
        if (!user.completed_quests) user.completed_quests = [];
        user.completed_quests.push(questId);
        await user.save();

        // Create success notification
        try {
            await Notification.create({
                recipientWallet: user.wallet || 'internal',
                type: 'quest_complete',
                message: `🎉 You earned ${quest.points} XP for completing '${quest.title}'!`,
                metadata: { questId, points: quest.points }
            });
        } catch (notificationError) {
            console.error('❌ [QuestRoute] Notification failed:', notificationError);
        }

        res.json({
            success: true,
            totalPoints: user.points,
            pointsEarned: quest.points,
            message: `Claimed ${quest.points} points for ${quest.title}`
        });
    } catch (error) {
        console.error('❌ [QuestRoute] Failed to claim quest:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @route GET /api/quest/status
 * @desc Get user points and completed quests
 */
router.get('/status', async (req, res) => {
    try {
        const userId = req.query.userId || req.headers['x-user-id'];

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID required' });
        }

        const user = await UserAccount.findOne({ user_id: userId });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            points: user.points || 0,
            completedQuests: user.completed_quests || []
        });
    } catch (error) {
        console.error('❌ [QuestRoute] Failed to get status:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
