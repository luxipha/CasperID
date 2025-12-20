/**
 * Gemini AI Service
 * Handles ID verification and face matching using Google's Gemini API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Analyze an ID document and extract information
 * @param {Buffer} imageBuffer - ID document image
 * @returns {Promise<Object>} Extracted information
 */
async function analyzeIDDocument(imageBuffer) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        const prompt = `Analyze this ID document and extract the following information in JSON format:
{
  "name": "Full name on the document",
  "dateOfBirth": "Date of birth (YYYY-MM-DD format)",
  "documentType": "Type of document (e.g., Passport, Driver's License, National ID)",
  "documentNumber": "Document number if visible",
  "expiryDate": "Expiry date if visible (YYYY-MM-DD format)",
  "isValid": true/false (whether this appears to be a legitimate government-issued ID),
  "confidence": 0-100 (your confidence in the extraction)
}

If you cannot extract certain information, use null for that field. Be very careful to only mark isValid as true if this appears to be a real government-issued document.`;

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType: 'image/jpeg'
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('Failed to parse AI response');
    } catch (error) {
        console.error('[Gemini] ID analysis error:', error);
        throw new Error('Failed to analyze ID document');
    }
}

/**
 * Compare a selfie with the photo on an ID document
 * @param {Buffer} idImageBuffer - ID document image
 * @param {Buffer} selfieBuffer - Selfie image
 * @returns {Promise<Object>} Match result with confidence score
 */
async function compareFaceWithID(idImageBuffer, selfieBuffer) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        const prompt = `You are analyzing two images for identity verification:
1. The first image is an ID document (passport, driver's license, etc.)
2. The second image is a selfie

Please compare the face in the ID document with the face in the selfie and provide a JSON response:
{
  "isMatch": true/false (whether the faces appear to be the same person),
  "confidence": 0-100 (your confidence in the match),
  "reasoning": "Brief explanation of your decision",
  "photoQuality": "Assessment of photo quality (good/fair/poor)"
}

Be thorough in your comparison. Consider facial features, structure, and any visible identifying marks.`;

        const idPart = {
            inlineData: {
                data: idImageBuffer.toString('base64'),
                mimeType: 'image/jpeg'
            }
        };

        const selfiePart = {
            inlineData: {
                data: selfieBuffer.toString('base64'),
                mimeType: 'image/jpeg'
            }
        };

        const result = await model.generateContent([prompt, idPart, selfiePart]);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('Failed to parse AI response');
    } catch (error) {
        console.error('[Gemini] Face comparison error:', error);
        throw new Error('Failed to compare faces');
    }
}

/**
 * Verify a liveness check gesture
 * @param {Buffer} imageBuffer - Image showing the gesture
 * @param {string} expectedGesture - Expected gesture (e.g., "thumbs up", "peace sign", "3 fingers")
 * @returns {Promise<Object>} Verification result
 */
async function verifyLivenessGesture(imageBuffer, expectedGesture) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        const prompt = `You are verifying a liveness check. The person should be showing: "${expectedGesture}"

Analyze the image and provide a JSON response:
{
  "gestureDetected": "Description of what gesture you see",
  "isCorrect": true/false (whether they are showing the expected gesture),
  "confidence": 0-100,
  "faceDetected": true/false,
  "reasoning": "Brief explanation"
}`;

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType: 'image/jpeg'
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('Failed to parse AI response');
    } catch (error) {
        console.error('[Gemini] Liveness check error:', error);
        throw new Error('Failed to verify liveness gesture');
    }
}

/**
 * Perform complete KYC verification
 * @param {Buffer} idImageBuffer - ID document image
 * @param {Buffer} selfieBuffer - Selfie image
 * @param {Buffer} livenessImageBuffer - Liveness check image (optional)
 * @param {string} expectedGesture - Expected liveness gesture (optional)
 * @returns {Promise<Object>} Complete verification result
 */
async function performKYCVerification(idImageBuffer, selfieBuffer, livenessImageBuffer = null, expectedGesture = null) {
    try {
        // Step 1: Analyze ID document
        console.log('[Gemini] Analyzing ID document...');
        const idAnalysis = await analyzeIDDocument(idImageBuffer);

        if (!idAnalysis.isValid || idAnalysis.confidence < 70) {
            return {
                success: false,
                reason: 'ID document appears invalid or low confidence',
                idAnalysis
            };
        }

        // Step 2: Compare face with ID
        console.log('[Gemini] Comparing selfie with ID...');
        const faceMatch = await compareFaceWithID(idImageBuffer, selfieBuffer);

        if (!faceMatch.isMatch || faceMatch.confidence < 70) {
            return {
                success: false,
                reason: 'Face does not match ID document',
                idAnalysis,
                faceMatch
            };
        }

        // Step 3: Verify liveness (if provided)
        let livenessCheck = null;
        if (livenessImageBuffer && expectedGesture) {
            console.log('[Gemini] Verifying liveness gesture...');
            livenessCheck = await verifyLivenessGesture(livenessImageBuffer, expectedGesture);

            if (!livenessCheck.isCorrect || livenessCheck.confidence < 70) {
                return {
                    success: false,
                    reason: 'Liveness check failed',
                    idAnalysis,
                    faceMatch,
                    livenessCheck
                };
            }
        }

        return {
            success: true,
            idAnalysis,
            faceMatch,
            livenessCheck
        };
    } catch (error) {
        console.error('[Gemini] KYC verification error:', error);
        throw error;
    }
}

