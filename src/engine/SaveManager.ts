import { GameState, Message } from '../models/types';

export class SaveManager {
  private readonly GAME_STATE_KEY = 'delubyo_game_state';
  private readonly MESSAGES_KEY = 'delubyo_messages';

  public saveGame(gameState: GameState): void {
    try {
      localStorage.setItem(this.GAME_STATE_KEY, JSON.stringify(gameState));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  public loadGame(): GameState | null {
    try {
      const savedState = localStorage.getItem(this.GAME_STATE_KEY);
      if (savedState) {
        return JSON.parse(savedState) as GameState;
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
    return null;
  }

  public saveMessages(messages: Message[]): void {
    try {
      localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }

  public loadMessages(): Message[] | null {
    try {
      const savedMessages = localStorage.getItem(this.MESSAGES_KEY);
      if (savedMessages) {
        return JSON.parse(savedMessages) as Message[];
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
    return null;
  }

  public clearSave(): void {
    try {
      localStorage.removeItem(this.GAME_STATE_KEY);
      localStorage.removeItem(this.MESSAGES_KEY);
    } catch (error) {
      console.error('Failed to clear save data:', error);
    }
  }

  public exportSave(): string {
    try {
      const gameState = localStorage.getItem(this.GAME_STATE_KEY);
      const messages = localStorage.getItem(this.MESSAGES_KEY);
      
      const exportData = {
        gameState: gameState ? JSON.parse(gameState) : null,
        messages: messages ? JSON.parse(messages) : null,
        exportDate: new Date().toISOString()
      };
      
      return JSON.stringify(exportData);
    } catch (error) {
      console.error('Failed to export save:', error);
      return '';
    }
  }

  public importSave(saveData: string): boolean {
    try {
      const importData = JSON.parse(saveData);
      
      if (importData.gameState) {
        localStorage.setItem(this.GAME_STATE_KEY, JSON.stringify(importData.gameState));
      }
      
      if (importData.messages) {
        localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(importData.messages));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }
}