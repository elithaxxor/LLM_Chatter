window.addEventListener('DOMContentLoaded', (event) => {
    // Check for dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    }
    
    // Listen for dark mode changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (event.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    });
    
    // Register handler for bot responses
    window.Poe.registerHandler("translation-handler", (result, context) => {
        const loadingElement = document.getElementById('loading');
        const resultContainer = document.getElementById('result-container');
        const translationResult = document.getElementById('translation-result');
        
        // Get the first response (we only expect one bot to respond)
        const response = result.responses[0];
        
        if (response.status === "error") {
            loadingElement.classList.add('hidden');
            resultContainer.classList.remove('hidden');
            translationResult.textContent = `Error: ${response.statusText || 'An error occurred during translation.'}`;
        } else if (response.status === "incomplete") {
            // Show partial response while streaming
            resultContainer.classList.remove('hidden');
            translationResult.textContent = response.content;
        } else if (response.status === "complete") {
            // Update with final content
            loadingElement.classList.add('hidden');
            resultContainer.classList.remove('hidden');
            translationResult.textContent = response.content;
        }
    });
    
    // Handle form submission
    document.getElementById('translation-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const sourceText = document.getElementById('source-text').value.trim();
        if (!sourceText) {
            alert('Please enter text to translate.');
            return;
        }
        
        const sourceLanguage = document.getElementById('source-language').value;
        const targetLanguage = document.getElementById('target-language').value;
        const model = document.querySelector('input[name="model"]:checked').value;
        
        // Show loading state
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('result-container').classList.add('hidden');
        
        // Format source language string
        const sourceLanguageStr = sourceLanguage === 'auto' ? 'auto-detected language' : sourceLanguage;
        
        // Construct the prompt
        const prompt = `@${model} Translate the following text from ${sourceLanguageStr} to ${targetLanguage}. Return only the translated text without explanations, additional text, or formatting:

${sourceText}`;
        
        try {
            await window.Poe.sendUserMessage(prompt, {
                handler: "translation-handler",
                stream: true,
                openChat: false
            });
        } catch (err) {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('result-container').classList.remove('hidden');
            document.getElementById('translation-result').textContent = `Error: ${err.message || 'Failed to send translation request.'}`;
        }
    });
});