import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StoryNode, Ending, EndingType, GameState, Choice, Message } from '../src/models/types';
import type { AIManager } from '../src/utils/AIManager';

// Shared, controllable SaveManager mock so we can drive save/load behavior.
const save = vi.hoisted(() => ({
  loadGameReturn: null as GameState | null,
  loadMessagesReturn: null as Message[] | null,
  saveGame: vi.fn(),
  saveMessages: vi.fn(),
  clearSave: vi.fn()
}));

vi.mock('../src/engine/SaveManager', () => ({
  SaveManager: class {
    saveGame = save.saveGame;
    saveMessages = save.saveMessages;
    clearSave = save.clearSave;
    loadGame = () => save.loadGameReturn;
    loadMessages = () => save.loadMessagesReturn;
  }
}));

// Make all in-game delays resolve immediately so tests are fast and deterministic.
vi.mock('../src/engine/TimeManager', () => ({
  TimeManager: class {
    delay = () => Promise.resolve();
    getElapsedTime = () => 0;
    formatTime = () => '';
    toggleRealTime = () => false;
    setSpeedFactor = () => undefined;
    getCompletionTime = () => new Date();
    formatTimestamp = () => '';
  }
}));

// Import after the mocks are registered.
import { StoryEngine } from '../src/engine/StoryEngine';

const nodes: StoryNode[] = [
  {
    id: 'start',
    character: 'maya',
    text: 'The storm is coming.',
    choices: [
      { id: 'safe', text: 'Play it safe', nextNodeId: 'next' },
      {
        id: 'fatal',
        text: 'Do something reckless',
        nextNodeId: 'aftermath',
        effect: (s) => ({ ...s, health: 10 })
      }
    ]
  },
  { id: 'next', character: 'maya', text: 'You continue on.', choices: [] },
  { id: 'aftermath', character: 'system', text: 'Everything goes dark.' }
];

const endings: Ending[] = [
  {
    id: 'bad',
    type: EndingType.BAD,
    text: 'You did not survive.',
    condition: (s) => s.health <= 30
  }
];

function freshState(overrides: Partial<GameState> = {}): GameState {
  return {
    currentNodeId: 'start',
    inventory: [],
    relationships: {},
    flags: {},
    location: 'station',
    health: 100,
    lastTimestamp: Date.now(),
    visitedNodes: [],
    activityStatus: 'active',
    messagesComplete: false,
    ...overrides
  };
}

describe('StoryEngine', () => {
  beforeEach(() => {
    save.loadGameReturn = null;
    save.loadMessagesReturn = null;
    save.saveGame.mockClear();
    save.saveMessages.mockClear();
    save.clearSave.mockClear();
  });

  it('advances to the next node and records the player choice when a choice is made', () => {
    const engine = new StoryEngine(nodes, endings, 'start', false, false, null);
    const messageSpy = vi.fn<(messages: Message[]) => void>();
    engine.onMessagesUpdate(messageSpy);

    engine.makeChoice('safe');

    expect(engine.getCurrentNodeId()).toBe('next');
    // The player's chosen text is echoed into the transcript.
    const allMessages = messageSpy.mock.calls.flatMap((call) => call[0]);
    expect(allMessages.some((m) => m.isPlayer && m.text === 'Play it safe')).toBe(true);
    // The choice is persisted.
    expect(save.saveGame).toHaveBeenCalled();
    expect(save.saveMessages).toHaveBeenCalled();
  });

  it('ignores an unknown choice id', () => {
    const engine = new StoryEngine(nodes, endings, 'start', false, false, null);
    engine.makeChoice('does_not_exist');
    expect(engine.getCurrentNodeId()).toBe('start');
  });

  it('triggers the matching ending when a choice drives the state into an ending condition', async () => {
    const engine = new StoryEngine(nodes, endings, 'start', false, false, null);
    const gameOverSpy = vi.fn<(ending: Ending) => void>();
    engine.onGameOver(gameOverSpy);

    engine.makeChoice('fatal');

    await vi.waitFor(() => expect(gameOverSpy).toHaveBeenCalled());
    expect(gameOverSpy.mock.calls[0][0].type).toBe(EndingType.BAD);
  });

  it('loads a saved game via SaveManager and resumes with the saved node and choices', async () => {
    save.loadGameReturn = freshState({ currentNodeId: 'start', messagesComplete: true });
    save.loadMessagesReturn = [
      { id: 'm1', text: 'Earlier message', character: 'maya', timestamp: 1, isPlayer: false }
    ];

    const engine = new StoryEngine(nodes, endings, 'start', false, false, null);
    const choicesSpy = vi.fn<(choices: Choice[]) => void>();
    const messageSpy = vi.fn<(messages: Message[]) => void>();
    engine.onChoicesAvailable(choicesSpy);
    engine.onMessagesUpdate(messageSpy);

    await engine.start();

    expect(engine.getCurrentNodeId()).toBe('start');

    // Restored transcript is delivered to listeners.
    const delivered = messageSpy.mock.calls.flatMap((call) => call[0]);
    expect(delivered.some((m) => m.text === 'Earlier message')).toBe(true);

    // Because the saved messages were complete, the node's choices are offered.
    await vi.waitFor(() =>
      expect(choicesSpy).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 'safe' })])
      )
    );
  });

  it('clears the save when the game is reset', () => {
    const engine = new StoryEngine(nodes, endings, 'start', false, false, null);
    engine.resetGame();
    expect(save.clearSave).toHaveBeenCalled();
    expect(engine.getCurrentNodeId()).toBe('start');
  });
});

