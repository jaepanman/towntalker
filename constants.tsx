
import { TileType, LocationInfo } from './types';

export const BOARD_SIZE = 15;

export const PLAYER_EMOJIS = ['🚗', '🚲', '🏃', '🛹', '🛵', '🚁', '🚌', '🛸', '🦖', '🦄', '🐶', '🐱'];

export const LOCATIONS: LocationInfo[] = [
  { id: 'conv_store', name: 'Convenience Store', color: 'bg-emerald-400' },
  { id: 'supermarket', name: 'Supermarket', color: 'bg-green-500' },
  { id: 'post_office', name: 'Post Office', color: 'bg-red-500' },
  { id: 'bank', name: 'Bank', color: 'bg-blue-600' },
  { id: 'school', name: 'School', color: 'bg-yellow-400' },
  { id: 'park', name: 'Park', color: 'bg-lime-500' },
  { id: 'fire_station', name: 'Fire Station', color: 'bg-orange-600' },
  { id: 'police_station', name: 'Police Station', color: 'bg-sky-700' },
  { id: 'mall', name: 'Shopping Mall', color: 'bg-pink-400' },
  { id: 'stadium', name: 'Stadium', color: 'bg-indigo-500' },
  { id: 'train_station', name: 'Train Station', color: 'bg-slate-500' },
  { id: 'yen_store', name: '100 Yen Store', color: 'bg-yellow-600' },
];

export const HOMES: LocationInfo[] = [
  { id: 'home_1', name: 'Home 1', color: 'bg-red-400' },
  { id: 'home_2', name: 'Home 2', color: 'bg-blue-400' },
  { id: 'home_3', name: 'Home 3', color: 'bg-yellow-400' },
  { id: 'home_4', name: 'Home 4', color: 'bg-purple-400' },
];

export const GRID_LAYOUT = [
  ['H1', 'S', 'Q', 'S', 'Q', 'S', 'S', 'B1', 'S', 'Q', 'S', 'S', 'Q', 'S', 'H2'],
  ['S', 'G', 'Q', 'G', 'R', 'G', 'Q', 'S', 'G', 'Q', 'G', 'G', 'G', 'Q', 'S'],
  ['Q', 'G', 'B2', 'G', 'C', 'G', 'B3', 'Q', 'G', 'B4', 'G', 'B5', 'G', 'Q', 'S'],
  ['U', 'Q', 'G', 'Q', 'R', 'G', 'G', 'U', 'G', 'G', 'Q', 'Q', 'G', 'G', 'S'],
  ['S', 'S', 'S', 'S', 'R', 'Q', 'S', 'S', 'Q', 'S', 'S', 'S', 'S', 'S', 'S'],
  ['R', 'R', 'C', 'R', 'R', 'R', 'C', 'R', 'R', 'R', 'C', 'R', 'R', 'R', 'R'],
  ['U', 'Q', 'S', 'S', 'R', 'S', 'S', 'S', 'Q', 'S', 'S', 'Q', 'S', 'Q', 'U'],
  ['B6', 'G', 'Q', 'G', 'C', 'G', 'Q', 'S', 'G', 'G', 'G', 'G', 'Q', 'G', 'B7'],
  ['S', 'S', 'S', 'S', 'R', 'Q', 'S', 'S', 'S', 'S', 'S', 'Q', 'S', 'S', 'S'],
  ['R', 'R', 'C', 'R', 'R', 'R', 'C', 'R', 'R', 'R', 'C', 'R', 'R', 'R', 'R'],
  ['S', 'S', 'Q', 'S', 'R', 'S', 'S', 'Q', 'S', 'S', 'Q', 'S', 'S', 'S', 'S'],
  ['S', 'Q', 'B8', 'G', 'C', 'G', 'B9', 'S', 'G', 'B10', 'G', 'B11', 'G', 'Q', 'S'],
  ['Q', 'G', 'G', 'Q', 'R', 'G', 'G', 'U', 'G', 'G', 'G', 'Q', 'G', 'G', 'S'],
  ['S', 'G', 'B12', 'G', 'R', 'G', 'Q', 'S', 'G', 'G', 'G', 'Q', 'G', 'Q', 'S'],
  ['H3', 'S', 'U', 'Q', 'S', 'S', 'S', 'Q', 'S', 'S', 'Q', 'S', 'S', 'S', 'H4'],
];

// Bus Stops Coordinates
export const BUS_STOPS = [
  { id: 1, x: 0, y: 3 },  // Top Left
  { id: 2, x: 7, y: 3 },  // Top Middle-Right
  { id: 3, x: 14, y: 6 }, // Middle Right
  { id: 4, x: 7, y: 12 }, // Bottom Right
  { id: 5, x: 2, y: 14 }, // Bottom Left
  { id: 6, x: 0, y: 6 },  // Middle Left
];

export const BUS_ROUTES = {
  CW: [1, 2, 3, 4, 5, 6],
  CCW: [1, 6, 5, 4, 3, 2],
};

export const getTileType = (char: string): TileType => {
  if (char.startsWith('H')) return TileType.HOME;
  if (char.startsWith('B')) return TileType.BUILDING;
  if (char === 'S') return TileType.SIDEWALK;
  if (char === 'R') return TileType.ROAD;
  if (char === 'C') return TileType.CROSSWALK;
  if (char === 'U') return TileType.BUS_STOP;
  if (char === 'G') return TileType.GRASS;
  if (char === 'Q') return TileType.QUESTION;
  return TileType.GRASS;
};
