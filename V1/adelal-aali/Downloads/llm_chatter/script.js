class TranslationApp {
    constructor() {
        this.initDarkMode();
        this.registerHandlers();
    }

    initDarkMode() {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const updateDarkMode = (matches) => {
            document.documentElement.classList.toggle('dark', matches);
        };

        updateDarkMode(darkModeMediaQuery.matches);
        darkModeMediaQuery.addEventListener('change', (e) => updateDarkMode(e.matches));
    }

    registerHandlers() {
        window.Poe.registerHandler("translation-handler", this.handleTranslationResponse.bind(this));
        document.getElementById('translation-form').addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    handleTranslationResponse(result, context) {
        const loadingElement = document.getElementById('loading');
        const resultContainer = document.getElementById('result-container');
        const translationResult = document.getElementById('translation-result');
        const response = result.responses[0];

        switch (response.status) {
            case "error":
                loadingElement.classList.add('hidden');
                resultContainer.classList.remove('hidden');
                translationResult.textContent = `Error: ${response.statusText || 'An error occurred during translation.'}`;
                break;
            case "incomplete":
                resultContainer.classList.remove('hidden');
                translationResult.textContent = response.content;
                break;
            case "complete":
                loadingElement.classList.add('hidden');
                resultContainer.classList.remove('hidden');
                translationResult.textContent = response.content;
                this.enableCopyButton();
                break;
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const sourceText = document.getElementById('source-text').value.trim();
        if (!sourceText) {
            this.showError('Please enter text to translate.');
            return;
        }

        if (sourceText.length > 5000) {
            this.showError('Text exceeds maximum length of 5000 characters.');
            return;
        }

        try {
            const sourceLanguage = document.getElementById('source-language').value;
            const targetLanguage = document.getElementById('target-language').value;
            const model = document.querySelector('input[name="model"]:checked').value;
            const sourceLanguageStr = sourceLanguage === 'auto' ? 'auto-detected language' : sourceLanguage;

            this.showLoadingState();
            
            const prompt = `@${model} Translate the following text from ${sourceLanguageStr} to ${targetLanguage}. Return only the translated text without explanations, additional text, or formatting:\n\n${sourceText}`;
            
            await window.Poe.sendUserMessage(prompt, {
                handler: "translation-handler",
                stream: true,
                openChat: false
            });
        } catch (err) {
            this.showError(`Error: ${err.message || 'Failed to send translation request.'}`);
        }
    }

    showLoadingState() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('result-container').classList.add('hidden');
        document.getElementById('copy-button').disabled = true;
    }

    showError(message) {
        alert(message);
    }

    enableCopyButton() {
        const copyButton = document.getElementById('copy-button');
        copyButton.disabled = false;
        copyButton.addEventListener('click', this.copyToClipboard.bind(this));
    }

    copyToClipboard() {
        const translationResult = document.getElementById('translation-result');
        navigator.clipboard.writeText(translationResult.textContent)
            .then(() => alert('Translation copied to clipboard!'))
            .catch(() => alert('Failed to copy translation.'));
    }
}

window.addEventListener('DOMContentLoaded', () => new TranslationApp());
