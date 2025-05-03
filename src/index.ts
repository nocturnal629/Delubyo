import { StoryEngine } from './engine/StoryEngine';
import { storyNodes, endings, INITIAL_NODE_ID } from './data/story';
import { GameUI } from './ui/GameUI';
import { AIManager, AIProvider } from './utils/AIManager';
import { AISettings } from './components/AISettings';
import { inject } from '@vercel/analytics';

inject();

const USE_AI = localStorage.getItem('use_ai') === 'true';
const USE_REAL_TIME = localStorage.getItem('use_real_time') !== 'false';

let aiManager: AIManager | null = null;
if (USE_AI) {
  const provider = localStorage.getItem('ai_provider') as AIProvider || AIProvider.OPENAI;
  const apiKey = localStorage.getItem('ai_api_key') || '';
  const apiUrl = localStorage.getItem('ai_api_url') || '';

  if (apiKey) {
    aiManager = new AIManager(provider, apiKey, apiUrl);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const gameUI = new GameUI();

  const aiSettings = new AISettings();
  aiSettings.onSave((provider, apiKey, apiUrl) => {
    localStorage.setItem('use_ai', 'true');
    
    if (aiManager) {
      aiManager.setApiConfig(provider, apiKey, apiUrl);
    } else {
      aiManager = new AIManager(provider, apiKey, apiUrl);
    }
    
    if (confirm('Settings saved! Reload page to apply changes?')) {
      window.location.reload();
    }
  });

  const storyEngine = new StoryEngine(
    storyNodes,
    endings,
    INITIAL_NODE_ID,
    USE_AI,
    USE_REAL_TIME,
    aiManager
  );

  gameUI.connectToStoryEngine(storyEngine);

  storyEngine.start();

  const resetButton = document.getElementById('reset-button');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
        storyEngine.resetGame();
      }
    });
  }

  const timingToggle = document.getElementById('timing-toggle') as HTMLInputElement;
  if (timingToggle) {
    timingToggle.checked = USE_REAL_TIME;
    timingToggle.addEventListener('change', () => {
      localStorage.setItem('use_real_time', timingToggle.checked ? 'true' : 'false');
      alert('Timing preference saved. Changes will apply in the next game session.');
    });
  }

  const themeToggle = document.getElementById('theme-toggle') as HTMLInputElement;
  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme === 'dark';

    themeToggle.checked = isDarkMode;
    
    if (isDarkMode) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }

    themeToggle.addEventListener('change', () => {
      if (themeToggle.checked) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      }
    });
  }
});