const mongoose = require('mongoose');
require('dotenv').config();

async function checkDb() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const { BusinessApp } = require('./server/src/database/models');
        
        const apps = await BusinessApp.find({ active: true });
        console.log('Total Active Apps:', apps.length);
        
        apps.forEach(app => {
            console.log('--- App ---');
            console.log('Name:', app.name);
            console.log('App ID:', app.app_id);
            console.log('Android Assets:', JSON.stringify(app.android_digital_assets, null, 2));
            console.log('Allowed Origins:', app.allowed_origins);
            console.log('---');
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDb();
