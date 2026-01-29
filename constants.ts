
import { GameSettings } from './types';

export const SETTINGS: GameSettings = {
  lanes: 3,
  laneWidth: 4,
  baseSpeed: 0.6,
  acceleration: 0.00015,
  maxSpeed: 1.8,
  jumpStrength: 0.28,
  gravity: 0.009,
};

export const COLORS = {
  primary: '#00ff00', // Ben 10 Green
  secondary: '#ffffff', // Shirt White
  accent: '#111111', // Black
  bg: '#020617',
  player: '#ffffff',
  obstacle: '#ff1100', // Danger Red
  coin: '#00ff00', // Green Coins (Omnitrix Energy)
};