/**
 * Verify a liveness sequence with multiple frames and movement detection
 * @param {Buffer[]} frameBuffers - Array of video frames
 * @param {string[]} expectedSteps - Expected sequence of movements
 * @returns {Promise<Object>} Verification result
 */
async function verifyLivenessSequence(frameBuffers, expectedSteps) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        // Analyze a sampling of frames (first, middle, last few) to reduce API cost
        const sampleFrames = [];
        const totalFrames = frameBuffers.length;

        // Always include first frame
        sampleFrames.push({ index: 0, buffer: frameBuffers[0] });

        // Include middle frame
        if (totalFrames > 2) {
            const midIndex = Math.floor(totalFrames / 2);
            sampleFrames.push({ index: midIndex, buffer: frameBuffers[midIndex] });
        }

        // Include last frame
        if (totalFrames > 1) {
            sampleFrames.push({ index: totalFrames - 1, buffer: frameBuffers[totalFrames - 1] });
        }

        // Include a couple more frames for better analysis
        if (totalFrames > 6) {
            const quarterIndex = Math.floor(totalFrames / 4);
            const threeQuarterIndex = Math.floor(totalFrames * 3 / 4);
            sampleFrames.push({ index: quarterIndex, buffer: frameBuffers[quarterIndex] });
            sampleFrames.push({ index: threeQuarterIndex, buffer: frameBuffers[threeQuarterIndex] });
        }

        const prompt = `You are analyzing a liveness verification sequence. The person was asked to perform these actions: ${expectedSteps.join(', ')}.

I'm providing you with ${sampleFrames.length} key frames from a video sequence of ${totalFrames} total frames.

For liveness verification, analyze these aspects:
1. **Face Detection**: Is a real human face consistently visible?
2. **Movement Detection**: Are there natural variations in face position, expression, or head pose across frames?
3. **Blinking**: Do you observe natural eye blinking or eye state changes?
4. **Head Movement**: Do you see natural head rotation or position changes?
5. **Expression Changes**: Are there natural facial expression variations?
6. **Anti-Spoofing**: Does this appear to be a live person vs a photo or video replay?

Provide a JSON response:
{
  "passed": true/false,
  "confidence": 0-100,
  "faceDetectedInAllFrames": true/false,
  "movementDetected": true/false,
  "blinkingObserved": true/false,
  "headMovementObserved": true/false,
  "expressionChanges": true/false,
  "antiSpoofingScore": 0-100,
  "reasoning": "Detailed explanation of your analysis",
  "suspiciousIndicators": ["list any suspicious signs"],
  "frameAnalysis": [
    {
      "frameIndex": 0,
      "faceVisible": true/false,
      "eyeState": "open/closed/partially",
      "headPose": "description",
      "expression": "description"
    }
  ]
}

Only mark as passed if you're confident this is a live human performing natural movements.`;

        // Convert sample frames to image parts
        const imageParts = sampleFrames.map(frame => ({
            inlineData: {
                data: frame.buffer.toString('base64'),
                mimeType: 'image/jpeg'
            }
        }));

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();

        console.log('[Gemini] Liveness sequence analysis response:', text);

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);

            // Additional validation logic
            const minConfidence = 70;
            const requiresMovement = analysis.movementDetected || analysis.blinkingObserved || analysis.headMovementObserved;
            const antiSpoofingPass = analysis.antiSpoofingScore >= 60;

            const finalPassed = analysis.passed &&
                analysis.confidence >= minConfidence &&
                requiresMovement &&
                antiSpoofingPass &&
                analysis.faceDetectedInAllFrames;

            return {
                ...analysis,
                passed: finalPassed,
                totalFramesAnalyzed: totalFrames,
                sampleFramesUsed: sampleFrames.length,
                validationChecks: {
                    confidencePass: analysis.confidence >= minConfidence,
                    movementPass: requiresMovement,
                    antiSpoofingPass: antiSpoofingPass,
                    faceDetectionPass: analysis.faceDetectedInAllFrames
                }
            };
        }

        throw new Error('Failed to parse AI response');
    } catch (error) {
        console.error('[Gemini] Liveness sequence verification error:', error);
        return {
            passed: false,
            confidence: 0,
            reasoning: 'Technical error during verification',
            error: error.message
        };
    }
}

