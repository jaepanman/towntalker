
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TileType, 
  Direction, 
  GameState, 
  PlayerTeam, 
  TileData 
} from './types';
import { 
  BOARD_SIZE, 
  LOCATIONS, 
  HOMES, 
  GRID_LAYOUT, 
  getTileType,
  PLAYER_EMOJIS,
  BUS_STOPS,
  BUS_ROUTES
} from './constants';
import CssDog from './components/CssDog';
import LocationIcon from './components/LocationIcons';
import { generateEnglishQuestion, EnglishQuestion } from './geminiService';
import { 
  Dices, 
  Coins, 
  MapPin, 
  RotateCw, 
  ArrowUp, 
  Bus, 
  TrafficCone,
  Check,
  X,
  Trophy,
  Users,
  ChevronRight,
  Zap,
  Ticket,
  Apple,
  Mail,
  Flame,
  Shield,
  ShoppingBag,
  Trophy as TrophyIcon,
  CircleStop,
  Home,
  Info
} from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentTeamIndex: 0,
    diceRoll: 0,
    remainingMoves: 0,
    phase: 'TEAM_COUNT',
    boardSize: BOARD_SIZE,
    teams: [],
    redLightPos: null,
    redLightTurns: 0
  });

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });
  
  const [activeQuestion, setActiveQuestion] = useState<EnglishQuestion | null>(null);
  const [locationPowerupMsg, setLocationPowerupMsg] = useState<{msg: string, icon: React.ReactNode} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const currentTeam = gameState.teams[gameState.currentTeamIndex] || null;

  // --- Board Panning Logic ---
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPanning(true);
    setStartPanPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    setOffset({
      x: e.clientX - startPanPos.x,
      y: e.clientY - startPanPos.y
    });
  };

  const handlePointerUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.5, Math.min(2.5, z + delta)));
  };

  const centerOnPlayer = useCallback((team: PlayerTeam) => {
    const tileSize = 70;
    const boardPxSize = BOARD_SIZE * tileSize;
    const boardCenter = boardPxSize / 2;
    
    const playerBoardX = (team.position.x * tileSize) + (tileSize / 2);
    const playerBoardY = (team.position.y * tileSize) + (tileSize / 2);
    
    const targetOffsetX = (boardCenter - playerBoardX) * zoom;
    const targetOffsetY = (boardCenter - playerBoardY) * zoom;
    
    setOffset({ x: targetOffsetX, y: targetOffsetY });
  }, [zoom]);

  // --- Game Flow Methods ---
  const selectTeamCount = (count: number) => {
    const initialTeams: PlayerTeam[] = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Team ${i + 1}`,
      emoji: PLAYER_EMOJIS[i % PLAYER_EMOJIS.length],
      color: ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500'][i],
      position: { x: 0, y: 0 },
      facing: 'RIGHT' as Direction,
      coins: 1, 
      destinations: [],
      visited: [],
      startHomeId: '',
      isHome: true,
      nextRollBonus: 0,
      freeBus: false
    }));
    setGameState(prev => ({ ...prev, teams: initialTeams, phase: 'TEAM_CUSTOMIZATION' }));
  };

  const startGame = () => {
    const updatedTeams = gameState.teams.map((team, idx) => {
      const homeId = HOMES[idx % HOMES.length].id;
      const homeIdx = idx % 4;
      let x = 0, y = 0, facing: Direction = 'RIGHT';

      if (homeIdx === 0) { x = 0; y = 0; facing = 'RIGHT'; } 
      else if (homeIdx === 1) { x = BOARD_SIZE - 1; y = 0; facing = 'DOWN'; } 
      else if (homeIdx === 2) { x = 0; y = BOARD_SIZE - 1; facing = 'UP'; } 
      else if (homeIdx === 3) { x = BOARD_SIZE - 1; y = BOARD_SIZE - 1; facing = 'LEFT'; } 

      const shuffled = [...LOCATIONS].sort(() => 0.5 - Math.random());
      const destinations = shuffled.slice(0, 2).map(l => l.id);

      return { ...team, position: { x, y }, facing, startHomeId: homeId, destinations, visited: [] };
    });

    setGameState(prev => ({ ...prev, teams: updatedTeams, phase: 'ROLLING' }));
  };

  useEffect(() => {
    if (gameState.phase === 'ROLLING' && currentTeam) {
      centerOnPlayer(currentTeam);
      
      // Check if player is on the bus
      if (currentTeam.busStatus) {
        setGameState(prev => ({ ...prev, phase: 'BUS_TRAVEL' }));
      }
    }
  }, [gameState.phase, gameState.currentTeamIndex, centerOnPlayer, currentTeam]);

  const updateTeamCustomization = (id: number, updates: Partial<PlayerTeam>) => {
    setGameState(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const rollDice = () => {
    const team = gameState.teams[gameState.currentTeamIndex];
    const roll = Math.floor(Math.random() * 6) + 1;
    const bonus = team?.nextRollBonus || 0;
    
    let updatedTeams = [...gameState.teams];
    if (bonus > 0) {
      updatedTeams[gameState.currentTeamIndex] = { ...updatedTeams[gameState.currentTeamIndex], nextRollBonus: 0 };
    }

    setGameState(prev => ({ 
      ...prev, 
      teams: updatedTeams,
      diceRoll: roll + bonus,
      remainingMoves: roll + bonus,
      phase: 'MOVING'
    }));
  };

  const canMoveTo = useCallback((x: number, y: number): boolean => {
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return false;
    const char = GRID_LAYOUT[y][x];
    const type = getTileType(char);
    if (gameState.redLightPos && gameState.redLightPos.x === x && gameState.redLightPos.y === y) return false;
    return [TileType.SIDEWALK, TileType.CROSSWALK, TileType.BUS_STOP, TileType.HOME, TileType.QUESTION, TileType.GRASS, TileType.BUILDING].includes(type);
  }, [gameState.redLightPos]);

  const moveForward = () => {
    if (gameState.remainingMoves <= 0 || !currentTeam || gameState.phase !== 'MOVING') return;
    let { x, y } = currentTeam.position;
    if (currentTeam.facing === 'UP') y--;
    else if (currentTeam.facing === 'DOWN') y++;
    else if (currentTeam.facing === 'LEFT') x--;
    else if (currentTeam.facing === 'RIGHT') x++;

    if (!canMoveTo(x, y)) return;

    const newTeams = [...gameState.teams];
    const updatedTeam = { ...newTeams[gameState.currentTeamIndex], position: { x, y } };
    newTeams[gameState.currentTeamIndex] = updatedTeam;
    
    checkInteractions(x, y, newTeams);

    setGameState(prev => ({ 
      ...prev, 
      teams: newTeams, 
      remainingMoves: prev.remainingMoves - 1,
    }));
  };

  const turn = (dir: 'LEFT' | 'RIGHT') => {
    if (gameState.remainingMoves <= 0 || !currentTeam || gameState.phase !== 'MOVING') return;
    const dirs: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
    const currentIdx = dirs.indexOf(currentTeam.facing);
    let newIdx = dir === 'RIGHT' ? (currentIdx + 1) % 4 : (currentIdx + 3) % 4;
    
    const newTeams = [...gameState.teams];
    newTeams[gameState.currentTeamIndex] = { ...newTeams[gameState.currentTeamIndex], facing: dirs[newIdx] };

    setGameState(prev => ({ ...prev, teams: newTeams, remainingMoves: prev.remainingMoves - 1 }));
  };

  const handleLocationPowerup = (locId: string, team: PlayerTeam) => {
    if (team.lastLocationRewardId === locId) return;
    let message = "";
    let icon = <Zap size={24} className="text-white" />;
    switch (locId) {
      case 'conv_store': team.nextRollBonus = 2; message = "Energy Drink! +2 next roll."; break;
      case 'supermarket': team.nextRollBonus = 1; message = "Fresh Apple! +1 next roll."; icon = <Apple size={24} className="text-white" />; break;
      case 'post_office': team.nextRollBonus = 1; message = "Express Mail! +1 next roll."; icon = <Mail size={24} className="text-white" />; break;
      case 'bank': team.coins += 2; message = "Cash Back! +2 Coins."; icon = <Coins size={24} className="text-white" />; break;
      case 'school': team.nextRollBonus = 1; message = "Recess! +1 next roll."; icon = <RotateCw size={24} className="text-white" />; break;
      case 'park': team.coins += 1; message = "Found a coin! +1 Coin."; icon = <MapPin size={24} className="text-white" />; break;
      case 'fire_station': team.nextRollBonus = 2; message = "Rescue Speed! +2 next roll."; icon = <Flame size={24} className="text-white" />; break;
      case 'police_station': team.nextRollBonus = 1; message = "Escort! +1 next roll."; icon = <Shield size={24} className="text-white" />; break;
      case 'mall': team.coins += 1; message = "Gift Card! +1 Coin."; icon = <ShoppingBag size={24} className="text-white" />; break;
      case 'stadium': team.nextRollBonus = 2; message = "Victory Lap! +2 next roll."; icon = <TrophyIcon size={24} className="text-white" />; break;
      case 'train_station': team.freeBus = true; message = "Free Pass! Next bus is free."; icon = <Ticket size={24} className="text-white" />; break;
      case 'yen_store': team.coins += 2; message = "Huge Bargain! +2 Coins."; icon = <Coins size={24} className="text-white" />; break;
    }
    team.lastLocationRewardId = locId;
    setLocationPowerupMsg({msg: message, icon});
    setTimeout(() => setLocationPowerupMsg(null), 3500);
  };

  const checkInteractions = (x: number, y: number, teams: PlayerTeam[]) => {
    const team = teams[gameState.currentTeamIndex];
    let triggered = false;
    
    const currentTileChar = GRID_LAYOUT[y][x];
    const type = getTileType(currentTileChar);

    if (type === TileType.BUS_STOP) {
      setGameState(prev => ({ ...prev, phase: 'BUS_OFFER' }));
      triggered = true;
    }

    if (currentTileChar.startsWith('B')) {
      const bIdx = parseInt(currentTileChar.substring(1)) - 1;
      const loc = LOCATIONS[bIdx];
      handleLocationPowerup(loc.id, team);
      if (team.destinations.includes(loc.id) && !team.visited.includes(loc.id)) {
        const wasFinished = team.visited.length === team.destinations.length;
        team.visited = [...team.visited, loc.id];
        if (!wasFinished && team.visited.length === team.destinations.length) notifyHeadHome(team);
      }
    }

    if (currentTileChar.startsWith('H')) {
      const hId = currentTileChar === 'H1' ? 'home_1' : currentTileChar === 'H2' ? 'home_2' : currentTileChar === 'H3' ? 'home_3' : 'home_4';
      if (team.startHomeId === hId && team.visited.length === team.destinations.length) {
        setGameState(prev => ({ ...prev, phase: 'GAME_OVER' }));
        triggered = true;
      }
    }

    if (type === TileType.QUESTION) {
      triggerQuestion();
      triggered = true;
    }

    return triggered;
  };

  const notifyHeadHome = (team: PlayerTeam) => {
    const home = HOMES.find(h => h.id === team.startHomeId);
    setLocationPowerupMsg({
      msg: `Quest Complete! Return to ${home?.name}!`,
      icon: <Home size={24} className="text-white animate-bounce" />
    });
    setTimeout(() => setLocationPowerupMsg(null), 5000);
  };

  const triggerQuestion = async () => {
    setIsProcessing(true);
    try {
      const q = await generateEnglishQuestion();
      setActiveQuestion(q);
      setGameState(prev => ({ ...prev, phase: 'QUESTION' }));
    } catch (e) {
      console.error(e);
      setGameState(prev => ({ ...prev, phase: 'MOVING' }));
    } finally { setIsProcessing(false); }
  };

  const handleQuestionResult = (correct: boolean) => {
    setActiveQuestion(null);
    if (correct) {
      const isRedLightReward = Math.random() > 0.6; 
      const newTeams = [...gameState.teams];
      if (!isRedLightReward) {
        newTeams[gameState.currentTeamIndex] = { ...newTeams[gameState.currentTeamIndex], coins: newTeams[gameState.currentTeamIndex].coins + 3 };
        setGameState(prev => ({ ...prev, teams: newTeams, phase: 'MOVING' }));
      } else {
        setGameState(prev => ({ ...prev, phase: 'POWERUP_SELECT' }));
      }
    } else {
      setGameState(prev => ({ ...prev, phase: 'MOVING' }));
    }
  };

  const selectRedLight = (x: number, y: number) => {
    if (getTileType(GRID_LAYOUT[y][x]) !== TileType.CROSSWALK) return;
    setGameState(prev => ({ ...prev, redLightPos: { x, y }, redLightTurns: 2, phase: 'MOVING' }));
  };

  const startBusRide = (routeId: 'CW' | 'CCW') => {
    if (!currentTeam) return;
    const stop = BUS_STOPS.find(s => s.x === currentTeam.position.x && s.y === currentTeam.position.y);
    if (!stop) return;

    const newTeams = [...gameState.teams];
    newTeams[gameState.currentTeamIndex].busStatus = { routeId, currentStopId: stop.id };
    setGameState(prev => ({ ...prev, teams: newTeams, remainingMoves: 0 }));
    endTurn();
  };

  const moveBusOneStop = (stayOn: boolean) => {
    if (!currentTeam || !currentTeam.busStatus) return;
    
    if (!stayOn) {
      const newTeams = [...gameState.teams];
      newTeams[gameState.currentTeamIndex].busStatus = undefined;
      setGameState(prev => ({ ...prev, teams: newTeams }));
      endTurn();
      return;
    }

    if (currentTeam.coins <= 0 && !currentTeam.freeBus) {
      moveBusOneStop(false);
      return;
    }

    const { routeId, currentStopId } = currentTeam.busStatus;
    const route = BUS_ROUTES[routeId];
    const currentIndex = route.indexOf(currentStopId);
    const nextStopId = route[(currentIndex + 1) % route.length];
    const nextStop = BUS_STOPS.find(s => s.id === nextStopId)!;

    const newTeams = [...gameState.teams];
    const team = newTeams[gameState.currentTeamIndex];
    team.position = { x: nextStop.x, y: nextStop.y };
    team.busStatus = { routeId, currentStopId: nextStopId };
    
    if (team.freeBus) team.freeBus = false;
    else team.coins -= 1;

    setGameState(prev => ({ ...prev, teams: newTeams }));
    endTurn();
  };

  const endTurn = useCallback(() => {
    setGameState(prev => {
      let nextTurns = prev.redLightTurns;
      let nextPos = prev.redLightPos;
      if (nextTurns > 0) {
        nextTurns--;
        if (nextTurns === 0) nextPos = null;
      }
      const updatedTeams = [...prev.teams];
      updatedTeams[prev.currentTeamIndex] = { ...updatedTeams[prev.currentTeamIndex], lastLocationRewardId: undefined };

      return {
        ...prev,
        teams: updatedTeams,
        currentTeamIndex: (prev.currentTeamIndex + 1) % prev.teams.length,
        diceRoll: 0,
        remainingMoves: 0,
        phase: 'ROLLING',
        redLightTurns: nextTurns,
        redLightPos: nextPos
      };
    });
  }, []);

  const endTurnEarly = () => { if (gameState.phase === 'MOVING') endTurn(); };

  useEffect(() => {
    if (gameState.phase === 'MOVING' && gameState.remainingMoves === 0 && !isProcessing && !activeQuestion && !locationPowerupMsg) {
      const timer = setTimeout(() => {
        setGameState(current => {
          if (current.phase === 'MOVING' && current.remainingMoves === 0) endTurn();
          return current;
        });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.remainingMoves, endTurn, isProcessing, activeQuestion, locationPowerupMsg]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-sky-100 flex flex-col items-center justify-center relative font-fredoka">
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-10">
        <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-lg border-2 border-emerald-500 pointer-events-auto">
          <h1 className="text-2xl font-bold text-emerald-600 flex items-center gap-2 uppercase tracking-tighter">
            <MapPin className="text-emerald-500" /> Town Talker
          </h1>
          {currentTeam && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-2xl border-2 border-emerald-200 min-w-[180px] animate-in slide-in-from-left duration-300 shadow-sm">
              <div className="font-bold flex items-center gap-2 text-lg">
                <span className="text-2xl">{currentTeam.emoji}</span> {currentTeam.name}
              </div>
              <div className="flex flex-col mt-2 gap-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 font-black text-amber-600">
                    <Coins size={18} className="text-amber-500" /> {currentTeam.coins}
                  </div>
                  <div className="text-[10px] font-black text-slate-500 uppercase">
                    Visited: {currentTeam.visited.length}/{currentTeam.destinations.length}
                  </div>
                </div>
                <div className="flex gap-2">
                  {currentTeam.nextRollBonus > 0 && <div className="bg-orange-100 text-orange-600 text-[9px] px-2 py-0.5 rounded-full border border-orange-200 font-bold flex items-center gap-1"> <Zap size={10} /> +{currentTeam.nextRollBonus} Next </div>}
                  {currentTeam.freeBus && <div className="bg-blue-100 text-blue-600 text-[9px] px-2 py-0.5 rounded-full border border-blue-200 font-bold flex items-center gap-1"> <Ticket size={10} /> Free Bus </div>}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {gameState.phase === 'MOVING' && (
          <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-lg border-2 border-blue-500 flex flex-col items-center animate-bounce pointer-events-auto mr-4">
            <span className="text-xs text-blue-600 font-bold uppercase">Moves</span>
            <span className="text-4xl font-black text-blue-600">{gameState.remainingMoves}</span>
          </div>
        )}
      </div>

      <div className="absolute top-0 w-full flex flex-col items-center pt-4 z-50 pointer-events-none gap-3">
        {gameState.phase === 'POWERUP_SELECT' && (
          <div className="bg-rose-500 px-10 py-4 rounded-full shadow-2xl border-4 border-white flex items-center gap-5 animate-in slide-in-from-top duration-500 pointer-events-auto ring-8 ring-rose-500/20">
            <TrafficCone className="text-white animate-bounce" size={32} />
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-white uppercase">Red Light!</h2>
              <p className="text-rose-100 text-sm font-bold">Tap a Crosswalk to block it!</p>
            </div>
          </div>
        )}
        {locationPowerupMsg && (
          <div className="bg-emerald-500 px-10 py-4 rounded-full shadow-2xl border-4 border-white flex items-center gap-4 animate-in slide-in-from-top duration-500 pointer-events-auto">
            <div className="bg-white/20 p-2 rounded-full">{locationPowerupMsg.icon}</div>
            <h2 className="text-xl font-black text-white">{locationPowerupMsg.msg}</h2>
          </div>
        )}
      </div>

      <div 
        className="board-container flex items-center justify-center cursor-move touch-none h-full w-full"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <div className="transition-transform duration-500 ease-out will-change-transform" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }} ref={boardRef}>
          <div className="grid gap-0 bg-slate-300 border-4 border-slate-400 shadow-2xl p-1 select-none pointer-events-none" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 70px)`, gridTemplateRows: `repeat(${BOARD_SIZE}, 70px)` }}>
            {GRID_LAYOUT.map((row, y) => 
              row.map((cell, x) => {
                const type = getTileType(cell);
                let bgColor = 'bg-slate-100', label = '', icon = null;

                if (type === TileType.ROAD) bgColor = 'bg-slate-700';
                if (type === TileType.CROSSWALK) bgColor = 'bg-slate-400 border-x-4 border-white';
                if (type === TileType.SIDEWALK) bgColor = 'bg-slate-200 border border-slate-300';
                if (type === TileType.GRASS) bgColor = 'bg-lime-200';
                if (type === TileType.BUS_STOP) {
                  const stop = BUS_STOPS.find(s => s.x === x && s.y === y);
                  bgColor = 'bg-blue-100 border-2 border-blue-400';
                  icon = <div className="flex flex-col items-center">
                    <Bus size={20} className="text-blue-500" />
                    <span className="text-[12px] font-black text-blue-700">#{stop?.id}</span>
                  </div>;
                }
                if (type === TileType.QUESTION) { bgColor = 'bg-amber-100 border-2 border-amber-400'; icon = <span className="text-3xl font-black text-amber-500">?</span>; }
                if (type === TileType.HOME) {
                  const hId = cell === 'H1' ? 'home_1' : cell === 'H2' ? 'home_2' : cell === 'H3' ? 'home_3' : 'home_4';
                  const home = HOMES.find(h => h.id === hId);
                  bgColor = home?.color || ''; icon = <MapPin size={28} className="text-white" />;
                  if (currentTeam?.startHomeId === hId && currentTeam?.visited.length === currentTeam?.destinations.length) bgColor += ' ring-8 ring-yellow-400 ring-offset-2 animate-pulse z-30';
                }
                if (type === TileType.BUILDING) {
                  const bIdx = parseInt(cell.substring(1)) - 1;
                  const loc = LOCATIONS[bIdx];
                  bgColor = loc.color; label = loc.name; icon = <LocationIcon id={loc.id} />;
                  if (currentTeam?.destinations.includes(loc.id)) bgColor += ' ring-4 ring-yellow-400 ring-inset animate-pulse';
                  if (currentTeam?.visited.includes(loc.id)) icon = <div className="relative"><LocationIcon id={loc.id} /><div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5"><Check size={12} className="text-white" /></div></div>;
                }

                const isRedLight = gameState.redLightPos?.x === x && gameState.redLightPos?.y === y;
                const isPossibleMove = gameState.phase === 'MOVING' && gameState.remainingMoves > 0 && canMoveTo(x, y) && Math.abs(x - (currentTeam?.position.x || 0)) + Math.abs(y - (currentTeam?.position.y || 0)) <= gameState.remainingMoves;

                return (
                  <div key={`${x}-${y}`} className={`w-[70px] h-[70px] relative flex flex-col items-center justify-between text-[8px] font-bold text-center p-1 transition-all duration-300 pointer-events-auto overflow-hidden ${bgColor} ${isRedLight ? 'bg-red-900 border-4 border-red-500' : ''} ${isPossibleMove ? 'sidewalk-flash' : ''} ${gameState.phase === 'POWERUP_SELECT' && type === TileType.CROSSWALK ? 'cursor-pointer hover:scale-110 ring-4 ring-rose-500 ring-offset-2' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (gameState.phase === 'POWERUP_SELECT') selectRedLight(x, y);
                    }}>
                    <div className="flex-1 flex items-center justify-center w-full mt-1">{icon}</div>
                    {label && <div className="w-full bg-black/40 backdrop-blur-sm text-white py-0.5 px-0.5 rounded-sm truncate">{label}</div>}
                    {isRedLight && <TrafficCone className="text-red-500 animate-bounce absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={32} />}
                    {gameState.teams.map((t) => (
                      t.position.x === x && t.position.y === y && (
                        <div key={t.id} className={`absolute inset-2 rounded-full ${t.color} border-2 border-white shadow-xl z-20 transition-all duration-500 flex items-center justify-center pointer-events-none`}
                          style={{ transform: `rotate(${t.facing === 'UP' ? -90 : t.facing === 'DOWN' ? 90 : t.facing === 'LEFT' ? 180 : 0}deg)` }}>
                          <span className="text-2xl" style={{ transform: `rotate(${(t.facing === 'UP' ? 90 : t.facing === 'DOWN' ? -90 : t.facing === 'LEFT' ? 180 : 0)}deg)` }}>{t.emoji}</span>
                          <ChevronRight className="absolute -right-3 text-white drop-shadow-md bg-emerald-500 rounded-full border-2 border-white" size={24} strokeWidth={4} />
                        </div>
                      )
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center">
        {gameState.phase === 'TEAM_COUNT' && (
          <div className="bg-white p-10 rounded-[40px] shadow-2xl border-8 border-emerald-400 flex flex-col items-center gap-6 pointer-events-auto animate-in zoom-in duration-300">
            <Users size={60} className="text-emerald-500" />
            <h2 className="text-4xl font-black text-emerald-600 text-center uppercase tracking-tighter">New Town Game</h2>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(num => (
                <button key={num} onClick={() => selectTeamCount(num)} className="w-16 h-16 bg-emerald-500 rounded-2xl text-white font-black text-2xl hover:scale-110 active:scale-95 transition-all shadow-lg">{num}</button>
              ))}
            </div>
          </div>
        )}

        {gameState.phase === 'TEAM_CUSTOMIZATION' && (
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border-8 border-blue-400 max-w-4xl w-full mx-4 flex flex-col items-center gap-6 pointer-events-auto animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-blue-600 uppercase">Team Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-h-[60vh] overflow-y-auto p-2">
              {gameState.teams.map(team => (
                <div key={team.id} className="bg-blue-50 p-4 rounded-3xl border-2 border-blue-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full ${team.color} flex items-center justify-center text-3xl shadow-inner`}>{team.emoji}</div>
                    <input className="bg-white border-2 border-blue-200 rounded-xl px-4 py-2 font-bold w-full" value={team.name} onChange={(e) => updateTeamCustomization(team.id, { name: e.target.value })} />
                  </div>
                  <div className="flex flex-wrap gap-2">{PLAYER_EMOJIS.map(emo => (
                    <button key={emo} onClick={() => updateTeamCustomization(team.id, { emoji: emo })} className={`text-2xl p-2 rounded-xl transition-all ${team.emoji === emo ? 'bg-blue-500 scale-110 shadow-lg' : 'bg-white hover:bg-blue-100'}`}>{emo}</button>
                  ))}</div>
                </div>
              ))}
            </div>
            <button onClick={startGame} className="bg-emerald-500 text-white px-12 py-4 rounded-3xl font-black text-2xl shadow-xl hover:bg-emerald-600 transition-all mt-4 uppercase">Let's Explore!</button>
          </div>
        )}

        {gameState.phase === 'ROLLING' && (
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border-8 border-yellow-400 flex flex-col items-center gap-4 pointer-events-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-3"><span className="text-4xl">{currentTeam?.emoji}</span><span className="text-2xl font-black text-slate-700">{currentTeam?.name}'s Turn</span></div>
            <button onClick={rollDice} className="bg-yellow-400 p-8 rounded-3xl text-white font-black text-4xl hover:bg-yellow-500 active:scale-95 transition-all shadow-2xl flex items-center gap-6 uppercase"><Dices size={50} /> Roll!</button>
          </div>
        )}

        {gameState.phase === 'MOVING' && gameState.remainingMoves > 0 && (
          <div className="fixed bottom-6 bg-white/95 backdrop-blur-md p-4 rounded-[40px] shadow-2xl border-2 border-blue-500 flex items-center gap-5 pointer-events-auto animate-in slide-in-from-bottom duration-300">
            <button onClick={() => turn('LEFT')} className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 active:scale-90 transition-all shadow-md">
              <RotateCw className="scale-x-[-1]" size={20} />
            </button>
            <div className="flex flex-col items-center gap-2">
              <button onClick={moveForward} className="w-16 h-16 bg-emerald-500 text-white rounded-full flex flex-col items-center justify-center hover:bg-emerald-600 active:scale-90 transition-all shadow-lg ring-4 ring-emerald-500/20">
                <ArrowUp size={24} />
                <span className="font-black -mt-1 uppercase text-[10px]">Go</span>
              </button>
              <button onClick={endTurnEarly} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full font-black text-[9px] uppercase border border-rose-100 hover:bg-rose-100 transition-all">End Turn</button>
            </div>
            <button onClick={() => turn('RIGHT')} className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 active:scale-90 transition-all shadow-md">
              <RotateCw size={20} />
            </button>
          </div>
        )}

        {gameState.phase === 'BUS_OFFER' && (
          <div className="bg-white p-6 rounded-[40px] shadow-2xl border-4 border-blue-400 flex flex-col items-center gap-4 pointer-events-auto animate-in zoom-in duration-300 max-w-sm w-full">
            <Bus size={40} className="text-blue-500" />
            <div className="text-center">
              <h2 className="text-xl font-black text-blue-600 uppercase">Bus Stop!</h2>
              <p className="text-sm font-bold text-slate-600">Want to ride? It costs 1 Coin per stop.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button onClick={() => startBusRide('CW')} className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-2xl font-black flex flex-col items-center gap-1 shadow-md transition-all active:scale-95 text-xs">
                <RotateCw size={20} /> Clockwise
              </button>
              <button onClick={() => startBusRide('CCW')} className="bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-2xl font-black flex flex-col items-center gap-1 shadow-md transition-all active:scale-95 text-xs">
                <RotateCw className="scale-x-[-1]" size={20} /> Counter-Clock
              </button>
              <button onClick={() => setGameState(prev => ({ ...prev, phase: 'MOVING' }))} className="col-span-2 bg-slate-200 hover:bg-slate-300 text-slate-600 p-2 rounded-2xl font-black shadow-sm transition-all active:scale-95 text-xs uppercase">Walk Instead</button>
            </div>
          </div>
        )}

        {gameState.phase === 'BUS_TRAVEL' && (
          <div className="bg-white/95 p-6 rounded-[40px] shadow-2xl border-4 border-emerald-400 flex flex-col items-center gap-4 pointer-events-auto animate-in zoom-in duration-300 max-w-[240px] w-full">
            <Bus size={40} className="text-emerald-500 animate-bounce" />
            <div className="text-center">
              <h2 className="text-xl font-black text-emerald-600 uppercase">Beep Beep!</h2>
              <p className="text-sm font-bold text-slate-600">Stop #{currentTeam?.busStatus?.currentStopId}. Stay on?</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button onClick={() => moveBusOneStop(true)} disabled={currentTeam && currentTeam.coins <= 0 && !currentTeam.freeBus}
                className={`bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-2xl font-black flex flex-col items-center gap-1 shadow-md transition-all active:scale-95 text-xs ${currentTeam && currentTeam.coins <= 0 && !currentTeam.freeBus ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
                <ArrowUp size={20} /> Next Stop (-1)
              </button>
              <button onClick={() => moveBusOneStop(false)} className="bg-rose-500 hover:bg-rose-600 text-white p-4 rounded-2xl font-black flex flex-col items-center gap-1 shadow-md transition-all active:scale-95 text-xs">
                <CircleStop size={20} /> Get Off
              </button>
            </div>
          </div>
        )}

        {gameState.phase === 'QUESTION' && activeQuestion && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-white p-10 rounded-[50px] shadow-2xl border-8 border-amber-400 max-w-xl w-full flex flex-col items-center gap-8 animate-in zoom-in duration-300 pointer-events-auto">
              <div className="bg-amber-100 px-8 py-3 rounded-full border-4 border-amber-200"><h2 className="text-3xl font-black text-amber-700 uppercase">Challenge!</h2></div>
              {activeQuestion.type === 'COLOR' && activeQuestion.color && (<div className="flex flex-col items-center gap-4 scale-125"><CssDog color={activeQuestion.color} /><p className="text-slate-400 text-sm italic">Hint: {activeQuestion.hint}</p></div>)}
              <p className="text-4xl font-black text-center text-slate-800 leading-snug">"{activeQuestion.question}"</p>
              <div className="grid grid-cols-2 gap-8 w-full">
                <button onClick={() => handleQuestionResult(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white p-8 rounded-[35px] font-black text-3xl flex flex-col items-center gap-3 shadow-xl transition-all active:scale-95 uppercase"><Check size={50} /> Correct</button>
                <button onClick={() => handleQuestionResult(false)} className="bg-rose-500 hover:bg-rose-600 text-white p-8 rounded-[35px] font-black text-3xl flex flex-col items-center gap-3 shadow-xl transition-all active:scale-95 uppercase"><X size={50} /> Wrong</button>
              </div>
            </div>
          </div>
        )}

        {gameState.phase === 'GAME_OVER' && (
          <div className="fixed inset-0 bg-white/95 z-[100] flex flex-col items-center justify-center p-8 text-center pointer-events-auto">
            <div className="text-9xl mb-6">{currentTeam?.emoji}</div>
            <Trophy className="text-yellow-400 w-40 h-40 animate-bounce absolute" />
            <h1 className="text-7xl font-black text-emerald-600 mt-4 uppercase tracking-tighter">{currentTeam?.name} wins!</h1>
            <button onClick={() => window.location.reload()} className="mt-16 bg-emerald-500 text-white px-16 py-8 rounded-full font-black text-4xl shadow-2xl hover:bg-emerald-600 transition-all active:scale-95 uppercase">New Game</button>
          </div>
        )}
      </div>

      {gameState.phase !== 'TEAM_COUNT' && gameState.phase !== 'TEAM_CUSTOMIZATION' && currentTeam && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur p-6 rounded-[35px] border-4 border-indigo-400 shadow-xl w-56 animate-in slide-in-from-right duration-500">
            <h4 className="text-indigo-600 font-black mb-4 text-xs uppercase tracking-widest text-center border-b-2 border-indigo-100 pb-2">Destinations</h4>
            {currentTeam.destinations.map(destId => {
              const loc = LOCATIONS.find(l => l.id === destId);
              const visited = currentTeam.visited.includes(destId);
              return (
                <div key={destId} className={`flex items-center gap-3 mb-3 p-3 rounded-2xl transition-all ${visited ? 'bg-emerald-100 opacity-60' : 'bg-indigo-50 border-indigo-200 border-2'}`}>
                  {visited ? <Check className="text-emerald-500 shrink-0" size={20} /> : <MapPin className="text-indigo-500 shrink-0" size={20} />}
                  <span className={`text-[12px] font-black leading-tight ${visited ? 'line-through text-slate-500' : 'text-indigo-700'}`}>{loc?.name}</span>
                </div>
              );
            })}
            {currentTeam.visited.length === currentTeam.destinations.length && <div className="bg-yellow-500 p-3 rounded-2xl text-white text-center font-black animate-pulse text-[10px] mt-4 uppercase flex items-center justify-center gap-2"><Home size={16} /> Go Home!</div>}
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-[200] flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 border-[12px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-emerald-800 font-black text-3xl animate-pulse uppercase">Thinking...</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-6 text-slate-400 text-[10px] font-black opacity-30 pointer-events-none uppercase tracking-widest"> Drag: Pan • Pinch: Zoom • Stop: Bus Ride </div>
    </div>
  );
};

export default App;
