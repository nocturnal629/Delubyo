import { StoryEngine } from '../engine/StoryEngine';
import { Message, Choice, Ending } from '../models/types';

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
  }

  private updateMessages(messages: Message[]): void {
    if (!this.messageContainer) return;

    this.messageContainer.innerHTML = '';

    const container = this.messageContainer;

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

      container.appendChild(messageElement);
    });

    this.createTypingIndicator();

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
  }
  
  public hideTypingIndicator(): void {
    if (!this.typingIndicator) return;
    
    this.typingIndicator.style.display = 'none';
  }
  
  public updateCharacterStatus(status: string): void {
    if (!this.characterStatusIndicator) return;
    
    if (status) {
      this.characterStatusIndicator.textContent = status;
      this.characterStatusIndicator.style.display = 'block';

      this.characterStatusIndicator.className = 'character-status';
      if (status.includes('away')) {
        this.characterStatusIndicator.classList.add('status-away');
      } else if (status.includes('typing')) {
        this.characterStatusIndicator.classList.add('status-typing');
      }
    } else {
      this.characterStatusIndicator.style.display = 'none';
    }
  }

  private updateChoices(choices: Choice[]): void {
    if (!this.choiceContainer) return;

    this.choiceContainer.innerHTML = '';

    const isAIConfigured = localStorage.getItem('ai_api_key') && localStorage.getItem('use_ai') === 'true';
    const isPrologue = this.storyEngine?.getCurrentNodeId()?.startsWith('prologue_') || false;

    if (this.inputContainer) {
      if (isAIConfigured && !isPrologue && choices.length === 0) {
        this.inputContainer.style.display = 'flex';
      } else {
        this.inputContainer.style.display = 'none';
      }
    }

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

    this.scrollToBottom();
  }
  
  private clearChoices(): void {
    if (this.choiceContainer) {
      this.choiceContainer.innerHTML = '';
    }
  }

  private handleCustomInput(): void {
    if (!this.inputField || !this.storyEngine) return;

    const text = this.inputField.value.trim();
    if (text) {
      this.storyEngine.submitCustomResponse(text);
      this.inputField.value = '';
      this.scrollToBottom();
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