const express = require('express');
const router = express.Router();
const {
    UserProfile,
    Experience,
    Education,
    Certification,
    Skill,
    Project,
    Award,
    Language,
    Volunteer,
    Credential
} = require('../database/models');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ensureHumanIdInProfile, getHumanIdForWallet } = require('../utils/wallet-to-human');

// Configure File Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});


// ============================================
// PUBLIC PROFILE BY HUMAN_ID OR WALLET
// ============================================

/**
 * GET /api/public-profile/:identifier
 * Get public profile by human_id or wallet address
 */
router.get('/public-profile/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        console.log(`GET /public-profile/${identifier}`);

        const trimmedIdentifier = identifier.trim();
        let profile;

        // Find by wallet OR human_id (since identifier can be either)
        profile = await UserProfile.findOne({
            $or: [
                { wallet: trimmedIdentifier },
                { human_id: trimmedIdentifier }
            ]
        });

        // If still not found, check if user has credentials (verified user)
        if (!profile) {
            const credential = await Credential.findOne({
                $or: [
                    { wallet: trimmedIdentifier },
                    { human_id: trimmedIdentifier }
                ],
                revoked: false
            });

            if (credential) {
                // Found verified user, try to get their profile
                profile = await UserProfile.findOne({ wallet: credential.wallet });
            }
        }

        if (!profile) {
            return res.status(404).json({
                error: 'Profile not found',
                message: `No profile found for identifier: ${identifier}`
            });
        }

        // Ensure profile has human_id for SEO-friendly URLs
        try {
            const result = await ensureHumanIdInProfile(profile.wallet, { UserProfile, Credential });
            profile = result.profile;
            console.log(`Ensured human_id for public profile: ${result.humanId}`);
        } catch (error) {
            console.error('Error ensuring human_id for public profile:', error);
            // Continue with profile without human_id if generation fails
        }

        // Fetch related public-safe sections using the same wallet
        const wallet = profile.wallet;
        const [
            experiences,
            education,
            certifications,
            skills,
            projects,
            awards,
            languages,
            volunteers
        ] = await Promise.all([
            Experience.find({ wallet }).sort({ 'start_date.year': -1, 'start_date.month': -1, created_at: -1 }),
            Education.find({ wallet }).sort({ 'start_date.year': -1, 'start_date.month': -1, created_at: -1 }),
            Certification.find({ wallet }).sort({ 'issue_date.year': -1, 'issue_date.month': -1, created_at: -1 }),
            Skill.find({ wallet }).sort({ is_top_skill: -1, display_order: 1, created_at: -1 }),
            Project.find({ wallet }).sort({ 'start_date.year': -1, 'start_date.month': -1, created_at: -1 }),
            Award.find({ wallet }).sort({ 'issue_date.year': -1, 'issue_date.month': -1, created_at: -1 }),
            Language.find({ wallet }).sort({ display_order: 1, created_at: -1 }),
            Volunteer.find({ wallet }).sort({ 'start_date.year': -1, 'start_date.month': -1, created_at: -1 })
        ]);

        // Return public profile (include contact fields for public display)
        const publicProfile = {
            wallet: profile.wallet,
            human_id: profile.human_id, // Include human_id for SEO-friendly URLs
            cns_name: profile.cns_name,
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
            phone_number: profile.phone_number,
            headline: profile.headline,
            profile_image_url: profile.profile_image_url,
            cover_image_url: profile.cover_image_url,
            city: profile.city,
            country: profile.country,
            website: profile.website,
            portfolio_links: profile.portfolio_links,
            about: profile.about,
            socials: profile.socials,
            open_to_work: profile.open_to_work,
            industry: profile.industry,
            seniority_level: profile.seniority_level,
            profile_completeness: profile.profile_completeness,
            pronouns: profile.pronouns,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            experiences,
            education,
            certifications,
            skills,
            projects,
            awards,
            languages,
            volunteers
            // Note: wallet address is NOT included for privacy
        };

        res.json(publicProfile);
    } catch (error) {
        console.error('Get public profile error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch public profile' });
    }
});

// ============================================
// USER PROFILE - Main Profile
// ============================================

/**
 * GET /api/profile/:wallet
 * Get complete user profile
 */
