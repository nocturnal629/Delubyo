import { GameState, StoryNode, Choice, Message, Ending } from '../models/types';
import { SaveManager } from './SaveManager';
import { TimeManager } from './TimeManager';
import { AIManager } from '../utils/AIManager';

export class StoryEngine {
  private gameState: GameState;
  private storyNodes: Map<string, StoryNode>;
  private messages: Message[] = [];
  private endings: Ending[] = [];
  private saveManager: SaveManager;
  private timeManager: TimeManager;
  private aiManager: AIManager | null = null;
  private messageListeners: ((messages: Message[]) => void)[] = [];
  private choiceListeners: ((choices: Choice[]) => void)[] = [];
  private gameOverListeners: ((ending: Ending) => void)[] = [];
  private typingStartListeners: (() => void)[] = [];
  private typingEndListeners: (() => void)[] = [];
  private statusUpdateListeners: ((status: string) => void)[] = [];
  private useAI: boolean = false;
  private isResetting: boolean = false;
  private maxMessageLength: number = 180;
  private typingSpeed: number = 35;
  private maxTypingTime: number = 5000;

  constructor(
    storyNodes: StoryNode[], 
    endings: Ending[],
    initialNodeId: string, 
    useAI: boolean = false,
    useRealTime: boolean = false
  ) {
    this.storyNodes = new Map(storyNodes.map(node => [node.id, node]));
    this.endings = endings;
    this.gameState = this.createInitialGameState(initialNodeId);
    this.saveManager = new SaveManager();
    this.timeManager = new TimeManager(useRealTime);
    
    if (useAI) {
      this.useAI = true;
      this.aiManager = new AIManager();
    }
  }

  private createInitialGameState(initialNodeId: string): GameState {
    return {
      currentNodeId: initialNodeId,
      inventory: [],
      relationships: {},
      flags: {},
      location: 'unknown',
      health: 100,
      lastTimestamp: Date.now(),
      visitedNodes: [],
      activityStatus: 'active',
      messagesComplete: false
    };
  }

  public async start(): Promise<void> {
    if (this.isResetting) {
      this.clearChoices();
      this.displayCurrentNode();
      return;
    }

    const savedState = this.saveManager.loadGame();
    if (savedState) {
      this.gameState = savedState;

      if (this.gameState.messagesComplete === undefined) {
        this.gameState.messagesComplete = false;
      }

      const savedMessages = this.saveManager.loadMessages();
      
      if (savedMessages && savedMessages.length > 0) {
        if (this.gameState.messagesComplete) {
          this.messages = savedMessages;
        } else {
          let lastPlayerMessageIndex = -1;
          for (let i = savedMessages.length - 1; i >= 0; i--) {
            if (savedMessages[i].isPlayer) {
              lastPlayerMessageIndex = i;
              break;
            }
          }
        
          if (lastPlayerMessageIndex >= 0) {
            this.messages = savedMessages.slice(0, lastPlayerMessageIndex + 1);
          } else {
            this.messages = [];
          }
        }
        
        this.notifyMessageListeners();
      }
      
      const currentNode = this.storyNodes.get(this.gameState.currentNodeId);
      if (currentNode && currentNode.effect) {
        this.gameState = currentNode.effect(this.gameState);
      }
      
      this.clearChoices();

      if (this.gameState.messagesComplete && currentNode && currentNode.choices) {
        const availableChoices = currentNode.choices.filter(choice => 
          !choice.condition || choice.condition(this.gameState)
        );
        
        if (availableChoices.length > 0) {
          this.notifyChoiceListeners(availableChoices);
        } else {
          this.checkForEnding();
        }
      } else {
        this.displayCurrentNode();
      }
    } else {
      this.messages = [];
      this.clearChoices();
      this.displayCurrentNode();
    }
  }

