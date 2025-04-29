// UI Manipulation Functions

// DOM Element References (will be populated by main.js)
let DOMElements = {};

function setDOMElements(elements) {
    DOMElements = elements;
}

// --- Error Handling --- 
function showError(message) {
    if (!DOMElements.errorMessage) return;
    DOMElements.errorMessage.textContent = message;
    DOMElements.errorMessage.style.display = 'block';
}

function hideError() {
    if (!DOMElements.errorMessage) return;
    DOMElements.errorMessage.style.display = 'none';
}

// --- Loading State --- 
function showLoading() {
    clearResults(); 
    hideError();
    if (DOMElements.loading) {
        DOMElements.loading.style.display = 'block';
        DOMElements.loading.innerHTML = '<div class="spinner"></div><p>Analyzing your homepage... This may take up to 60 seconds.</p>';
    }
    if (DOMElements.results) DOMElements.results.style.display = 'none';
}

function hideLoading() {
    if (DOMElements.loading) DOMElements.loading.style.display = 'none';
}

// --- Result Display --- 
function clearResults() {
    // Clear dynamic content areas
    if (DOMElements.overallScore) DOMElements.overallScore.textContent = '0/10';
    if (DOMElements.categoryScoreCards) DOMElements.categoryScoreCards.innerHTML = '';
    if (DOMElements.roastContent) DOMElements.roastContent.textContent = '';
    if (DOMElements.icpContent) DOMElements.icpContent.textContent = '';
    if (DOMElements.detailedCards) DOMElements.detailedCards.innerHTML = ''; 
    if (DOMElements.detailedAnalysisCards) DOMElements.detailedAnalysisCards.innerHTML = ''; // Clear detailed cards too
    // Hide the results container itself
    if (DOMElements.results) DOMElements.results.style.display = 'none';
}

function showResultsContainer() {
    if (DOMElements.results) DOMElements.results.style.display = 'block';
}

// --- Specific Content Rendering --- 

function renderRoast(roastText) {
    if (DOMElements.roastContent) {
        DOMElements.roastContent.textContent = roastText || 'No roast available.';
    }
}

function renderICP(icpText) {
    if (DOMElements.icpContent) {
        DOMElements.icpContent.textContent = icpText || 'No ICP description available.';
    }
}

function renderOverallScore(score) {
    // Get references to the new elements
    const scoreTextElement = document.getElementById('overallScore'); // The text display
    const scoreContainer = document.querySelector('.score-container');
    const circlePath = scoreContainer ? scoreContainer.querySelector('path.circle') : null;

    if (scoreTextElement && scoreContainer && circlePath) {
        let numericScore = parseFloat(score);
        let displayScore = '?';
        let percentage = 0;
        let colorClass = 'score-grey'; // Default class

        if (!isNaN(numericScore) && numericScore >= 0 && numericScore <= 10) {
            displayScore = numericScore.toFixed(1);
            percentage = (numericScore / 10) * 100;

            // Determine color class
            if (numericScore <= 4) {
                colorClass = 'score-red';
            } else if (numericScore <= 7) {
                colorClass = 'score-orange';
            } else {
                colorClass = 'score-green';
            }
        } else {
            // Handle null, NaN, or out-of-range scores
            numericScore = null; // Explicitly null for logic below
            displayScore = '?';
            percentage = 0;
            colorClass = 'score-grey';
        }

        // Update Text
        scoreTextElement.textContent = `${displayScore}/10`;

        // Update SVG circle - the SVG has a full circumference of 339.29
        // We need to reduce the strokeDashoffset based on the percentage
        const circumference = 339.29; // Match the value in the SVG
        const offset = circumference - (percentage / 100) * circumference;
        circlePath.style.strokeDashoffset = offset;

        // Update Color Class on container
        scoreContainer.classList.remove('score-red', 'score-orange', 'score-green', 'score-grey');
        scoreContainer.classList.add(colorClass);

    } else {
        console.error('renderOverallScore Error: Could not find all necessary elements.');
        console.log('Element Check - scoreTextElement:', scoreTextElement); 
        console.log('Element Check - scoreContainer:', scoreContainer);
        console.log('Element Check - circlePath:', circlePath); 

        // Fallback or default state if elements are missing
        if (scoreTextElement) { 
            scoreTextElement.textContent = '?/10'; 
        } else {
            console.error('renderOverallScore Error: scoreTextElement (#overallScore) not found!');
        }
    }
}

