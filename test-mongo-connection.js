#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns').promises;

async function testConnection() {
    console.log('Testing MongoDB Connection...\n');

    // Extract host from URI
    const uri = process.env.MONGODB_URI;
    const hostMatch = uri.match(/@([^/]+)\//);
    const host = hostMatch ? hostMatch[1] : null;

    console.log('1. DNS Resolution Test');
    if (host) {
        try {
            const addresses = await dns.resolve4(host.split(':')[0]);
            console.log(`✅ DNS resolved: ${host} -> ${addresses.join(', ')}`);
        } catch (err) {
            console.log(`❌ DNS failed: ${err.message}`);
        }
    }

    console.log('\n2. MongoDB Connection Test');
    console.log(`URI: mongodb+srv://adevarid:***@${host}/casperID`);

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 10000,
        });
        console.log('✅ MongoDB Connected successfully');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log(`✅ Found ${collections.length} collections`);

        await mongoose.disconnect();
        console.log('✅ Disconnected');
        process.exit(0);
    } catch (err) {
        console.log('❌ MongoDB Connection Failed:');
        console.log(`   Error: ${err.message}`);
        console.log(`   Code: ${err.code}`);
        console.log(`   Name: ${err.name}`);
        process.exit(1);
    }
}

testConnection();
