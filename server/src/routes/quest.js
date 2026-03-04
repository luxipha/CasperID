const express = require('express');
const router = express.Router();
const { UserAccount, Notification, Quest } = require('../database/models');

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
 * @route POST /api/quest/claim
 * @desc Claim points for a completed quest
 */
router.post('/claim', async (req, res) => {
    try {
        const { questId, userId } = req.body;
        const targetUserId = userId || req.headers['x-user-id'];

        if (!targetUserId) {
            return res.status(400).json({ success: false, error: 'User ID required' });
        }

        const quest = await Quest.findOne({ quest_id: questId, active: true });
        if (!quest) {
            return res.status(404).json({ success: false, error: 'Quest not found or inactive' });
        }

        const user = await UserAccount.findOne({ user_id: targetUserId });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (user.completed_quests && user.completed_quests.includes(questId)) {
            return res.status(400).json({ success: false, error: 'Quest already completed' });
        }

        user.points = (user.points || 0) + quest.points;
        if (!user.completed_quests) user.completed_quests = [];
        user.completed_quests.push(questId);
        await user.save();

        try {
            await Notification.create({
                recipientWallet: user.wallet || 'internal',
                type: 'quest_complete',
                message: `🎉 You earned ${quest.points} XP for completing '${quest.title}'!`,
                metadata: { questId, points: quest.points }
            });
        } catch (nErr) {
            console.error('Notification failed:', nErr);
        }

        res.json({
            success: true,
            totalPoints: user.points,
            pointsEarned: quest.points
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route GET /api/quest/status
 */
router.get('/status', async (req, res) => {
    try {
        const userId = req.query.userId || req.headers['x-user-id'];
        if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

        const [user, allQuests] = await Promise.all([
            UserAccount.findOne({ user_id: userId }),
            Quest.find({ active: true })
        ]);

        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        res.json({
            success: true,
            points: user.points || 0,
            completedQuests: user.completed_quests || [],
            availableQuests: allQuests.map(q => ({
                id: q.quest_id,
                title: q.title,
                xp: q.points,
                icon: q.icon
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin CRUD Routes
router.get('/admin/list', async (req, res) => {
    try {
        const quests = await Quest.find().sort({ created_at: -1 });
        res.json({ success: true, quests });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/admin/add', async (req, res) => {
    try {
        const quest = new Quest(req.body);
        await quest.save();
        res.json({ success: true, quest });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/admin/update/:id', async (req, res) => {
    try {
        const quest = await Quest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, quest });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/admin/delete/:id', async (req, res) => {
    try {
        await Quest.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
