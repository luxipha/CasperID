const { RpcProvider, Account, CallData, ec, hash } = require('starknet');
require('dotenv').config();

const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL || 'https://starknet-sepolia-rpc.publicnode.com' });

const privateKey = '0x002f32f943650265376430de0258869504be5487ae8688458d2e0b2031bf1212';
const publicKey = '0x757658fe94b41c89e1dc04a8ce8294da14352edf00461eb0303f9794f7ab149';
const address = '0x19018091c8bcdebfc21855f3286fd0839b607e8d7e4357f92b33a12d8235233';
const ozClassHash = '0x04a444ef8caf8fa0db05da60bf0ad9bae264c73fa7e32c61d245406f5523174b';

async function estimate() {
    console.log('--- ESTIMATING DEPLOYMENT FEE ---');

    const ozAccount = new Account({
        provider,
        address,
        signer: privateKey
    });

    try {
        const constructorCalldata = CallData.compile({ publicKey });

        console.log('Estimating fee for Account Deploy...');
        const estimate = await ozAccount.estimateAccountDeployFee({
            classHash: ozClassHash,
            constructorCalldata,
            addressSalt: publicKey
        });

        const replacer = (key, value) =>
            typeof value === 'bigint' ? value.toString() : value;

        console.log('Fee Estimate:', JSON.stringify(estimate, replacer, 2));

        if (estimate.resourceBounds) {
            console.log('V3 Resource Bounds detected.');
        } else {
            console.log('V1 (ETH) Fee detected.');
        }
    } catch (err) {
        console.error('Estimation failed:', err.message);
        process.exit(1);
    }
}

estimate();