router.get('/profile/:wallet', async (req, res) => {
    try {
        const { wallet } = req.params;
        console.log(`GET /profile/${wallet}`);

        const trimmedWallet = wallet.trim();
        let profile = await UserProfile.findOne({
            $or: [
                { wallet: trimmedWallet },
                { human_id: trimmedWallet }
            ]
        });
        console.log(`Found profile:`, !!profile);

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Ensure profile has human_id
        if (!profile.human_id) {
            try {
                const result = await ensureHumanIdInProfile(trimmedWallet, { UserProfile, Credential });
                profile = result.profile;
                console.log(`Generated human_id for profile: ${result.humanId}`);
            } catch (error) {
                console.error('Error ensuring human_id:', error);
                // Continue with profile without human_id if generation fails
            }
        }

        res.json(profile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch profile' });
    }
});

/**
 * PUT /api/profile/:wallet
 * Update user profile
 */
router.put('/profile/:wallet', async (req, res) => {
    try {
        const { wallet } = req.params;
        const updates = req.body;

        console.log(`Updating profile for ${wallet}`, updates);

        // Security: Remove wallet/id from updates to avoid overwriting
        delete updates.wallet;
        delete updates._id;
        delete updates.human_id; // Prevent manual human_id updates

        // First ensure the profile has a human_id
        let profile;
        try {
            const result = await ensureHumanIdInProfile(wallet, { UserProfile, Credential });
            console.log(`Ensured human_id: ${result.humanId}`);

            // Now update with the provided data
            profile = await UserProfile.findOneAndUpdate(
                { wallet },
                { $set: updates },
                { new: true, runValidators: true }
            );
        } catch (humanIdError) {
            console.error('Error ensuring human_id:', humanIdError);
            // Fallback: update without human_id generation
            profile = await UserProfile.findOneAndUpdate(
                { wallet },
                {
                    $set: updates,
                    $setOnInsert: { wallet }
                },
                { new: true, upsert: true, runValidators: true }
            );
        }

        console.log('Profile updated/created:', profile ? profile._id : 'null');
        res.json(profile);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
});



/**
 * GET /api/profile/random-banner
 * Get a random banner image from Unsplash
 */
router.get('/random-banner', async (req, res) => {
    try {
        const accessKey = process.env.UNSPLASH_ACCESS_KEY;

        // If no key, fallback to Picsum
        if (!accessKey) {
            console.warn('UNSPLASH_ACCESS_KEY not configured, falling back to Picsum');
            return res.json({ imageUrl: `https://picsum.photos/seed/${Date.now()}/1600/900` });
        }

        // Use standard fetch (Node 18+)
        const response = await fetch('https://api.unsplash.com/photos/random?orientation=landscape&query=technology,abstract,digital,blockchain', {
            headers: {
                'Authorization': `Client-ID ${accessKey}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Unsplash API error:', response.status, errorText);
            // Fallback on error
            return res.json({ imageUrl: `https://picsum.photos/seed/${Date.now()}/1600/900` });
        }

        const data = await response.json();
        res.json({ imageUrl: data.urls.regular });
    } catch (error) {
        console.error('Random banner error:', error);
        // Fallback on exception
        res.json({ imageUrl: `https://picsum.photos/seed/${Date.now()}/1600/900` });
    }
});

/**
 * POST /api/profile/:wallet/upload-avatar
 * Upload profile picture
 */
router.post('/profile/:wallet/upload-avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { wallet } = req.params;
        // Construct URL based on server configuration (assuming /uploads is served statically)
        // In local dev, this is strictly relative path, frontend should prepend backend URL
        const imageUrl = `/uploads/${req.file.filename}`;

        const profile = await UserProfile.findOneAndUpdate(
            { wallet },
            { $set: { profile_image_url: imageUrl } },
            { new: true, upsert: true }
        );

        res.json({ profile, imageUrl });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload image' });
    }
});

// ============================================
// EXPERIENCE - Work History
// ============================================

/**
 * GET /api/profile/:wallet/experience
 * Get all experiences for a user
 */
router.get('/profile/:wallet/experience', async (req, res) => {
    try {
        const { wallet } = req.params;
        const experiences = await Experience.find({ wallet }).sort({ display_order: 1, created_at: -1 });
        res.json(experiences);
    } catch (error) {
        console.error('Get experiences error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch experiences' });
    }
});

/**
 * POST /api/profile/:wallet/experience
 * Add new experience
 */
router.post('/profile/:wallet/experience', async (req, res) => {
    try {
        const { wallet } = req.params;
        const experienceData = { ...req.body, wallet };

        const experience = new Experience(experienceData);
        await experience.save();

        res.status(201).json(experience);
    } catch (error) {
        console.error('Add experience error:', error);
        res.status(500).json({ error: error.message || 'Failed to add experience' });
    }
});

/**
 * PUT /api/profile/:wallet/experience/:id
 * Update experience
 */
router.put('/profile/:wallet/experience/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const experience = await Experience.findOneAndUpdate(
            { _id: id, wallet },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!experience) {
            return res.status(404).json({ error: 'Experience not found' });
        }

        res.json(experience);
    } catch (error) {
        console.error('Update experience error:', error);
        res.status(500).json({ error: error.message || 'Failed to update experience' });
    }
});

/**
 * DELETE /api/profile/:wallet/experience/:id
 * Delete experience
 */
