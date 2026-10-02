import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIManager, AIProvider, AI_REQUEST_TIMEOUT_MS } from '../src/utils/AIManager';
import { GameState, Choice } from '../src/models/types';

// Capture how the OpenAI SDK is constructed and what requests are made so we can
// assert on per-provider baseURL/headers/model without hitting the network.
const mocks = vi.hoisted(() => ({
  constructorCalls: [] as Array<Record<string, unknown>>,
  create: vi.fn()
}));

vi.mock('openai', () => ({
  default: class MockOpenAI {
    public chat = { completions: { create: mocks.create } };
    constructor(config: Record<string, unknown>) {
      mocks.constructorCalls.push(config);
    }
  }
}));

const gameState: GameState = {
  currentNodeId: 'n1',
  inventory: [],
  relationships: {},
  flags: {},
  location: 'station',
  health: 100,
  lastTimestamp: 0,
  visitedNodes: [],
  activityStatus: 'active',
  messagesComplete: false
};

function openAIReply(content: string) {
  return { choices: [{ message: { content } }] };
}

describe('AIManager OpenAI-compatible providers', () => {
  beforeEach(() => {
    mocks.constructorCalls.length = 0;
    mocks.create.mockReset();
  });

  it('configures OpenAI without a baseURL or custom headers', async () => {
    mocks.create.mockResolvedValue(openAIReply('Some narrative text.'));

    const manager = new AIManager(AIProvider.OPENAI, 'test-key');
    await manager.generateText('prompt', 'base', gameState);

    expect(mocks.constructorCalls).toHaveLength(1);
    const config = mocks.constructorCalls[0];
    expect(config.apiKey).toBe('test-key');
    expect(config.baseURL).toBeUndefined();
    expect(config.defaultHeaders).toBeUndefined();

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gpt-3.5-turbo' })
    );
  });

  it('configures DeepSeek with the DeepSeek baseURL and no custom auth header', async () => {
    mocks.create.mockResolvedValue(openAIReply('text'));

    const manager = new AIManager(AIProvider.DEEPSEEK, 'ds-key');
    await manager.generateText('prompt', 'base', gameState);

    const config = mocks.constructorCalls[0];
    expect(config.baseURL).toBe('https://api.deepseek.com');
    expect(config.defaultHeaders).toBeUndefined();
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'deepseek-chat' })
    );
  });

  it('configures CloudIQ with the supplied baseURL and an X-API-Key header', async () => {
    mocks.create.mockResolvedValue(openAIReply('text'));

    const manager = new AIManager(AIProvider.CLOUDIQ, 'cloud-key', 'https://cloudiq.example.com/v1');
    await manager.generateText('prompt', 'base', gameState);

    const config = mocks.constructorCalls[0];
    expect(config.baseURL).toBe('https://cloudiq.example.com/v1');
    expect(config.defaultHeaders).toEqual({ 'X-API-Key': 'cloud-key' });
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'cloudiq-smart' })
    );
  });

  it('throws when CloudIQ is selected without a base URL', () => {
    expect(() => new AIManager(AIProvider.CLOUDIQ, 'cloud-key')).toThrow(/base URL/i);
  });
});

describe('AIManager.mapResponseToChoice', () => {
  const choices: Choice[] = [
    { id: 'choice_a', text: 'Option A', nextNodeId: 'a' },
    { id: 'choice_b', text: 'Option B', nextNodeId: 'b' }
  ];

  beforeEach(() => {
    mocks.constructorCalls.length = 0;
    mocks.create.mockReset();
  });

  it('returns the choice id when the AI responds with a valid id', async () => {
    mocks.create.mockResolvedValue(openAIReply('choice_b'));

    const manager = new AIManager(AIProvider.OPENAI, 'key');
    const result = await manager.mapResponseToChoice('I pick the second one', choices, gameState);

    expect(result).toBe('choice_b');
  });

  it('rejects an AI response that is not one of the available choice ids', async () => {
    mocks.create.mockResolvedValue(openAIReply('choice_does_not_exist'));

    const manager = new AIManager(AIProvider.OPENAI, 'key');
    const result = await manager.mapResponseToChoice('something', choices, gameState);

    expect(result).toBeNull();
  });

  it('returns null when the AI responds with NONE', async () => {
    mocks.create.mockResolvedValue(openAIReply('NONE'));

    const manager = new AIManager(AIProvider.OPENAI, 'key');
    const result = await manager.mapResponseToChoice('unrelated rambling', choices, gameState);

    expect(result).toBeNull();
  });

  it('returns null when there are no available choices', async () => {
    const manager = new AIManager(AIProvider.OPENAI, 'key');
    const result = await manager.mapResponseToChoice('anything', [], gameState);

    expect(result).toBeNull();
    expect(mocks.create).not.toHaveBeenCalled();
  });
});

describe('AIManager request timeout (fix #5)', () => {
  beforeEach(() => {
    mocks.constructorCalls.length = 0;
    mocks.create.mockReset();
  });

  it('generateText resolves to null when the provider request hangs past the timeout', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Warm up the client under real timers first so the async dynamic import of the
    // SDK is fully resolved before we switch to fake timers (keeps the fake-timer
    // window to just the setTimeout the timeout helper schedules).
    mocks.create.mockResolvedValueOnce(openAIReply('warmup'));
    const manager = new AIManager(AIProvider.OPENAI, 'key');
    await manager.generateText('warmup', 'base', gameState);

    vi.useFakeTimers();
    // A request that never settles simulates a stalled provider / network.
    mocks.create.mockReturnValue(new Promise(() => {}));

    const resultPromise = manager.generateText('prompt', 'base', gameState);

    // Advance past the client-side timeout; the hung request should be abandoned.
    await vi.advanceTimersByTimeAsync(AI_REQUEST_TIMEOUT_MS + 1);
    const result = await resultPromise;

    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalled();

    vi.useRealTimers();
    errorSpy.mockRestore();
  });
});
