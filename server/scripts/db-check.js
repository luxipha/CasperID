const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { UserAccount, UserProfile, VerificationRequest, AdminUser, Experience } = require('../src/database/models');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Search for Shina in all UserAccount fields
        const allAccounts = await UserAccount.find({});
        const shinaAccounts = allAccounts.filter(a => JSON.stringify(a).toLowerCase().includes('shina'));

        if (shinaAccounts.length > 0) {
            console.log(`Found ${shinaAccounts.length} UserAccounts containing "Shina":`);
            shinaAccounts.forEach(a => console.log(`ID: ${a.user_id}, Email: ${a.recovery_email}`));
        } else {
            console.log('No UserAccounts containing "Shina".');
        }

        // Search for Shina in all UserProfile fields
        const allProfiles = await UserProfile.find({});
        const shinaProfiles = allProfiles.filter(p => JSON.stringify(p).toLowerCase().includes('shina'));

        if (shinaProfiles.length > 0) {
            console.log(`Found ${shinaProfiles.length} UserProfiles containing "Shina":`);
            shinaProfiles.forEach(p => console.log(`Wallet: ${p.wallet}, Email: ${p.email}`));
        } else {
            console.log('No UserProfiles containing "Shina".');
        }

        // Check experiences for "resume"
        const allExperiences = await Experience.find({});
        const resumeExps = allExperiences.filter(e => JSON.stringify(e).toLowerCase().includes('resume'));
        if (resumeExps.length > 0) {
            console.log(`\nFound ${resumeExps.length} Experiences containing "resume":`);
            resumeExps.forEach(e => console.log(`Wallet: ${e.wallet}, Company: ${e.company_name}`));
        } else {
            console.log('\nNo Experiences containing "resume".');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

run();
