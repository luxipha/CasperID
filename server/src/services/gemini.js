/**
 * Gemini AI Service
 * Handles ID verification and face matching using Google's Gemini API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
// Datadog tracking imports removed - not using Datadog anymore

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Analyze an ID document and extract information
 * @param {Buffer} imageBuffer - ID document image
 * @returns {Promise<Object>} Extracted information
 */
async function analyzeIDDocument(imageBuffer) {
    const startTime = Date.now();
    let result;
    let error;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

        let aiResult;
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
            try {
                aiResult = await model.generateContent([prompt, imagePart]);
                break; // Success
            } catch (err) {
                retries++;
                // 503 Service Unavailable is the common "High Demand" error
                if (err.status === 503 && retries < maxRetries) {
                    const delay = Math.pow(2, retries) * 1000; // Exponential backoff
                    console.warn(`[Gemini] Model busy (503). Retrying ${retries}/${maxRetries} in ${delay}ms...`);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                throw err;
            }
        }

        const response = await aiResult.response;
        const text = response.text();

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            result = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('Failed to parse AI response');
        }

        // Datadog LLM trace removed - not using Datadog anymore

        return result;
    } catch (err) {
        error = err;
        console.error('[Gemini] ID analysis error:', err);

        // Datadog error trace removed - not using Datadog anymore

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
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
    const startTime = Date.now();
    let result;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Dense sampling to capture movement nuances (up to 20 frames)
        const sampleFrames = [];
        const totalFrames = frameBuffers.length;
        const maxSampleCount = 20;

        if (totalFrames <= maxSampleCount) {
            // If we have fewer than max frames, just use all of them
            for (let i = 0; i < totalFrames; i++) {
                sampleFrames.push({ index: i, buffer: frameBuffers[i] });
            }
        } else {
            // Densely sample across the sequence
            const step = (totalFrames - 1) / (maxSampleCount - 1);
            for (let i = 0; i < maxSampleCount; i++) {
                const idx = Math.round(i * step);
                sampleFrames.push({ index: idx, buffer: frameBuffers[idx] });
            }
        }


        // Sort frames chronologically to maintain temporal context for the AI
        sampleFrames.sort((a, b) => a.index - b.index);

        const prompt = `You are analyzing a liveness verification sequence. The person was asked to perform these actions in sequence: ${expectedSteps.join(', ')}.
        
I'm providing you with ${sampleFrames.length} key frames from a video sequence, provided in CHRONOLOGICAL order.
- The first frames show the initial state and blinking.
- The final frames (especially the last one) capture the peak of the head turn or movement.

For liveness verification, analyze these aspects:
1. **Face Detection**: Is a real human face consistently visible?
2. **Movement Detection**: Are there natural variations in face position, expression, or head pose across frames?
3. **Blinking**: Do you observe natural eye blinking or eye state changes?
4. **Head Movement**: Do you see natural head rotation or position changes? (Crucial: check if the person turns their head as requested).
5. **Anti-Spoofing**: Does this appear to be a live person vs a photo or video replay?

Provide a JSON response:
{
  "passed": true/false,
  "confidence": 0-100,
  "faceDetectedInAllFrames": true/false,
  "movementDetected": true/false,
  "blinkingObserved": true/false,
  "headMovementObserved": true/false,
  "antiSpoofingScore": 0-100,
  "reasoning": "Detailed explanation of your analysis",
  "suspiciousIndicators": ["list any suspicious signs"],
  "frameAnalysis": [
    {
      "frameIndex": 0,
      "faceVisible": true/false,
      "headPose": "description",
      "actionDetected": "what action is shown in this specific frame"
    }
  ]
}

Only mark as passed if you're confident this is a live human performing the requested movements.`;

        // Convert sample frames to image parts
        const imageParts = sampleFrames.map(frame => ({
            inlineData: {
                data: frame.buffer.toString('base64'),
                mimeType: 'image/jpeg'
            }
        }));

        console.log(`[Gemini] Sending liveness check to AI:`, {
            expectedSteps,
            sampleFrameCount: sampleFrames.length,
            totalFrames,
            promptLength: prompt.length
        });

        let aiResult;
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
            try {
                aiResult = await model.generateContent([prompt, ...imageParts]);
                break; // Success
            } catch (err) {
                retries++;
                if (err.status === 503 && retries < maxRetries) {
                    const delay = Math.pow(2, retries) * 1000;
                    console.warn(`[Gemini] Liveness Model busy (503). Retrying ${retries}/${maxRetries} in ${delay}ms...`);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                throw err;
            }
        }

        const response = await aiResult.response;
        const text = response.text();

        // Strip markdown fences if Gemini wrapped the JSON (happens after model updates)
        const cleanText = text
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/, '')
            .trim();

        // Extract JSON from the response
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
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

            result = {
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
        } else {
            throw new Error('Failed to parse AI response');
        }

        return result;
    } catch (err) {
        console.error('[Gemini] Liveness sequence verification error:', err);
        return {
            passed: false,
            confidence: 0,
            reasoning: 'Technical error during verification',
            error: err.message
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
    const startTime = Date.now();
    let result;
    let error;

    try {
        console.log(`[Gemini] Starting parseResume with mimeType: ${mimeType}, buffer size: ${fileBuffer.length}`);
        console.log(`[Gemini] Buffer first 20 bytes (hex): ${fileBuffer.toString('hex', 0, 20)}`);

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        console.log(`[Gemini] Model created successfully`);

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
- For employment_type, use ONLY these values: "full-time", "part-time", "self-employed", "freelance", "contract", "internship", "seasonal"
- For location_type, use ONLY these values: "on-site", "hybrid", "remote" (if not specified, use "on-site")
- For certifications: ONLY include entries that have BOTH name AND issuing organization. Skip any certifications without issuing organization.
- For dates (Experiences, Education, Projects, Volunteer): 
  * Convert to YYYY-MM-DD for the JSON output. 
  * If the input is only Month/Year, use the 1st of the month (e.g., "Jan 2022" -> "2022-01-01").
- For volunteer entries: The "role" field is REQUIRED. If the resume doesn't specify a specific title, you MUST use "Volunteer" or "Contributor". NEVER return an empty string for the role.
- For projects: The "name" field is REQUIRED. If no project name is clear, use "Project" or "Research Project". NEVER return an empty string for the project name.
- For awards: The "title" field is REQUIRED. If no award title is clear, use "Award" or "Honors". NEVER return an empty string for the award title.
- For socials: Aggressively look for LinkedIn, GitHub, Twitter, and Website links. They are often in the header, footer, or "Contact" section. Extract the FULL URL if present.
- For contact info: Extract the primary phone number and email address. If multiple are present, take the first one.

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
      "employment_type": "full-time",
      "location_type": "on-site",
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
      "issue_date": {
        "month": 6,
        "year": 2023
      },
      "expiration_date": {
        "month": 6,
        "year": 2025,
        "does_not_expire": false
      },
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
      "issuing_organization": "string",
      "issue_date": {
        "month": 6,
        "year": 2023
      },
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

        console.log(`[Gemini] Calling generateContent with prompt length: ${prompt.length}`);
        console.log(`[Gemini] Base64 data length: ${fileBuffer.toString('base64').length}`);

        const aiResult = await model.generateContent([prompt, filePart]);
        console.log(`[Gemini] AI request completed`);

        const response = await aiResult.response;
        const text = response.text();
        console.log(`[Gemini] Response received, text length: ${text.length}`);
        console.log(`[Gemini] Response preview: ${text.substring(0, 200)}...`);

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            console.log(`[Gemini] JSON extracted successfully`);
            result = JSON.parse(jsonMatch[0]);
        } else {
            console.error(`[Gemini] No JSON found in response: ${text}`);
            throw new Error('Failed to parse AI response - no JSON found');
        }

        console.log(`[Gemini] Parse completed successfully in ${Date.now() - startTime}ms`);
        return result;
    } catch (err) {
        error = err;
        console.error('[Gemini] Resume parsing error:', err);
        console.error('[Gemini] Error type:', err.constructor.name);
        console.error('[Gemini] Error status:', err.status);
        console.error('[Gemini] Error statusText:', err.statusText);
        console.error('[Gemini] Error message:', err.message);
        console.error('[Gemini] Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

        // Return more specific error information
        if (err.status === 400) {
            throw new Error(`Gemini API Error (400): ${err.message}`);
        } else if (err.status === 403) {
            throw new Error(`Gemini API Authentication Error (403): Check API key`);
        } else if (err.status === 413) {
            throw new Error(`File too large for Gemini API (413): Try a smaller file`);
        } else if (err.status === 429) {
            throw new Error(`Gemini API Rate Limit (429): Please try again later`);
        } else {
            throw new Error(`Failed to parse resume: ${err.message}`);
        }
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
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

/**
 * Match a user's profile with a job description to calculate fit and gaps
 * @param {Object} profileData - User's CasperID profile data
 * @param {string} jobDescription - Scraped job description
 * @returns {Promise<Object>} Match results
 */
async function matchJobWithProfile(profileData, jobDescription) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are an expert ATS (Applicant Tracking System) and career matchmaker. 
Analyze the user's professional profile against the provided job description.

User Profile:
${JSON.stringify(profileData, null, 2)}

Job Description:
${jobDescription}

Provide a JSON response with the following structure:
{
  "matchScore": 0-100,
  "summary": "1-2 sentence overview of why the user is or isn't a good fit",
  "skillGaps": ["Skill 1", "Skill 2"],
  "matchedSkills": ["Skill 1", "Skill 2"],
  "careerAdvice": "Brief advice on what to emphasize in the application"
}

Be honest but constructive. Focus on technical skills, years of experience, and core responsibilities.`;

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
        console.error('[Gemini] Job matching error:', error);
        throw new Error('Failed to match job with profile');
    }
}

module.exports = {
    analyzeIDDocument,
    compareFaceWithID,
    verifyLivenessGesture,
    verifyLivenessSequence,
    performKYCVerification,
    parseResume,
    generateCoverLetter,
    matchJobWithProfile
};
