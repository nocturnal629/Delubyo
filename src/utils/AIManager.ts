import { GameState, Choice } from '../models/types';
import OpenAI from 'openai';

export enum AIProvider {
  OPENAI = 'openai',
  CLAUDE = 'claude',
  DEEPSEEK = 'deepseek',
  HUGGINGFACE = 'huggingface',  
  GEMINI = 'gemini',
  GROQ = 'groq',
  COHERE = 'cohere'
}

export class AIManager {
  private openai: OpenAI | null = null;
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
      Your responses should be concise, dramatic when appropriate, and reflect Filipino culture and language where relevant.
      You must stay within the established narrative boundaries and character traits.
      All your responses should be compatible with a survivor dealing with a natural disaster scenario.
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
        
      case AIProvider.CLAUDE:
        // Claude doesn't have an official npm package, we'll use fetch API
        // No initialization needed here, we'll use fetch in the request methods
        break;
        
      case AIProvider.DEEPSEEK:
        // DeepSeek doesn't have an official npm package, we'll use fetch API
        // No initialization needed here, we'll use fetch in the request methods
        break;
        
      case AIProvider.HUGGINGFACE:
        // Hugging Face doesn't require initialization, using fetch API in the request methods
        break;
        
      case AIProvider.GEMINI:
        // Google's Gemini API uses direct fetch calls
        // No initialization needed here, we'll use fetch in the request methods
        break;
        
      case AIProvider.GROQ:
        // Groq uses an OpenAI-compatible API but we'll use fetch directly
        // No initialization needed here, we'll use fetch in the request methods
        break;
        
      case AIProvider.COHERE:
        // Cohere API is accessed via fetch
        // No initialization needed here, we'll use fetch in the request methods
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
          return await this.generateTextDeepSeek(prompt, baseText, contextPrompt);
        
        case AIProvider.HUGGINGFACE:
          return await this.generateTextHuggingFace(prompt, baseText, contextPrompt);
          
        case AIProvider.GEMINI:
          return await this.generateTextGemini(prompt, baseText, contextPrompt);
          
        case AIProvider.GROQ:
          return await this.generateTextGroq(prompt, baseText, contextPrompt);
          
        case AIProvider.COHERE:
          return await this.generateTextCohere(prompt, baseText, contextPrompt);
          
