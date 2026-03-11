const { RpcProvider, Account, CallData, json } = require('starknet');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL || 'https://starknet-sepolia-rpc.publicnode.com' });

// Use the newly deployed relay account
const privateKey = '0x002f32f943650265376430de0258869504be5487ae8688458d2e0b2031bf1212';
const accountAddress = '0x4d3d82608d445ae0b7c060a3b112c1506bfa37885715108463d073e8d3d2248';

async function deployContract() {
    console.log('=== CasperID ZK Contract Deployment ===\n');

    // Initialize account
    const account = new Account({
        provider,
        address: accountAddress,
        signer: privateKey
    });

    console.log('Deployer account:', accountAddress);

    // Read compiled contract (Sierra + CASM)
    const sierraPath = path.join(__dirname, '../../casperid_zk/target/dev/casperid_zk_CasperIDZK.contract_class.json');
    const casmPath = path.join(__dirname, '../../casperid_zk/target/dev/casperid_zk_CasperIDZK.compiled_contract_class.json');

    if (!fs.existsSync(sierraPath) || !fs.existsSync(casmPath)) {
        console.error('Contract files not found');
        console.log('Run "scarb build" in casperid_zk directory first');
        process.exit(1);
    }

    const sierraContract = json.parse(fs.readFileSync(sierraPath, 'utf-8'));
    const casmContract = json.parse(fs.readFileSync(casmPath, 'utf-8'));
    console.log('Contract classes loaded (Sierra + CASM)');

    try {
        // Step 1: Declare the contract
        console.log('\n1. Declaring contract class...');
        const declareResponse = await account.declare({
            contract: sierraContract,
            casm: casmContract
        });

        console.log('   Declaration tx:', declareResponse.transaction_hash);
        await provider.waitForTransaction(declareResponse.transaction_hash);
        console.log('   Class hash:', declareResponse.class_hash);

        // Step 2: Deploy the contract
        console.log('\n2. Deploying contract...');
        const constructorCalldata = CallData.compile({
            owner: accountAddress  // Set deployer as owner
        });

        const deployResponse = await account.deployContract({
            classHash: declareResponse.class_hash,
            constructorCalldata
        });

        console.log('   Deploy tx:', deployResponse.transaction_hash);
        await provider.waitForTransaction(deployResponse.transaction_hash);
        console.log('   Contract address:', deployResponse.contract_address);

        // Output results
        console.log('\n=== Deployment Successful ===');
        console.log('Class Hash:      ', declareResponse.class_hash);
        console.log('Contract Address:', deployResponse.contract_address);
        console.log('Owner:           ', accountAddress);
        console.log('\nExplorer:', `https://sepolia.voyager.online/contract/${deployResponse.contract_address}`);

        console.log('\n=== Update your .env ===');
        console.log(`CASPERID_ZK_CONTRACT=${deployResponse.contract_address}`);

    } catch (err) {
        console.error('Deployment failed:', err.message);
        if (err.message.includes('already declared')) {
            console.log('\nContract already declared. Getting class hash...');
            // Try to get existing class hash and deploy
        }
        process.exit(1);
    }
}

deployContract();
