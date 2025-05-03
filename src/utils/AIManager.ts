import { GameState, Choice } from '../models/types';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

export enum AIProvider {
  OPENAI = 'openai',
  CLAUDE = 'claude',
  DEEPSEEK = 'deepseek',
  GEMINI = 'gemini'
}

export class AIManager {
  private openai: OpenAI | null = null;
  private claude: Anthropic | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private geminiModel: GenerativeModel | null = null;
  private provider: AIProvider;
  private apiKey: string | null = null;
  private apiBaseUrl: string | null = null;
  private systemPrompt: string;

  constructor(provider: AIProvider = AIProvider.OPENAI, apiKey?: string, apiBaseUrl?: string) {
    this.provider = provider;
    this.apiKey = apiKey || null;
    this.apiBaseUrl = apiBaseUrl || null;

    if (apiKey) {
      this.initializeClient();
    }

    this.systemPrompt = `
      You are assisting with a text adventure game called "Delubyo" set in the Philippines during a typhoon disaster.
      Your responses must ALWAYS be in ENGLISH ONLY, never include Filipino words or phrases.
      Your responses should be concise, dramatic when appropriate, and reflect the serious nature of the situation.
      You must stay within the established narrative boundaries and character traits.
      All your responses should be compatible with a survivor dealing with a natural disaster scenario.
      Never use the SYSTEM character in your responses - only respond as Maya when generating dialogue.
    `;
  }

  private initializeClient(): void {
    if (!this.apiKey) return;
    
    switch (this.provider) {
      case AIProvider.OPENAI:
        try {
          this.openai = new OpenAI({ 
            apiKey: this.apiKey,
            ...(this.apiBaseUrl && { baseURL: this.apiBaseUrl })
          });
        } catch (error) {
          console.error('Failed to initialize OpenAI:', error);
        }
        break;
        
      case AIProvider.DEEPSEEK:
        try {
          this.openai = new OpenAI({
            baseURL: this.apiBaseUrl || 'https://api.deepseek.com',
            apiKey: this.apiKey
          });
        } catch (error) {
          console.error('Failed to initialize DeepSeek:', error);
        }
        break;
        
      case AIProvider.CLAUDE:
        try {
          this.claude = new Anthropic({
            apiKey: this.apiKey,
            ...(this.apiBaseUrl && { baseURL: this.apiBaseUrl })
          });
        } catch (error) {
          console.error('Failed to initialize Claude:', error);
        }
        break;
        
      case AIProvider.GEMINI:
        try {
          this.gemini = new GoogleGenerativeAI(this.apiKey!);
          this.geminiModel = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
        } catch (error) {
          console.error('Failed to initialize Gemini:', error);
        }
        break;
        
      default:
        console.warn(`No initialization method defined for provider: ${this.provider}`);
    }
  }

  public setApiConfig(provider: AIProvider, apiKey: string, apiBaseUrl?: string): void {
    this.provider = provider;
    this.apiKey = apiKey;
    this.apiBaseUrl = apiBaseUrl || null;
    this.initializeClient();
  }

  public async generateText(prompt: string, baseText: string, gameState: GameState): Promise<string | null> {
    if (!this.apiKey) return null;
  
    const contextPrompt = this.createContextPrompt(gameState);
    
    try {
      switch (this.provider) {
        case AIProvider.OPENAI:
          return await this.generateTextOpenAI(prompt, baseText, contextPrompt);
          
        case AIProvider.CLAUDE:
          return await this.generateTextClaude(prompt, baseText, contextPrompt);
          
        case AIProvider.DEEPSEEK:
          return await this.generateTextDeepSeek(prompt, baseText, contextPrompt, "deepseek-chat");
          
        case AIProvider.GEMINI:
          return await this.generateTextGemini(prompt, baseText, contextPrompt);
          
        default:
          console.error('Unsupported AI provider');
          return null;
      }
    } catch (error) {
      console.error(`Error generating AI text with ${this.provider}:`, error);
      return null;
    }
  }

