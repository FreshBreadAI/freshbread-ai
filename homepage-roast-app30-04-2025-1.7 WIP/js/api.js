// API Interaction Functions

async function fetchAnalysis(url) {
    console.log(`Attempting to fetch analysis for: ${url}`);
    
    try {
        const response = await fetch(Config.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });

        console.log(`Received response with status: ${response.status}`);
        if (!response.ok) {
            // Try to get error details from response body if possible
            let errorBody = 'Could not retrieve error details.';
            try {
                 errorBody = await response.text();
            } catch (e) { /* Ignore if reading body fails */ }
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. Body: ${errorBody}`);
        }

        // Get response text instead of directly parsing as JSON
        const responseText = await response.text();
        
        // Sanitize the JSON string to remove invalid control characters
        const sanitizedJson = responseText
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
            .replace(/\\(?!["bfnrtu\\])/g, '\\\\'); // Escape backslashes not followed by valid escape chars
        
        try {
            // Parse the sanitized JSON
            const json = JSON.parse(sanitizedJson);
            console.log('Successfully parsed JSON response after sanitization');
            return json; // Return the parsed JSON data
        } catch (parseError) {
            console.error('JSON parsing error after sanitization:', parseError);
            // If still fails, try a more aggressive sanitization approach
            const aggressiveSanitized = responseText.replace(/[^\x20-\x7E]/g, '');
            try {
                const json = JSON.parse(aggressiveSanitized);
                console.log('Successfully parsed JSON with aggressive sanitization');
                return json;
            } catch (e) {
                throw new Error(`Failed to parse JSON after sanitization: ${parseError.message}`);
            }
        }

    } catch (error) {
        console.error('Detailed error fetching or processing roast data:', error);
        // Re-throw the error so the caller (main.js) knows it failed
        throw new Error(`Failed to fetch or process analysis: ${error.message}`); 
    }
}
