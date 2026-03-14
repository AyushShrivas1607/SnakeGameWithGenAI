import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, RefreshCw } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 120;

const TRACKS = [
  { id: 1, title: 'Neon Dreams (AI Gen)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Cybernetic Pulse (AI Gen)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'Synthwave Horizon (AI Gen)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function App() {
  // Music Player State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Snake Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);

  // Refs for game loop to avoid dependency issues in setInterval
  const snakeRef = useRef(snake);
  const directionRef = useRef(direction);
  const foodRef = useRef(food);
  const gameOverRef = useRef(gameOver);
  const isGameStartedRef = useRef(isGameStarted);

  useEffect(() => {
    snakeRef.current = snake;
    directionRef.current = direction;
    foodRef.current = food;
    gameOverRef.current = gameOver;
    isGameStartedRef.current = isGameStarted;
  }, [snake, direction, food, gameOver, isGameStarted]);

  // Music Player Effects
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  const toggleMute = () => setIsMuted(!isMuted);

  // Snake Game Logic
  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Ensure food doesn't spawn on snake
      const onSnake = snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setFood(generateFood());
    setIsGameStarted(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      if (!isGameStartedRef.current && !gameOverRef.current && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
         setIsGameStarted(true);
      }

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isGameStarted || gameOver) return;

    const moveSnake = () => {
      const currentSnake = [...snakeRef.current];
      const head = { ...currentSnake[0] };
      const dir = directionRef.current;

      head.x += dir.x;
      head.y += dir.y;

      // Check collisions
      if (
        head.x < 0 || head.x >= GRID_SIZE ||
        head.y < 0 || head.y >= GRID_SIZE ||
        currentSnake.some(segment => segment.x === head.x && segment.y === head.y)
      ) {
        setGameOver(true);
        return;
      }

      currentSnake.unshift(head);

      // Check food
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore(s => s + 10);
        setFood(generateFood());
      } else {
        currentSnake.pop();
      }

      setSnake(currentSnake);
    };

    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [isGameStarted, gameOver, generateFood]);

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-50 font-mono flex flex-col items-center justify-center p-4 selection:bg-pink-500/30">
      {/* Header & Music Player */}
      <div className="w-full max-w-2xl mb-8 p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
              NEON SNAKE
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-cyan-300/70">
              {isPlaying && <span className="animate-pulse text-pink-500">â«</span>}
              <p className="truncate max-w-[200px]">{TRACKS[currentTrackIndex].title}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={prevTrack} className="p-2 rounded-full hover:bg-cyan-500/20 text-cyan-400 transition-colors cursor-pointer">
              <SkipBack size={24} />
            </button>
            <button
              onClick={togglePlay}
              className="p-4 rounded-full bg-cyan-500/10 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-slate-950 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all cursor-pointer"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>
            <button onClick={nextTrack} className="p-2 rounded-full hover:bg-cyan-500/20 text-cyan-400 transition-colors cursor-pointer">
              <SkipForward size={24} />
            </button>
            <div className="w-px h-8 bg-cyan-500/30 mx-2"></div>
            <button onClick={toggleMute} className="p-2 rounded-full hover:bg-cyan-500/20 text-cyan-400 transition-colors cursor-pointer">
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>
        </div>
        <audio
          ref={audioRef}
          src={TRACKS[currentTrackIndex].url}
          onEnded={nextTrack}
          loop={false}
          className="hidden"
        />
      </div>

      {/* Game Area */}
      <div className="relative flex flex-col items-center">
        {/* Score Display */}
        <div className="absolute -top-12 w-full flex justify-between items-end px-2">
          <div className="text-xl font-bold text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
            SCORE: {score.toString().padStart(4, '0')}
          </div>
        </div>

        {/* Game Board */}
        <div
          className="relative bg-slate-900 border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.2)] rounded-lg overflow-hidden"
          style={{
            width: `${GRID_SIZE * 20}px`,
            height: `${GRID_SIZE * 20}px`,
            backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {!isGameStarted && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10">
              <p className="text-cyan-400 animate-pulse text-lg text-center px-4">Press any arrow key<br/>to start</p>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md z-10">
              <h2 className="text-4xl font-bold text-pink-500 mb-2 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]">GAME OVER</h2>
              <p className="text-cyan-300 mb-6">Final Score: {score}</p>
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-slate-950 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all font-bold tracking-wider cursor-pointer"
              >
                <RefreshCw size={20} />
                PLAY AGAIN
              </button>
            </div>
          )}

          {/* Food */}
          <div
            className="absolute bg-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,1)]"
            style={{
              width: '20px',
              height: '20px',
              left: `${food.x * 20}px`,
              top: `${food.y * 20}px`,
              transform: 'scale(0.8)'
            }}
          />

          {/* Snake */}
          {snake.map((segment, index) => {
            const isHead = index === 0;
            return (
              <div
                key={`${segment.x}-${segment.y}-${index}`}
                className={`absolute rounded-sm ${isHead ? 'bg-cyan-300 shadow-[0_0_15px_rgba(103,232,249,0.8)] z-10' : 'bg-cyan-600/80 border border-cyan-400/30'}`}
                style={{
                  width: '20px',
                  height: '20px',
                  left: `${segment.x * 20}px`,
                  top: `${segment.y * 20}px`,
                  transform: isHead ? 'scale(0.95)' : 'scale(0.85)',
                }}
              />
            );
          })}
        </div>

        {/* Mobile Controls */}
        <div className="mt-8 grid grid-cols-3 gap-2 md:hidden">
          <div />
          <button onClick={() => { if (direction.y !== 1) setDirection({ x: 0, y: -1 }); setIsGameStarted(true); }} className="p-4 bg-slate-800 rounded-lg border border-cyan-500/30 active:bg-cyan-500/20 text-cyan-400 flex justify-center items-center">â</button>
          <div />
          <button onClick={() => { if (direction.x !== 1) setDirection({ x: -1, y: 0 }); setIsGameStarted(true); }} className="p-4 bg-slate-800 rounded-lg border border-cyan-500/30 active:bg-cyan-500/20 text-cyan-400 flex justify-center items-center">â</button>
          <button onClick={() => { if (direction.y !== -1) setDirection({ x: 0, y: 1 }); setIsGameStarted(true); }} className="p-4 bg-slate-800 rounded-lg border border-cyan-500/30 active:bg-cyan-500/20 text-cyan-400 flex justify-center items-center">â</button>
          <button onClick={() => { if (direction.x !== -1) setDirection({ x: 1, y: 0 }); setIsGameStarted(true); }} className="p-4 bg-slate-800 rounded-lg border border-cyan-500/30 active:bg-cyan-500/20 text-cyan-400 flex justify-center items-center">â</button>
        </div>
      </div>
    </div>
  );
}
