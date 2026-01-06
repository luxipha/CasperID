const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const genAI = new GoogleGenerativeAI('AIzaSyDwpBQA_0HQhH8JBBestjL-7JkSxtbhihQ');

async function testResumeParser() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        // Create a simple test PDF buffer (just test with a text message first)
        const testPrompt = 'Extract this simple resume data: John Doe, Software Engineer at Google, john@gmail.com';
        
        console.log('Testing simple text parsing...');
        const result = await model.generateContent(testPrompt);
        const response = await result.response;
        console.log('Simple test result:', response.text());
        
        console.log('\nTesting with actual file upload capability...');
        // Test if the model supports file uploads
        const fileTestPrompt = `Analyze this resume and return JSON: {"name": "test"}`;
        
        // Create a minimal PDF-like buffer for testing
        const dummyBuffer = Buffer.from('Test resume content');
        
        const filePart = {
            inlineData: {
                data: dummyBuffer.toString('base64'),
                mimeType: 'application/pdf'
            }
        };

        const fileResult = await model.generateContent([fileTestPrompt, filePart]);
        const fileResponse = await fileResult.response;
        console.log('File test result:', fileResponse.text());
        
    } catch (error) {
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error status:', error.status);
        console.error('Error code:', error.code);
    }
}

testResumeParser();