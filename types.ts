
export enum GameState {
  INTRO = 'INTRO',
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export interface ObstacleData {
  id: string;
  z: number;
  lane: number;
  type: 'thorns';
}

export interface CoinData {
  id: string;
  z: number;
  lane: number;
  collected: boolean;
}

export interface GameSettings {
  lanes: number;
  laneWidth: number;
  baseSpeed: number;
  acceleration: number;
  maxSpeed: number;
  jumpStrength: number;
  gravity: number;
}
