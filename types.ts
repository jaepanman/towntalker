
export enum TileType {
  SIDEWALK = 'SIDEWALK',
  ROAD = 'ROAD',
  CROSSWALK = 'CROSSWALK',
  BUILDING = 'BUILDING',
  BUS_STOP = 'BUS_STOP',
  HOME = 'HOME',
  GRASS = 'GRASS',
  QUESTION = 'QUESTION'
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface LocationInfo {
  name: string;
  color: string;
  id: string;
}

export interface PlayerTeam {
  id: number;
  name: string;
  emoji: string;
  color: string;
  position: { x: number; y: number };
  facing: Direction;
  coins: number;
  destinations: string[]; // IDs of locations to visit
  visited: string[]; // IDs of locations already visited
  startHomeId: string;
  isHome: boolean;
  // Power-ups
  nextRollBonus: number;
  freeBus: boolean;
  lastLocationRewardId?: string; // Prevent multiple rewards from same building in one turn
  // Bus logic
  busStatus?: {
    routeId: 'CW' | 'CCW';
    currentStopId: number;
  };
}

export interface GameState {
  currentTeamIndex: number;
  diceRoll: number;
  remainingMoves: number;
  phase: 'TEAM_COUNT' | 'TEAM_CUSTOMIZATION' | 'ROLLING' | 'MOVING' | 'QUESTION' | 'POWERUP_SELECT' | 'GAME_OVER' | 'BUS_OFFER' | 'BUS_TRAVEL';
  boardSize: number;
  teams: PlayerTeam[];
  redLightPos: { x: number; y: number } | null;
  redLightTurns: number;
}

export interface TileData {
  type: TileType;
  buildingId?: string;
  homeId?: string;
  isRedLight?: boolean;
}
