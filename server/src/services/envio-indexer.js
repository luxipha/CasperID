const { ethers } = require('ethers');
const { request, gql } = require('graphql-request');
const { UserAccount, VerificationEvent } = require('../database/models');

/**
 * Envio-style Blockchain Event Indexer
 * Tracks verification events across multiple networks
 * Custom implementation using ethers and GraphQL
 */
class EnvioIndexerService {
    constructor() {
        this.providers = new Map();
        this.isRunning = false;
        this.lastBlockNumbers = new Map();
        
        // Supported networks for verification tracking
        this.supportedNetworks = [
            {
                chainId: 1,
                name: 'ethereum',
                rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
                casperBridge: process.env.ETH_CASPER_BRIDGE_ADDRESS
            },
            {
                chainId: 11155111,
                name: 'sepolia',
                rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
                casperBridge: process.env.SEPOLIA_CASPER_BRIDGE_ADDRESS
            },
            {
                chainId: 8453,
                name: 'base',
                rpcUrl: process.env.BASE_RPC_URL || 'https://base.llamarpc.com',
                casperBridge: process.env.BASE_CASPER_BRIDGE_ADDRESS
            }
        ];

        // Event signatures we're tracking
        this.eventSignatures = {
            VerificationRequested: 'VerificationRequested(address,string,uint256,bytes32)',
            VerificationCompleted: 'VerificationCompleted(address,string,bool,bytes32)',
            PermissionGranted: 'PermissionGranted(address,address,string,uint256)',
            PermissionRevoked: 'PermissionRevoked(address,address,bytes32)'
        };

        this.initializeProviders();
    }

    /**
     * Initialize blockchain providers for each network
     */
    initializeProviders() {
        this.supportedNetworks.forEach(network => {
            try {
                const provider = new ethers.JsonRpcProvider(network.rpcUrl);
                this.providers.set(network.chainId, {
                    provider,
                    network,
                    lastBlock: 0
                });
                console.log(`✅ Initialized provider for ${network.name} (${network.chainId})`);
            } catch (error) {
                console.error(`❌ Failed to initialize provider for ${network.name}:`, error);
            }
        });
    }

    /**
     * Start the indexer service
     */
    async startIndexing() {
        if (this.isRunning) {
            console.log('Indexer is already running');
            return;
        }

        this.isRunning = true;
        console.log('🚀 Starting Envio blockchain event indexer...');

        try {
            // Initialize starting blocks for each network
            await this.initializeStartingBlocks();

            // Start indexing loop
            this.indexingLoop();

            console.log('✅ Envio indexer started successfully');
        } catch (error) {
            console.error('❌ Failed to start indexer:', error);
            this.isRunning = false;
        }
    }

    /**
     * Stop the indexer service
     */
    stopIndexing() {
        this.isRunning = false;
        console.log('⏹️ Envio indexer stopped');
    }

    /**
     * Initialize starting block numbers for each network
     */
    async initializeStartingBlocks() {
        for (const [chainId, providerData] of this.providers) {
            try {
                const currentBlock = await providerData.provider.getBlockNumber();
                
                // Start from 100 blocks ago to catch recent events
                const startBlock = Math.max(0, currentBlock - 100);
                
                this.lastBlockNumbers.set(chainId, startBlock);
                providerData.lastBlock = startBlock;

                console.log(`📍 ${providerData.network.name}: Starting from block ${startBlock} (current: ${currentBlock})`);
            } catch (error) {
                console.error(`❌ Failed to get starting block for ${providerData.network.name}:`, error);
            }
        }
    }

    /**
     * Main indexing loop
     */
    async indexingLoop() {
        const POLL_INTERVAL = 15000; // 15 seconds

        while (this.isRunning) {
            try {
                await this.indexAllNetworks();
                await this.sleep(POLL_INTERVAL);
            } catch (error) {
                console.error('❌ Indexing loop error:', error);
                await this.sleep(POLL_INTERVAL * 2); // Wait longer on error
            }
        }
    }

    /**
     * Index events from all supported networks
     */
    async indexAllNetworks() {
        const indexPromises = [];

        for (const [chainId, providerData] of this.providers) {
            if (providerData.network.casperBridge) {
                indexPromises.push(this.indexNetwork(chainId, providerData));
            }
        }

        await Promise.allSettled(indexPromises);
    }

