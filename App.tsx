
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { GameState, ObstacleData, CoinData } from './types';
import { SETTINGS } from './constants';
import { Player } from './components/Player';
import { Obstacle } from './components/Obstacle';
import { Coin } from './components/Coin';
import { Road } from './components/Road';
import { Sky } from './components/Sky';
import { ParticleEffect } from './components/Particles';

interface ParticleBurst {
  id: string;
  position: [number, number, number];
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lane, setLane] = useState(1);
  const [speed, setSpeed] = useState(SETTINGS.baseSpeed);
  const [obstacles, setObstacles] = useState<ObstacleData[]>([]);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [zPos, setZPos] = useState(0);
  const [yPos, setYPos] = useState(0);
  const [bursts, setBursts] = useState<ParticleBurst[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const coinAudioRef = useRef<HTMLAudioElement | null>(null);
  const runningAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const zPosRef = useRef(0);
  const yPosRef = useRef(0);
  const vyRef = useRef(0);
  const lastObstacleZ = useRef(0);
  const lastCoinZ = useRef(0);
  const scoreRef = useRef(0);
  const coinRef = useRef(0);

  // Audio setup - Using more direct stable links
  useEffect(() => {
    // Background Music (Sunflower vibe)
    const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    // Coin Sfx - Direct Mixkit link
    const coinSfx = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    coinSfx.volume = 0.6;
    coinAudioRef.current = coinSfx;

    // Running Sfx - Footsteps
    const runSfx = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    runSfx.loop = true;
    runSfx.volume = 0.3;
    runningAudioRef.current = runSfx;
    
    return () => {
      audio.pause();
      runSfx.pause();
    };
  }, []);

  // Sync mute state
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
    if (coinAudioRef.current) coinAudioRef.current.muted = isMuted;
    if (runningAudioRef.current) runningAudioRef.current.muted = isMuted;
  }, [isMuted]);

  // Handle music and running sound transitions
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      runningAudioRef.current?.play().catch(() => {});
    } else {
      runningAudioRef.current?.pause();
    }
  }, [gameState]);

  // Intro Logic
  useEffect(() => {
    if (gameState === GameState.INTRO) {
      const timer = setTimeout(() => setGameState(GameState.MENU), 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Persistent Storage
  useEffect(() => {
    const saved = localStorage.getItem('benrunner_top');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = useCallback(() => {
    // CRITICAL: Unlock all audio on user interaction
    const unlockAudio = async (el: HTMLAudioElement | null) => {
        if (!el) return;
        try {
            // Play and immediately pause to "prime" the browser's audio context
            await el.play();
            if (el !== audioRef.current && el !== runningAudioRef.current) {
                el.pause();
                el.currentTime = 0;
            }
        } catch (e) {
            console.warn("Audio priming failed:", e);
        }
    };

    unlockAudio(audioRef.current);
    unlockAudio(coinAudioRef.current);
    unlockAudio(runningAudioRef.current);

    setGameState(GameState.PLAYING);
    setScore(0);
    setCoinsCollected(0);
    scoreRef.current = 0;
    coinRef.current = 0;
    setZPos(0);
    zPosRef.current = 0;
    setYPos(0);
    yPosRef.current = 0;
    vyRef.current = 0;
    setLane(1);
    setSpeed(SETTINGS.baseSpeed);
    setObstacles([]);
    setCoins([]);
    setBursts([]);
    lastObstacleZ.current = -40;
    lastCoinZ.current = -20;
  }, []);

  const jump = useCallback(() => {
    if (yPosRef.current < 0.1) {
      vyRef.current = SETTINGS.jumpStrength;
      // Pause running sound while in air
      runningAudioRef.current?.pause();
    }
  }, []);

  const gameOver = useCallback(() => {
    setGameState(GameState.GAMEOVER);
    runningAudioRef.current?.pause();
    const finalScore = scoreRef.current;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('benrunner_top', finalScore.toString());
    }
  }, [highScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') setLane(p => Math.max(0, p - 1));
      else if (e.key === 'ArrowRight' || e.key === 'd') setLane(p => Math.min(SETTINGS.lanes - 1, p + 1));
      else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') jump();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, jump]);

  // Main Loop
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    let frameId: number;
    const loop = () => {
      zPosRef.current -= speed;
      setZPos(zPosRef.current);
      
      scoreRef.current += 1;
      if (scoreRef.current % 10 === 0) setScore(scoreRef.current);
      setSpeed(s => {
        const nextSpeed = Math.min(SETTINGS.maxSpeed, s + SETTINGS.acceleration);
        if (runningAudioRef.current) {
            runningAudioRef.current.playbackRate = 1.0 + (nextSpeed / SETTINGS.maxSpeed) * 0.5;
        }
        return nextSpeed;
      });

      yPosRef.current += vyRef.current;
      vyRef.current -= SETTINGS.gravity;
      
      if (yPosRef.current < 0) { 
        if (yPosRef.current !== 0 && gameState === GameState.PLAYING) {
            // Resumed running sound on landing
            runningAudioRef.current?.play().catch(() => {});
        }
        yPosRef.current = 0; 
        vyRef.current = 0; 
      }
      setYPos(yPosRef.current);

      if (zPosRef.current < lastObstacleZ.current - 20) {
        const newObstacle: ObstacleData = {
          id: Math.random().toString(),
          z: zPosRef.current - 130,
          lane: Math.floor(Math.random() * SETTINGS.lanes),
          type: 'thorns'
        };
        setObstacles(prev => [...prev.filter(o => o.z > zPosRef.current - 250), newObstacle]);
        lastObstacleZ.current = zPosRef.current - (Math.random() * 25 + 30);
      }

      if (zPosRef.current < lastCoinZ.current - 12) {
        const newCoin: CoinData = {
          id: Math.random().toString(),
          z: zPosRef.current - 110,
          lane: Math.floor(Math.random() * SETTINGS.lanes),
          collected: false
        };
        setCoins(prev => [...prev.filter(c => c.z > zPosRef.current - 250), newCoin]);
        lastCoinZ.current = zPosRef.current - (Math.random() * 8 + 10);
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [gameState, speed]);

  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;
    const playerX = (lane - 1) * SETTINGS.laneWidth;

    const hit = obstacles.find(o => {
        const ox = (o.lane - 1) * SETTINGS.laneWidth;
        return Math.abs(o.z - zPosRef.current) < 1.4 && Math.abs(playerX - ox) < 1.1 && yPosRef.current < 2.5;
    });
    if (hit) gameOver();

    setCoins(prev => {
        const next = prev.map(c => {
            if (!c.collected && Math.abs(c.z - zPosRef.current) < 2.5 && Math.abs(playerX - (c.lane - 1) * SETTINGS.laneWidth) < 1.5) {
                // Play coin sound
                if (coinAudioRef.current) {
                  coinAudioRef.current.currentTime = 0;
                  coinAudioRef.current.play().catch(() => {});
                }

                // Trigger burst effect
                const burstX = (c.lane - 1) * SETTINGS.laneWidth;
                const newBurst: ParticleBurst = { 
                  id: Math.random().toString(), 
                  position: [burstX, 1.5, c.z] 
                };
                setBursts(b => [...b, newBurst]);
                
                coinRef.current += 1;
                setCoinsCollected(coinRef.current);
                return { ...c, collected: true };
            }
            return c;
        });
        return next;
    });

  }, [zPos, lane, obstacles, gameState, gameOver]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden text-white select-none font-sans">
      
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 6, zPos + 9]} rotation={[-0.4, 0, 0]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 15, zPos - 15]} intensity={60} color="#00ff00" />
        
        <Sky />
        
        {(gameState === GameState.PLAYING || gameState === GameState.GAMEOVER) && (
          <>
            <Player lane={lane} zPos={zPos} yPos={yPos} />
            {obstacles.map(o => <Obstacle key={o.id} lane={o.lane} z={o.z} />)}
            {coins.filter(c => !c.collected).map(c => <Coin key={c.id} lane={c.lane} z={c.z} />)}
            {bursts.map(b => (
              <ParticleEffect 
                key={b.id} 
                position={b.position} 
                onComplete={() => setBursts(prev => prev.filter(x => x.id !== b.id))} 
              />
            ))}
            <Road zOffset={zPos} />
          </>
        )}
        
        {(gameState === GameState.MENU || gameState === GameState.INTRO) && <Road zOffset={0} />}
      </Canvas>

      <div className="absolute inset-0 pointer-events-none">
        
        {/* Intro Branding */}
        {gameState === GameState.INTRO && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black transition-opacity duration-1000">
              <div className="flex flex-col items-center scale-110">
                <div className="flex flex-col items-center">
                  <h1 className="text-8xl font-black italic tracking-tighter text-green-500 drop-shadow-[0_0_30px_rgba(0,255,0,0.8)] animate-pulse">BEN-RUNNER</h1>
                  <h2 className="text-2xl font-light tracking-[0.8em] text-white mt-4 uppercase opacity-90">PRESENTS</h2>
                </div>
                <div className="h-px w-64 bg-green-500/50 my-6 shadow-[0_0_10px_rgba(0,255,0,0.5)]"></div>
                <h3 className="text-xl font-bold tracking-[0.4em] text-green-400 uppercase italic">MADE BY JUSTIBAD</h3>
              </div>
           </div>
        )}

        {/* HUD */}
        {gameState === GameState.PLAYING && (
          <div className="p-10 flex justify-between items-start w-full">
             <button 
                onClick={() => setIsMuted(!isMuted)}
                className="pointer-events-auto bg-black/50 p-4 rounded-full border border-white/20 hover:bg-white/10 transition-colors flex items-center justify-center w-16 h-16"
             >
                <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-2xl`}></i>
             </button>
             <div className="flex flex-col items-end gap-0">
                <div className="text-5xl font-black text-green-400 flex items-center gap-3 tabular-nums drop-shadow-lg">
                    <i className="fas fa-coins text-2xl animate-pulse"></i> {coinsCollected}
                </div>
                <div className="text-[10px] uppercase tracking-[0.4em] text-green-500 font-bold opacity-100">Coins Collected</div>
             </div>
          </div>
        )}

        {/* Main Menu */}
        {gameState === GameState.MENU && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto">
            <h1 className="text-9xl font-black text-white mb-2 italic drop-shadow-[0_0_30px_rgba(0,255,0,0.6)]">BEN-RUNNER</h1>
            <div className="flex flex-col items-center mb-16">
               <p className="text-green-500 font-mono tracking-[0.5em] text-lg uppercase border-b border-green-500/30 pb-2">OMNITRIX READY</p>
               <p className="text-sm text-white/60 tracking-[0.4em] mt-4 uppercase italic font-bold">BY JUSTIBAD</p>
            </div>
            
            <button 
              onClick={startGame}
              className="group relative px-28 py-10 overflow-hidden transition-all bg-green-600 hover:bg-green-500 text-black font-black text-6xl skew-x-[-15deg] shadow-[0_0_50px_rgba(34,197,94,0.6)] active:scale-95"
            >
              <span className="relative z-10 tracking-widest italic uppercase">START</span>
            </button>

            <div className="mt-24 flex flex-col items-center gap-8 text-white text-sm">
                <div className="flex items-center gap-16 uppercase tracking-[0.3em] font-black">
                  <div className="flex items-center gap-4 bg-black/80 px-4 py-2 border border-green-500/50"><span className="text-green-400">A / D</span> STEER</div>
                  <div className="flex items-center gap-4 bg-black/80 px-4 py-2 border border-green-500/50"><span className="text-green-400">SPACE</span> JUMP</div>
                </div>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === GameState.GAMEOVER && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-950/40 backdrop-blur-2xl pointer-events-auto">
            <h2 className="text-[10rem] font-black text-green-500 mb-8 italic tracking-tighter drop-shadow-[0_0_40px_rgba(34,197,94,0.5)]">RUN ENDED</h2>
            
            <div className="flex flex-col items-center my-10 border-y border-white/20 py-16 px-32 bg-black/80 w-full max-w-3xl shadow-2xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500"></div>
                
                <span className="text-[12rem] font-black text-green-400 tabular-nums leading-none">{coinsCollected}</span>
                <span className="text-xl uppercase tracking-[1em] text-white font-black mt-8">COINS COLLECTED</span>
            </div>

            <div className="flex flex-col items-center gap-8">
              <button 
                onClick={startGame}
                className="px-24 py-8 bg-white text-black font-black text-5xl skew-x-[-10deg] hover:bg-green-400 hover:scale-105 transition-all shadow-[0_0_60px_rgba(255,255,255,0.3)] active:scale-95"
              >
                RE-SYNC
              </button>
              
              <button 
                onClick={() => setGameState(GameState.MENU)}
                className="text-white/60 hover:text-white transition-colors uppercase text-sm tracking-[0.8em] mt-4 font-bold"
              >
                EXIT TERMINAL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
