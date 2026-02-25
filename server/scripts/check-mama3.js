const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { UserAccount, UserProfile, Experience } = require('../src/database/models');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'mama3@yahoo.com';

        // Find the UserAccount
        const account = await UserAccount.findOne({ recovery_email: email });
        if (account) {
            console.log(`\nFound UserAccount for ${email}:`);
            console.log(`ID: ${account.user_id}`);
            console.log(`Email Verified: ${account.email_verified}`);
            console.log(`Wallet: ${account.wallet}`);
            console.log(`CNS Name: ${account.cns_name}`);
            console.log(`Recovery Email: ${account.recovery_email}`);

            // Find matching profile
            const profile = await UserProfile.findOne({ wallet: account.wallet });
            if (profile) {
                console.log(`\nFound UserProfile:`);
                console.log(`Name: ${profile.first_name || ''} ${profile.last_name || ''}`);
                console.log(`Headline: ${profile.headline || 'None'}`);
                console.log(`About: ${profile.about || 'None'}`);
            }

            // Find experiences
            const exps = await Experience.find({ wallet: account.wallet });
            if (exps.length > 0) {
                console.log(`\nExperiences (${exps.length}):`);
                exps.forEach(e => {
                    console.log(`- ${e.job_title} at ${e.company_name}`);
                });
            }
        } else {
            console.log(`\nNo UserAccount found for ${email}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

run();
