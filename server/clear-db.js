#!/usr/bin/env node
const mongoose = require('mongoose');
require('dotenv').config();

async function clearDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all collections
        const collections = await mongoose.connection.db.collections();
        
        console.log('🗑️  Clearing all collections...');
        
        for (const collection of collections) {
            const count = await collection.countDocuments();
            if (count > 0) {
                await collection.deleteMany({});
                console.log(`   ✅ Cleared ${collection.collectionName}: ${count} documents`);
            } else {
                console.log(`   ⚪ ${collection.collectionName}: already empty`);
            }
        }
        
        console.log('🎉 Database cleared successfully!');
        
        // Close connection
        await mongoose.disconnect();
        console.log('📴 Disconnected from MongoDB');
        
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    clearDatabase();
}

module.exports = clearDatabase;