  private async displayCurrentNode(): Promise<void> {
    if (this.isResetting) {
      return;
    }

    this.gameState.messagesComplete = false;
    this.saveManager.saveGame(this.gameState);

    if (this.gameState.currentNodeId === 'intro_1') {
      this.messages = [];
      this.notifyMessageListeners();
    }

    this.clearChoices();

    const currentNode = this.storyNodes.get(this.gameState.currentNodeId);
    if (!currentNode) {
      console.error(`Node with ID ${this.gameState.currentNodeId} not found!`);
      return;
    }

    if (!this.gameState.visitedNodes.includes(currentNode.id)) {
      this.gameState.visitedNodes.push(currentNode.id);
    }

    if (currentNode.effect) {
      this.gameState = currentNode.effect(this.gameState);
    }

    if (currentNode.delay && currentNode.delay > 0) {
      this.updateCharacterStatus('busy', currentNode.delay);
      await this.timeManager.delay(currentNode.delay);
    }

    let displayText = currentNode.text;
    if (this.useAI && this.aiManager && currentNode.aiPrompt) {
      try {
        const aiText = await this.aiManager.generateText(
          currentNode.aiPrompt, 
          currentNode.text,
          this.gameState
        );
        if (aiText) {
          displayText = aiText;
        }
      } catch (error) {
        console.error('Error generating AI text:', error);
      }
    }

    const textChunks = this.splitTextIntoChunks(displayText);
    
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      const typingTime = Math.min(Math.max(chunk.length * this.typingSpeed, 1000), this.maxTypingTime);
      
      this.notifyTypingStart();
      try {
        await this.timeManager.delay(typingTime);
      } catch (error) {
        console.error('Error during typing delay:', error);
      }
      this.notifyTypingEnd();
      
      const message: Message = {
        id: `msg_${Date.now()}_${i}`,
        text: chunk,
        character: currentNode.character,
        timestamp: currentNode.character === 'system' ? null : Date.now(),
        isPlayer: false,
        showTimestamp: currentNode.character !== 'system'
      };

      this.messages.push(message);
      this.notifyMessageListeners();
      this.saveManager.saveGame(this.gameState);
      this.saveManager.saveMessages(this.messages);

      if (i < textChunks.length - 1) {
        await this.timeManager.delay(500 + Math.random() * 500);
      }
    }

    if (currentNode.followupMessages && currentNode.followupMessages.length > 0) {
      this.clearChoices();
      
      for (const followup of currentNode.followupMessages) {
        if (followup.delay && followup.delay > 0) {
          await this.timeManager.delay(followup.delay);
        }
        
        const followupTextChunks = this.splitTextIntoChunks(followup.text);
        
        for (let i = 0; i < followupTextChunks.length; i++) {
          const chunk = followupTextChunks[i];
          const typingTime = Math.min(Math.max(chunk.length * this.typingSpeed, 1000), this.maxTypingTime);
          
          this.notifyTypingStart();
          try {
            await this.timeManager.delay(typingTime);
          } catch (error) {
            console.error('Error during typing delay:', error);
          }
          this.notifyTypingEnd();
          
          const message: Message = {
            id: `follow_${Date.now()}_${i}`,
            text: chunk,
            character: followup.character || currentNode.character,
            timestamp: (followup.character || currentNode.character) === 'system' ? null : Date.now(),
            isPlayer: false,
            showTimestamp: (followup.character || currentNode.character) !== 'system'
          };
          
          this.messages.push(message);
          this.notifyMessageListeners();
          this.saveManager.saveGame(this.gameState);
          this.saveManager.saveMessages(this.messages);
          
          if (i < followupTextChunks.length - 1) {
            await this.timeManager.delay(500 + Math.random() * 500);
          }
        }
      }
    }

    this.gameState.messagesComplete = true;
    this.saveManager.saveGame(this.gameState);

