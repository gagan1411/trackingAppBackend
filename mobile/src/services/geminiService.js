import * as SecureStore from 'expo-secure-store';

/**
 * geminiService.js
 * ----------------
 * Uses Google Gemini 1.5 Flash (Free Tier) to perform stable visual biometric verification.
 * Implements a hyper-robust fallback system to handle regional/API version discrepancies.
 */

let discoveredModel = null;
let discoveredVersion = "v1beta";

/**
 * Automatically discovers the best available model for the user's specific API key.
 */
async function discoverBestModel(apiKey) {
    if (discoveredModel) return { model: discoveredModel, version: discoveredVersion };

    const versions = ["v1beta", "v1"];
    let lastErr = "";

    for (const v of versions) {
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`);
            const data = await res.json();

            if (data.models && data.models.length > 0) {
                // Look for Flash (priority), then Pro, then anything that supports vision/content
                const flash = data.models.find(m => m.name.includes("flash") && m.supportedGenerationMethods.includes("generateContent"));
                const pro = data.models.find(m => m.name.includes("pro") && m.supportedGenerationMethods.includes("generateContent"));
                const any = data.models.find(m => m.supportedGenerationMethods.includes("generateContent"));

                const best = flash || pro || any;
                if (best) {
                    // best.name is usually "models/gemini-1.5-flash"
                    discoveredModel = best.name.split("/").pop();
                    discoveredVersion = v;
                    console.log(`Dynamic Discovery Success: Using ${discoveredModel} on ${discoveredVersion}`);
                    return { model: discoveredModel, version: discoveredVersion };
                }
            }
            if (data.error) lastErr = data.error.message;
        } catch (e) {
            lastErr = e.message;
        }
    }

    throw new Error(`Cloud AI Discovery Failed: ${lastErr || "No generative models found for this key."}`);
}

const getUrl = (v, m) => `https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent`;

/**
 * Identify if a live photo matches ANY person in a batch of candidate photos.
 */
export async function identifyInBatch(livePhotoBase64, candidates) {
    try {
        const apiKey = await SecureStore.getItemAsync('gemini_api_key');
        if (!apiKey) throw new Error("Cloud AI Key Missing. Tap footer 5x to configure.");

        const candidatesPrompt = candidates.map((c, i) => `Person ${i + 1} (Name: ${c.name}, ID: ${c.id})`).join(", ");

        const prompt = `
            TASK: Visual Biometric Matching.
            Compare the "LIVE PROBE" (Image 1) against the "GALLERY BATCH" (Remaining Images).
            
            GALLERY DATA: [${candidatesPrompt}]

            INSTRUCTIONS:
            1. Analyze bone structure and permanent facial features.
            2. Determine if the Probe matches ANY Gallery member.
            3. Return the EXACT "matched_id" from the list above.
            
            JSON FORMAT ONLY:
            {
                "found": boolean,
                "matched_id": "string or null",
                "confidence_score": number (0-100),
                "brief_analysis": "string"
            }
        `;

        const parts = [
            { text: prompt },
            { inline_data: { mime_type: "image/jpeg", data: livePhotoBase64 } }
        ];

        candidates.forEach(c => {
            if (c.base64) parts.push({ inline_data: { mime_type: "image/jpeg", data: c.base64 } });
        });

        const requestBody = { contents: [{ parts }] };

        // 1. Discover best model
        const { model, version } = await discoverBestModel(apiKey);

        // 2. Execute
        try {
            const url = `${getUrl(version, model)}?key=${apiKey}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error.message);
            return parseBatchResponse(result);
        } catch (err) {
            // If the discovered model suddenly fails, reset and try one more time
            discoveredModel = null;
            throw err;
        }
    } catch (error) {
        console.error("Batch Identify Error:", error);
        throw error;
    }
}

/**
 * Verify if two images contain the same person.
 */
export async function verifyFaceWithGemini(livePhotoBase64, registeredPhotoBase64) {
    try {
        const apiKey = await SecureStore.getItemAsync('gemini_api_key');
        if (!apiKey) throw new Error("API Key Missing.");

        const { model, version } = await discoverBestModel(apiKey);
        const url = `${getUrl(version, model)}?key=${apiKey}`;

        const prompt = `
            Task: Direct 1:1 Facial Comparison.
            Compare Image 1 (Live) and Image 2 (Record).
            
            JSON FORMAT ONLY:
            { "is_same_person": boolean, "confidence_score": number, "brief_analysis": "string" }
        `;

        const requestBody = {
            contents: [{
                parts: [
                    { text: prompt },
                    { inline_data: { mime_type: "image/jpeg", data: livePhotoBase64 } },
                    { inline_data: { mime_type: "image/jpeg", data: registeredPhotoBase64 } }
                ]
            }]
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        if (result.error) throw new Error(result.error.message);
        return parseVerifyResponse(result);
    } catch (error) {
        console.error("Gemini Verify Error:", error);
        throw error;
    }
}

/**
 * Diagnostic tool to check if the API key and cloud are working.
 */
export async function testCloudConnection() {
    try {
        const apiKey = await SecureStore.getItemAsync('gemini_api_key');
        if (!apiKey) return { ok: false, msg: "NO KEY SAVED" };

        const { model, version } = await discoverBestModel(apiKey);
        return { ok: true, msg: `SUCCESS: Using ${model} on ${version}` };
    } catch (e) {
        return { ok: false, msg: e.message };
    }
}

function parseBatchResponse(result) {
    const cand = result.candidates?.[0];
    if (!cand) throw new Error("Cloud AI blocked this scan (Safety Filter).");

    const text = cand.content?.parts?.[0]?.text;
    if (!text) throw new Error("Cloud AI returned empty result.");

    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const data = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        return {
            matched: !!data.found,
            id: data.matched_id || null,
            confidence: data.confidence_score || 0,
            analysis: data.brief_analysis || "Scanning complete."
        };
    } catch (e) {
        throw new Error("Data Parsing Error from Cloud AI.");
    }
}

function parseVerifyResponse(result) {
    const cand = result.candidates?.[0];
    if (!cand) throw new Error("Cloud AI blocked this scan (Safety Filter).");

    const text = cand.content?.parts?.[0]?.text;
    if (!text) throw new Error("Cloud AI returned empty result.");

    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const data = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        return {
            matched: !!data.is_same_person,
            confidence: data.confidence_score || 0,
            analysis: data.brief_analysis || "Verification complete."
        };
    } catch (e) {
        throw new Error("Data Parsing Error from Cloud AI.");
    }
}
