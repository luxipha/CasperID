#!/usr/bin/env node

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { authenticateAdmin, resetAdminPassword } = require('./utils/admin-auth');
const { RateLimit } = require('./database/models');

function readGeneratedCredentials() {
    const credentialsPath = path.join(__dirname, '../.admin-credentials');

    if (!fs.existsSync(credentialsPath)) {
        return null;
    }

    const content = fs.readFileSync(credentialsPath, 'utf8');
    const username = content.match(/^Username:\s*(.+)$/m)?.[1]?.trim();
    const password = content.match(/^Password:\s*(.+)$/m)?.[1]?.trim();

    return username && password ? { username, password } : null;
}

async function main() {
    const generatedCredentials = readGeneratedCredentials();
    const username = process.env.ADMIN_USERNAME || generatedCredentials?.username || 'admin';
    const password = process.env.ADMIN_PASSWORD || generatedCredentials?.password;

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is required');
    }

    if (!password) {
        throw new Error('Set ADMIN_PASSWORD or provide a valid server/.admin-credentials file');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    await resetAdminPassword(username, password);
    const verifiedAdmin = await authenticateAdmin(username, password);

    if (!verifiedAdmin) {
        throw new Error('Password was updated but authentication verification failed');
    }

    await RateLimit.deleteMany({ endpoint: 'admin_login' });
    console.log(`Admin "${username}" password synchronized and login lockouts cleared.`);
}

main()
    .catch((error) => {
        console.error(`Admin password reset failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
