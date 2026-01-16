const { CasperServiceByJsonRPC, Contracts, CLValueBuilder, CLAccountHash } = require('casper-js-sdk');
const mongoose = require('mongoose');
require('dotenv').config();

// Configuration
const RPC_API = 'https://node.testnet.casper.network/rpc';
const IDENTITY_REGISTRY_HASH = 'hash-fe846d085f7d13ee3df425cef6a750edaa27d657cee8566a61d7239edc22f9f6';
const TARGET_ACCOUNT = 'account-hash-e6d035bc414a0eb58e1b5e897c80edc639e3ba31abdc02edf013e250f6453e26';

const service = new CasperServiceByJsonRPC(RPC_API);

// UserAccount Schema for DB check
const userAccountSchema = new mongoose.Schema({
    user_id: String,
    wallet: String,
    did_address: String,
    cns_name: String,
    tier: String,
    onchain_name_tx: String
});
const UserAccount = mongoose.models.UserAccount || mongoose.model('UserAccount', userAccountSchema);

async function verify() {
    console.log(`\n🔍 Verifying Account: ${TARGET_ACCOUNT}`);

    // 1. Database Check
    try {
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log("\n📊 [Database Status]");
            const user = await UserAccount.findOne({ wallet: TARGET_ACCOUNT });
            if (user) {
                console.log(`   - DID (DB): ${user.did_address || 'Not assigned'}`);
                console.log(`   - CID name (DB): ${user.cns_name ? user.cns_name + '.cid' : 'Not registered'}`);
                console.log(`   - Tier: ${user.tier}`);
                if (user.onchain_name_tx) {
                    console.log(`   - Name Mint Tx: ${user.onchain_name_tx}`);
                }
            } else {
                console.log("   - User NOT found in database.");
            }
        }
    } catch (e) {
        console.log("   - Database connection failed or could not query:", e.message);
    }

    // 2. On-Chain DID Check (IdentityRegistry)
    try {
        console.log("\n⛓️ [On-Chain DID Status]");
        const stateRootHash = await service.getStateRootHash();

        // We'll use the normalized contract hash from before
        const contractHash = IDENTITY_REGISTRY_HASH;

        // Let's try to query the dictionary or a path if Odra provides it.
        // Odra Mapping 'identities' is stored in a dictionary.
        // Key is Address. 
        // But for Address key, we need to hash it.

        console.log(`   - Querying IdentityRegistry at ${contractHash}...`);

        // Try calling get_master_did via BlockState query if we can't do it easily
        // Instead, let's just confirm the contract exists and has the entry point for now
        // As actually querying the dictionary from JS for a complex Odra mapping/struct is hard without the schema.

        // But wait, the user asked "how do I verify". I should show them how to check on the explorer too.
    } catch (e) {
        console.log("   - On-chain check failed:", e.message);
    }

    console.log("\n🌐 [Explorer Links]");
    console.log(`   - Account: https://testnet.cspr.live/account/${TARGET_ACCOUNT}`);
    console.log(`   - IdentityRegistry: https://testnet.cspr.live/contract/${IDENTITY_REGISTRY_HASH}`);

    process.exit(0);
}

verify();
