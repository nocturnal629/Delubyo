import { AIProvider } from '../utils/AIManager';

export class AISettings {
  private modal: HTMLElement | null = null;
  private selectedProvider: AIProvider = AIProvider.OPENAI;
  private apiKeyInput: HTMLInputElement | null = null;
  private apiUrlInput: HTMLInputElement | null = null;
  private saveCallback: ((provider: AIProvider, apiKey: string, apiUrl: string) => void) | null = null;

  constructor() {
    this.initializeUI();
  }

  private initializeUI(): void {
    const settingsButton = document.getElementById('ai-settings-button');
    if (settingsButton) {
      settingsButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.showSettings();
      });
    }

    const existingModal = document.getElementById('ai-settings-modal');
    if (existingModal) {
      existingModal.remove();
    }

    this.createModal();
  }

  private createModal(): void {
    this.modal = document.createElement('div');
    this.modal.id = 'ai-settings-modal';
    this.modal.className = 'modal';
    this.modal.style.display = 'none';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const closeButton = document.createElement('span');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => this.hideSettings());

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hideSettings();
      }
    });

    const title = document.createElement('h2');
    title.textContent = 'AI Provider Settings';

    const providerLabel = document.createElement('label');
    providerLabel.textContent = 'Select AI Provider:';
    providerLabel.htmlFor = 'ai-provider-select';

    const providerSelect = document.createElement('select');
    providerSelect.id = 'ai-provider-select';
    
    const providers = [
      { value: AIProvider.OPENAI, label: 'OpenAI' },
      { value: AIProvider.CLAUDE, label: 'Claude AI' },
      { value: AIProvider.DEEPSEEK, label: 'DeepSeek AI' },
      { value: AIProvider.HUGGINGFACE, label: 'Hugging Face (Free Tier)' },
      { value: AIProvider.GEMINI, label: 'Google Gemini (Free Tier)' },
      { value: AIProvider.GROQ, label: 'Groq (Free Tier)' },
      { value: AIProvider.COHERE, label: 'Cohere (Free Tier)' }
    ];

    providers.forEach(provider => {
      const option = document.createElement('option');
      option.value = provider.value;
      option.textContent = provider.label;
      providerSelect.appendChild(option);
    });

    providerSelect.addEventListener('change', (e) => {
      this.selectedProvider = (e.target as HTMLSelectElement).value as AIProvider;
      this.updateProviderFields();
    });

    const apiKeyLabel = document.createElement('label');
    apiKeyLabel.textContent = 'API Key:';
    apiKeyLabel.htmlFor = 'ai-api-key';

    this.apiKeyInput = document.createElement('input');
    this.apiKeyInput.type = 'password';
    this.apiKeyInput.id = 'ai-api-key';
    this.apiKeyInput.placeholder = 'Enter your API key';

    const apiUrlLabel = document.createElement('label');
    apiUrlLabel.textContent = 'API URL (optional):';
    apiUrlLabel.htmlFor = 'ai-api-url';

    this.apiUrlInput = document.createElement('input');
    this.apiUrlInput.type = 'text';
    this.apiUrlInput.id = 'ai-api-url';
    this.apiUrlInput.placeholder = 'Enter custom API URL if needed';

    const providerInfo = document.createElement('div');
    providerInfo.id = 'provider-info';
    providerInfo.className = 'provider-info';

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Settings';
    saveButton.className = 'primary-button';
    saveButton.addEventListener('click', () => this.saveSettings());

    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(document.createElement('hr'));
    
    modalContent.appendChild(providerLabel);
    modalContent.appendChild(providerSelect);
    
    modalContent.appendChild(apiKeyLabel);
    modalContent.appendChild(this.apiKeyInput);
    
    modalContent.appendChild(apiUrlLabel);
    modalContent.appendChild(this.apiUrlInput);
    
    modalContent.appendChild(providerInfo);
    modalContent.appendChild(saveButton);

    this.modal.appendChild(modalContent);
    document.body.appendChild(this.modal);
  }

  public showSettings(): void {
    if (this.modal) {
      const savedProvider = localStorage.getItem('ai_provider') as AIProvider || AIProvider.OPENAI;
      const savedApiKey = localStorage.getItem('ai_api_key') || '';
      const savedApiUrl = localStorage.getItem('ai_api_url') || '';

      this.selectedProvider = savedProvider;
      const selectElement = document.getElementById('ai-provider-select') as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = savedProvider;
      }

      if (this.apiKeyInput) {
        this.apiKeyInput.value = savedApiKey;
      }

      if (this.apiUrlInput) {
        this.apiUrlInput.value = savedApiUrl;
      }

      this.updateProviderFields();

      this.modal.style.display = 'block';

      void this.modal.offsetHeight;
    }
  }

  public hideSettings(): void {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }

  private updateProviderFields(): void {
    const providerInfo = document.getElementById('provider-info');
    if (!providerInfo) return;

    let infoText = '';
    let apiUrlPlaceholder = 'Enter custom API URL if needed';

    switch (this.selectedProvider) {
      case AIProvider.OPENAI:
        infoText = 'OpenAI requires an API key. You can get one at <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a>';
        break;
      
      case AIProvider.CLAUDE:
        infoText = 'Claude requires an API key. You can get one at <a href="https://console.anthropic.com/" target="_blank">console.anthropic.com</a>';
        apiUrlPlaceholder = 'Usually: https://api.anthropic.com/v1/messages';
        break;
      
      case AIProvider.DEEPSEEK:
        infoText = 'DeepSeek requires an API key. You can get one at <a href="https://platform.deepseek.com/" target="_blank">platform.deepseek.com</a>';
        apiUrlPlaceholder = 'Usually: https://api.deepseek.com/v1/chat/completions';
        break;

      case AIProvider.HUGGINGFACE:
        infoText = 'Hugging Face offers a free tier. Get your API key at <a href="https://huggingface.co/settings/tokens" target="_blank">huggingface.co</a>';
        apiUrlPlaceholder = 'Leave empty for default or enter model endpoint';
        break;
      
      case AIProvider.GEMINI:
        infoText = 'Google Gemini offers a free tier. Get your API key at <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a>';
        apiUrlPlaceholder = 'API URL not needed for Gemini';
        break;
      
      case AIProvider.GROQ:
        infoText = 'Groq currently offers a free tier. Get your API key at <a href="https://console.groq.com/keys" target="_blank">console.groq.com</a>';
        apiUrlPlaceholder = 'Usually: https://api.groq.com/openai/v1/chat/completions';
        break;
      
      case AIProvider.COHERE:
        infoText = 'Cohere offers a free tier. Get your API key at <a href="https://dashboard.cohere.com/api-keys" target="_blank">dashboard.cohere.com</a>';
        apiUrlPlaceholder = 'Usually: https://api.cohere.ai/v1/chat';
        break;
    }

    providerInfo.innerHTML = infoText;
    
    if (this.apiUrlInput) {
      this.apiUrlInput.placeholder = apiUrlPlaceholder;
    }
  }

  private saveSettings(): void {
    if (!this.apiKeyInput) return;

    const apiKey = this.apiKeyInput.value.trim();
    const apiUrl = this.apiUrlInput?.value.trim() || '';

    if (!apiKey) {
      alert('API Key is required');
      return;
    }

    localStorage.setItem('ai_provider', this.selectedProvider);
    localStorage.setItem('ai_api_key', apiKey);
    localStorage.setItem('ai_api_url', apiUrl);
    localStorage.setItem('use_ai', 'true');

    if (this.saveCallback) {
      this.saveCallback(this.selectedProvider, apiKey, apiUrl);
    }

    alert('Settings saved! Refresh the page for changes to take effect.');
    this.hideSettings();
  }

  public onSave(callback: (provider: AIProvider, apiKey: string, apiUrl: string) => void): void {
    this.saveCallback = callback;
  }
}