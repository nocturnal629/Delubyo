import { StoryEngine } from '../engine/StoryEngine';
import { Message, Choice, Ending, GameState } from '../models/types';

export class GameUI {
  private messageContainer: HTMLElement | null = null;
  private choiceContainer: HTMLElement | null = null;
  private inputContainer: HTMLElement | null = null;
  private inputField: HTMLInputElement | null = null;
  private sendButton: HTMLElement | null = null;
  private statusContainer: HTMLElement | null = null;
  private endingContainer: HTMLElement | null = null;
  private storyEngine: StoryEngine | null = null;
  private typingIndicator: HTMLElement | null = null;
  private characterStatusIndicator: HTMLElement | null = null;
  private customInputAllowed: boolean = false;
  private inputPlaceholderDefault: string = "Type your response...";
  private inputDisabledMessage: string = "Waiting for Maya to finish...";
  private multipleChoicesMessage: string = "Please select from the choices above";

  // HUD + atmospheric UI elements
  private gameHud: HTMLElement | null = null;
  private locationLabelEl: HTMLElement | null = null;
  private healthFill: HTMLElement | null = null;
  private healthValue: HTMLElement | null = null;
  private signalIndicator: HTMLElement | null = null;
  private lightningFlash: HTMLElement | null = null;
  private awayIndicator: HTMLElement | null = null;

  // Transient UI state
  private gameState: GameState | null = null;
  private lastHealth: number | null = null;
  private lastLocation: string = 'unknown';
  private isAway: boolean = false;
  private awayText: string = '';
  private lastMessageId: string | null = null;
  private messageMetadata: Map<string, string> = new Map();
  private lightningTimeout: number | null = null;

  constructor() {
    this.initializeUI();
  }

