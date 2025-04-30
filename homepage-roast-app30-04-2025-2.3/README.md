# Homepage Roast App v2.3

This is the latest version of the Homepage Roast application with enhanced loading UI featuring:

- Sequential loading messages with emojis
- Fading animations for loading messages
- Checkmarks that appear after each step completes
- A progress bar that advances from 0-100%
- Improved layout with no line breaks in status messages

## Deployment Instructions

1. Push this entire directory (`homepage-roast-app30-04-2025-2.3`) to your GitHub repository.
2. After pushing to GitHub, the application will be available via jsDelivr CDN.
3. For Webflow integration, use the `webflow-index.html` file content in your Webflow HTML embed element.

## Local Testing

You can test the application locally by:

1. Opening `standalone-test.html` directly in your browser
2. This test file contains buttons to simulate different loading scenarios

## File Structure

- `index.html` - Main application HTML
- `webflow-index.html` - Embed code for Webflow with CDN references
- `standalone-test.html` - Self-contained test file
- `css/style.css` - CSS for styling the application
- `js/` - JavaScript files:
  - `config.js` - Configuration parameters
  - `api.js` - API interaction code
  - `ui.js` - User interface code with enhanced loading
  - `main.js` - Main application logic

## Important CDN URLs

All URLs in `webflow-index.html` reference:
```
https://cdn.jsdelivr.net/gh/FreshBreadAI/freshbread-ai@main/homepage-roast-app30-04-2025-2.3/
```

Make sure your GitHub repository and branch names match these URLs.
