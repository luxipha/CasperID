const { CasperServiceByJsonRPC } = require('casper-js-sdk');

const RPC_API = 'https://node.testnet.casper.network/rpc';
const TARGET_HASH = 'hash-2a26a4f39ed401ee06530f80ecda3ab979ca32210faf0e1ae0d77f3ca35ff67f';

const service = new CasperServiceByJsonRPC(RPC_API);

async function checkHash() {
    try {
        console.log(`🔍 Probing hash: ${TARGET_HASH}`);
        const stateRootHash = await service.getStateRootHash();
        const result = await service.getBlockState(stateRootHash, TARGET_HASH, []);

        if (result.ContractPackage) {
            console.log("📦 This is a Contract Package.");
            const latestVersion = result.ContractPackage.versions[result.ContractPackage.versions.length - 1];
            let contractHash = latestVersion.contractHash;
            if (contractHash.startsWith('contract-')) {
                contractHash = 'hash-' + contractHash.slice(9);
            }
            console.log(`🚀 Latest Contract Version: ${latestVersion.contractVersion}`);
            console.log(`👉 Actual Contract Hash: ${contractHash}`);
            await inspectContract(stateRootHash, contractHash);
        } else if (result.Contract) {
            console.log("✅ This is a Contract object.");
            await inspectContract(stateRootHash, TARGET_HASH);
        } else {
            console.log("❓ Unknown object type:", Object.keys(result));
        }
    } catch (error) {
        console.error("❌ Probe failed:", error.message);
    }
}

async function inspectContract(stateRootHash, contractHash) {
    const res = await service.getBlockState(stateRootHash, contractHash, []);
    const contract = res.Contract;
    const entryPoints = contract.entrypoints || contract.entryPoints || contract.entry_points;

    if (entryPoints) {
        console.log("📝 Available Entry Points:");
        const names = entryPoints.map(ep => ep.name);
        names.sort().forEach(name => console.log(`   - ${name}`));

        const isIdentityRegistry = names.includes('update_tier') || names.includes('mint_master_did');
        const isCidNameNFT = names.includes('mint_cid_name') || names.includes('token_metadata');

        if (isIdentityRegistry) console.log("\n结论: This looks like the IdentityRegistry contract.");
        if (isCidNameNFT) console.log("\n结论: This looks like the CidNameNFT (NFT) contract.");
        if (!isIdentityRegistry && !isCidNameNFT) console.log("\n结论: This doesn't match known Identity or CNS signatures.");
    }
}

checkHash();
