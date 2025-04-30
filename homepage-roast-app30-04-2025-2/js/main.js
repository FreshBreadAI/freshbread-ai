// Main application logic: Event listeners and coordination

function initializeRoastApp() {
    console.log('initializeRoastApp() called.'); // Log function call
    // --- Get DOM Elements --- 
    const elements = {
        roastForm: document.getElementById('roastForm'),
        urlInput: document.getElementById('urlInput'),
        errorMessage: document.getElementById('errorMessage'),
        loading: document.getElementById('loading'),
        results: document.getElementById('results'),
        roastContent: document.getElementById('roastContent'),
        icpContent: document.getElementById('icpContent'),
        overallScore: document.getElementById('overallScore'),
        categoryScoreCards: document.querySelector('.category-score-cards'),
        detailedCards: document.getElementById('detailedCards'), // If you add detailed cards later
        detailedAnalysisCards: document.getElementById('detailedAnalysisCards'), // Container for new detailed cards
        // Share Buttons
        shareTwitter: document.getElementById('shareTwitter'),
        shareFacebook: document.getElementById('shareFacebook'),
        shareLinkedIn: document.getElementById('shareLinkedIn'),
        shareEmail: document.getElementById('shareEmail'),
        // Details Popup
        detailsPopupOverlay: document.getElementById('detailsPopupOverlay'),
        detailsPopupClose: document.getElementById('detailsPopupClose'),
        detailsPopupTitle: document.getElementById('detailsPopupTitle'),
        detailsPopupScore: document.getElementById('detailsPopupScore'),
        detailsPopupAnalysis: document.getElementById('detailsPopupAnalysis'),
        detailsPopupRecommendations: document.getElementById('detailsPopupRecommendations'),
        // Gated Content Popup (Add elements if implemented)
        popupOverlay: document.getElementById('popupOverlay'),
        popupClose: document.getElementById('popupClose'),
        // ... add other funnel form elements if needed ...
    };
    console.log('Attempted to get roastForm element:', elements.roastForm);

    let currentRoastData = { roastText: '', analyzedUrl: '' }; // Store current results for sharing

    // Provide elements to the UI module
    if (typeof setDOMElements === 'function') {
        setDOMElements(elements);
    } else {
        console.error('ERROR: setDOMElements function not found (ui.js might not be loaded correctly).');
        return; // Stop initialization if UI elements can't be set
    }

    let lastAnalysisData = null; // Store the last successful analysis

    // --- Utility Functions --- (Keep isValidUrl if it's only used here, otherwise move to utils.js)
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // --- Event Listeners --- 

    // Form Submission
    if (elements.roastForm) { 
        console.log('Attaching submit listener to:', elements.roastForm);
        elements.roastForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted'); // Log submit event
            const url = elements.urlInput.value.trim();

            if (typeof isValidUrl !== 'function') {
                console.error('ERROR: isValidUrl function not found.');
                if (typeof showError === 'function') {
                    showError('An internal error occurred. Please try again later.');
                } else {
                     alert('An internal error occurred. Please try again later.');
                }
                return;
            }
             if (typeof showError !== 'function') {
                console.error('ERROR: showError function not found.');
                 alert('Please enter a valid URL (e.g., https://example.com)');
                 return;
            }

            if (!isValidUrl(url)) {
                console.log('Invalid URL entered:', url);
                showError('Please enter a valid URL (e.g., https://example.com)');
                return;
            }
            
            console.log(`Valid URL submitted: ${url}`);

            if (typeof showLoading === 'function') {
                 console.log('Calling showLoading...');
                 showLoading();
            } else {
                console.error('ERROR: showLoading function not found.');
            }
            
            if (typeof clearResults === 'function') {
                clearResults(); // Clear previous results
            } else {
                 console.error('ERROR: clearResults function not found.');
            }

            lastAnalysisData = null;

            if (typeof fetchAnalysis !== 'function') {
                 console.error('ERROR: fetchAnalysis function not found (api.js might not be loaded correctly).');
                 showError('Error: Cannot fetch analysis data.');
                  if (typeof hideLoading === 'function') hideLoading();
                 return;
            }

            try {
                console.log('Calling fetchAnalysis...');
                const data = await fetchAnalysis(url);
                console.log('fetchAnalysis returned:', data);
                lastAnalysisData = data; 

                // Check if data is valid before proceeding
                if (!data || !data.analysis_results) {
                     console.error('Invalid data received from fetchAnalysis:', data);
                     throw new Error('Received invalid analysis data format.');
                }

                // Store data for sharing
                const roastResultShare = data.analysis_results.find(r => r.category === 'Roast'); 
                currentRoastData.roastText = roastResultShare ? roastResultShare.roast : 'No roast available.';
                currentRoastData.analyzedUrl = url;

                // --- Render Results --- 
                // Check for rendering functions before calling
                if (typeof renderRoast !== 'function' || typeof renderICP !== 'function' || typeof renderSummaryScoreCards !== 'function' || typeof renderDetailedAnalysisCards !== 'function' || typeof addGatingButtonListeners !== 'function' || typeof addScoreCircleInteractions !== 'function') {
                    console.error('ERROR: One or more rendering functions are missing (ui.js might not be fully loaded or initialized).');
                    throw new Error('UI rendering functions are not available.');
                }

                // 1. Find Roast and ICP
                const roastResult = data.analysis_results.find(r => r.category === 'Roast');
                const icpResult = data.analysis_results.find(r => r.category === 'ICP');
                renderRoast(roastResult ? roastResult.roast : null);
                renderICP(icpResult ? icpResult.icp_description : null);
                
                // 1.5 Display screenshot if available
                if (data.screenshot_url) {
                    console.log('Screenshot URL found:', data.screenshot_url);
                    const screenshotImg = document.getElementById('homepageScreenshot');
                    if (screenshotImg) {
                        screenshotImg.src = data.screenshot_url;
                        screenshotImg.style.display = 'block';
                    } else {
                        console.warn('homepageScreenshot element not found for screenshot.');
                    }
                } else {
                    console.log('No screenshot URL in response')
                    const screenshotImg = document.getElementById('homepageScreenshot');
                    if (screenshotImg) {
                        screenshotImg.style.display = 'none';
                    }
                }

                // 2. Render Summary Score Cards (this also calculates and renders overall score)
                renderSummaryScoreCards(data.analysis_results);
                
                // 3. Render Detailed Analysis Cards
                renderDetailedAnalysisCards(data.analysis_results);

                // 4. Add Listeners for "Get Full Report" buttons
                addGatingButtonListeners();

                // 5. Animate Circles & Add Click Listeners (AFTER elements are in DOM)
                addScoreCircleInteractions();

                if(elements.results) {
                    elements.results.style.display = 'block'; // Show results container
                    console.log('Analysis displayed successfully.');
                } else {
                     console.error('ERROR: results element not found, cannot display.');
                }
                
            } catch (error) {
                console.error('Error during analysis fetch or rendering:', error);
                // Check if showError exists before calling
                 if (typeof showError === 'function') {
                    showError(`Analysis failed: ${error.message}`);
                } else {
                    alert(`Analysis failed: ${error.message}`);
                }
                // Check if clearResults exists before calling
                if (typeof clearResults === 'function') {
                    clearResults();
                } 
            } finally {
                 // Check if hideLoading exists before calling
                 if (typeof hideLoading === 'function') {
                    console.log('Calling hideLoading...');
                    hideLoading();
                } else {
                    console.error('ERROR: hideLoading function not found.');
                }
            }
        });
    } else {
        console.error('ERROR: roastForm element was null when trying to attach listener in initializeRoastApp.');
    }

    // --- Share Button Listeners --- 
    // Check if setupShareButtons exists before calling
    if (typeof setupShareButtons === 'function') {
        setupShareButtons(() => currentRoastData); // Pass function to get current data
    } else {
        console.error('ERROR: setupShareButtons function not found.');
    }

    // --- Popup Listeners (Details & Gated Content) ---
    // Removing this call for now as the function doesn't exist in ui.js
    /* if (typeof setupPopupListeners === 'function') {
        setupPopupListeners(() => lastAnalysisData); // Pass function to get last data
    } else {
        console.error('ERROR: setupPopupListeners function not found.');
    }
    */

    // --- Example Usage & Initialization --- 
    // (Optional: Add any initial setup needed after listeners are attached)
    console.log('Homepage Roast App Initialized');

    // --- Helper Functions Specific to main.js --- 
 
     // Function to add listeners and animation AFTER score circles are rendered
    function addScoreCircleInteractions() {
        const circleElements = elements.categoryScoreCards.querySelectorAll('.circle-indicator');
        circleElements.forEach(circleElem => {
            const score = parseFloat(circleElem.dataset.animateScore); // Get score saved earlier
            if (!isNaN(score)) {
                animateCircle(circleElem, score, 1000); // Animate the circle
            }

            // Add click listener to scroll to the corresponding detailed card
            circleElem.addEventListener('click', () => {
                const categoryName = circleElem.dataset.categoryName;
                if (categoryName) {
                    // Find the corresponding detailed card
                    const detailedCards = document.querySelectorAll('.detailed-analysis-card');
                    let targetCard = null;
                    
                    detailedCards.forEach(card => {
                        const titleElem = card.querySelector('.category-title');
                        if (titleElem && titleElem.textContent.includes(categoryName)) {
                            targetCard = card;
                        }
                    });
                    
                    if (targetCard) {
                        // Scroll to the card with smooth behavior
                        targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        
                        // Optional: Add a highlight effect
                        targetCard.classList.add('highlight-card');
                        setTimeout(() => {
                            targetCard.classList.remove('highlight-card');
                        }, 2000);
                    }
                }
            });
        });
    }

    // Animation helper (easeOutCubic)
    function easeOutCubic(t) { 
        return 1 - Math.pow(1 - t, 3); 
    }

    // Animate number counter and arc
    function animateCircle(circleElem, finalScore, duration) {
        const valueElem = circleElem.querySelector('.score-value');
        const progressElem = circleElem.querySelector('.progress');
        if (!valueElem || !progressElem) {
            console.error('Could not find value or progress element for animation');
            return;
        }
        const radius = 54; // Must match the SVG radius
        const circumference = 2 * Math.PI * radius;
        let start = null;
        
        // Reset before starting
        valueElem.textContent = '0';
        progressElem.setAttribute('stroke-dashoffset', circumference);
        progressElem.style.transition = 'stroke-dashoffset 0s'; // Disable CSS transition during JS animation

        function animate(ts) {
            if (!start) start = ts;
            let elapsed = ts - start;
            let progress = Math.min(elapsed / duration, 1);
            let eased = easeOutCubic(progress);
            let currentScore = Math.round(eased * finalScore);
            
            valueElem.textContent = currentScore;
            
            let percent = (currentScore / 10); // Assuming max score is 10
            let offset = circumference * (1 - percent);
            progressElem.setAttribute('stroke-dashoffset', offset);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Ensure final values are exact
                valueElem.textContent = finalScore;
                let finalOffset = circumference * (1 - (finalScore / 10));
                progressElem.setAttribute('stroke-dashoffset', finalOffset);
            }
        }
        requestAnimationFrame(animate);
    }

    // --- Gating Logic --- 
    function addGatingButtonListeners() {
        const buttons = elements.detailedAnalysisCards.querySelectorAll('.get-full-report-btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent potential form submission if wrapped
                // Show the main popup overlay (assuming it contains the form)
                if (elements.popupOverlay) {
                    elements.popupOverlay.style.display = 'flex';
                } else {
                    console.error('Popup overlay element not found.');
                }
            });
        });
    }

    // Details Popup Logic
    function openDetailsPopup(category, score, analysis, recommendations) {
        elements.detailsPopupTitle.textContent = category || 'Details';
        elements.detailsPopupScore.textContent = score !== '?' ? score : 'N/A';
        elements.detailsPopupAnalysis.textContent = analysis || 'No analysis provided.';
        elements.detailsPopupRecommendations.textContent = recommendations || 'No recommendations provided.';
        elements.detailsPopupOverlay.style.display = 'flex';
    }

    function closeDetailsPopup() {
        elements.detailsPopupOverlay.style.display = 'none';
    }
    
    function setupDetailsPopup() {
        if(elements.detailsPopupClose) {
            elements.detailsPopupClose.addEventListener('click', closeDetailsPopup);
        }
        if(elements.detailsPopupOverlay) {
            // Close if clicking outside the popup content
            elements.detailsPopupOverlay.addEventListener('click', (event) => {
                if (event.target === elements.detailsPopupOverlay) {
                    closeDetailsPopup();
                }
            });
        }
    }

    // Share Button Logic 
    function setupShareButtons() {
        // Only keeping Twitter/X sharing functionality
        if (elements.shareTwitter) {
            elements.shareTwitter.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentRoastData.analyzedUrl && currentRoastData.roastText) {
                    // Get the overall score from lastAnalysisData
                    let overallScore = '?';
                    if (lastAnalysisData) {
                        // Calculate the average score of all categories
                        const scores = lastAnalysisData.analysis_results
                            .filter(item => typeof item.score === 'number')
                            .map(item => item.score);
                        
                        if (scores.length > 0) {
                            const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
                            overallScore = average.toFixed(1);
                        }
                    }
                    
                    // Format the share text according to the exact example
                    // Including the full roast text without truncation
                    const fullRoast = currentRoastData.roastText || '';
                    
                    const text = encodeURIComponent(
                        `I just got my homepage roasted (URL: ${currentRoastData.analyzedUrl})\n\n` +
                        `Score: ${overallScore}/10\n\n` +
                        `"${fullRoast}"\n\n` +
                        `Check out https://www.freshbread.ai/downloads/roast-my-homepage`
                    );
                    
                    // Don't include the URL as a separate parameter
                    const tweetUrl = `https://twitter.com/intent/tweet?text=${text}`;
                    console.log('Share URL:', decodeURIComponent(text)); // For debugging
                    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
                } else {
                    alert('Please analyze a URL first to share the results.');
                }
            });
        }
    }

    // --- Multi-Stage Popup Logic ---
    const popupOverlay = document.getElementById('popupOverlay');
    const popupContainer = document.getElementById('popupContainer');
    const closePopupButton = document.getElementById('popupClose');
    const funnelStages = document.querySelectorAll('.funnel-stage');
    const funnelContent = document.getElementById('funnelContent'); // Container for stages
    const successNotification = document.getElementById('successNotification');
    const successContainer = document.getElementById('successContainer'); // Container for success message
    const finalForm = document.getElementById('contactForm'); // Stage 4 form
    const stageIndicator = document.getElementById('stageIndicator');

    let currentStageIndex = 0;
    const totalStages = 4; // Total number of input stages (excluding success)
    const formData = {
        businessType: '',
        contentChallenges: '',
        annualRevenue: '',
        name: '',
        email: '',
        phone: '',
        countryCode: ''
    };

    function updateStageIndicator() {
        if (stageIndicator) {
            stageIndicator.textContent = `Step ${currentStageIndex + 1} of ${totalStages}`;
        }
         // Hide indicator on the final form stage or success stage
        if (stageIndicator) {
            stageIndicator.style.display = (currentStageIndex >= totalStages -1 ) ? 'none' : 'block';
        }
    }


    function showStage(stageIndex) {
        funnelStages.forEach((stage, index) => {
            stage.classList.toggle('active', index === stageIndex);
        });
        currentStageIndex = stageIndex;
        updateStageIndicator();

        // Reset scroll position for the new stage if needed
        const activeStage = funnelStages[stageIndex];
        if (activeStage) {
            activeStage.scrollTop = 0;
        }
        // Ensure main funnel content is visible and success is hidden
        funnelContent.style.display = 'block';
        successContainer.style.display = 'none';
        successNotification.style.display = 'none';
        popupContainer.classList.remove('success-mode');

    }

    function openPopup() {
        if (popupOverlay) {
            resetPopup(); // Reset to first stage every time it opens
            popupOverlay.style.display = 'flex';
             // Delay slightly to allow display:flex to apply before transition
            setTimeout(() => {
                // Add styles for smooth transition if defined in CSS
                // e.g., popupContainer.style.transform = 'scale(1)';
                // e.g., popupContainer.style.opacity = '1';
            }, 10);
        }
    }

    function closePopup() {
         if (popupOverlay) {
            // Add styles for smooth transition if defined in CSS
             // e.g., popupContainer.style.transform = 'scale(0.95)';
             // e.g., popupContainer.style.opacity = '0';
            // Wait for transition before hiding
            // setTimeout(() => {
                popupOverlay.style.display = 'none';
                resetPopup(); // Reset state after closing
            // }, 300); // Match transition duration if any
        }
    }

    function nextStage() {
        if (currentStageIndex < funnelStages.length - 1) {
            showStage(currentStageIndex + 1);
        }
    }

     function resetPopup() {
        formData.businessType = '';
        formData.contentChallenges = '';
        formData.annualRevenue = '';
        formData.name = '';
        formData.email = '';
        formData.phone = '';
        formData.countryCode = '';
        if(finalForm) finalForm.reset();
        // Select the default country code again if needed
        const countryCodeSelect = document.getElementById('countryCode');
        if (countryCodeSelect) {
            countryCodeSelect.value = '+1'; // Or your default
        }
        showStage(0); // Go back to the first stage
        // Ensure success message is hidden and funnel is shown
        funnelContent.style.display = 'block';
        successContainer.style.display = 'none';
        successNotification.style.display = 'none';
        popupContainer.classList.remove('success-mode');

    }

    function showSuccessState() {
        funnelContent.style.display = 'none'; // Hide form stages
        successContainer.style.display = 'flex'; // Show success message container
        successNotification.style.display = 'block'; // Show success banner
        popupContainer.classList.add('success-mode');
        // Optional: Auto-close after a few seconds
        // setTimeout(closePopup, 5000);
    }


    // Event Listener for Closing Popup
    if (closePopupButton) {
        closePopupButton.addEventListener('click', closePopup);
    }
    if (popupOverlay) {
        popupOverlay.addEventListener('click', (event) => {
            // Close only if clicked directly on the overlay, not the container itself
            if (event.target === popupOverlay) {
                closePopup();
            }
        });
    }

    // Event Listeners for Option Buttons (Stages 1-3)
    funnelStages.forEach((stage, index) => {
        if (index < 3) { // Only for stages 0, 1, 2 (Business Type, Challenges, Revenue)
            const optionButtons = stage.querySelectorAll('.option-button');
            optionButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const value = button.dataset.value;
                    if (index === 0) formData.businessType = value;
                    else if (index === 1) formData.contentChallenges = value;
                    else if (index === 2) formData.annualRevenue = value;
                    console.log('Updated formData:', formData); // For debugging
                    nextStage();
                });
            });
        }
    });


    // Event Listener for Final Form Submission (Stage 4)
    if (finalForm) {
        finalForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            // Collect data from the final form
            formData.name = document.getElementById('name').value;
            formData.email = document.getElementById('email').value;
            formData.phone = document.getElementById('phone').value || ''; // Handle empty phone
            formData.countryCode = document.getElementById('countryCode').value;

            console.log('Submitting final form data:', formData); // For debugging

            // Show loading state on button
            const submitButton = finalForm.querySelector('.submit-button');
            if (submitButton) {
                submitButton.textContent = 'Submitting...';
                submitButton.disabled = true;
            }
                
            // Format data for webhook in the expected format
            const webhookData = {
                businessType: formData.businessType || 'Not specified',
                contentChallenge: formData.contentChallenges || 'Not specified',
                annualRevenue: formData.annualRevenue || 'Not specified',
                name: formData.name,
                email: formData.email,
                phone: formData.phone ? `${formData.countryCode} ${formData.phone}` : 'Not provided',
                url: currentRoastData.analyzedUrl || window.location.href // Include the analyzed URL or fallback to current page
            };
            
            console.log('Submitting to webhook:', webhookData);
            
            // Use setTimeout to ensure UI updates before trying the fetch
            setTimeout(async () => {
                // Always show success after a delay, regardless of actual submission result
                const showSuccess = () => {
                    setTimeout(() => {
                        showSuccessState();
                    }, 1000); // Small delay for better UX
                };
                
                // Attempt to send data but don't let failures affect the user experience
                try {
                    // Use no-cors mode to avoid CORS issues
                    const fetchOptions = {
                        method: 'POST',
                        mode: 'no-cors', // This prevents CORS errors but means we can't read the response
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(webhookData)
                    };
                    
                    // Send the data with a timeout to prevent hanging
                    const fetchPromise = fetch('https://hook.eu2.make.com/icfxtcjhrir2g5o1sfdfi8w4o0px1vy4', fetchOptions);
                    
                    // Set a timeout for the fetch
                    const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Request timed out')), 5000);
                    });
                    
                    // Race the fetch against the timeout
                    await Promise.race([fetchPromise, timeoutPromise]);
                    console.log('Data sent to webhook');                
                } catch (error) {
                    // Log error but don't show to user
                    console.log('Error in submission (proceeding anyway):', error);
                    // Store in localStorage for retry later if needed
                    try {
                        const storedSubmissions = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
                        storedSubmissions.push(webhookData);
                        localStorage.setItem('pendingSubmissions', JSON.stringify(storedSubmissions));
                        console.log('Saved submission data for later retry');
                    } catch (storageError) {
                        console.error('Could not save to localStorage:', storageError);
                    }
                }
                
                // Always show success regardless of what happened with the submission
                showSuccess();
                
                // Reset button state after a delay
                setTimeout(() => {
                    if (submitButton) {
                        submitButton.textContent = 'Get the Full Report';
                        submitButton.disabled = false;
                    }
                }, 2000);
            }, 500);
        });
    }
    // --- End of Form Submit Handler ---

    // --- Add Trigger for Opening Popup (Example - replace with actual triggers) ---
    // This part needs to be connected to the "Get the full report" buttons
    // We will add those buttons and their listeners in the next step (editing ui.js)
    // Example: document.getElementById('someButtonId').addEventListener('click', openPopup);
    // Make openPopup globally accessible or attach it to window if needed by ui.js
    window.openReportPopup = openPopup; 


} // End of initializeRoastApp function

// !! DO NOT CALL initializeRoastApp() here !!
// It will be called from webflow-index.html after scripts are loaded.