        default:
          console.error('Unsupported AI provider');
          return null;
      }
    } catch (error) {
      console.error(`Error generating AI text with ${this.provider}:`, error);
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
      return data.content?.[0]?.text || null;
    } catch (error) {
      console.error('Error with Claude API:', error);
      return null;
    }
  }

  private async generateTextDeepSeek(prompt: string, baseText: string, contextPrompt: string): Promise<string | null> {
    const apiUrl = this.apiBaseUrl || 'https://api.deepseek.com/v1/chat/completions';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey!}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: this.systemPrompt + contextPrompt },
            { role: 'user', content: prompt + "\n\nBase text: " + baseText }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message.content || null;
    } catch (error) {
      console.error('Error with DeepSeek API:', error);
      return null;
    }
  }

  private async generateTextHuggingFace(prompt: string, baseText: string, contextPrompt: string): Promise<string | null> {
    const model = this.apiBaseUrl || 'mistralai/Mistral-7B-Instruct-v0.2';
    const apiUrl = `https://api-inference.huggingface.co/models/${model}`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          inputs: `${this.systemPrompt}${contextPrompt}\n\n${prompt}\n\nBase text: ${baseText}`,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7
          }
        })
      });
  
      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
      }
  
      const data = await response.json();
      return data[0]?.generated_text || null;
    } catch (error) {
      console.error('Error with Hugging Face API:', error);
      return null;
    }
  }
  
  private async generateTextGemini(prompt: string, baseText: string, contextPrompt: string): Promise<string | null> {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    try {
      const response = await fetch(`${apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${this.systemPrompt}${contextPrompt}\n\n${prompt}\n\nBase text: ${baseText}`
            }]
          }],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7
          }
        })
      });
  
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
  
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
      console.error('Error with Gemini API:', error);
      return null;
    }
  }
  
  private async generateTextGroq(prompt: string, baseText: string, contextPrompt: string): Promise<string | null> {
    const apiUrl = this.apiBaseUrl || 'https://api.groq.com/openai/v1/chat/completions';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',  // Free tier model
          messages: [
            { role: "system", content: this.systemPrompt + contextPrompt },
            { role: "user", content: prompt + "\n\nBase text: " + baseText }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });
  
      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }
  
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (error) {
      console.error('Error with Groq API:', error);
      return null;
    }
  }
  
  private async generateTextCohere(prompt: string, baseText: string, contextPrompt: string): Promise<string | null> {
    const apiUrl = this.apiBaseUrl || 'https://api.cohere.ai/v1/chat';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: prompt + "\n\nBase text: " + baseText,
          model: 'command',
          preamble: this.systemPrompt + contextPrompt,
          max_tokens: 150,
          temperature: 0.7
        })
      });
  
      if (!response.ok) {
        throw new Error(`Cohere API error: ${response.status}`);
      }
  
      const data = await response.json();
      return data.text || null;
    } catch (error) {
      console.error('Error with Cohere API:', error);
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
      You must select exactly one of the available choices that best matches the user's intent.
      If none of the choices are a reasonable match, respond with "NONE".
      The available choices are:
      ${choicesText}
      
      Respond ONLY with the choice ID (e.g., "choice_1") or "NONE".`;
    
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
          aiResponse = await this.mapResponseDeepSeek(mappingPrompt, userResponse);
          break;
        
        case AIProvider.HUGGINGFACE:
          aiResponse = await this.mapResponseHuggingFace(mappingPrompt, userResponse);
          break;
          
        case AIProvider.GEMINI:
          aiResponse = await this.mapResponseGemini(mappingPrompt, userResponse);
          break;
          
        case AIProvider.GROQ:
          aiResponse = await this.mapResponseGroq(mappingPrompt, userResponse);
          break;
          
        case AIProvider.COHERE:
          aiResponse = await this.mapResponseCohere(mappingPrompt, userResponse);
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
      return data.content?.[0]?.text?.trim() || "NONE";
    } catch (error) {
      console.error('Error with Claude API:', error);
      return "NONE";
    }
  }

  private async mapResponseDeepSeek(mappingPrompt: string, userResponse: string): Promise<string | null> {
    const apiUrl = this.apiBaseUrl || 'https://api.deepseek.com/v1/chat/completions';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey!}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: mappingPrompt },
            { role: 'user', content: userResponse }
          ],
          max_tokens: 30,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message.content?.trim() || "NONE";
    } catch (error) {
      console.error('Error with DeepSeek API:', error);
      return "NONE";
    }
  }

  private async mapResponseHuggingFace(mappingPrompt: string, userResponse: string): Promise<string | null> {
    const model = this.apiBaseUrl || 'mistralai/Mistral-7B-Instruct-v0.2';
    const apiUrl = `https://api-inference.huggingface.co/models/${model}`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          inputs: `${mappingPrompt}\n\nUser response: ${userResponse}\n\nChoice ID:`,
          parameters: {
            max_new_tokens: 30,
            temperature: 0.2,
            return_full_text: false
          }
        })
      });
  
      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
      }
  
      const data = await response.json();
      const generatedText = data[0]?.generated_text || "";
      const choiceMatch = generatedText.match(/choice_[a-zA-Z0-9_]+/);
      return choiceMatch ? choiceMatch[0].trim() : "NONE";
    } catch (error) {
      console.error('Error with Hugging Face API:', error);
      return "NONE";
    }
  }
  
  private async mapResponseGemini(mappingPrompt: string, userResponse: string): Promise<string | null> {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    try {
      const response = await fetch(`${apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${mappingPrompt}\n\nUser response: ${userResponse}\n\nChoice ID:`
            }]
          }],
          generationConfig: {
            maxOutputTokens: 30,
            temperature: 0.2
          }
        })
      });
  
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
  
      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      const choiceMatch = generatedText.match(/choice_[a-zA-Z0-9_]+/);
      return choiceMatch ? choiceMatch[0].trim() : "NONE";
    } catch (error) {
      console.error('Error with Gemini API:', error);
      return "NONE";
    }
  }
  
  private async mapResponseGroq(mappingPrompt: string, userResponse: string): Promise<string | null> {
    const apiUrl = this.apiBaseUrl || 'https://api.groq.com/openai/v1/chat/completions';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: mappingPrompt },
            { role: 'user', content: userResponse }
          ],
          max_tokens: 30,
          temperature: 0.2
        })
      });
  
      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }
  
      const data = await response.json();
      const responseText = data.choices?.[0]?.message?.content?.trim() || "NONE";
      
      return responseText.match(/^choice_[a-zA-Z0-9_]+$/) ? responseText : "NONE";
    } catch (error) {
      console.error('Error with Groq API:', error);
      return "NONE";
    }
  }
  
  private async mapResponseCohere(mappingPrompt: string, userResponse: string): Promise<string | null> {
    const apiUrl = this.apiBaseUrl || 'https://api.cohere.ai/v1/chat';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: userResponse,
          model: 'command',
          preamble: mappingPrompt,
          max_tokens: 30,
          temperature: 0.2
        })
      });
  
      if (!response.ok) {
        throw new Error(`Cohere API error: ${response.status}`);
      }
  
      const data = await response.json();
      const responseText = data.text?.trim() || "NONE";
      
      return responseText.match(/^choice_[a-zA-Z0-9_]+$/) ? responseText : "NONE";
    } catch (error) {
      console.error('Error with Cohere API:', error);
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
    `;
  }
}