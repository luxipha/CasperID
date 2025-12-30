#!/usr/bin/env node

/**
 * CasperID Traffic Generator for Datadog Hackathon Demo
 * 
 * Generates realistic API traffic to trigger monitors and demonstrate
 * LLM observability, fraud detection, and incident management.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_URL || 'http://localhost:3001';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS) || 5;
const DURATION_MINUTES = parseInt(process.env.DURATION_MINUTES) || 10;

// Sample test data
const TEST_WALLETS = [
    '0x1234567890abcdef1234567890abcdef12345678',
    '0xabcdef1234567890abcdef1234567890abcdef12',
    '0x2468ace13579bdf02468ace13579bdf024681357',
    '0x13579bdf2468ace13579bdf2468ace1357924680',
    '0xfedcba0987654321fedcba0987654321fedcba09'
];

const SAMPLE_USERS = [
    { name: 'Alice Johnson', email: 'alice@example.com', age: 28, location: 'San Francisco, CA' },
    { name: 'Bob Smith', email: 'bob@example.com', age: 34, location: 'New York, NY' },
    { name: 'Carol Wilson', email: 'carol@example.com', age: 25, location: 'Austin, TX' },
    { name: 'David Brown', email: 'david@example.com', age: 42, location: 'Seattle, WA' },
    { name: 'Eva Martinez', email: 'eva@example.com', age: 31, location: 'Miami, FL' }
];

// Traffic patterns
const TRAFFIC_PATTERNS = {
    normal: { successRate: 0.85, avgLatency: 800 },
    stress: { successRate: 0.65, avgLatency: 2000 },
    fraud: { successRate: 0.15, avgLatency: 500 },
    highVolume: { requestsPerMinute: 100 }
};

class TrafficGenerator {
    constructor() {
        this.stats = {
            requests: 0,
            successes: 0,
            failures: 0,
            avgLatency: 0,
            errors: []
        };
        
        this.isRunning = false;
    }

    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async makeRequest(method, endpoint, data = null) {
        const startTime = Date.now();
        try {
            const config = {
                method,
                url: `${API_BASE}${endpoint}`,
                timeout: 30000
            };
            
            if (data) {
                config.data = data;
                config.headers = { 'Content-Type': 'application/json' };
            }

            const response = await axios(config);
            const latency = Date.now() - startTime;
            
            this.stats.requests++;
            this.stats.successes++;
            this.updateAvgLatency(latency);
            
            return { success: true, data: response.data, latency };
            
        } catch (error) {
            const latency = Date.now() - startTime;
            this.stats.requests++;
            this.stats.failures++;
            this.stats.errors.push(error.message);
            this.updateAvgLatency(latency);
            
            return { success: false, error: error.message, latency };
        }
    }

    updateAvgLatency(newLatency) {
        this.stats.avgLatency = ((this.stats.avgLatency * (this.stats.requests - 1)) + newLatency) / this.stats.requests;
    }

    async simulateBasicVerification(userIndex = 0) {
        const wallet = TEST_WALLETS[userIndex % TEST_WALLETS.length];
        const user = SAMPLE_USERS[userIndex % SAMPLE_USERS.length];
        
        // First check identity status
        await this.makeRequest('GET', `/api/identity-status?wallet=${wallet}`);
        
        // Submit basic verification request
        const verificationData = {
            wallet,
            tier: 'basic',
            name: user.name,
            email: user.email,
            age: user.age,
            location: user.location
        };
        
        const result = await this.makeRequest('POST', '/api/request-verification', verificationData);
        
        if (result.success) {
            this.log(`✅ Basic verification submitted for ${user.name}`);
        } else {
            this.log(`❌ Verification failed: ${result.error}`, 'error');
        }
        
        return result;
    }

    async simulateResumeUpload() {
        // Skip resume upload simulation since it requires actual file uploads
        // Instead, hit other AI endpoints or just skip
        this.log(`📄 Skipping resume upload (requires file)`);
        return { success: true, latency: 100 };
    }

    async simulateFraudAttempt() {
        // Simulate suspicious patterns that should trigger fraud monitors
        const suspiciousWallet = '0x' + 'deadbeef'.repeat(10);
        
        // Rapid-fire requests (should trigger rate limiting)
        for (let i = 0; i < 10; i++) {
            await this.makeRequest('GET', `/api/identity-status?wallet=${suspiciousWallet}${i}`);
        }
        
        // Submit verification with suspicious data
        const fraudData = {
            wallet: suspiciousWallet,
            tier: 'full_kyc',
            name: 'Test User',
            email: 'test@temp.com',
            age: 99,
            location: 'Unknown'
        };
        
        const result = await this.makeRequest('POST', '/api/request-verification', fraudData);
        this.log(`🚨 Fraud simulation: ${result.success ? 'submitted' : 'blocked'}`, 'warn');
        
        return result;
    }

    async simulateHighLatency() {
        // Hit endpoints that might be slower
        const promises = [];
        
        for (let i = 0; i < 5; i++) {
            promises.push(this.simulateResumeUpload());
        }
        
        await Promise.all(promises);
        this.log(`⏱️ High latency simulation completed`);
    }

    async runNormalTraffic() {
        this.log('🚀 Starting normal traffic pattern...');
        
        const interval = setInterval(async () => {
            if (!this.isRunning) {
                clearInterval(interval);
                return;
            }
            
            try {
                // Mix of different request types
                await Promise.all([
                    this.simulateBasicVerification(Math.floor(Math.random() * 5)),
                    this.simulateResumeUpload(),
                    this.makeRequest('GET', '/health')
                ]);
            } catch (error) {
                this.log(`Error in normal traffic: ${error.message}`, 'error');
            }
            
        }, 2000); // Every 2 seconds
    }

    async runStressTest() {
        this.log('💥 Starting stress test pattern...');
        
        // Generate high volume of concurrent requests
        const promises = [];
        for (let i = 0; i < 20; i++) {
            promises.push(this.simulateBasicVerification(i));
            promises.push(this.simulateResumeUpload());
        }
        
        await Promise.all(promises);
        this.log('💥 Stress test completed');
    }

    async runFraudSimulation() {
        this.log('🚨 Starting fraud simulation...');
        
        // Simulate different fraud patterns
        await this.simulateFraudAttempt();
        await this.simulateHighLatency();
        
        // Multiple rapid requests from same source
        const promises = [];
        for (let i = 0; i < 15; i++) {
            promises.push(this.makeRequest('GET', `/api/identity-status?wallet=0xfraudulent${i}`));
        }
        await Promise.all(promises);
        
        this.log('🚨 Fraud simulation completed');
    }

    printStats() {
        console.log('\\n📊 Traffic Generator Stats:');
        console.log(`Total Requests: ${this.stats.requests}`);
        console.log(`Successes: ${this.stats.successes}`);
        console.log(`Failures: ${this.stats.failures}`);
        console.log(`Success Rate: ${((this.stats.successes / this.stats.requests) * 100).toFixed(1)}%`);
        console.log(`Average Latency: ${this.stats.avgLatency.toFixed(0)}ms`);
        
        if (this.stats.errors.length > 0) {
            console.log(`\\n❌ Recent Errors:`);
            [...new Set(this.stats.errors.slice(-5))].forEach(error => {
                console.log(`  - ${error}`);
            });
        }
    }

    async start() {
        this.log('🎬 CasperID Traffic Generator Starting...');
        this.log(`Target API: ${API_BASE}`);
        this.log(`Duration: ${DURATION_MINUTES} minutes`);
        this.log(`Concurrent Users: ${CONCURRENT_USERS}`);
        
        this.isRunning = true;
        
        // Health check
        const healthCheck = await this.makeRequest('GET', '/health');
        if (!healthCheck.success) {
            this.log('❌ API health check failed! Is the server running?', 'error');
            return;
        }
        this.log('✅ API health check passed');

        // Schedule different traffic patterns
        setTimeout(() => this.runNormalTraffic(), 1000);
        setTimeout(() => this.runStressTest(), 30000); // After 30s
        setTimeout(() => this.runFraudSimulation(), 120000); // After 2 min
        
        // Stats reporting
        const statsInterval = setInterval(() => {
            if (!this.isRunning) {
                clearInterval(statsInterval);
                return;
            }
            this.printStats();
        }, 30000); // Every 30 seconds
        
        // Stop after duration
        setTimeout(() => {
            this.isRunning = false;
            this.log('🏁 Traffic generation completed');
            this.printStats();
            process.exit(0);
        }, DURATION_MINUTES * 60 * 1000);
    }
}

// Run if called directly
if (require.main === module) {
    const generator = new TrafficGenerator();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\\n🛑 Shutting down traffic generator...');
        generator.isRunning = false;
        generator.printStats();
        process.exit(0);
    });
    
    generator.start().catch(error => {
        console.error('❌ Traffic generator failed:', error);
        process.exit(1);
    });
}

module.exports = TrafficGenerator;