// Helper to escape characters unsafe for HTML attributes
function escapeHtmlAttr(str) {
    if (typeof str !== 'string') return '';
    // Basic escaping for quotes and less-than/greater-than
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Score color logic
function getScoreColorClass(score) {
    if (score === null || score === undefined) return 'grey'; // Handle missing scores
    if (score <= 4) return 'red';
    if (score <= 7) return 'orange';
    return 'green';
}

function renderSummaryScoreCards(analysisResults) {
    if (!DOMElements.categoryScoreCards || !analysisResults) return;

    DOMElements.categoryScoreCards.innerHTML = ''; // Clear previous cards
    let totalScore = 0;
    let scoredCount = 0;

    Config.scoredCategories.forEach(catKey => {
        const result = analysisResults.find(r => r.category === catKey);
        const score = result && typeof result.score === 'number' ? result.score : null;
        const analysis = result ? result.analysis : '';
        const recommendations = result ? result.recommendations : '';
        const displayName = Config.CATEGORY_MAP[catKey] || catKey; // Fallback to key if no map

        if (score !== null) {
            totalScore += score;
            scoredCount++;
        }

        const colorClass = getScoreColorClass(score);
        const scoreDisplay = score !== null ? score : '?'; // Use '?' for display if score is null

        const card = document.createElement('div');
        card.className = 'category-score-card';
        
        // Create the circle indicator SVG structure
        const circleSVG = `
        <div class="circle-indicator ${colorClass}" 
             data-score="${scoreDisplay}" 
             data-analysis="${escapeHtmlAttr(analysis)}" 
             data-recommendations="${escapeHtmlAttr(recommendations)}" 
             data-category-name="${escapeHtmlAttr(displayName)}"
             title="${escapeHtmlAttr(displayName)}: ${scoreDisplay}/10">
          <svg viewBox="0 0 120 120">
            <circle class="bg" cx="60" cy="60" r="54"/>
            <circle class="progress" cx="60" cy="60" r="54" stroke-dasharray="339.29" stroke-dashoffset="339.29"/>
          </svg>
          <span class="score-value">0</span>
        </div>
        <div class="category-name">${escapeHtmlAttr(displayName)}</div>
        `;
        
        card.innerHTML = circleSVG;
        DOMElements.categoryScoreCards.appendChild(card);

        // Add animation and popup listener (handled in main.js after element exists)
        const circleElem = card.querySelector('.circle-indicator');
        if (circleElem && score !== null) {
             // Store score on the element for animation retrieval
            circleElem.dataset.animateScore = score; 
        }
    });

    // Calculate and render overall score
    const overallAvg = scoredCount > 0 ? (totalScore / scoredCount) : null;
    console.log(`Calculated Overall Score: totalScore=${totalScore}, scoredCount=${scoredCount}, overallAvg=${overallAvg !== null ? overallAvg.toFixed(1) : 'N/A'}`); // DEBUG LOG
    renderOverallScore(overallAvg); 
}

// Helper function to format text as bullet points
function formatTextAsBullets(text) {
    if (!text || text === 'No analysis provided.' || text === 'No recommendations provided.') {
        return `<p>${escapeHtmlAttr(text)}</p>`;
    }
    
    // Split text into sentences (handling periods, question marks, exclamation points)
    // This regex looks for sentence endings followed by spaces or end of string
    const sentences = text.split(/(?<=[.!?])\s+|(?<=[.!?])$/)
        .filter(sentence => sentence.trim().length > 0);
    
    if (sentences.length === 0) {
        return `<p>${escapeHtmlAttr(text)}</p>`;
    }
    
    // Format as bullet points
    const bulletPoints = sentences.map(sentence => {
        // Trim the sentence and ensure it ends with proper punctuation
        let trimmedSentence = sentence.trim();
        if (!/[.!?]$/.test(trimmedSentence)) {
            trimmedSentence += '.';
        }
        return `<li>${escapeHtmlAttr(trimmedSentence)}</li>`;
    }).join('');
    
    return `<ul class="bullet-list">${bulletPoints}</ul>`;
}

// --- Detailed Analysis Card Rendering ---
function renderDetailedAnalysisCards(analysisResults) {
    if (!DOMElements.detailedAnalysisCards || !analysisResults) {
        console.error("Missing detailed analysis card container or results data");
        return;
    }

    const container = DOMElements.detailedAnalysisCards;
    container.innerHTML = ''; // Clear previous cards

    Config.scoredCategories.forEach(catKey => {
        const result = analysisResults.find(r => r.category === catKey);
        if (!result) return; // Skip if no data for this category

        const displayName = Config.CATEGORY_MAP[catKey] || catKey;
        const analysis = result.analysis || 'No analysis provided.';
        const recommendations = result.recommendations || 'No recommendations provided.';
        const score = typeof result.score === 'number' ? result.score : null;
        const scoreDisplay = score !== null ? `${score}/10` : 'N/A';

        const card = document.createElement('div');
        card.className = 'card detailed-analysis-card';

        // Use emoji instead of SVG based on category
        let iconEmoji = '';
        switch (displayName) {
            case 'Clarity & Value':
                iconEmoji = '💡';
                break;
            case 'Motivation':
                iconEmoji = '🚀';
                break;
            case 'Trust':
                iconEmoji = '🤝';
                break;
            case 'CTA Effectiveness':
                iconEmoji = '👉';
                break;
            case 'UX & Usability':
                iconEmoji = '🖱️';
                break;
            case 'Narrative Flow':
            case 'Overall Narrative & Flow':
                iconEmoji = '📝';
                break;
            default:
                iconEmoji = '';
        }

        // Set the inner HTML for the card structure
        card.innerHTML = `
            <div class="category-header">
                <span class="category-title">${iconEmoji} ${escapeHtmlAttr(displayName)}</span>
                <span class="category-score ${getScoreColorClass(score)}">${scoreDisplay}</span>
            </div>
            <div class="detailed-content">
                <div class="analysis-column">
                    <h4>Analysis</h4>
                    ${formatTextAsBullets(analysis)}
                </div>
                <div class="recommendation-column blurred">
                     <h4 class="not-blurred">How to Fix</h4>
                     <div class="blurred-content">${formatTextAsBullets(recommendations)}</div>
                     <div class="gating-overlay">
                         <i class="fas fa-lock lock-icon"></i>
                         <button class="cta-button get-full-report-btn">Get the full report</button>
                     </div>
                </div>
            </div>
        `;

        // Find the button within the newly created card
        const reportButton = card.querySelector('.get-full-report-btn');

        // Add the event listener to open the popup
        if (reportButton) {
            reportButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent potential card-level clicks if any
                if (typeof window.openReportPopup === 'function') {
                    window.openReportPopup();
                } else {
                    console.error('openReportPopup function not found on window.');
                    alert('Could not open the report form.');
                }
            });
        }

        // Append the fully constructed card to the container
        container.appendChild(card);
    });
}

// --- Simple Validation --- 
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;  
    }
}