    /**
     * Index events from a specific network
     */
    async indexNetwork(chainId, providerData) {
        try {
            const { provider, network } = providerData;
            const currentBlock = await provider.getBlockNumber();
            const lastIndexedBlock = this.lastBlockNumbers.get(chainId);

            if (currentBlock <= lastIndexedBlock) {
                return; // No new blocks
            }

            // Limit block range to prevent RPC timeouts
            const toBlock = Math.min(lastIndexedBlock + 1000, currentBlock);

            console.log(`🔍 ${network.name}: Indexing blocks ${lastIndexedBlock + 1} to ${toBlock}`);

            // Get events for verification-related activities
            const events = await this.getEventsInRange(
                provider,
                network.casperBridge,
                lastIndexedBlock + 1,
                toBlock
            );

            // Process and store events
            for (const event of events) {
                await this.processEvent(event, network);
            }

            // Update last processed block
            this.lastBlockNumbers.set(chainId, toBlock);
            providerData.lastBlock = toBlock;

            if (events.length > 0) {
                console.log(`✅ ${network.name}: Processed ${events.length} events up to block ${toBlock}`);
            }

        } catch (error) {
            console.error(`❌ Error indexing ${providerData.network.name}:`, error);
        }
    }

    /**
     * Get verification events in a block range
     */
    async getEventsInRange(provider, contractAddress, fromBlock, toBlock) {
        if (!contractAddress) {
            return []; // No bridge contract configured
        }

        try {
            const events = [];

            // Create event filters for each signature
            for (const [eventName, signature] of Object.entries(this.eventSignatures)) {
                const topic = ethers.id(signature);
                
                const filter = {
                    address: contractAddress,
                    fromBlock,
                    toBlock,
                    topics: [topic]
                };

                const logs = await provider.getLogs(filter);
                
                for (const log of logs) {
                    events.push({
                        ...log,
                        eventName,
                        signature
                    });
                }
            }

            return events.sort((a, b) => a.blockNumber - b.blockNumber);

        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
    }

    /**
     * Process and store a blockchain event
     */
    async processEvent(event, network) {
        try {
            const eventData = this.parseEventData(event);
            
            // Store in database
            const verificationEvent = new VerificationEvent({
                event_id: `${network.chainId}-${event.transactionHash}-${event.logIndex}`,
                network_name: network.name,
                chain_id: network.chainId,
                block_number: event.blockNumber,
                transaction_hash: event.transactionHash,
                event_type: event.eventName,
                contract_address: event.address,
                user_address: eventData.userAddress,
                event_data: eventData,
                timestamp: new Date(),
                indexed_at: new Date()
            });

            await verificationEvent.save();

            // Update user account if applicable
            if (eventData.userAddress) {
                await this.updateUserVerificationStatus(eventData.userAddress, event.eventName, eventData);
            }

            console.log(`📝 Stored ${event.eventName} event: ${event.transactionHash}`);

        } catch (error) {
            console.error('Error processing event:', error);
        }
    }

    /**
     * Parse event data from log
     */
    parseEventData(event) {
        try {
            // Basic parsing - in production, use contract ABI for proper decoding
            const data = {
                userAddress: null,
                verificationType: null,
                success: null,
                permissionData: null
            };

            // Extract user address from topics (usually the first indexed parameter)
            if (event.topics && event.topics.length > 1) {
                try {
                    const rawAddress = '0x' + event.topics[1].slice(26);
                    data.userAddress = ethers.getAddress(rawAddress);
                } catch (error) {
                    // Handle invalid address format
                    console.warn('Invalid address format in event topic:', event.topics[1]);
                    data.userAddress = null;
                }
            }

            // Parse event-specific data
            switch (event.eventName) {
                case 'VerificationRequested':
                    // Parse verification request data
                    data.verificationType = 'requested';
                    break;

                case 'VerificationCompleted':
                    // Parse verification completion data
                    data.verificationType = 'completed';
                    data.success = true; // Would parse from event data
                    break;

                case 'PermissionGranted':
                    // Parse permission grant data
                    try {
                        data.permissionData = {
                            granted: true,
                            dappAddress: event.topics[2] ? ethers.getAddress('0x' + event.topics[2].slice(26)) : null
                        };
                    } catch (error) {
                        data.permissionData = { granted: true, dappAddress: null };
                    }
                    break;

                case 'PermissionRevoked':
                    // Parse permission revocation data
                    try {
                        data.permissionData = {
                            granted: false,
                            dappAddress: event.topics[2] ? ethers.getAddress('0x' + event.topics[2].slice(26)) : null
                        };
                    } catch (error) {
                        data.permissionData = { granted: false, dappAddress: null };
                    }
                    break;
            }

            return data;

        } catch (error) {
            console.error('Error parsing event data:', error);
            return {
                userAddress: null,
                verificationType: null,
                success: null,
                permissionData: null,
                error: error.message
            };
        }
    }

    /**
     * Update user account verification status based on blockchain events
     */
    async updateUserVerificationStatus(userAddress, eventType, eventData) {
        try {
            // Find user by MetaMask address
            const userAccount = await UserAccount.findOne({
                metamask_address: userAddress.toLowerCase()
            });

            if (!userAccount) {
                console.log(`No CasperID account found for address: ${userAddress}`);
                return;
            }

            // Update verification status based on event
            switch (eventType) {
                case 'VerificationCompleted':
                    if (eventData.success) {
                        // Upgrade user's layer status
                        if (userAccount.tier === 'layer_1') {
                            userAccount.tier = 'layer_2';
                        } else if (userAccount.tier === 'layer_2') {
                            userAccount.tier = 'layer_3';
                        }
                        userAccount.verification_completed_at = new Date();
                    }
                    break;

                case 'PermissionGranted':
                    userAccount.external_permissions_count = (userAccount.external_permissions_count || 0) + 1;
                    break;

                case 'PermissionRevoked':
                    userAccount.external_permissions_count = Math.max(0, (userAccount.external_permissions_count || 0) - 1);
                    break;
            }

            userAccount.last_blockchain_activity = new Date();
            userAccount.updated_at = new Date();
            
            await userAccount.save();

            console.log(`🔄 Updated user ${userAccount.user_id} for ${eventType} event`);

        } catch (error) {
            console.error('Error updating user verification status:', error);
        }
    }

    /**
     * Get verification events for a specific user
     */
    async getUserVerificationEvents(userAddress) {
        try {
            const events = await VerificationEvent.find({
                user_address: userAddress.toLowerCase()
            }).sort({ block_number: -1, timestamp: -1 });

            return events;

        } catch (error) {
            console.error('Error getting user events:', error);
            return [];
        }
    }

    /**
     * Get verification events for a specific transaction
     */
    async getTransactionEvents(transactionHash) {
        try {
            const events = await VerificationEvent.find({
                transaction_hash: transactionHash.toLowerCase()
            }).sort({ timestamp: -1 });

            return events;

        } catch (error) {
            console.error('Error getting transaction events:', error);
            return [];
        }
    }

    /**
     * Get indexer status and metrics
     */
    getIndexerStatus() {
        const status = {
            isRunning: this.isRunning,
            networks: {},
            lastUpdate: new Date()
        };

        for (const [chainId, providerData] of this.providers) {
            status.networks[providerData.network.name] = {
                chainId,
                lastBlock: this.lastBlockNumbers.get(chainId) || 0,
                bridgeContract: providerData.network.casperBridge || 'Not configured',
                status: 'active'
            };
        }

        return status;
    }

    /**
     * Utility function for async sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Query GraphQL endpoint (if available for specific networks)
     */
    async queryGraphQL(endpoint, query, variables = {}) {
        try {
            const result = await request(endpoint, query, variables);
            return result;
        } catch (error) {
            console.error('GraphQL query failed:', error);
            throw error;
        }
    }

    /**
     * Get network statistics
     */
    async getNetworkStatistics() {
        try {
            const stats = {
                totalEvents: 0,
                eventsByNetwork: {},
                eventsByType: {},
                recentActivity: []
            };

            // Get total events
            stats.totalEvents = await VerificationEvent.countDocuments();

            // Get events by network
            const networkAgg = await VerificationEvent.aggregate([
                {
                    $group: {
                        _id: '$network_name',
                        count: { $sum: 1 },
                        lastEvent: { $max: '$timestamp' }
                    }
                }
            ]);

            networkAgg.forEach(item => {
                stats.eventsByNetwork[item._id] = {
                    count: item.count,
                    lastEvent: item.lastEvent
                };
            });

            // Get events by type
            const typeAgg = await VerificationEvent.aggregate([
                {
                    $group: {
                        _id: '$event_type',
                        count: { $sum: 1 }
                    }
                }
            ]);

            typeAgg.forEach(item => {
                stats.eventsByType[item._id] = item.count;
            });

            // Get recent activity (last 24 hours)
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            stats.recentActivity = await VerificationEvent.find({
                timestamp: { $gte: yesterday }
            }).sort({ timestamp: -1 }).limit(50);

            return stats;

        } catch (error) {
            console.error('Error getting network statistics:', error);
            return null;
        }
    }
}

// Export singleton instance
module.exports = new EnvioIndexerService();