/** Minimal fake AIManager exposing just the two methods the pipeline uses. */
type FakeAI = {
  mapResponseToChoice: ReturnType<typeof vi.fn>;
  generateText: ReturnType<typeof vi.fn>;
};

function makeFakeAI(overrides: Partial<FakeAI> = {}): FakeAI {
  return {
    mapResponseToChoice: vi.fn(() => Promise.resolve(null)),
    generateText: vi.fn(() => Promise.resolve('Generated line.')),
    ...overrides
  };
}

function collect(spy: ReturnType<typeof vi.fn>): Message[] {
  return spy.mock.calls.flatMap((call) => call[0] as Message[]);
}

describe('StoryEngine custom AI response pipeline', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    save.loadGameReturn = null;
    save.loadMessagesReturn = null;
    save.saveGame.mockClear();
    save.saveMessages.mockClear();
    save.clearSave.mockClear();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('happy path: maps the response, shows Maya\'s acknowledgment, and advances the story', async () => {
    const ai = makeFakeAI({
      mapResponseToChoice: vi.fn(() => Promise.resolve('safe')),
      // Embedded quote pair should be unwrapped by sanitizeDialogue (fix #3).
      generateText: vi.fn(() => Promise.resolve('"We stay." I nod.'))
    });
    const engine = new StoryEngine(nodes, endings, 'start', true, false, ai as unknown as AIManager);
    const messageSpy = vi.fn<(messages: Message[]) => void>();
    engine.onMessagesUpdate(messageSpy);

    await engine.submitCustomResponse('I think we should stay put');

    expect(ai.mapResponseToChoice).toHaveBeenCalledTimes(1);
    expect(ai.generateText).toHaveBeenCalledTimes(1);

    const delivered = collect(messageSpy);
    // Quotes stripped, read as Maya speaking directly.
    expect(delivered.some((m) => !m.isPlayer && m.text === 'We stay. I nod.')).toBe(true);
    // Mapped choice 'safe' drives the transition to its nextNodeId.
    expect(engine.getCurrentNodeId()).toBe('next');
  });

  it('runs the mapping and generation calls concurrently, not sequentially (fix #1)', async () => {
    let resolveMap: (value: string) => void = () => {};
    const mapPromise = new Promise<string>((resolve) => {
      resolveMap = resolve;
    });
    const ai = makeFakeAI({
      mapResponseToChoice: vi.fn(() => mapPromise),
      generateText: vi.fn(() => Promise.resolve('ok'))
    });
    const engine = new StoryEngine(nodes, endings, 'start', true, false, ai as unknown as AIManager);

    const pending = engine.submitCustomResponse('something');
    // Let the synchronous part of handleAIResponse run.
    await Promise.resolve();

    // generateText has already fired even though mapResponseToChoice is still
    // unresolved — impossible if the two calls were awaited sequentially.
    expect(ai.generateText).toHaveBeenCalledTimes(1);
    expect(ai.mapResponseToChoice).toHaveBeenCalledTimes(1);

    resolveMap('safe');
    await pending;
    expect(engine.getCurrentNodeId()).toBe('next');
  });

  it('no confident match: uses a neutral prompt and does not pretend a choice was picked (fix #4)', async () => {
    const ai = makeFakeAI({
      mapResponseToChoice: vi.fn(() => Promise.resolve(null)),
      generateText: vi.fn((prompt: string) =>
        Promise.resolve(
          prompt.includes('does not clearly match any available option')
            ? 'Let us keep moving for now.'
            : 'I hear you.'
        )
      )
    });
    const engine = new StoryEngine(nodes, endings, 'start', true, false, ai as unknown as AIManager);
    const messageSpy = vi.fn<(messages: Message[]) => void>();
    engine.onMessagesUpdate(messageSpy);

    await engine.submitCustomResponse('completely unrelated rambling');

    // A second generation happened using the neutral no-match prompt...
    const prompts = ai.generateText.mock.calls.map((call) => call[0] as string);
    expect(prompts.some((p) => p.includes('does not clearly match any available option'))).toBe(true);

    // ...and the neutral line (not the acknowledgment) is what gets shown.
    const delivered = collect(messageSpy);
    expect(delivered.some((m) => m.text === 'Let us keep moving for now.')).toBe(true);
    expect(delivered.some((m) => m.text === 'I hear you.')).toBe(false);

    // Still progresses sensibly via the first available choice.
    expect(engine.getCurrentNodeId()).toBe('next');
  });

  it('logs the error and still degrades gracefully when an AI call rejects (fix #2)', async () => {
    const ai = makeFakeAI({
      mapResponseToChoice: vi.fn(() => Promise.reject(new Error('boom'))),
      generateText: vi.fn(() => Promise.resolve('unused'))
    });
    const engine = new StoryEngine(nodes, endings, 'start', true, false, ai as unknown as AIManager);
    const messageSpy = vi.fn<(messages: Message[]) => void>();
    engine.onMessagesUpdate(messageSpy);

    await engine.submitCustomResponse('anything');

    // The error is now logged rather than silently swallowed.
    expect(errorSpy).toHaveBeenCalled();
    // Graceful-degradation message + progression still happen.
    const delivered = collect(messageSpy);
    expect(delivered.some((m) => m.text === 'I understand. Let me continue...')).toBe(true);
    expect(engine.getCurrentNodeId()).toBe('next');
  });
});
