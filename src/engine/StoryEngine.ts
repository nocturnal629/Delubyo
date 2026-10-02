import { GameState, StoryNode, Choice, Message, Ending } from '../models/types';
import { SaveManager } from './SaveManager';
import { TimeManager } from './TimeManager';
import { AIManager } from '../utils/AIManager';
import { CHARACTER_MAYA } from '../data/story';
import {
  splitTextIntoChunks,
  calculateTypingDelay,
  DEFAULT_MAX_MESSAGE_LENGTH,
  DEFAULT_TYPING_SPEED,
  DEFAULT_MAX_TYPING_TIME
} from './TextChunker';

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
  private gameStateUpdateListeners: ((state: GameState) => void)[] = [];
  private useAI: boolean = false;
  private isResetting: boolean = false;
  private maxMessageLength: number = DEFAULT_MAX_MESSAGE_LENGTH;
  private typingSpeed: number = DEFAULT_TYPING_SPEED;
  private maxTypingTime: number = DEFAULT_MAX_TYPING_TIME;
  private processingCustomInput: boolean = false;
  private activeMessageProcessing: boolean = false;
  private sessionId: string = Date.now().toString();

  constructor(
    storyNodes: StoryNode[], 
    endings: Ending[],
    initialNodeId: string, 
    useAI: boolean = false,
    useRealTime: boolean = false,
    aiManager: AIManager | null = null
  ) {
    this.storyNodes = new Map(storyNodes.map(node => [node.id, node]));
    this.endings = endings;
    this.gameState = this.createInitialGameState(initialNodeId);
    this.saveManager = new SaveManager();
    this.timeManager = new TimeManager(useRealTime);
    
    if (useAI) {
      this.useAI = true;
      this.aiManager = aiManager;
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

      this.notifyGameStateUpdate();

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
    if (this.isResetting || this.activeMessageProcessing) {
      return;
    }

    this.activeMessageProcessing = true;
    
    try {
      this.gameState.messagesComplete = false;
      this.saveManager.saveGame(this.gameState);
      this.notifyGameStateUpdate();

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
        this.notifyGameStateUpdate();
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
        if (this.isResetting) {
          return;
        }
        
        const chunk = textChunks[i];
        const typingTime = calculateTypingDelay(chunk.length, this.typingSpeed, 1000, this.maxTypingTime);
        
        this.notifyTypingStart();
        try {
          await this.timeManager.delay(typingTime);
        } catch (error) {
          console.error('Error during typing delay:', error);
        }
        this.notifyTypingEnd();

        if (this.isResetting) {
          return;
        }
        
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
          if (this.isResetting) {
            return;
          }
          
          if (followup.delay && followup.delay > 0) {
            await this.timeManager.delay(followup.delay);
          }
          
          const followupTextChunks = this.splitTextIntoChunks(followup.text);
          
          for (let i = 0; i < followupTextChunks.length; i++) {
            if (this.isResetting) {
              return;
            }
            
            const chunk = followupTextChunks[i];
            const typingTime = calculateTypingDelay(chunk.length, this.typingSpeed, 1000, this.maxTypingTime);
            
            this.notifyTypingStart();
            try {
              await this.timeManager.delay(typingTime);
            } catch (error) {
              console.error('Error during typing delay:', error);
            }
            this.notifyTypingEnd();

            if (this.isResetting) {
              return;
            }
            
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
    } finally {
      this.activeMessageProcessing = false;
    }
  }

  private async handleWaitTime(currentNode: StoryNode): Promise<void> {
    if (this.isResetting || this.activeMessageProcessing) {
      return;
    }
    
    this.activeMessageProcessing = true;
    
    try {
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

        if (this.isResetting) {
          return;
        }
  
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
    } finally {
      this.activeMessageProcessing = false;
    }
  }

  private clearChoices(): void {
    this.notifyChoiceListeners([]);
  }

  private splitTextIntoChunks(text: string): string[] {
    return splitTextIntoChunks(text, this.maxMessageLength);
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

  public onGameStateUpdate(callback: (state: GameState) => void): void {
    this.gameStateUpdateListeners.push(callback);
  }

  private notifyGameStateUpdate(): void {
    this.gameStateUpdateListeners.forEach(listener => listener({ ...this.gameState }));
  }

  public makeChoice(choiceId: string): void {
    if (this.processingCustomInput) return;
    
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
      this.notifyGameStateUpdate();
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

  public async submitCustomResponse(text: string): Promise<void> {
    if (!text.trim() || this.isResetting) {
      return;
    }
  
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
    this.saveManager.saveMessages(this.messages);
  
    if (this.useAI && this.aiManager) {
      await this.handleAIResponse(text);
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
      this.saveManager.saveMessages(this.messages);
  
      const currentNode = this.storyNodes.get(this.gameState.currentNodeId);
      if (currentNode && currentNode.choices) {
        const availableChoices = currentNode.choices.filter(choice => 
          !choice.condition || choice.condition(this.gameState)
        );
        this.notifyChoiceListeners(availableChoices);
      }
    }
  }

  private async handleAIResponse(text: string): Promise<void> {
    if (this.isResetting) {
      return;
    }
    
    const capturedSessionId = this.sessionId;
    
    const currentNode = this.storyNodes.get(this.gameState.currentNodeId);
    if (!currentNode || !currentNode.choices || !this.aiManager) {
      return;
    }
  
    const availableChoices = currentNode.choices.filter(choice => 
      !choice.condition || choice.condition(this.gameState)
    );
  
    if (availableChoices.length === 0) {
      return;
    }
  
    try {
      this.clearChoices();
      this.notifyTypingStart();

      // The acknowledgment prompt only references the current node text and the
      // raw player input — it never depends on which choice the mapping picks, so
      // the mapping call and this generation call have no data dependency and can
      // run concurrently instead of sequentially (fix #1 — halves the latency).
      const acknowledgePrompt = this.buildAcknowledgePrompt(currentNode.text, text);

      const [mappedChoiceId, acknowledgeResponse] = await Promise.all([
        this.aiManager.mapResponseToChoice(text, availableChoices, this.gameState),
        this.aiManager.generateText(acknowledgePrompt, currentNode.text, this.gameState)
      ]);

      // Both calls have now settled. A resetGame() (which rotates sessionId) or a
      // newer submitCustomResponse may have fired while they were in flight; this
      // single combined guard after Promise.all replaces the per-await checks that
      // existed when the calls were sequential, using the same sessionId mechanism
      // the rest of this file relies on (fix #1).
      if (capturedSessionId !== this.sessionId || this.isResetting) {
        this.notifyTypingEnd();
        return;
      }

      const matchedChoice = mappedChoiceId
        ? availableChoices.find(c => c.id === mappedChoiceId)
        : undefined;

      // No confident match: still fall back to the first choice so the story keeps
      // moving, but do NOT present the "acknowledge what they said" line, which
      // implies Maya agreed with a specific option the player never actually chose.
      // Instead regenerate with a neutral prompt that gently moves things forward
      // without claiming a deliberate pick (fix #4).
      const choiceToUse = matchedChoice ?? availableChoices[0];

      if (!choiceToUse) {
        throw new Error("Failed to select a valid choice");
      }

      let rawResponse: string | null;
      if (matchedChoice) {
        rawResponse = acknowledgeResponse;
      } else {
        const noMatchPrompt = this.buildNoMatchPrompt(currentNode.text, text);
        rawResponse = await this.aiManager.generateText(
          noMatchPrompt,
          currentNode.text,
          this.gameState
        );

        if (capturedSessionId !== this.sessionId || this.isResetting) {
          this.notifyTypingEnd();
          return;
        }
      }

      const fallbackLine = matchedChoice
        ? "I understand. That's important to consider."
        : "Okay — let's keep moving. We can't lose any time.";
      const aiResponseText = this.sanitizeDialogue(rawResponse || fallbackLine);

      const typingTime = calculateTypingDelay(aiResponseText.length, 30, 1200, 3000);
      await this.timeManager.delay(typingTime);

      if (capturedSessionId !== this.sessionId || this.isResetting) {
        this.notifyTypingEnd();
        return;
      }

      this.notifyTypingEnd();

      const aiMessage: Message = {
        id: `ai_response_${Date.now()}`,
        text: aiResponseText,
        character: CHARACTER_MAYA,
        timestamp: Date.now(),
        isPlayer: false,
        showTimestamp: true
      };

      this.messages.push(aiMessage);
      this.notifyMessageListeners();
      this.saveManager.saveMessages(this.messages);

      if (capturedSessionId !== this.sessionId || this.isResetting) {
        return;
      }

      if (choiceToUse.effect) {
        this.gameState = choiceToUse.effect(this.gameState);
        this.notifyGameStateUpdate();
      }

      const nextNodeId = choiceToUse.nextNodeId;
      this.gameState.currentNodeId = nextNodeId;
      this.gameState.lastTimestamp = Date.now();
      this.gameState.messagesComplete = false;

      this.saveManager.saveGame(this.gameState);

      if (currentNode.waitTime && currentNode.waitTime > 0) {
        await this.handleWaitTime(currentNode);

        if (capturedSessionId !== this.sessionId || this.isResetting) {
          return;
        }
      }

      await this.timeManager.delay(1000);

      if (capturedSessionId !== this.sessionId || this.isResetting) {
        return;
      }

      await this.displayCurrentNode();

    } catch (error) {
      // Fix #2: this was previously a bare `catch { ... }` that discarded every
      // thrown error (real bugs included) with no logging. Log it like every other
      // AI call site in the codebase, while keeping the existing graceful fallback
      // (the "Let me continue..." line + default-choice progression) unchanged.
      console.error('Error handling custom AI response:', error);
      this.notifyTypingEnd();
  
      if (capturedSessionId === this.sessionId && !this.isResetting) {
        const errorMessage: Message = {
          id: `ai_error_${Date.now()}`,
          text: "I understand. Let me continue...",
          character: CHARACTER_MAYA,
          timestamp: Date.now(),
          isPlayer: false,
          showTimestamp: true
        };
        this.messages.push(errorMessage);
        this.notifyMessageListeners();
        this.saveManager.saveMessages(this.messages);
      }
      
      if (capturedSessionId === this.sessionId && !this.isResetting) {
        const defaultChoice = availableChoices[0];
        if (defaultChoice) {
          if (defaultChoice.effect) {
            this.gameState = defaultChoice.effect(this.gameState);
          }
          
          const nextNodeId = defaultChoice.nextNodeId;
          this.gameState.lastTimestamp = Date.now();
          this.gameState.messagesComplete = false;
          this.gameState.currentNodeId = nextNodeId;
          
          this.saveManager.saveGame(this.gameState);
          
          await this.displayCurrentNode();
        }
      }
    }
  }

  /**
   * Prompt used when the player's free text maps confidently onto a choice: Maya
   * acknowledges what they said and continues naturally. It deliberately avoids
   * referencing the mapped choice so it can be generated concurrently with the
   * mapping call (fix #1).
   */
  private buildAcknowledgePrompt(nodeText: string, playerText: string): string {
    return `
      You are playing the character of Maya in a narrative game about surviving a typhoon in the Philippines.

      CURRENT CONTEXT:
      ${nodeText}

      PLAYER'S MESSAGE:
      ${playerText}

      INSTRUCTIONS:
      1. Acknowledge what the player said in a natural way
      2. Keep your response under 2-3 sentences, in Maya's voice
      3. Your response must be in ENGLISH ONLY (never use Filipino)
      4. Your response should naturally follow from the current context
      5. DO NOT use quotation marks anywhere in your response — not around your words and not to represent spoken dialogue
      6. Write as if you are speaking directly to the player, never quoting yourself or anyone else
    `;
  }

  /**
   * Prompt used when the player's free text matches no available choice
   * confidently. Rather than reusing the "acknowledge" framing (which would imply
   * Maya agreed to a specific option the player never chose), this asks for a
   * neutral line that gently keeps the moment moving (fix #4).
   */
  private buildNoMatchPrompt(nodeText: string, playerText: string): string {
    return `
      You are playing the character of Maya in a narrative game about surviving a typhoon in the Philippines.

      CURRENT CONTEXT:
      ${nodeText}

      PLAYER'S MESSAGE:
      ${playerText}

      INSTRUCTIONS:
      1. The player said something that does not clearly match any available option
      2. Respond with a brief, in-character line that gently keeps the moment moving forward
      3. Do NOT agree to or confirm any specific plan or decision — the player has not actually chosen one
      4. Keep it under 2-3 sentences, in Maya's voice, in ENGLISH ONLY (never Filipino)
      5. DO NOT use quotation marks anywhere in your response — not around your words and not to represent spoken dialogue
      6. Write as if you are speaking directly to the player, never quoting yourself or anyone else
    `;
  }

  /**
   * Cleans up AI-generated dialogue before it is shown as a chat bubble. The model
   * sometimes wraps its spoken lines in quotation marks despite the prompt (e.g.
   * `"Stay close." I nod. "Let's go."`), which reads oddly for a character meant to
   * be speaking directly. We strip *paired* double-quote marks (straight or curly)
   * anywhere in the string — matching an opening and closing quote and keeping the
   * words between them — so embedded quote-wrapped fragments are unwrapped, not just
   * ones at the very start/end. Because we only remove balanced pairs, a single
   * stray quote is left alone; and because the pattern never touches single quotes /
   * apostrophes (U+0027 / U+2019), contractions like "I'm" and "don't" survive.
   */
  private sanitizeDialogue(text: string): string {
    let cleaned = text.trim();

    // Unwrap any paired double quotes (straight ", curly “ ”) anywhere in the text.
    cleaned = cleaned.replace(/["“”]([^"“”]*)["“”]/g, '$1');

    // Drop a single pair of straight single quotes only if they wrap the whole line
    // (a common "quoted the entire response" pattern); this cannot hit a contraction
    // because those never span the full string start-to-end.
    cleaned = cleaned.replace(/^'([\s\S]*)'$/, '$1');

    // Collapse any stray double spaces left where a quote+space was removed, and
    // normalize per-line whitespace.
    cleaned = cleaned
      .split('\n')
      .map(line => line.replace(/ {2,}/g, ' ').trim())
      .join('\n')
      .trim();

    return cleaned;
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
    this.processingCustomInput = false;
    this.activeMessageProcessing = false;

    this.sessionId = Date.now().toString();

    this.clearChoices();

    this.notifyTypingEnd();

    this.notifyStatusUpdate('');

    this.saveManager.clearSave();

    this.gameState = this.createInitialGameState(
      Array.from(this.storyNodes.values())[0]?.id || ''
    );

    this.messages = [];
    this.notifyMessageListeners();
    this.notifyGameStateUpdate();

    setTimeout(() => {
      this.isResetting = false;
      this.displayCurrentNode();
    }, 300);
  }
}