// API Interaction Functions

async function fetchAnalysis(url) {
    console.log(`[api.js] Attempting to fetch analysis for: ${url}`);
    
    try {
        console.log(`[api.js] Sending POST request to: ${Config.webhookUrl}`);
        const response = await fetch(Config.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });

        console.log(`[api.js] Received response. Status: ${response.status}`);
        if (!response.ok) {
            console.log(`[api.js] Response not OK (${response.status}). Attempting to read error body...`);
            let errorBody = 'Could not retrieve error details.';
            try {
                 errorBody = await response.text();
                 console.log(`[api.js] Error body received: ${errorBody}`);
            } catch (e) { 
                console.error('[api.js] Failed to read error body:', e);
            }
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. Body: ${errorBody}`);
        }

        console.log('[api.js] Response OK. Attempting to read response text...');
        const responseText = await response.text();
        console.log('[api.js] Successfully read response text.'); // Log length for debugging: . Length: ${responseText.length}`);
        
        // Sanitize the JSON string to remove invalid control characters
        console.log('[api.js] Attempting basic sanitization...');
        const sanitizedJson = responseText
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
            .replace(/\\(?!["bfnrtu\\])/g, '\\\\'); // Escape backslashes not followed by valid escape chars
        console.log('[api.js] Basic sanitization complete.');
        
        try {
            console.log('[api.js] Attempting to parse sanitized JSON...');
            const json = JSON.parse(sanitizedJson);
            console.log('[api.js] Successfully parsed JSON response after sanitization.');
            return json; // Return the parsed JSON data
        } catch (parseError) {
            console.error('[api.js] JSON parsing error after basic sanitization:', parseError);
            console.log('[api.js] Attempting aggressive sanitization...');
            // If still fails, try a more aggressive sanitization approach
            const aggressiveSanitized = responseText.replace(/[^\x20-\x7E]/g, '');
            console.log('[api.js] Aggressive sanitization complete.');
            try {
                console.log('[api.js] Attempting to parse aggressively sanitized JSON...');
                const json = JSON.parse(aggressiveSanitized);
                console.log('[api.js] Successfully parsed JSON with aggressive sanitization.');
                return json;
            } catch (e) {
                console.error('[api.js] JSON parsing error after aggressive sanitization:', e);
                // Throw specific error about parsing failure
                throw new Error(`Failed to parse JSON response even after sanitization. Original error: ${parseError.message}`);
            }
        }

    } catch (error) {
        console.error('[api.js] Detailed error in fetchAnalysis:', error);
        // Re-throw the error so the caller (main.js) knows it failed
        // Ensure the error message is useful
        throw new Error(`[api.js] Error during fetch/processing: ${error.message}`); 
    }
}
