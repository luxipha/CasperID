const mongoose = require('/Users/abisoye/Projects/casperId/server/node_modules/mongoose');
require('/Users/abisoye/Projects/casperId/server/node_modules/dotenv').config({ path: '/Users/abisoye/Projects/casperId/server/.env' });

async function verifyDatabase() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        console.log('URI:', process.env.MONGODB_URI.replace(/:[^:@]*@/, ':***@'));
        
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Get current database name
        const dbName = mongoose.connection.db.databaseName;
        console.log('✅ Connected to database:', dbName);
        
        // List all collections in this database
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📁 Collections in casperID database:');
        collections.forEach(col => {
            console.log(`  - ${col.name}`);
        });
        
        // Count documents in each collection
        console.log('\n📊 Document counts:');
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`  - ${col.name}: ${count} documents`);
        }
        
        // Show sample of each collection (first document only)
        console.log('\n🔍 Sample documents (first doc from each collection):');
        for (const col of collections) {
            const sample = await mongoose.connection.db.collection(col.name).findOne();
            if (sample) {
                console.log(`\n  ${col.name}:`);
                console.log(`    ID: ${sample._id}`);
                if (sample.wallet) console.log(`    Wallet: ${sample.wallet}`);
                if (sample.email) console.log(`    Email: ${sample.email}`);
                if (sample.name) console.log(`    Name: ${sample.name}`);
                if (sample.created_at) console.log(`    Created: ${sample.created_at}`);
            }
        }
        
        // Check if this looks like data from other projects
        console.log('\n🔍 Checking for cross-contamination...');
        const verificationReqs = await mongoose.connection.db.collection('verificationrequests').find().limit(5).toArray();
        const credentials = await mongoose.connection.db.collection('credentials').find().limit(5).toArray();
        
        if (verificationReqs.length > 0) {
            console.log('VerificationRequests found - checking structure...');
            const firstReq = verificationReqs[0];
            if (firstReq.tier && ['basic', 'full_kyc'].includes(firstReq.tier)) {
                console.log('✅ Structure matches casperID schema');
            } else {
                console.log('⚠️  Structure might be from another project');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run verification
verifyDatabase();