  private initializeUI(): void {
    this.messageContainer = document.getElementById('message-container');
    this.choiceContainer = document.getElementById('choice-container');
    this.inputContainer = document.getElementById('input-container');
    this.inputField = document.getElementById('input-field') as HTMLInputElement;
    this.sendButton = document.getElementById('send-button');
    this.statusContainer = document.getElementById('status-container');
    this.endingContainer = document.getElementById('ending-container');

    this.createGameHud();
    this.createAtmosphericElements();
    this.createTypingIndicator();
    this.createCharacterStatusIndicator();

    if (this.sendButton && this.inputField) {
      this.sendButton.addEventListener('click', () => this.handleCustomInput());
      this.inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleCustomInput();
        }
      });
    }

    this.renderOverlays();
    this.checkAndShowInputField();
  }

  private createGameHud(): void {
    const main = document.querySelector('main');
    if (!main) return;

    const existing = document.getElementById('game-hud');
    if (existing) existing.remove();

    this.gameHud = document.createElement('div');
    this.gameHud.id = 'game-hud';
    this.gameHud.className = 'game-hud';

    const locationEl = document.createElement('div');
    locationEl.className = 'hud-location';
    const pin = document.createElement('span');
    pin.className = 'hud-location-pin';
    pin.textContent = '◉';
    this.locationLabelEl = document.createElement('span');
    this.locationLabelEl.className = 'hud-location-label';
    this.locationLabelEl.textContent = this.locationLabel('unknown');
    locationEl.appendChild(pin);
    locationEl.appendChild(this.locationLabelEl);

    const healthEl = document.createElement('div');
    healthEl.className = 'hud-health';
    const healthLabel = document.createElement('span');
    healthLabel.className = 'hud-health-label';
    healthLabel.textContent = 'Condition';
    const healthBar = document.createElement('div');
    healthBar.className = 'hud-health-bar';
    this.healthFill = document.createElement('div');
    this.healthFill.className = 'hud-health-fill health-high';
    this.healthFill.style.width = '100%';
    healthBar.appendChild(this.healthFill);
    this.healthValue = document.createElement('span');
    this.healthValue.className = 'hud-health-value';
    this.healthValue.textContent = '100';
    healthEl.appendChild(healthLabel);
    healthEl.appendChild(healthBar);
    healthEl.appendChild(this.healthValue);

    this.gameHud.appendChild(locationEl);
    this.gameHud.appendChild(healthEl);

    main.insertBefore(this.gameHud, main.firstChild);
  }

  private createAtmosphericElements(): void {
    this.signalIndicator = document.createElement('div');
    this.signalIndicator.className = 'signal-indicator signal-strong';
    this.signalIndicator.textContent = '●●●';
    this.signalIndicator.title = 'Transmitter signal';

    this.lightningFlash = document.createElement('div');
    this.lightningFlash.className = 'lightning-flash';

    this.awayIndicator = document.createElement('div');
    this.awayIndicator.className = 'character-away-indicator';
    this.awayIndicator.style.display = 'none';
  }

  private checkAndShowInputField(): void {
    if (this.inputContainer) {
      const isAIConfigured = localStorage.getItem('ai_api_key') && localStorage.getItem('use_ai') === 'true';

      if (isAIConfigured) {
        this.inputContainer.style.display = 'flex';
      }
    }
  }

  private createTypingIndicator(): void {
    if (!this.messageContainer) return;

    const existingIndicator = document.getElementById('typing-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    this.typingIndicator = document.createElement('div');
    this.typingIndicator.id = 'typing-indicator';
    this.typingIndicator.className = 'typing-indicator';
    this.typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    this.typingIndicator.style.display = 'none';

    this.messageContainer.appendChild(this.typingIndicator);
  }

  private createCharacterStatusIndicator(): void {
    if (!this.statusContainer) return;

    const existingIndicator = document.getElementById('character-status');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    this.characterStatusIndicator = document.createElement('div');
    this.characterStatusIndicator.id = 'character-status';
    this.characterStatusIndicator.className = 'character-status';
    this.characterStatusIndicator.style.display = 'none';

    this.statusContainer.appendChild(this.characterStatusIndicator);
  }

  public connectToStoryEngine(storyEngine: StoryEngine): void {
    this.storyEngine = storyEngine;

    storyEngine.onMessagesUpdate((messages) => this.updateMessages(messages));
    storyEngine.onChoicesAvailable((choices) => this.updateChoices(choices));
    storyEngine.onGameOver((ending) => this.showEnding(ending));
    storyEngine.onTypingStart(() => this.showTypingIndicator());
    storyEngine.onTypingEnd(() => this.hideTypingIndicator());
    storyEngine.onStatusUpdate((status) => this.updateCharacterStatus(status));
    storyEngine.onGameStateUpdate((state) => this.updateGameState(state));

    this.updateInputFieldState();
  }

  private updateMessages(messages: Message[]): void {
    if (!this.messageContainer) return;

    this.messageContainer.innerHTML = '';

    const container = this.messageContainer;

    if (messages.length > 0) {
      this.lastMessageId = messages[messages.length - 1].id;
    }

    messages.forEach((message) => {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');

      if (message.isPlayer) {
        messageElement.classList.add('player-message');
      } else if (message.character === 'system') {
        messageElement.classList.add('system-message');
      } else {
        messageElement.classList.add('character-message');
      }

      const textElement = document.createElement('div');
      textElement.classList.add('message-text');
      textElement.textContent = message.text;
      messageElement.appendChild(textElement);

      const shouldShowTimestamp =
        message.showTimestamp === true ||
        (message.showTimestamp === undefined && message.character !== 'system');

      if (shouldShowTimestamp && message.timestamp !== null) {
        const timeElement = document.createElement('div');
        timeElement.classList.add('message-time');
        timeElement.textContent = this.formatTimestamp(message.timestamp);
        messageElement.appendChild(timeElement);
      }

      const metadata = this.messageMetadata.get(message.id);
      if (metadata) {
        const metaElement = document.createElement('div');
        metaElement.classList.add('message-metadata');
        metaElement.textContent = metadata;
        messageElement.appendChild(metaElement);
      }

      container.appendChild(messageElement);
    });

    this.createTypingIndicator();
    this.renderOverlays();

    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
  }

  private scrollToBottom(): void {
    if (this.messageContainer) {
      this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
  }

  public showTypingIndicator(): void {
    if (!this.typingIndicator || !this.messageContainer) return;

    this.typingIndicator.style.display = 'flex';
    this.scrollToBottom();

    this.customInputAllowed = false;
    this.updateInputFieldState();
  }

  public hideTypingIndicator(): void {
    if (!this.typingIndicator) return;

    this.typingIndicator.style.display = 'none';
  }

  public updateCharacterStatus(status: string): void {
    if (status && status.toLowerCase().includes('away')) {
      // Maya is offline during the storm - use the inline away indicator
      // and flash the sky, instead of the generic status banner.
      this.isAway = true;
      this.awayText = status;
      if (this.characterStatusIndicator) {
        this.characterStatusIndicator.style.display = 'none';
      }
      this.triggerLightning();
      this.renderOverlays();
      this.scrollToBottom();
      return;
    }

    this.isAway = false;

    if (this.characterStatusIndicator) {
      if (status) {
        this.characterStatusIndicator.textContent = status;
        this.characterStatusIndicator.style.display = 'block';
        this.characterStatusIndicator.className = 'character-status';
        if (status.includes('typing')) {
          this.characterStatusIndicator.classList.add('status-typing');
        }
      } else {
        this.characterStatusIndicator.style.display = 'none';
      }
    }

    this.renderOverlays();
  }

  private updateGameState(state: GameState): void {
    this.gameState = state;

    const health = Math.max(0, Math.min(100, Math.round(state.health)));

    if (this.healthFill) {
      this.healthFill.style.width = `${health}%`;
      this.healthFill.classList.remove('health-high', 'health-mid', 'health-low');
      this.healthFill.classList.add(
        health >= 70 ? 'health-high' : health >= 40 ? 'health-mid' : 'health-low'
      );
    }
    if (this.healthValue) {
      this.healthValue.textContent = `${health}`;
    }

    const label = this.locationLabel(state.location);
    if (this.locationLabelEl) {
      this.locationLabelEl.textContent = label;
    }

    // Stamp a small location note under the latest message when Maya moves.
    if (
      state.location &&
      state.location !== 'unknown' &&
      state.location !== this.lastLocation
    ) {
      if (this.lastMessageId) {
        this.messageMetadata.set(this.lastMessageId, `◉ ${label}`);
      }
      this.lastLocation = state.location;
    }

    // A drop in condition means the storm just turned on her - flash the sky.
    if (this.lastHealth !== null && health < this.lastHealth) {
      this.triggerLightning();
    }
    this.lastHealth = health;

    this.renderOverlays();
  }

  private renderOverlays(): void {
    if (!this.messageContainer) return;

    const health = this.gameState ? Math.max(0, Math.min(100, Math.round(this.gameState.health))) : 100;
    const level = health >= 70 ? 'strong' : health >= 40 ? 'medium' : 'weak';

    if (this.signalIndicator) {
      this.signalIndicator.className = `signal-indicator signal-${level}`;
      this.signalIndicator.textContent =
        level === 'strong' ? '●●●' : level === 'medium' ? '●●○' : '●○○';
      this.signalIndicator.title = `Transmitter signal: ${level}`;
      if (this.signalIndicator.parentElement !== this.messageContainer) {
        this.messageContainer.appendChild(this.signalIndicator);
      }
    }

    if (this.lightningFlash && this.lightningFlash.parentElement !== this.messageContainer) {
      this.messageContainer.appendChild(this.lightningFlash);
    }

    if (this.awayIndicator) {
      if (this.isAway) {
        this.awayIndicator.textContent = this.awayText;
        this.awayIndicator.style.display = 'block';
        if (this.awayIndicator.parentElement !== this.messageContainer) {
          this.messageContainer.appendChild(this.awayIndicator);
        }
      } else if (this.awayIndicator.parentElement) {
        this.awayIndicator.remove();
      }
    }
  }

  private triggerLightning(): void {
    if (!this.lightningFlash) return;

    this.lightningFlash.classList.remove('active');
    // Force reflow so the animation restarts even on rapid re-triggers.
    void this.lightningFlash.offsetWidth;
    this.lightningFlash.classList.add('active');

    if (this.lightningTimeout !== null) {
      clearTimeout(this.lightningTimeout);
    }
    this.lightningTimeout = window.setTimeout(() => {
      if (this.lightningFlash) {
        this.lightningFlash.classList.remove('active');
      }
    }, 2000);
  }

  private locationLabel(location: string): string {
    if (!location || location === 'unknown') {
      return 'Batanes Climate Station';
    }
    const map: Record<string, string> = {
      'storage bunker': 'Storage bunker',
      'lab': 'Main lab',
      'equipment shed': 'Equipment shed',
      'outside': 'Outside the station'
    };
    return map[location] || location.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private updateChoices(choices: Choice[]): void {
    if (!this.choiceContainer) return;

    this.choiceContainer.innerHTML = '';

    this.customInputAllowed = (choices.length === 1);
    choices.forEach((choice) => {
      const choiceButton = document.createElement('button');
      choiceButton.classList.add('choice-button');
      choiceButton.textContent = choice.text;
      choiceButton.addEventListener('click', () => {
        if (this.storyEngine) {
          this.clearChoices();
          this.storyEngine.makeChoice(choice.id);
        }
      });
      if (this.choiceContainer) {
        this.choiceContainer.appendChild(choiceButton);
      }
    });

    this.updateInputFieldState();
    this.scrollToBottom();
  }

  private updateInputFieldState(): void {
    if (!this.inputContainer || !this.inputField) return;

    const isAIConfigured = localStorage.getItem('ai_api_key') && localStorage.getItem('use_ai') === 'true';

    if (!isAIConfigured) {
      this.inputContainer.style.display = 'none';
      return;
    }

    this.inputContainer.style.display = 'flex';

    if (this.customInputAllowed) {
      this.inputField.disabled = false;
      this.inputField.placeholder = this.inputPlaceholderDefault;
      this.inputContainer.classList.remove('input-disabled');
    } else {
      this.inputField.disabled = true;

      if (this.choiceContainer && this.choiceContainer.children.length > 1) {
        this.inputField.placeholder = this.multipleChoicesMessage;
      } else {
        this.inputField.placeholder = this.inputDisabledMessage;
      }

      this.inputContainer.classList.add('input-disabled');
    }
  }

  private clearChoices(): void {
    if (this.choiceContainer) {
      this.choiceContainer.innerHTML = '';
    }
  }

  private handleCustomInput(): void {
    if (!this.inputField || !this.storyEngine || !this.customInputAllowed) {
      return;
    }

    const text = this.inputField.value.trim();
    if (text) {
      this.customInputAllowed = false;
      this.updateInputFieldState();

      this.storyEngine.submitCustomResponse(text);
      this.inputField.value = '';
      this.scrollToBottom();

      this.clearChoices();
    }
  }

  private showEnding(ending: Ending): void {
    if (!this.endingContainer) return;

    this.endingContainer.style.display = 'block';

    const endingTitleElement = document.createElement('h3');
    endingTitleElement.textContent = `${ending.type} ENDING`;
    endingTitleElement.classList.add('ending-title');
    endingTitleElement.classList.add(`ending-${ending.type.toLowerCase()}`);

    const endingTextElement = document.createElement('p');
    endingTextElement.textContent = ending.text;
    endingTextElement.classList.add('ending-text');

    const restartButton = document.createElement('button');
    restartButton.textContent = 'Play Again';
    restartButton.classList.add('restart-button');
    restartButton.addEventListener('click', () => {
      if (this.storyEngine) {
        this.messageMetadata.clear();
        this.lastLocation = 'unknown';
        this.lastHealth = null;
        this.isAway = false;
        this.storyEngine.resetGame();
        this.endingContainer!.style.display = 'none';
      }
    });

    this.endingContainer.innerHTML = '';
    this.endingContainer.appendChild(endingTitleElement);
    this.endingContainer.appendChild(endingTextElement);
    this.endingContainer.appendChild(restartButton);

    this.clearChoices();
    if (this.inputContainer) this.inputContainer.style.display = 'none';

    this.endingContainer.scrollIntoView({ behavior: 'smooth' });
  }

  public setStatus(text: string): void {
    if (!this.statusContainer) return;

    this.statusContainer.textContent = text;
    this.statusContainer.style.display = 'block';

    setTimeout(() => {
      this.statusContainer!.style.display = 'none';
    }, 5000);
  }

  private formatTimestamp(timestamp: number | null): string {
    if (timestamp === null) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
