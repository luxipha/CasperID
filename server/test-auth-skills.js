require('dotenv').config();
const axios = require('axios');

async function testAuthenticatedSkills() {
    try {
        const baseURL = 'http://localhost:3001';
        
        // This test would need actual session tokens to work properly
        // But let's see what error we get
        console.log('Testing authenticated endpoints (will fail without proper auth tokens)...');
        
        // Test 1: Try to get user profile (needs auth)
        console.log('\n--- Test 1: Get User Profile (no auth) ---');
        try {
            const profileResponse = await axios.get(`${baseURL}/api/user/profile`);
            console.log('✅ Profile response:', profileResponse.data);
        } catch (profileError) {
            console.log('❌ Profile error (expected):', profileError.response?.status, profileError.response?.data?.error);
        }

        // Test 2: Try a direct wallet-based skills call with the known wallet
        console.log('\n--- Test 2: Direct wallet skills call ---');
        const knownWallet = 'account-hash-dc58ac9a3fd8aec027d055726ea3d4a7ed510f6d2f0612d4538ee94d52fbbcf0';
        try {
            const skillsResponse = await axios.get(`${baseURL}/api/profile/${knownWallet}/skills`);
            console.log('✅ Direct wallet skills response:', skillsResponse.data);
        } catch (skillsError) {
            console.log('❌ Direct wallet skills error:', skillsError.response?.status, skillsError.response?.data);
        }

        // Test 3: Try to add a skill directly to the known wallet
        console.log('\n--- Test 3: Add skill to known wallet ---');
        const skillData = {
            skill_name: 'Direct Test Skill',
            is_top_skill: false
        };
        
        try {
            const addResponse = await axios.post(`${baseURL}/api/profile/${knownWallet}/skills`, skillData);
            console.log('✅ Add skill response:', addResponse.data);
        } catch (addError) {
            console.log('❌ Add skill error:', addError.response?.status, addError.response?.data);
        }

        // Test 4: Check skills again
        console.log('\n--- Test 4: Check skills after adding ---');
        try {
            const skillsResponse2 = await axios.get(`${baseURL}/api/profile/${knownWallet}/skills`);
            console.log('✅ Skills after add:', skillsResponse2.data);
        } catch (skillsError2) {
            console.log('❌ Skills after add error:', skillsError2.response?.status, skillsError2.response?.data);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAuthenticatedSkills();