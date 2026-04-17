const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/abisoye/Projects/casperId/server/.env' });

async function checkApp() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const { BusinessApp } = require('/Users/abisoye/Projects/casperId/server/src/database/models');
        
        const appId = 'app_O5X5EtzieSD46AWNJpQulD8KNzVqbYb1';
        const app = await BusinessApp.findOne({ app_id: appId });
        
        if (!app) {
            console.log('App not found');
        } else {
            console.log('App ID:', app.app_id);
            console.log('Allowed Origins:', JSON.stringify(app.allowed_origins));
            console.log('Is it an array?', Array.isArray(app.allowed_origins));
            console.log('Array length:', app.allowed_origins.length);
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkApp();
