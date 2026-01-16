/**
 * Find the correct new IdentityRegistry contract with mint_for_user
 */
require('dotenv').config();
const { CasperClient } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';

// Candidate contract hashes
const CANDIDATES = [
    { name: 'From .env', hash: '24e654054b712d3187499eb77b4c2459f881d88361b1e1b848a983535b9b4b14' },
    { name: 'identity_registry_contract_hash', hash: '079ee3a4940346c3aa5e5bac6615fc08e70d0fd0afe877f6724ee32a1e0b33fd' },
    { name: 'IdentityRegistry_package_hash', hash: 'eb1f6aaf565b967534ff4c0c189ce9e73fbac01e5a78d5e83284b1587a04c7f1' },
    { name: 'OLD identity_registry', hash: '055f94fc5ea037a02be18a8f7e8414e34aae7b2995e9b3daa09856a89e5d78be' },
    { name: 'OLD fe846 contract', hash: 'fe846d085f7d13ee3df425cef6a750edaa27d657cee8566a61d7239edc22f9f6' },
];

async function checkContract(client, hash, name) {
    try {
        const stateRootHash = await client.nodeClient.getStateRootHash();
        const result = await client.nodeClient.getBlockState(stateRootHash, `hash-${hash}`, []);

        if (result.Contract) {
            const entryPoints = result.Contract.entrypoints || [];
            const epNames = entryPoints.map(ep => ep.name);

            const hasMintForUser = epNames.includes('mint_for_user');
            const hasMintMasterDid = epNames.includes('mint_master_did');
            const hasGetMasterDid = epNames.includes('get_master_did');
            const hasIsIssuer = epNames.includes('is_issuer');

            console.log(`\n${name}:`);
            console.log(`  Hash: hash-${hash.slice(0,16)}...`);
            console.log(`  Entry points: ${epNames.join(', ')}`);
            console.log(`  ✅ mint_for_user: ${hasMintForUser ? 'YES' : 'NO'}`);
            console.log(`  ✅ is_issuer: ${hasIsIssuer ? 'YES' : 'NO'}`);
            console.log(`  ❌ mint_master_did (old): ${hasMintMasterDid ? 'YES' : 'NO'}`);

            if (hasMintForUser && hasIsIssuer) {
                console.log(`\n  🎯 THIS IS THE NEW CONTRACT!`);
                return { hash, isNew: true };
            }
        }
    } catch (e) {
        console.log(`\n${name}:`);
        console.log(`  Hash: hash-${hash.slice(0,16)}...`);
        console.log(`  ❌ Error: ${e.message.slice(0, 60)}`);
    }
    return { hash, isNew: false };
}

async function main() {
    console.log('='.repeat(60));
    console.log('FINDING NEW IDENTITY REGISTRY CONTRACT');
    console.log('Looking for: mint_for_user, is_issuer entry points');
    console.log('='.repeat(60));

    const client = new CasperClient(RPC_API);

    let newContractHash = null;

    for (const candidate of CANDIDATES) {
        const result = await checkContract(client, candidate.hash, candidate.name);
        if (result.isNew) {
            newContractHash = result.hash;
        }
    }

    console.log('\n' + '='.repeat(60));
    if (newContractHash) {
        console.log('✅ NEW CONTRACT FOUND!');
        console.log(`CONTRACT_HASH=hash-${newContractHash}`);
    } else {
        console.log('❌ New contract not found in candidates.');
        console.log('The contract may need to be deployed.');
    }
    console.log('='.repeat(60));
}

main().catch(console.error);
