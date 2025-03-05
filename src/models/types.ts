export interface GameState {
  currentNodeId: string;
  inventory: string[];
  relationships: Record<string, number>;
  flags: Record<string, boolean>;
  location: string;
  health: number;
  lastTimestamp: number;
  visitedNodes: string[];
  activityStatus: string;
  messagesComplete: boolean;
}

export interface Choice {
  id: string;
  text: string;
  nextNodeId: string;
  condition?: (state: GameState) => boolean;
  effect?: (state: GameState) => GameState;
}

export interface StoryNode {
  id: string;
  character: string;
  text: string;
  delay?: number;
  followupMessages?: FollowupMessage[];
  choices?: Choice[];
  aiPrompt?: string;
  effect?: (state: GameState) => GameState;
  waitTime?: number;
  activityMessage?: string;
  condition?: (state: GameState) => boolean;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  profileImage?: string;
}

export interface Message {
  id: string;
  text: string;
  character: string;
  timestamp: number | null;
  isPlayer: boolean;
  showTimestamp?: boolean;
}

export interface FollowupMessage {
  text: string;
  delay: number;
  character?: string;
}

export enum EndingType {
  GOOD = "GOOD",
  NEUTRAL = "NEUTRAL",
  BAD = "BAD"
}

export interface Ending {
  id: string;
  type: EndingType;
  text: string;
  condition: (state: GameState) => boolean;
}