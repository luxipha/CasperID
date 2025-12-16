const mongoose = require('/Users/abisoye/Projects/casperId/server/node_modules/mongoose');
require('/Users/abisoye/Projects/casperId/server/node_modules/dotenv').config({ path: '/Users/abisoye/Projects/casperId/server/.env' });

// Collections that belong to casperID (keep these)
const CASPER_COLLECTIONS = [
    'verificationrequests',
    'credentials', 
    'issuers'
];

async function cleanDatabase() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        
        const dbName = mongoose.connection.db.databaseName;
        console.log('✅ Connected to database:', dbName);
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`\n📁 Found ${collections.length} collections`);
        
        // Find collections to remove (not in CASPER_COLLECTIONS)
        const toRemove = collections.filter(col => !CASPER_COLLECTIONS.includes(col.name));
        const toKeep = collections.filter(col => CASPER_COLLECTIONS.includes(col.name));
        
        console.log(`\n✅ Keeping ${toKeep.length} casperID collections:`);
        toKeep.forEach(col => {
            console.log(`   - ${col.name}`);
        });
        
        console.log(`\n🗑️  Will remove ${toRemove.length} foreign collections:`);
        toRemove.forEach(col => {
            console.log(`   - ${col.name}`);
        });
        
        // Ask for confirmation
        console.log('\n⚠️  WARNING: This will permanently delete the foreign collections!');
        console.log('   Only casperID collections (verificationrequests, credentials, issuers) will remain.');
        console.log('\n   To proceed, run: node clean-db.js --confirm');
        
        // Check if --confirm flag is provided
        if (process.argv.includes('--confirm')) {
            console.log('\n🚀 Starting cleanup...');
            
            for (const col of toRemove) {
                try {
                    await mongoose.connection.db.collection(col.name).drop();
                    console.log(`   ✅ Removed: ${col.name}`);
                } catch (err) {
                    if (err.codeName === 'NamespaceNotFound') {
                        console.log(`   ⚠️  Already gone: ${col.name}`);
                    } else {
                        console.log(`   ❌ Error removing ${col.name}:`, err.message);
                    }
                }
            }
            
            console.log('\n🎉 Cleanup completed!');
            
            // Verify results
            const newCollections = await mongoose.connection.db.listCollections().toArray();
            console.log(`\n📊 Database now has ${newCollections.length} collections:`);
            newCollections.forEach(col => {
                console.log(`   - ${col.name}`);
            });
            
        } else {
            console.log('\n💡 No action taken. Add --confirm flag to proceed.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

cleanDatabase();