router.delete('/profile/:wallet/experience/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const experience = await Experience.findOneAndDelete({ _id: id, wallet });

        if (!experience) {
            return res.status(404).json({ error: 'Experience not found' });
        }

        res.json({ message: 'Experience deleted successfully' });
    } catch (error) {
        console.error('Delete experience error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete experience' });
    }
});

// ============================================
// EDUCATION
// ============================================

router.get('/profile/:wallet/education', async (req, res) => {
    try {
        const { wallet } = req.params;
        const education = await Education.find({ wallet }).sort({ display_order: 1, created_at: -1 });
        res.json(education);
    } catch (error) {
        console.error('Get education error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch education' });
    }
});

router.post('/profile/:wallet/education', async (req, res) => {
    try {
        const { wallet } = req.params;
        const educationData = { ...req.body, wallet };

        const education = new Education(educationData);
        await education.save();

        res.status(201).json(education);
    } catch (error) {
        console.error('Add education error:', error);
        res.status(500).json({ error: error.message || 'Failed to add education' });
    }
});

router.put('/profile/:wallet/education/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const education = await Education.findOneAndUpdate(
            { _id: id, wallet },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!education) {
            return res.status(404).json({ error: 'Education not found' });
        }

        res.json(education);
    } catch (error) {
        console.error('Update education error:', error);
        res.status(500).json({ error: error.message || 'Failed to update education' });
    }
});

router.delete('/profile/:wallet/education/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const education = await Education.findOneAndDelete({ _id: id, wallet });

        if (!education) {
            return res.status(404).json({ error: 'Education not found' });
        }

        res.json({ message: 'Education deleted successfully' });
    } catch (error) {
        console.error('Delete education error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete education' });
    }
});

// ============================================
// CERTIFICATIONS
// ============================================

router.get('/profile/:wallet/certifications', async (req, res) => {
    try {
        const { wallet } = req.params;
        const certifications = await Certification.find({ wallet }).sort({ display_order: 1, created_at: -1 });
        res.json(certifications);
    } catch (error) {
        console.error('Get certifications error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch certifications' });
    }
});

router.post('/profile/:wallet/certifications', async (req, res) => {
    try {
        const { wallet } = req.params;
        const certData = { ...req.body, wallet };

        const certification = new Certification(certData);
        await certification.save();

        res.status(201).json(certification);
    } catch (error) {
        console.error('Add certification error:', error);
        res.status(500).json({ error: error.message || 'Failed to add certification' });
    }
});

router.put('/profile/:wallet/certifications/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const certification = await Certification.findOneAndUpdate(
            { _id: id, wallet },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!certification) {
            return res.status(404).json({ error: 'Certification not found' });
        }

        res.json(certification);
    } catch (error) {
        console.error('Update certification error:', error);
        res.status(500).json({ error: error.message || 'Failed to update certification' });
    }
});

router.delete('/profile/:wallet/certifications/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const certification = await Certification.findOneAndDelete({ _id: id, wallet });

        if (!certification) {
            return res.status(404).json({ error: 'Certification not found' });
        }

        res.json({ message: 'Certification deleted successfully' });
    } catch (error) {
        console.error('Delete certification error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete certification' });
    }
});

// ============================================
// SKILLS
// ============================================

router.get('/profile/:wallet/skills', async (req, res) => {
    try {
        const { wallet } = req.params;
        const skills = await Skill.find({ wallet }).sort({ is_top_skill: -1, display_order: 1 });
        res.json(skills);
    } catch (error) {
        console.error('Get skills error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch skills' });
    }
});

router.post('/profile/:wallet/skills', async (req, res) => {
    try {
        const { wallet } = req.params;
        const skillData = { ...req.body, wallet };

        const skill = new Skill(skillData);
        await skill.save();

        res.status(201).json(skill);
    } catch (error) {
        console.error('Add skill error:', error);
        res.status(500).json({ error: error.message || 'Failed to add skill' });
    }
});

router.put('/profile/:wallet/skills/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const skill = await Skill.findOneAndUpdate(
            { _id: id, wallet },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        res.json(skill);
    } catch (error) {
        console.error('Update skill error:', error);
        res.status(500).json({ error: error.message || 'Failed to update skill' });
    }
});

router.delete('/profile/:wallet/skills/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const skill = await Skill.findOneAndDelete({ _id: id, wallet });

        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        console.error('Delete skill error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete skill' });
    }
});

// ============================================
// PROJECTS
// ============================================

router.get('/profile/:wallet/projects', async (req, res) => {
    try {
        const { wallet } = req.params;
        const projects = await Project.find({ wallet }).sort({ display_order: 1, created_at: -1 });
        res.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch projects' });
    }
});

router.post('/profile/:wallet/projects', async (req, res) => {
    try {
        const { wallet } = req.params;
        const projectData = { ...req.body, wallet };

        const project = new Project(projectData);
        await project.save();

        res.status(201).json(project);
    } catch (error) {
        console.error('Add project error:', error);
        res.status(500).json({ error: error.message || 'Failed to add project' });
    }
});