    if (currentNode.choices && currentNode.choices.length > 0) {
      const availableChoices = currentNode.choices.filter(choice => 
        !choice.condition || choice.condition(this.gameState)
      );
    
      if (availableChoices.length > 0) {
        this.notifyChoiceListeners(availableChoices);
        return;
      } else {
        this.checkForEnding();
      }
    } else if (currentNode.waitTime && currentNode.waitTime > 0) {
      await this.handleWaitTime(currentNode);

      this.checkForEnding();
    } else {
      this.checkForEnding();
    }
  }

  private async handleWaitTime(currentNode: StoryNode): Promise<void> {
    this.clearChoices();
    
    const lastTimestamp = this.gameState.lastTimestamp;
    const currentTime = Date.now();
    const elapsedTime = currentTime - lastTimestamp;
    const waitTime = currentNode.waitTime || 0
    
    if (waitTime > 0 && elapsedTime >= waitTime) {
      const offlineMessage: Message = {
        id: `offline_${Date.now()}`,
        text: "Maya was offline.",
        character: 'system',
        timestamp: null,
        isPlayer: false,
        showTimestamp: false
      };
      this.messages.push(offlineMessage);
      
      const onlineMessage: Message = {
        id: `online_${Date.now()}`,
        text: "Maya is online.",
        character: 'system',
        timestamp: null,
        isPlayer: false,
        showTimestamp: false
      };
      this.messages.push(onlineMessage);
      this.notifyMessageListeners();
      
      this.saveManager.saveGame(this.gameState);
      this.saveManager.saveMessages(this.messages);
      return;
    }

    if (waitTime > 0) {
      this.updateCharacterStatus('away', waitTime);

      const offlineMessage: Message = {
        id: `offline_${Date.now()}`,
        text: "Maya is offline.",
        character: 'system',
        timestamp: null,
        isPlayer: false,
        showTimestamp: false
      };
      this.messages.push(offlineMessage);
      this.notifyMessageListeners();

      this.saveManager.saveGame(this.gameState);
      this.saveManager.saveMessages(this.messages);
      
      if (currentNode.activityMessage) {
        const activityMessage: Message = {
          id: `activity_${Date.now()}`,
          text: currentNode.activityMessage,
          character: 'system',
          timestamp: null,
          isPlayer: false,
          showTimestamp: false
        };
        this.messages.push(activityMessage);
        this.notifyMessageListeners();
        
        this.saveManager.saveGame(this.gameState);
        this.saveManager.saveMessages(this.messages);
      }
      
      await this.timeManager.delay(waitTime);

      const onlineMessage: Message = {
        id: `online_${Date.now()}`,
        text: "Maya is online.",
        character: 'system',
        timestamp: null,
        isPlayer: false,
        showTimestamp: false
      };
      this.messages.push(onlineMessage);
      this.notifyMessageListeners();

      this.saveManager.saveGame(this.gameState);
      this.saveManager.saveMessages(this.messages);
      
      this.updateCharacterStatus('active', 0);
    }
  }

  private clearChoices(): void {
    this.notifyChoiceListeners([]);
  }

  private splitTextIntoChunks(text: string): string[] {
    if (text.length <= this.maxMessageLength) {
      return [text];
    }

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    if (sentences.length === 0) {
      const chunks: string[] = [];
      for (let i = 0; i < text.length; i += this.maxMessageLength) {
        chunks.push(text.substring(i, Math.min(i + this.maxMessageLength, text.length)));
      }
      return chunks;
    }

    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length <= this.maxMessageLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  private updateCharacterStatus(status: string, duration: number): void {
    this.gameState.activityStatus = status;

    let statusMsg = '';
    if (status === 'busy') {
      statusMsg = 'Maya is typing...';
    } else if (status === 'away') {
      const minutes = Math.floor(duration / 60000);
      if (minutes > 0) {
        statusMsg = `Maya is away (${minutes} ${minutes === 1 ? 'minute' : 'minutes'})`;
      } else {
        statusMsg = 'Maya is away';
      }
    }
    
    if (statusMsg) {
      this.notifyStatusUpdate(statusMsg);
    }
  }

  private notifyStatusUpdate(status: string): void {
    this.statusUpdateListeners.forEach(listener => listener(status));
  }
  
  public onStatusUpdate(callback: (status: string) => void): void {
    this.statusUpdateListeners.push(callback);
  }

  public makeChoice(choiceId: string): void {
    const currentNode = this.storyNodes.get(this.gameState.currentNodeId);
    if (!currentNode || !currentNode.choices) {
      return;
    }

    const choice = currentNode.choices.find(c => c.id === choiceId);
    if (!choice) {
      return;
    }

    this.clearChoices();

    const message: Message = {
      id: `choice_${Date.now()}`,
      text: choice.text,
      character: 'player',
      timestamp: Date.now(),
      isPlayer: true,
      showTimestamp: true
    };

    this.messages.push(message);
    this.notifyMessageListeners();

    if (choice.effect) {
      this.gameState = choice.effect(this.gameState);
    }

    const nextNodeId = choice.nextNodeId;
    this.gameState.lastTimestamp = Date.now();

    this.gameState.messagesComplete = false;

    this.saveManager.saveGame(this.gameState);
    this.saveManager.saveMessages(this.messages);

    if (currentNode.waitTime && currentNode.waitTime > 0) {
      this.handleWaitTime(currentNode).then(() => {
        this.gameState.currentNodeId = nextNodeId;
        this.displayCurrentNode();
      });
    } else {
      this.gameState.currentNodeId = nextNodeId;
      this.displayCurrentNode();
    }
  }

  public submitCustomResponse(text: string): void {
    if (!text.trim()) return;

    this.clearChoices();

    const playerMessage: Message = {
      id: `custom_${Date.now()}`,
      text,
      character: 'player',
      timestamp: Date.now(),
      isPlayer: true,
      showTimestamp: true
    };

    this.messages.push(playerMessage);
    this.notifyMessageListeners();

    if (this.useAI && this.aiManager) {
      this.handleAIResponse(text);
    } else {
      const fallbackMessage: Message = {
        id: `ai_required_${Date.now()}`,
        text: "To process custom responses, please enable AI integration in the settings and configure an API key.",
        character: 'system',
        timestamp: null,
        isPlayer: false,
        showTimestamp: false
      };
      this.messages.push(fallbackMessage);
      this.notifyMessageListeners();

      const currentNode = this.storyNodes.get(this.gameState.currentNodeId);
      if (currentNode && currentNode.choices) {
        this.notifyChoiceListeners(currentNode.choices);
      }
    }
  }

  private async handleAIResponse(text: string): Promise<void> {
    const currentNode = this.storyNodes.get(this.gameState.currentNodeId);
    if (!currentNode || !currentNode.choices || !this.aiManager) {
      return;
    }

    try {
      const mappedChoiceId = await this.aiManager.mapResponseToChoice(
        text,
        currentNode.choices,
        this.gameState
      );

      if (mappedChoiceId) {
        this.makeChoice(mappedChoiceId);
      } else {
        this.notifyTypingStart();
        await this.timeManager.delay(800);
        this.notifyTypingEnd();

        const fallbackMessage: Message = {
          id: `ai_fallback_${Date.now()}`,
          text: "I'm not sure how to respond to that. Could you try another approach?",
          character: currentNode.character,
          timestamp: Date.now(),
          isPlayer: false,
          showTimestamp: true
        };
        
        this.messages.push(fallbackMessage);
        this.notifyMessageListeners();

        this.notifyChoiceListeners(currentNode.choices);
      }
    } catch (error) {
      console.error('Error processing AI response:', error);

      const errorMessage: Message = {
        id: `ai_error_${Date.now()}`,
        text: "I'm having trouble understanding. Please choose from the available options.",
        character: currentNode.character,
        timestamp: Date.now(),
        isPlayer: false,
        showTimestamp: true
      };
      this.messages.push(errorMessage);
      this.notifyMessageListeners();

      this.notifyChoiceListeners(currentNode.choices);
    }
  }

  private checkForEnding(): void {
    for (const ending of this.endings) {
      if (ending.condition(this.gameState)) {
        this.clearChoices();
        
        const endingMessage: Message = {
          id: `ending_${Date.now()}`,
          text: `[${ending.type} ENDING]`,
          character: 'system',
          timestamp: null,
          isPlayer: false,
          showTimestamp: false
        };
        this.messages.push(endingMessage);
        this.notifyMessageListeners();

        this.notifyGameOver(ending);

        this.saveManager.saveGame(this.gameState);
        this.saveManager.saveMessages(this.messages);
        return;
      }
    }
  }

  public onMessagesUpdate(callback: (messages: Message[]) => void): void {
    this.messageListeners.push(callback);
  }

  public onChoicesAvailable(callback: (choices: Choice[]) => void): void {
    this.choiceListeners.push(callback);
  }

  public onGameOver(callback: (ending: Ending) => void): void {
    this.gameOverListeners.push(callback);
  }
  
  public onTypingStart(callback: () => void): void {
    this.typingStartListeners.push(callback);
  }
  
  public onTypingEnd(callback: () => void): void {
    this.typingEndListeners.push(callback);
  }

  private notifyMessageListeners(): void {
    this.messageListeners.forEach(listener => listener([...this.messages]));
  }

  private notifyChoiceListeners(choices: Choice[]): void {
    this.choiceListeners.forEach(listener => listener(choices));
  }

  private notifyGameOver(ending: Ending): void {
    this.gameOverListeners.forEach(listener => listener(ending));
  }
  
  private notifyTypingStart(): void {
    this.clearChoices();
    
    this.typingStartListeners.forEach(listener => listener());
  }
  
  private notifyTypingEnd(): void {
    this.typingEndListeners.forEach(listener => listener());
  }
  
  public getCurrentNodeId(): string {
    return this.gameState.currentNodeId;
  }

  public resetGame(): void {
    this.isResetting = true;
    this.clearChoices();
    this.saveManager.clearSave();
    this.gameState = this.createInitialGameState(
      Array.from(this.storyNodes.values())[0]?.id || ''
    );
    this.messages = [];
    this.notifyMessageListeners();

    setTimeout(() => {
      this.isResetting = false;
      this.displayCurrentNode();
    }, 100);
  }
}