/**
 * Parse a resume and extract structured profile data
 * @param {Buffer} fileBuffer - PDF, Image, or Word doc buffer
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<Object>} Extracted profile data
 */
async function parseResume(fileBuffer, mimeType) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Analyze this resume and extract the person's professional profile into a structured JSON format. 
Return ONLY the JSON.

IMPORTANT PARSING GUIDELINES:
- For dates: Convert ALL date formats to YYYY-MM-DD:
  * "Jan 2020" → "2020-01-01"
  * "January 2020" → "2020-01-01" 
  * "Feb 2021" → "2021-02-01"
  * "Sept 2019" → "2019-09-01"
  * "December 2022" → "2022-12-01"
  * If "Present", "Current", "Now" → use exactly "Present"
- Extract ALL skills mentioned anywhere in resume, including:
  * Technical skills (programming languages, frameworks, tools)
  * Soft skills (leadership, communication, teamwork)
  * Certifications and specializations
  * Software and platforms used
- Extract personal contact information from headers, contact sections, or anywhere on resume
- Look for social media links in contact sections, headers, or signature areas
- For names: Extract from header or contact section, split into first_name and last_name

Expected JSON structure:
{
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone_number": "string",
  "home_address": "string",
  "bio": "A short professional summary",
  "skills": ["JavaScript", "Python", "React", "Node.js", "Project Management"],
  "experiences": [
    {
      "company_name": "Google Inc",
      "job_title": "Software Engineer",
      "start_date": "2020-01-01",
      "end_date": "2022-06-01",
      "description": "Developed web applications using React and Node.js",
      "location": "San Francisco, CA"
    }
  ],
  "education": [
    {
      "school_name": "string",
      "degree": "string",
      "field_of_study": "string",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "location": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuing_organization": "string",
      "issue_date": "YYYY-MM-DD",
      "expiry_date": "YYYY-MM-DD or null",
      "credential_id": "string",
      "credential_url": "url"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD or 'Present'",
      "url": "url",
      "technologies": ["tech1", "tech2"]
    }
  ],
  "awards": [
    {
      "title": "string",
      "issuer": "string",
      "date": "YYYY-MM-DD",
      "description": "string"
    }
  ],
  "languages": [
    {
      "language": "string",
      "proficiency": "Native/Fluent/Conversational/Basic"
    }
  ],
  "volunteer": [
    {
      "organization": "string",
      "role": "string",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD or 'Present'",
      "description": "string",
      "location": "string"
    }
  ],
  "socials": {
    "linkedin": "url",
    "github": "url",
    "twitter": "url",
    "website": "url"
  }
}

If a field is not found, use null or an empty array/object as appropriate.

CRITICAL: Ensure you extract EVERY piece of information visible on the resume. Look carefully at:
- Header sections for personal details
- Skills sections, technical competencies, or any mentions of technologies/tools
- All work experience with exact dates, company names, and job titles
- Education details with schools, degrees, and graduation dates
- Contact information including phone, email, and social media profiles

Return the complete JSON with all available information filled in.`;

        const filePart = {
            inlineData: {
                data: fileBuffer.toString('base64'),
                mimeType: mimeType
            }
        };

        const result = await model.generateContent([prompt, filePart]);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('Failed to parse AI response');
    } catch (error) {
        console.error('[Gemini] Resume parsing error:', error);
        throw new Error('Failed to parse resume');
    }
}

/**
 * Generate a personalized cover letter based on user profile and job description
 * @param {Object} profileData - User's CasperID profile data
 * @param {string} jobDescription - Scraped job description or page content
 * @returns {Promise<Object>} Generated cover letter
 */
async function generateCoverLetter(profileData, jobDescription) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        const prompt = `You are an expert career coach. Write a highly personalized, compelling cover letter for the user.

User Profile:
${JSON.stringify(profileData, null, 2)}

Job Details/Description:
${jobDescription}

Return ONLY a JSON response:
{
  "subject": "Subject line for application",
  "content": "The full cover letter body",
  "keyHighlights": ["Highlight 1", "Highlight 2"],
  "tone": "Professional/Enthusiastic"
}`;

        const result = await model.generateContent([prompt]);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('Failed to parse AI response');
    } catch (error) {
        console.error('[Gemini] Cover letter generation error:', error);
        throw new Error('Failed to generate cover letter');
    }
}

module.exports = {
    analyzeIDDocument,
    compareFaceWithID,
    verifyLivenessGesture,
    verifyLivenessSequence,
    performKYCVerification,
    parseResume,
    generateCoverLetter
};