router.put('/profile/:wallet/projects/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const project = await Project.findOneAndUpdate(
            { _id: id, wallet },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ error: error.message || 'Failed to update project' });
    }
});

router.delete('/profile/:wallet/projects/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const project = await Project.findOneAndDelete({ _id: id, wallet });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete project' });
    }
});

// ============================================
// AWARDS
// ============================================

router.get('/profile/:wallet/awards', async (req, res) => {
    try {
        const { wallet } = req.params;
        const awards = await Award.find({ wallet }).sort({ display_order: 1, created_at: -1 });
        res.json(awards);
    } catch (error) {
        console.error('Get awards error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch awards' });
    }
});

router.post('/profile/:wallet/awards', async (req, res) => {
    try {
        const { wallet } = req.params;
        const awardData = { ...req.body, wallet };

        const award = new Award(awardData);
        await award.save();

        res.status(201).json(award);
    } catch (error) {
        console.error('Add award error:', error);
        res.status(500).json({ error: error.message || 'Failed to add award' });
    }
});

router.put('/profile/:wallet/awards/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const award = await Award.findOneAndUpdate(
            { _id: id, wallet },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!award) {
            return res.status(404).json({ error: 'Award not found' });
        }

        res.json(award);
    } catch (error) {
        console.error('Update award error:', error);
        res.status(500).json({ error: error.message || 'Failed to update award' });
    }
});

router.delete('/profile/:wallet/awards/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const award = await Award.findOneAndDelete({ _id: id, wallet });

        if (!award) {
            return res.status(404).json({ error: 'Award not found' });
        }

        res.json({ message: 'Award deleted successfully' });
    } catch (error) {
        console.error('Delete award error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete award' });
    }
});

// ============================================
// LANGUAGES
// ============================================

router.get('/profile/:wallet/languages', async (req, res) => {
    try {
        const { wallet } = req.params;
        const languages = await Language.find({ wallet }).sort({ display_order: 1 });
        res.json(languages);
    } catch (error) {
        console.error('Get languages error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch languages' });
    }
});

router.post('/profile/:wallet/languages', async (req, res) => {
    try {
        const { wallet } = req.params;
        const languageData = { ...req.body, wallet };

        const language = new Language(languageData);
        await language.save();

        res.status(201).json(language);
    } catch (error) {
        console.error('Add language error:', error);
        res.status(500).json({ error: error.message || 'Failed to add language' });
    }
});

router.put('/profile/:wallet/languages/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const language = await Language.findOneAndUpdate(
            { _id: id, wallet },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!language) {
            return res.status(404).json({ error: 'Language not found' });
        }

        res.json(language);
    } catch (error) {
        console.error('Update language error:', error);
        res.status(500).json({ error: error.message || 'Failed to update language' });
    }
});

router.delete('/profile/:wallet/languages/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const language = await Language.findOneAndDelete({ _id: id, wallet });

        if (!language) {
            return res.status(404).json({ error: 'Language not found' });
        }

        res.json({ message: 'Language deleted successfully' });
    } catch (error) {
        console.error('Delete language error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete language' });
    }
});

// ============================================
// VOLUNTEER EXPERIENCE
// ============================================

router.get('/profile/:wallet/volunteer', async (req, res) => {
    try {
        const { wallet } = req.params;
        const volunteer = await Volunteer.find({ wallet }).sort({ display_order: 1, created_at: -1 });
        res.json(volunteer);
    } catch (error) {
        console.error('Get volunteer error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch volunteer experience' });
    }
});

router.post('/profile/:wallet/volunteer', async (req, res) => {
    try {
        const { wallet } = req.params;
        const volunteerData = { ...req.body, wallet };

        const volunteer = new Volunteer(volunteerData);
        await volunteer.save();

        res.status(201).json(volunteer);
    } catch (error) {
        console.error('Add volunteer error:', error);
        res.status(500).json({ error: error.message || 'Failed to add volunteer experience' });
    }
});

router.put('/profile/:wallet/volunteer/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const volunteer = await Volunteer.findOneAndUpdate(
            { _id: id, wallet },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer experience not found' });
        }

        res.json(volunteer);
    } catch (error) {
        console.error('Update volunteer error:', error);
        res.status(500).json({ error: error.message || 'Failed to update volunteer experience' });
    }
});

router.delete('/profile/:wallet/volunteer/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const volunteer = await Volunteer.findOneAndDelete({ _id: id, wallet });

        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer experience not found' });
        }

        res.json({ message: 'Volunteer experience deleted successfully' });
    } catch (error) {
        console.error('Delete volunteer error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete volunteer experience' });
    }
});

module.exports = router;
