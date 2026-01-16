require('dotenv').config();
const mongoose = require('mongoose');
const { Skill, UserProfile } = require('../src/database/models');

async function checkSkillsDb() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Check all skills in database
        console.log('\n--- All Skills in Database ---');
        const allSkills = await Skill.find({});
        console.log(`Found ${allSkills.length} total skills:`);
        allSkills.forEach((skill, index) => {
            console.log(`${index + 1}. ${skill.skill_name} (Wallet: ${skill.wallet}) - Created: ${skill.created_at}`);
        });

        // Check all user profiles to see if there are any users with wallets
        console.log('\n--- User Profiles with Wallets ---');
        const profiles = await UserProfile.find({}, { wallet: 1, first_name: 1, last_name: 1, email: 1 });
        console.log(`Found ${profiles.length} profiles:`);
        profiles.forEach((profile, index) => {
            console.log(`${index + 1}. ${profile.first_name} ${profile.last_name} (${profile.email}) - Wallet: ${profile.wallet}`);
        });

        // Check skills for each profile
        if (profiles.length > 0) {
            console.log('\n--- Skills per Profile ---');
            for (const profile of profiles) {
                const skillsForProfile = await Skill.find({ wallet: profile.wallet });
                console.log(`${profile.first_name} ${profile.last_name} (${profile.wallet}): ${skillsForProfile.length} skills`);
                skillsForProfile.forEach((skill, index) => {
                    console.log(`  ${index + 1}. ${skill.skill_name}`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
}

checkSkillsDb();