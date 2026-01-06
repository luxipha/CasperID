const axios = require('axios');

async function testProficiencyField() {
    try {
        const baseURL = 'http://localhost:3001';
        const knownWallet = 'account-hash-dc58ac9a3fd8aec027d055726ea3d4a7ed510f6d2f0612d4538ee94d52fbbcf0';
        
        // Test adding a skill with proficiency field (like frontend does)
        console.log('--- Testing skill with proficiency field ---');
        const skillData = {
            skill_name: 'React with Proficiency',
            proficiency: 'Advanced' // Frontend sends this
        };
        
        try {
            const addResponse = await axios.post(`${baseURL}/api/profile/${knownWallet}/skills`, skillData);
            console.log('✅ Add skill with proficiency response:', addResponse.data);
        } catch (addError) {
            console.log('❌ Add skill error:', addError.response?.status, addError.response?.data);
        }

        // Check all skills for the wallet
        console.log('\n--- All skills for wallet ---');
        try {
            const skillsResponse = await axios.get(`${baseURL}/api/profile/${knownWallet}/skills`);
            console.log('✅ All skills:', skillsResponse.data);
        } catch (skillsError) {
            console.log('❌ Get skills error:', skillsError.response?.status, skillsError.response?.data);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testProficiencyField();