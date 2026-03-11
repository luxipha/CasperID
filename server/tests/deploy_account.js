const { RpcProvider, Account, CallData } = require('starknet');
require('dotenv').config();

const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL || 'https://starknet-sepolia-rpc.publicnode.com' });

const privateKey = '0x002f32f943650265376430de0258869504be5487ae8688458d2e0b2031bf1212';
const publicKey = '0x757658fe94b41c89e1dc04a8ce8294da14352edf00461eb0303f9794f7ab149';
const address = '0x4d3d82608d445ae0b7c060a3b112c1506bfa37885715108463d073e8d3d2248';
const ozClassHash = '0x04a444ef8caf8fa0db05da60bf0ad9bae264c73fa7e32c61d245406f5523174b';

// Helper to convert BigInt to hex string for starknet.js
const toHex = (val) => '0x' + BigInt(val).toString(16);

async function deploy() {
    console.log('--- DEPLOYING MODERN ACCOUNT (STRK FEES) ---');
    console.log(`Address: ${address}`);

    // starknet.js v9: Account({ provider, address, signer })
    const ozAccount = new Account({
        provider,
        address,
        signer: privateKey
    });

    try {
        const constructorCalldata = CallData.compile({ publicKey });

        // First estimate the fee
        console.log('Estimating deployment fee...');
        const estimate = await ozAccount.estimateAccountDeployFee({
            classHash: ozClassHash,
            constructorCalldata,
            addressSalt: publicKey
        });

        console.log('Estimated overall fee (FRI):', estimate.overall_fee.toString());

        // Use estimate's resourceBounds directly - starknet.js will handle conversion
        console.log('Sending deployment transaction (paying in STRK)...');
        const deployResponse = await ozAccount.deployAccount({
            classHash: ozClassHash,
            constructorCalldata,
            addressSalt: publicKey
        });

        console.log(`Deployment transaction sent: ${deployResponse.transaction_hash}`);
        console.log('Waiting for confirmation...');
        await provider.waitForTransaction(deployResponse.transaction_hash);
        console.log('SUCCESS! Account deployed and active.');
    } catch (err) {
        console.error('Deployment failed:', err.message);
        if (err.data) console.error('Error data:', JSON.stringify(err.data, null, 2));
        process.exit(1);
    }
}

deploy();
