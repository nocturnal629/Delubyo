import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '../src/engine/SaveManager';
import { GameState, Message } from '../src/models/types';

function installMockLocalStorage(): void {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    }
  } as Storage;
}

const sampleState: GameState = {
  currentNodeId: 'node_1',
  inventory: ['radio'],
  relationships: { maya: 5 },
  flags: { isInjured: true },
  location: 'station',
  health: 80,
  lastTimestamp: 1234567890,
  visitedNodes: ['node_0'],
  activityStatus: 'active',
  messagesComplete: true
};

const sampleMessages: Message[] = [
  { id: 'm1', text: 'Hello', character: 'maya', timestamp: 1, isPlayer: false, showTimestamp: true }
];

describe('SaveManager', () => {
  let manager: SaveManager;

  beforeEach(() => {
    installMockLocalStorage();
    manager = new SaveManager();
  });

  it('round-trips game state through save and load', () => {
    manager.saveGame(sampleState);
    expect(manager.loadGame()).toEqual(sampleState);
  });

  it('round-trips messages through save and load', () => {
    manager.saveMessages(sampleMessages);
    expect(manager.loadMessages()).toEqual(sampleMessages);
  });

  it('returns null when nothing has been saved', () => {
    expect(manager.loadGame()).toBeNull();
    expect(manager.loadMessages()).toBeNull();
  });

  it('clears both game state and messages', () => {
    manager.saveGame(sampleState);
    manager.saveMessages(sampleMessages);

    manager.clearSave();

    expect(manager.loadGame()).toBeNull();
    expect(manager.loadMessages()).toBeNull();
  });

  it('returns null (and does not throw) when stored data is corrupt', () => {
    localStorage.setItem('delubyo_game_state', '{not valid json');
    expect(manager.loadGame()).toBeNull();
  });

  it('exports and re-imports a save', () => {
    manager.saveGame(sampleState);
    manager.saveMessages(sampleMessages);

    const exported = manager.exportSave();
    manager.clearSave();
    expect(manager.loadGame()).toBeNull();

    expect(manager.importSave(exported)).toBe(true);
    expect(manager.loadGame()).toEqual(sampleState);
    expect(manager.loadMessages()).toEqual(sampleMessages);
  });
});
