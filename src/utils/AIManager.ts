import { GameState, Choice } from '../models/types';
// NOTE: provider SDKs are imported dynamically (see initializeClient) so that a
// user who only ever uses one provider does not pay the bundle cost of the
// others. Only the *types* are imported statically here (erased at build time).
import type OpenAI from 'openai';
import type Anthropic from '@anthropic-ai/sdk';
import type { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

/**
 * Client-side timeout for a single AI provider request. Without this a stalled
 * network request (or a provider that hangs) would leave the UI waiting on the
 * typing indicator forever. On timeout the request promise rejects, which the
 * per-provider try/catch below turns into the normal error-fallback path
 * (returning null / "NONE") exactly like any other provider failure.
 */
export const AI_REQUEST_TIMEOUT_MS = 20000;

/**
 * Rejects if `promise` does not settle within `timeoutMs`. When an AbortController
 * is supplied it is aborted on timeout so the underlying request is actually
 * cancelled where the SDK / fetch honours the signal; for providers whose SDK does
 * not expose a signal this still degrades the hang into the error path (Promise.race
 * style). Used uniformly across every provider so timeout behaviour is consistent.
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  controller?: AbortController
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      controller?.abort();
      reject(new Error(`AI request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      value => {
        clearTimeout(timer);
        resolve(value);
      },
      error => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

export enum AIProvider {
  OPENAI = 'openai',
  CLAUDE = 'claude',
  DEEPSEEK = 'deepseek',
  GEMINI = 'gemini',
  CLOUDIQ = 'cloudiq'
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
  private initPromise: Promise<void> | null = null;

  constructor(provider: AIProvider = AIProvider.OPENAI, apiKey?: string, apiBaseUrl?: string) {
    this.provider = provider;
    this.apiKey = apiKey || null;
    this.apiBaseUrl = apiBaseUrl || null;

    if (apiKey) {
      // Synchronous validation so misconfiguration surfaces as a thrown error
      // rather than a silent null later on.
      this.validateConfig();
      this.initPromise = this.initializeClient();
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

  /**
   * Validates that the current provider has everything it needs. Throws a clear
   * error for misconfiguration (e.g. CloudIQ without a base URL) so the caller
   * can surface it instead of failing silently at request time.
   */
  private validateConfig(): void {
    if (this.provider === AIProvider.CLOUDIQ && !this.apiBaseUrl) {
      throw new Error(
        'CloudIQ requires a base URL (your self-hosted gateway host, e.g. https://your-cloudiq-host.example.com/v1). ' +
        'Set the "API URL" field in AI settings.'
      );
    }
  }

  private ensureInitialized(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.initializeClient();
    }
    return this.initPromise;
  }

  private async initializeClient(): Promise<void> {
    if (!this.apiKey) return;

    switch (this.provider) {
      case AIProvider.OPENAI:
        try {
          await this.createOpenAICompatibleClient(this.apiBaseUrl || undefined);
        } catch (error) {
          console.error('Failed to initialize OpenAI:', error);
        }
        break;

      case AIProvider.DEEPSEEK:
        try {
          await this.createOpenAICompatibleClient(this.apiBaseUrl || 'https://api.deepseek.com');
        } catch (error) {
          console.error('Failed to initialize DeepSeek:', error);
        }
        break;

      case AIProvider.CLOUDIQ:
        try {
          // CloudIQ is OpenAI-compatible but authenticates via an X-API-Key
          // header rather than the standard Authorization: Bearer header. The
          // SDK still requires a non-empty apiKey, but the real auth comes from
          // the default header we attach here.
          await this.createOpenAICompatibleClient(this.apiBaseUrl || undefined, {
            'X-API-Key': this.apiKey
          });
        } catch (error) {
          console.error('Failed to initialize CloudIQ:', error);
        }
        break;

      case AIProvider.CLAUDE: {
        try {
          const { default: Anthropic } = await import('@anthropic-ai/sdk');
          this.claude = new Anthropic({
            apiKey: this.apiKey,
            ...(this.apiBaseUrl && { baseURL: this.apiBaseUrl })
          });
        } catch (error) {
          console.error('Failed to initialize Claude:', error);
        }
        break;
      }

      case AIProvider.GEMINI: {
        try {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          this.gemini = new GoogleGenerativeAI(this.apiKey);
          this.geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        } catch (error) {
          console.error('Failed to initialize Gemini:', error);
        }
        break;
      }

      default:
        console.warn(`No initialization method defined for provider: ${this.provider}`);
    }
  }

  /**
   * Shared client construction for every OpenAI-compatible provider
   * (OpenAI, DeepSeek, CloudIQ). They differ only by baseURL and auth headers;
   * the request shape is identical.
   */
  private async createOpenAICompatibleClient(
    baseURL?: string,
    headers?: Record<string, string>
  ): Promise<void> {
    const { default: OpenAI } = await import('openai');
    this.openai = new OpenAI({
      apiKey: this.apiKey!,
      ...(baseURL && { baseURL }),
      ...(headers && { defaultHeaders: headers })
    });
  }

  public setApiConfig(provider: AIProvider, apiKey: string, apiBaseUrl?: string): void {
    this.provider = provider;
    this.apiKey = apiKey;
    this.apiBaseUrl = apiBaseUrl || null;

    // Reset any previously created clients so the next request re-initializes.
    this.openai = null;
    this.claude = null;
    this.gemini = null;
    this.geminiModel = null;

    this.validateConfig();
    this.initPromise = this.apiKey ? this.initializeClient() : null;
  }

  public async generateText(prompt: string, baseText: string, gameState: GameState): Promise<string | null> {
    if (!this.apiKey) return null;

    const contextPrompt = this.createContextPrompt(gameState);

    try {
      await this.ensureInitialized();

      switch (this.provider) {
        case AIProvider.OPENAI:
        case AIProvider.DEEPSEEK:
        case AIProvider.CLOUDIQ:
          return await this.generateViaOpenAICompatible(
            prompt,
            baseText,
            contextPrompt,
            this.getOpenAICompatibleModel()
          );

        case AIProvider.CLAUDE:
          return await this.generateTextClaude(prompt, baseText, contextPrompt);

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

  /** Default model id for each OpenAI-compatible provider. */
  private getOpenAICompatibleModel(): string {
    switch (this.provider) {
      case AIProvider.DEEPSEEK:
        return 'deepseek-chat';
      case AIProvider.CLOUDIQ:
        return 'cloudiq-smart';
      case AIProvider.OPENAI:
      default:
        return 'gpt-3.5-turbo';
    }
  }

  private async generateTextGemini(prompt: string, baseText: string, contextPrompt: string): Promise<string | null> {
    if (!this.geminiModel) return null;

    try {
      const generationConfig: GenerationConfig = {
        maxOutputTokens: 150,
        temperature: 0.7
      };

      const result = await withTimeout(
        this.geminiModel.generateContent({
          contents: [
            { role: "user", parts: [{ text: this.systemPrompt + contextPrompt + '\n\n' + prompt + "\n\nBase text: " + baseText }] }
          ],
          generationConfig
        }),
        AI_REQUEST_TIMEOUT_MS
      );

      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error with Gemini API:', error);
      return null;
    }
  }

  /**
   * Shared text generation for every OpenAI-compatible provider. The only thing
   * that varies between OpenAI / DeepSeek / CloudIQ is the model id and the
   * baseURL/headers (already baked into the client at init time).
   */
  private async generateViaOpenAICompatible(
    prompt: string,
    baseText: string,
    contextPrompt: string,
    model: string
  ): Promise<string | null> {
    if (!this.openai) return null;

    try {
      const response = await withTimeout(
        this.openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: this.systemPrompt + contextPrompt },
            { role: "user", content: prompt + "\n\nBase text: " + baseText }
          ],
          max_tokens: 150,
          temperature: 0.7
        }),
        AI_REQUEST_TIMEOUT_MS
      );

      return response.choices[0]?.message.content || null;
    } catch (error) {
      this.logOpenAICompatibleError(error, model);
      return null;
    }
  }

  private async generateTextClaude(prompt: string, baseText: string, contextPrompt: string): Promise<string | null> {
    if (this.claude) {
      try {
        const response = await withTimeout(
          this.claude.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 150,
            temperature: 0.7,
            system: this.systemPrompt + contextPrompt,
            messages: [
              { role: 'user', content: prompt + "\n\nBase text: " + baseText }
            ]
          }),
          AI_REQUEST_TIMEOUT_MS
        );

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
      const controller = new AbortController();
      const response = await withTimeout(
        fetch(apiUrl, {
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
          }),
          signal: controller.signal
        }),
        AI_REQUEST_TIMEOUT_MS,
        controller
      );

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
      await this.ensureInitialized();

      let aiResponse = null;

      switch (this.provider) {
        case AIProvider.OPENAI:
        case AIProvider.DEEPSEEK:
        case AIProvider.CLOUDIQ:
          aiResponse = await this.mapViaOpenAICompatible(
            mappingPrompt,
            userResponse,
            this.getOpenAICompatibleModel()
          );
          break;

        case AIProvider.CLAUDE:
          aiResponse = await this.mapResponseClaude(mappingPrompt, userResponse);
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

      const result = await withTimeout(
        this.geminiModel.generateContent({
          contents: [
            { role: "user", parts: [{ text: mappingPrompt + "\n\n" + userResponse }] }
          ],
          generationConfig
        }),
        AI_REQUEST_TIMEOUT_MS
      );

      const response = result.response;
      return response.text().trim() || "NONE";
    } catch (error) {
      console.error('Error with Gemini API:', error);
      return "NONE";
    }
  }

  /**
   * Shared choice-mapping call for every OpenAI-compatible provider.
   */
  private async mapViaOpenAICompatible(
    mappingPrompt: string,
    userResponse: string,
    model: string
  ): Promise<string | null> {
    if (!this.openai) return null;

    try {
      const response = await withTimeout(
        this.openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: mappingPrompt },
            { role: "user", content: userResponse }
          ],
          max_tokens: 30,
          temperature: 0.2
        }),
        AI_REQUEST_TIMEOUT_MS
      );

      return response.choices[0]?.message.content?.trim() || "NONE";
    } catch (error) {
      this.logOpenAICompatibleError(error, model);
      return "NONE";
    }
  }

  private async mapResponseClaude(mappingPrompt: string, userResponse: string): Promise<string | null> {
    if (this.claude) {
      try {
        const response = await withTimeout(
          this.claude.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 30,
            temperature: 0.2,
            system: mappingPrompt,
            messages: [
              { role: 'user', content: userResponse }
            ]
          }),
          AI_REQUEST_TIMEOUT_MS
        );

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
      const controller = new AbortController();
      const response = await withTimeout(
        fetch(apiUrl, {
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
          }),
          signal: controller.signal
        }),
        AI_REQUEST_TIMEOUT_MS,
        controller
      );

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

  /**
   * Logs errors from OpenAI-compatible providers, surfacing the server-provided
   * JSON error text ({ "error": "..." }, as returned by CloudIQ and others)
   * when available so rate-limit (429) and similar failures are readable.
   */
  private logOpenAICompatibleError(error: unknown, model: string): void {
    const err = error as {
      status?: number;
      message?: string;
      error?: { error?: string; message?: string } | string;
    };

    let serverMessage: string | undefined;
    if (typeof err?.error === 'string') {
      serverMessage = err.error;
    } else if (err?.error && typeof err.error === 'object') {
      serverMessage = err.error.error || err.error.message;
    }
    serverMessage = serverMessage || err?.message;

    const status = err?.status ? ` (HTTP ${err.status})` : '';
    console.error(`Error with OpenAI-compatible API for ${model}${status}:`, serverMessage ?? error);
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