  private async generateTextGemini(prompt: string, baseText: string, contextPrompt: string): Promise<string | null> {
    if (!this.geminiModel) return null;
    
    try {
      const generationConfig: GenerationConfig = {
        maxOutputTokens: 150,
        temperature: 0.7
      };
      
      const result = await this.geminiModel.generateContent({
        contents: [
          { role: "user", parts: [{ text: this.systemPrompt + contextPrompt + '\n\n' + prompt + "\n\nBase text: " + baseText }] }
        ],
        generationConfig
      });
      
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error with Gemini API:', error);
      return null;
    }
  }

  private async generateTextDeepSeek(prompt: string, baseText: string, contextPrompt: string, model: string): Promise<string | null> {
    if (!this.openai) return null;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: this.systemPrompt + contextPrompt },
          { role: "user", content: prompt + "\n\nBase text: " + baseText }
        ],
        max_tokens: 150,
        temperature: 0.7
      });
  
      return response.choices[0]?.message.content || null;
    } catch (error) {
      console.error(`Error with OpenAI-compatible API for ${model}:`, error);
      return null;
    }
  }

  private async generateTextOpenAI(prompt: string, baseText: string, contextPrompt: string): Promise<string | null> {
    if (!this.openai) return null;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: this.systemPrompt + contextPrompt },
          { role: "user", content: prompt + "\n\nBase text: " + baseText }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      return response.choices[0]?.message.content || null;
    } catch (error) {
      console.error('Error with OpenAI API:', error);
      return null;
    }
  }

  private async generateTextClaude(prompt: string, baseText: string, contextPrompt: string): Promise<string | null> {
    if (this.claude) {
      try {
        const response = await this.claude.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 150,
          temperature: 0.7,
          system: this.systemPrompt + contextPrompt,
          messages: [
            { role: 'user', content: prompt + "\n\nBase text: " + baseText }
          ]
        });
        
        if (response.content && response.content.length > 0) {
          const firstBlock = response.content[0];
          
          if (firstBlock.type === 'text') {
            return firstBlock.text || null;
          }
        }

        return null;
      } catch (error) {
        console.error('Error with Claude SDK:', error);
        return null;
      }
    }
    
    const apiUrl = this.apiBaseUrl || 'https://api.anthropic.com/v1/messages';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 150,
          temperature: 0.7,
          system: this.systemPrompt + contextPrompt,
          messages: [
            { role: 'user', content: prompt + "\n\nBase text: " + baseText }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.content && data.content.length > 0) {
        const contentBlock = data.content[0];
        if (typeof contentBlock.text === 'string') {
          return contentBlock.text;
        }
      }

      return null;
    } catch (error) {
      console.error('Error with Claude API:', error);
      return null;
    }
  }

  public async mapResponseToChoice(
    userResponse: string,
    availableChoices: Choice[],
    gameState: GameState
  ): Promise<string | null> {
    if (!this.apiKey || availableChoices.length === 0) return null;
  
    const choicesText = availableChoices
      .map(choice => `${choice.id}: ${choice.text}`)
      .join('\n');
  
    const contextPrompt = this.createContextPrompt(gameState);
    const mappingPrompt = `${this.systemPrompt}${contextPrompt}
      Your task is to map the user's free-form response to the most appropriate available choice.
      You must analyze which of the available choices best matches the user's intent or sentiment.
      
      Consider:
      1. The literal meaning of what the user said
      2. The implied intent behind their words
      3. The emotional tone of their message
      4. Which choice best continues the narrative given their input
      
      The available choices are:
      ${choicesText}
      
      IMPORTANT: Respond ONLY with the exact choice ID (e.g., "choice_1") of the best match.
      If no choice is a reasonable match, respond with "NONE".
      Your entire response should be just the ID or "NONE", nothing else.
    `;
    
    try {
      let aiResponse = null;
      
      switch (this.provider) {
        case AIProvider.OPENAI:
          aiResponse = await this.mapResponseOpenAI(mappingPrompt, userResponse);
          break;
          
        case AIProvider.CLAUDE:
          aiResponse = await this.mapResponseClaude(mappingPrompt, userResponse);
          break;
          
        case AIProvider.DEEPSEEK:
          aiResponse = await this.mapResponseDeepSeek(mappingPrompt, userResponse, "deepseek-chat");
          break;
          
        case AIProvider.GEMINI:
          aiResponse = await this.mapResponseGemini(mappingPrompt, userResponse);
          break;
          
        default:
          console.error('Unsupported AI provider');
          return null;
      }
  
      if (aiResponse !== "NONE" && availableChoices.some(choice => choice.id === aiResponse)) {
        return aiResponse;
      }
      
      return null;
    } catch (error) {
      console.error(`Error mapping response with ${this.provider}:`, error);
      return null;
    }
  }

  private async mapResponseGemini(mappingPrompt: string, userResponse: string): Promise<string | null> {
    if (!this.geminiModel) return null;
    
    try {
      const generationConfig: GenerationConfig = {
        maxOutputTokens: 30,
        temperature: 0.2
      };
      
      const result = await this.geminiModel.generateContent({
        contents: [
          { role: "user", parts: [{ text: mappingPrompt + "\n\n" + userResponse }] }
        ],
        generationConfig
      });
      
      const response = result.response;
      return response.text().trim() || "NONE";
    } catch (error) {
      console.error('Error with Gemini API:', error);
      return "NONE";
    }
  }

  private async mapResponseOpenAI(mappingPrompt: string, userResponse: string): Promise<string | null> {
    if (!this.openai) return null;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: mappingPrompt },
          { role: "user", content: userResponse }
        ],
        max_tokens: 30,
        temperature: 0.2
      });

      return response.choices[0]?.message.content?.trim() || "NONE";
    } catch (error) {
      console.error('Error with OpenAI API:', error);
      return "NONE";
    }
  }

  private async mapResponseClaude(mappingPrompt: string, userResponse: string): Promise<string | null> {
    if (this.claude) {
      try {
        const response = await this.claude.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 30,
          temperature: 0.2,
          system: mappingPrompt,
          messages: [
            { role: 'user', content: userResponse }
          ]
        });
        
        if (response.content && response.content.length > 0) {
          const firstBlock = response.content[0];
          
          if (firstBlock.type === 'text') {
            return firstBlock.text?.trim() || "NONE";
          }
        }
        
        return "NONE";
      } catch (error) {
        console.error('Error with Claude SDK:', error);
        return "NONE";
      }
    }
    
    const apiUrl = this.apiBaseUrl || 'https://api.anthropic.com/v1/messages';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 30,
          temperature: 0.2,
          system: mappingPrompt,
          messages: [
            { role: 'user', content: userResponse }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.content && data.content.length > 0) {
        const contentBlock = data.content[0];
        if (typeof contentBlock.text === 'string') {
          return contentBlock.text.trim() || "NONE";
        }
      }
      
      return "NONE";
    } catch (error) {
      console.error('Error with Claude API:', error);
      return "NONE";
    }
  }

  private async mapResponseDeepSeek(mappingPrompt: string, userResponse: string, model: string): Promise<string | null> {
    if (!this.openai) return null;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: mappingPrompt },
          { role: "user", content: userResponse }
        ],
        max_tokens: 30,
        temperature: 0.2
      });
  
      return response.choices[0]?.message.content?.trim() || "NONE";
    } catch (error) {
      console.error(`Error with OpenAI-compatible API for ${model}:`, error);
      return "NONE";
    }
  }

  private createContextPrompt(gameState: GameState): string {
    const flagEntries = Object.entries(gameState.flags).filter(([, value]) => value);
    const flagsText = flagEntries.length ? flagEntries.map(([key]) => key).join(', ') : 'none';
  
    return `
      Current game context:
      - Player is at location: ${gameState.location}
      - Player health: ${gameState.health}%
      - Inventory items: ${gameState.inventory.join(', ') || 'none'}
      - Important flags: ${flagsText}
      
      IMPORTANT NOTES:
      - All responses must be in ENGLISH ONLY, never in Filipino
      - Only respond as character Maya when generating dialogue, never as SYSTEM
      - Keep dialogue concise, dramatic, and appropriate for a survival scenario
    `;
  }
}