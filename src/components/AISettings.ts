import { AIProvider } from '../utils/AIManager';

export class AISettings {
  private modal: HTMLElement | null = null;
  private selectedProvider: AIProvider = AIProvider.OPENAI;
  private apiKeyInput: HTMLInputElement | null = null;
  private apiUrlInput: HTMLInputElement | null = null;
  private apiUrlLabel: HTMLLabelElement | null = null;
  private statusRegion: HTMLElement | null = null;
  private saveCallback: ((provider: AIProvider, apiKey: string, apiUrl: string) => void) | null = null;
  private previouslyFocused: HTMLElement | null = null;
  private keydownHandler: (e: KeyboardEvent) => void;

  constructor() {
    this.keydownHandler = (e: KeyboardEvent) => this.handleKeydown(e);
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
    // Accessibility: expose the modal as a proper dialog to assistive tech.
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', 'ai-settings-title');

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Close settings');
    closeButton.addEventListener('click', () => this.hideSettings());

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hideSettings();
      }
    });

    const title = document.createElement('h2');
    title.id = 'ai-settings-title';
    title.textContent = 'AI Provider Settings';

    const providerLabel = document.createElement('label');
    providerLabel.textContent = 'Select AI Provider:';
    providerLabel.htmlFor = 'ai-provider-select';

    const providerSelect = document.createElement('select');
    providerSelect.id = 'ai-provider-select';

    const providers = [
      { value: AIProvider.OPENAI, label: 'OpenAI (ChatGPT)' },
      { value: AIProvider.CLAUDE, label: 'Claude AI' },
      { value: AIProvider.DEEPSEEK, label: 'DeepSeek AI' },
      { value: AIProvider.GEMINI, label: 'Google Gemini (Free Tier)' },
      { value: AIProvider.CLOUDIQ, label: 'CloudIQ (Self-hosted gateway)' }
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

    this.apiUrlLabel = document.createElement('label');
    this.apiUrlLabel.textContent = 'API URL (optional):';
    this.apiUrlLabel.htmlFor = 'ai-api-url';

    this.apiUrlInput = document.createElement('input');
    this.apiUrlInput.type = 'text';
    this.apiUrlInput.id = 'ai-api-url';
    this.apiUrlInput.placeholder = 'Enter custom API URL if needed';

    const providerInfo = document.createElement('div');
    providerInfo.id = 'provider-info';
    providerInfo.className = 'provider-info';

    // Non-blocking status region (replaces alert()). Announced to screen readers.
    this.statusRegion = document.createElement('div');
    this.statusRegion.id = 'ai-settings-status';
    this.statusRegion.className = 'ai-settings-status';
    this.statusRegion.setAttribute('role', 'status');
    this.statusRegion.setAttribute('aria-live', 'polite');
    this.statusRegion.style.display = 'none';

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
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

    modalContent.appendChild(this.apiUrlLabel);
    modalContent.appendChild(this.apiUrlInput);

    modalContent.appendChild(providerInfo);
    modalContent.appendChild(this.statusRegion);
    modalContent.appendChild(saveButton);

    this.modal.appendChild(modalContent);
    document.body.appendChild(this.modal);
  }

  public showSettings(): void {
    if (this.modal) {
      this.previouslyFocused = document.activeElement as HTMLElement | null;
      this.clearStatus();

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

      document.addEventListener('keydown', this.keydownHandler, true);

      // Move focus into the dialog.
      const firstField = document.getElementById('ai-provider-select') as HTMLElement | null;
      firstField?.focus();
    }
  }

  public hideSettings(): void {
    if (this.modal) {
      this.modal.style.display = 'none';
      document.removeEventListener('keydown', this.keydownHandler, true);

      // Restore focus to whatever opened the dialog.
      if (this.previouslyFocused && typeof this.previouslyFocused.focus === 'function') {
        this.previouslyFocused.focus();
      }
      this.previouslyFocused = null;
    }
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (!this.modal || this.modal.style.display === 'none') {
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      this.hideSettings();
      return;
    }

    if (e.key === 'Tab') {
      this.trapFocus(e);
    }
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this.modal) return [];
    const selector = 'button, [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(this.modal.querySelectorAll<HTMLElement>(selector))
      .filter(el => el.offsetParent !== null || el === document.activeElement);
  }

  private trapFocus(e: KeyboardEvent): void {
    const focusable = this.getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement;

    if (e.shiftKey) {
      if (active === first || !this.modal?.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last || !this.modal?.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  private updateProviderFields(): void {
    const providerInfo = document.getElementById('provider-info');
    if (!providerInfo) return;

    let infoText = '';
    let apiUrlPlaceholder = 'Enter custom API URL if needed';
    let urlLabelText = 'API URL (optional):';

    switch (this.selectedProvider) {
      case AIProvider.OPENAI:
        infoText = 'OpenAI requires an API key. You can get one at <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a>';
        apiUrlPlaceholder = 'Leave blank unless using a custom endpoint';
        break;

      case AIProvider.CLAUDE:
        infoText = 'Claude requires an API key. You can get one at <a href="https://console.anthropic.com/" target="_blank">console.anthropic.com</a>';
        apiUrlPlaceholder = 'Usually: https://api.anthropic.com/v1/messages';
        break;

      case AIProvider.DEEPSEEK:
        infoText = 'DeepSeek offers both free and paid tiers. Get your API key at <a href="https://platform.deepseek.com/" target="_blank">platform.deepseek.com</a> or use open-source models through Hugging Face.';
        apiUrlPlaceholder = 'Usually: https://api.deepseek.com/v1/chat/completions';
        break;

      case AIProvider.GEMINI:
        infoText = 'Google Gemini offers a free tier. Get your API key at <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a>.';
        apiUrlPlaceholder = 'API URL not required for Gemini';
        break;

      case AIProvider.CLOUDIQ:
        infoText = 'CloudIQ is a self-hosted / bring-your-own-host OpenAI-compatible gateway. It requires <strong>both</strong> a host / base URL (e.g. https://your-cloudiq-host.example.com/v1) <strong>and</strong> an API key (sent as an X-API-Key header). The default model is "cloudiq-smart".';
        apiUrlPlaceholder = 'Required: https://your-cloudiq-host.example.com/v1';
        urlLabelText = 'API URL (required):';
        break;
    }

    providerInfo.innerHTML = infoText;

    if (this.apiUrlLabel) {
      this.apiUrlLabel.textContent = urlLabelText;
    }

    if (this.apiUrlInput) {
      this.apiUrlInput.placeholder = apiUrlPlaceholder;

      // Gemini is the only provider that genuinely never needs a URL, so it is
      // the only one whose URL field is hidden. CloudIQ, by contrast, *requires*
      // the URL, so it must stay visible (and prominent).
      if (this.selectedProvider === AIProvider.GEMINI) {
        this.apiUrlInput.style.display = 'none';
        this.apiUrlLabel?.setAttribute('style', 'display: none');
      } else {
        this.apiUrlInput.style.display = '';
        this.apiUrlLabel?.removeAttribute('style');
      }
    }
  }

  private saveSettings(): void {
    if (!this.apiKeyInput) return;

    const apiKey = this.apiKeyInput.value.trim();
    const apiUrl = this.apiUrlInput?.value.trim() || '';

    if (!apiKey) {
      this.showStatus('API Key is required.', 'error');
      this.apiKeyInput.focus();
      return;
    }

    // CloudIQ is self-hosted, so it cannot fall back to a public endpoint.
    if (this.selectedProvider === AIProvider.CLOUDIQ && !apiUrl) {
      this.showStatus('CloudIQ requires a host / base URL (e.g. https://your-cloudiq-host.example.com/v1).', 'error');
      this.apiUrlInput?.focus();
      return;
    }

    localStorage.setItem('ai_provider', this.selectedProvider);
    localStorage.setItem('ai_api_key', apiKey);
    localStorage.setItem('ai_api_url', apiUrl);
    localStorage.setItem('use_ai', 'true');

    if (this.saveCallback) {
      this.saveCallback(this.selectedProvider, apiKey, apiUrl);
    }

    this.showStatus('Settings saved! Refresh the page for changes to take effect.', 'success');
  }

  private showStatus(message: string, type: 'error' | 'success'): void {
    if (!this.statusRegion) return;
    this.statusRegion.textContent = message;
    this.statusRegion.className = `ai-settings-status ai-settings-status--${type}`;
    this.statusRegion.style.display = 'block';
  }

  private clearStatus(): void {
    if (!this.statusRegion) return;
    this.statusRegion.textContent = '';
    this.statusRegion.style.display = 'none';
  }

  public onSave(callback: (provider: AIProvider, apiKey: string, apiUrl: string) => void): void {
    this.saveCallback = callback;
  }
}
