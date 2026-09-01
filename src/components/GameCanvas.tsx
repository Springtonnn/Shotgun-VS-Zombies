import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { GameRenderer } from '../game/renderer';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../game/constants';
import { GameModals } from './GameModals';
import { TouchControls } from './TouchControls';
import { GameStats, GameStatus, StageConfig } from '../types';

interface GameCanvasProps {
  engine: GameEngine;
  scanlines: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, scanlines }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const accumulatorRef = useRef<number>(0);
  const activeAimTouchIdRef = useRef<number | null>(null);

  const [uiStatus, setUiStatus] = useState<GameStatus>(engine.status);
  const [currentStage, setCurrentStage] = useState<StageConfig>(engine.currentStage);
  const [stats, setStats] = useState<GameStats>(engine.stats);
  const [playerHp, setPlayerHp] = useState<number>(engine.player.health);
  const [playerMaxHp] = useState<number>(engine.player.maxHealth);
  const [bossHp, setBossHp] = useState<number | null>(null);
  const [bossMaxHp, setBossMaxHp] = useState<number | null>(null);
  const [bossType, setBossType] = useState<'boss_tank' | 'boss_mutant' | 'boss_ticket' | 'boss_tall_shadow' | null>(null);
  const [mechBossInfo, setMechBossInfo] = useState<{
    active: boolean;
    headHealth: number;
    headMaxHealth: number;
    shielded: boolean;
    leftHp: number;
    rightHp: number;
    handMaxHp: number;
  } | null>(null);
  const [slideReady, setSlideReady] = useState<boolean>(true);
  const [meleeReady, setMeleeReady] = useState<boolean>(true);
  const [ammo, setAmmo] = useState<number>(engine.player.ammo);
  const [maxAmmo] = useState<number>(engine.player.maxAmmo);
  const [bombs, setBombs] = useState<number>(engine.player.bombs || 0);
  const [stageZombiesKilled, setStageZombiesKilled] = useState<number>(engine.stageZombiesKilled || 0);
  const [stageZombiesTotal, setStageZombiesTotal] = useState<number>(engine.stageZombiesTotal || 0);
  const [isReloading, setIsReloading] = useState<boolean>(engine.player.isReloading);
  const [reloadProgress, setReloadProgress] = useState<number>(0);
  const [progressPct, setProgressPct] = useState<number>(0);

  // Mobile and Touch Detection
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(true);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  useEffect(() => {
    const checkDevice = () => {
      const touch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches ||
        /Android|iPhone|iPad|iPod|webOS|Windows Phone/i.test(navigator.userAgent);
      setIsTouchDevice(touch);
      setShowTouchControls(touch);
      setIsPortrait(window.innerHeight > window.innerWidth && touch);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Update aim and trigger shooting from touch coordinates
  const handleTouchAim = useCallback((touch: React.Touch | Touch, isFiring: boolean) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const touchX = (touch.clientX - rect.left) * scaleX;
    const touchY = (touch.clientY - rect.top) * scaleY;

    engine.keys.mouseX = Math.max(0, Math.min(CANVAS_WIDTH, touchX));
    engine.keys.mouseY = Math.max(0, Math.min(CANVAS_HEIGHT, touchY));
    engine.keys.mouseWorldX = engine.keys.mouseX + engine.cameraX;
    engine.keys.mouseWorldY = engine.keys.mouseY;

    if (isFiring) {
      engine.keys.shoot = true;
    }
  }, [engine]);

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (engine.status !== 'playing') return;
    e.preventDefault();
    if (e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      activeAimTouchIdRef.current = touch.identifier;
      handleTouchAim(touch, true);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (engine.status !== 'playing') return;
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeAimTouchIdRef.current) {
        handleTouchAim(touch, true);
        break;
      }
    }
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeAimTouchIdRef.current) {
        activeAimTouchIdRef.current = null;
        engine.keys.shoot = false;
        break;
      }
    }
  };

  // Initialize Renderer
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        rendererRef.current = new GameRenderer(ctx);
      }
    }
  }, []);

  // Main Game Loop with Fixed 60 FPS Time-Step (eliminates speed differences across 60Hz/120Hz/144Hz/240Hz monitors)
  const gameLoop = useCallback((now: number) => {
    let frameTime = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

    // Guard against huge delta spikes (e.g. background tab or lag freeze)
    if (frameTime > 0.1) frameTime = 0.1;
    if (frameTime < 0) frameTime = 0;

    accumulatorRef.current += frameTime;
    const FIXED_TIME_STEP = 1 / 60; // Exact 60 updates per second (16.66ms per tick)
    let updateTicks = 0;

    while (accumulatorRef.current >= FIXED_TIME_STEP && updateTicks < 5) {
      engine.update(FIXED_TIME_STEP);
      accumulatorRef.current -= FIXED_TIME_STEP;
      updateTicks++;
    }

    // Update React HUD state periodically
    setUiStatus(engine.status);
    setCurrentStage(engine.currentStage);
    setStats({ ...engine.stats });
    setPlayerHp(engine.player.health);
    setSlideReady(engine.player.slideCooldown <= 0 && !engine.player.isSliding);
    setMeleeReady(engine.player.meleeCooldown <= 0 && !engine.player.isMeleeing);
    setAmmo(engine.player.ammo);
    setBombs(engine.player.bombs || 0);
    setStageZombiesKilled(engine.stageZombiesKilled || 0);
    setStageZombiesTotal(engine.stageZombiesTotal || 0);
    setIsReloading(engine.player.isReloading);
    setReloadProgress(engine.player.isReloading ? Math.min(100, Math.floor(((180 - engine.player.reloadTimer) / 180) * 100)) : 0);

    // Calculate stage progress
    const maxProg = engine.currentStage.mapLength;
    const curProg = Math.min(100, Math.max(0, Math.floor((engine.player.x / maxProg) * 100)));
    setProgressPct(curProg);

    // Check Boss HP & Type (Phase 1, Stage 2 Tall Shadow Boss, or Mech Boss)
    if (engine.mechBoss && engine.mechBoss.active) {
      setMechBossInfo({
        active: true,
        headHealth: engine.mechBoss.headHealth,
        headMaxHealth: engine.mechBoss.headMaxHealth,
        shielded: engine.mechBoss.shielded,
        leftHp: engine.mechBoss.leftHand.health,
        rightHp: engine.mechBoss.rightHand.health,
        handMaxHp: engine.mechBoss.leftHand.maxHealth,
      });
      setBossHp(null);
      setBossMaxHp(null);
      setBossType(null);
    } else if (engine.tallShadowBoss && engine.tallShadowBoss.active && engine.tallShadowBoss.introState !== 'defeated') {
      setMechBossInfo(null);
      setBossHp(Math.max(0, engine.tallShadowBoss.health));
      setBossMaxHp(engine.tallShadowBoss.maxHealth);
      setBossType('boss_tall_shadow');
    } else {
      setMechBossInfo(null);
      const boss = engine.enemies.find((e) => e.type === 'boss_tank' || e.type === 'boss_mutant' || e.type === 'boss_ticket');
      if (boss) {
        setBossHp(Math.max(0, boss.health));
        setBossMaxHp(boss.maxHealth);
        setBossType(boss.type as 'boss_tank' | 'boss_mutant' | 'boss_ticket');
      } else {
        setBossHp(null);
        setBossMaxHp(null);
        setBossType(null);
      }
    }

    // Render Canvas Frame
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    if (canvas && renderer) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        // Screen shake transform (reduced by 50% for smoother visual comfort across all attacks and explosions)
        if (engine.screenShake > 0) {
          const shakeX = (Math.random() - 0.5) * engine.screenShake * 1.0;
          const shakeY = (Math.random() - 0.5) * engine.screenShake * 1.0;
          ctx.translate(shakeX, shakeY);
        }

        // Draw parallax background & ground
        renderer.renderBackground(engine.cameraX, engine.currentStage, now);

        // Draw Colossus Mech Boss (Background Titan Robot)
        if (engine.mechBoss && engine.mechBoss.active) {
          renderer.renderMechBoss(engine.mechBoss, engine.cameraX);
        }

        // Draw Stage 2 Sub-Boss: Shadow Goliath (Colossal Shadow Zombie)
        if (engine.tallShadowBoss && engine.tallShadowBoss.active) {
          renderer.renderTallShadowBoss(engine.tallShadowBoss, engine.cameraX);
        }

        // Draw multi-level platforms & tactical structures
        renderer.renderPlatforms(engine.platforms, engine.cameraX);

        // Draw Stage 1 & 2 Quarantine Barricade / Security Gate
        renderer.renderStageBarricade(
          engine.currentStage,
          engine.stageZombiesKilled,
          engine.stageZombiesTotal,
          engine.cameraX
        );

        // Draw razor ticket cards
        renderer.renderTicketCards(engine.ticketCards, engine.cameraX);

        // Draw particles behind
        renderer.renderParticles(engine.particles.filter((p) => p.type !== 'text'), engine.cameraX);

        // Draw enemies & boss
        for (const enemy of engine.enemies) {
          renderer.renderEnemy(enemy, engine.cameraX);
        }

        // Draw homing missiles
        renderer.renderMissiles(engine.missiles, engine.cameraX);

        // Draw thrown tactical bombs
        renderer.renderBombs(engine.bombs, engine.cameraX);

        // Draw thrown cars from Shadow Boss
        renderer.renderThrownCars(engine.thrownCars, engine.cameraX);

        // Draw player
        renderer.renderPlayer(engine.player, engine.cameraX);

        // Draw bullets
        renderer.renderBullets(engine.bullets, engine.cameraX);

        // Draw falling rocks debris
        renderer.renderFallingRocks(engine.fallingRocks, engine.cameraX);

        // Draw Mech Boss Foreground elements (Hands gripping road, laser beam blasts)
        if (engine.mechBoss && engine.mechBoss.active) {
          renderer.renderMechBossForeground(engine.mechBoss, engine.cameraX);
        }

        // Draw Off-screen Zombie Radar & Beacons
        renderer.renderZombieRadar(
          engine.enemies,
          engine.currentStage,
          engine.stageZombiesKilled,
          engine.stageZombiesTotal,
          engine.cameraX,
          engine.player.x
        );

        // Draw text particles (damage numbers, intercept bonuses)
        renderer.renderParticles(engine.particles.filter((p) => p.type === 'text'), engine.cameraX);

        ctx.restore();
      }
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [engine]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameLoop]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on game keys
      if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'KeyA' || e.code === 'ArrowLeft') engine.keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') engine.keys.right = true;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        engine.keys.jump = true;
        engine.keys.up = true;
      }
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        engine.keys.slide = true;
        engine.keys.down = true;
      }
      // Spacebar throws Bomb (or falls back to Melee if no bombs)
      if (e.code === 'Space') {
        engine.keys.bomb = true;
        engine.keys.melee = true;
      }
      if (e.code === 'KeyF' || e.code === 'KeyE' || e.code === 'KeyV') {
        engine.keys.melee = true;
      }
      if (e.code === 'KeyR') engine.keys.reload = true;

      // Pause toggle
      if (e.code === 'Escape') {
        if (engine.status === 'playing') {
          engine.status = 'paused';
        } else if (engine.status === 'paused') {
          engine.status = 'playing';
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') engine.keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') engine.keys.right = false;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        engine.keys.jump = false;
        engine.keys.up = false;
      }
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        engine.keys.slide = false;
        engine.keys.down = false;
      }
      if (e.code === 'Space') {
        engine.keys.bomb = false;
        engine.keys.melee = false;
      }
      if (e.code === 'KeyF' || e.code === 'KeyE' || e.code === 'KeyV') {
        engine.keys.melee = false;
      }
      if (e.code === 'KeyR') engine.keys.reload = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;

      engine.keys.mouseX = (e.clientX - rect.left) * scaleX;
      engine.keys.mouseY = (e.clientY - rect.top) * scaleY;
      engine.keys.mouseWorldX = engine.keys.mouseX + engine.cameraX;
      engine.keys.mouseWorldY = engine.keys.mouseY;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        engine.keys.shoot = true;
      } else if (e.button === 2) {
        e.preventDefault();
        engine.throwBomb();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        engine.keys.shoot = false;
      } else if (e.button === 2) {
        engine.keys.bomb = false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [engine]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[800/480] max-w-[960px] mx-auto bg-black overflow-hidden win95-sunken cursor-crosshair select-none"
    >
      {/* 2D Canvas with Touch & Mouse support */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onTouchStart={handleCanvasTouchStart}
        onTouchMove={handleCanvasTouchMove}
        onTouchEnd={handleCanvasTouchEnd}
        onTouchCancel={handleCanvasTouchEnd}
        className="w-full h-full block touch-none select-none"
      />

      {/* CRT Scanline Overlay if enabled */}
      {scanlines && <div className="absolute inset-0 scanlines pointer-events-none z-10" />}

      {/* Mobile Portrait Mode Rotation Tip */}
      {isPortrait && uiStatus === 'playing' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/85 text-yellow-300 px-3 py-1 rounded-full text-[11px] border border-yellow-500/50 z-30 animate-pulse pointer-events-none flex items-center gap-1.5 shadow-xl whitespace-nowrap font-thai">
          <span>📱</span>
          <span>เพื่อการเล่นที่ถนัดมือยิ่งขึ้น แนะนำหมุนหน้าจอแนวนอน 🔄</span>
        </div>
      )}

      {/* Mobile Touch Virtual Buttons Overlay */}
      {uiStatus === 'playing' && (
        <TouchControls
          engine={engine}
          bombs={bombs}
          ammo={ammo}
          maxAmmo={maxAmmo}
          isReloading={isReloading}
          meleeReady={meleeReady}
          slideReady={slideReady}
          visible={showTouchControls}
        />
      )}

      {/* In-Game HUD Overlay */}
      {uiStatus === 'playing' && (
        <div className="absolute inset-0 pointer-events-none p-2 sm:p-3 flex flex-col justify-between z-20 font-thai">
          {/* Top Row: Health Bar, Boss Bar, Stage & Score */}
          <div className="flex items-start justify-between gap-4">
            {/* Left: Player Status */}
            <div className="bg-[#C0C0C0]/95 text-black px-3 py-2 win95-raised flex flex-col gap-1.5 shadow min-w-[168px]">
              <div className="flex items-center justify-between text-xs font-bold gap-2">
                <span className="flex items-center gap-1">
                  <span className="text-[#FF6600]">▲</span>
                  <span>พลังชีวิต (HP)</span>
                </span>
                <span className="font-mono text-sm">{playerHp} / {playerMaxHp}</span>
              </div>
              {/* HP Bar */}
              <div className="w-full h-3.5 bg-gray-900 win95-sunken overflow-hidden p-0.5">
                <div
                  className="h-full transition-all duration-100"
                  style={{
                    width: `${Math.max(0, (playerHp / playerMaxHp) * 100)}%`,
                    backgroundColor: playerHp > 40 ? '#48BB78' : playerHp > 20 ? '#ED8936' : '#E53E3E',
                  }}
                />
              </div>

              {/* Shotgun Ammo (10 Rounds & 3s Reloading Bar) */}
              <div className="flex flex-col gap-1 pt-1 border-t border-gray-400">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="flex items-center gap-1 text-red-700">
                    <span>🔴</span>
                    <span>กระสุน:</span>
                  </span>
                  {isReloading ? (
                    <span className="text-amber-800 font-pixel text-[9px] animate-pulse">
                      RELOAD {reloadProgress}%
                    </span>
                  ) : (
                    <span className="font-mono text-xs font-bold text-gray-900">
                      {ammo} / {maxAmmo}
                    </span>
                  )}
                </div>

                {/* Ammo Shells or Reloading Progress Bar */}
                {isReloading ? (
                  <div className="w-full h-2.5 bg-gray-900 win95-sunken overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-75"
                      style={{ width: `${reloadProgress}%` }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5 w-full">
                    {Array.from({ length: maxAmmo }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 h-2 rounded-xs border border-gray-900 transition-colors ${
                          idx < ammo ? 'bg-red-600 shadow-inner' : 'bg-gray-400 opacity-40'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Skill Badges */}
              <div className="flex items-center justify-between text-[10px] font-pixel pt-1 border-t border-gray-400">
                <span className={`px-1.5 py-0.5 rounded ${slideReady ? 'bg-green-700 text-white' : 'bg-gray-400 text-gray-700'}`}>
                  SLIDE: {slideReady ? 'READY' : 'COOL'}
                </span>
                <span className={`px-1.5 py-0.5 rounded ${meleeReady ? 'bg-blue-700 text-white' : 'bg-gray-400 text-gray-700'}`}>
                  MELEE: {meleeReady ? 'READY' : 'COOL'}
                </span>
              </div>

              {/* Tactical Bomb Counter */}
              <div className="flex items-center justify-between text-[11px] font-bold pt-1 border-t border-gray-400">
                <span className="flex items-center gap-1 text-gray-900">
                  <span>💣</span>
                  <span>ระเบิด (ฆ่า 10 ตัว):</span>
                </span>
                <span className={`font-mono text-xs px-1.5 py-0.5 rounded font-bold ${bombs > 0 ? 'bg-amber-400 text-black animate-pulse' : 'bg-gray-300 text-gray-600'}`}>
                  {bombs} ลูก [คลิกขวา]
                </span>
              </div>
            </div>

            {/* Center: Boss Health Bar (if active) */}
            {mechBossInfo !== null && (
              <div className="bg-[#C0C0C0]/95 text-black px-4 py-2 win95-raised flex flex-col items-center gap-1.5 shadow animate-pulse min-w-[320px]">
                <div className="font-pixel text-[11px] flex items-center gap-1.5 font-bold text-red-800">
                  <span>🤖</span>
                  <span>FINAL BOSS: GIGA MECHA-Z (TITAN)</span>
                </div>
                {/* Head Core Health Bar */}
                <div className="w-72 h-4 bg-gray-900 win95-sunken overflow-hidden p-0.5 relative">
                  <div
                    className={`h-full transition-all duration-100 ${
                      mechBossInfo.shielded
                        ? 'bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500'
                        : 'bg-gradient-to-r from-red-600 via-yellow-400 to-red-500'
                    }`}
                    style={{ width: `${Math.max(0, (mechBossInfo.headHealth / mechBossInfo.headMaxHealth) * 100)}%` }}
                  />
                  {mechBossInfo.shielded && (
                    <div className="absolute inset-0 flex items-center justify-center text-[9px] font-pixel text-white font-bold drop-shadow">
                      🛡️ SHIELD ACTIVE (DESTROY BOTH HANDS!)
                    </div>
                  )}
                </div>
                {/* Sub status: Hands Health */}
                <div className="flex items-center justify-between w-full text-[10px] font-pixel px-1">
                  <span className={`px-1 py-0.5 rounded ${mechBossInfo.leftHp > 0 ? 'bg-red-800 text-white' : 'bg-gray-500 text-gray-300 line-through'}`}>
                    L-HAND: {mechBossInfo.leftHp > 0 ? `${mechBossInfo.leftHp} HP` : 'DESTROYED'}
                  </span>
                  <span className="font-mono font-bold text-gray-800">
                    CORE: {mechBossInfo.headHealth} / {mechBossInfo.headMaxHealth}
                  </span>
                  <span className={`px-1 py-0.5 rounded ${mechBossInfo.rightHp > 0 ? 'bg-red-800 text-white' : 'bg-gray-500 text-gray-300 line-through'}`}>
                    R-HAND: {mechBossInfo.rightHp > 0 ? `${mechBossInfo.rightHp} HP` : 'DESTROYED'}
                  </span>
                </div>
              </div>
            )}

            {bossHp !== null && bossMaxHp !== null && mechBossInfo === null && (
              <div className="bg-[#C0C0C0]/95 text-black px-4 py-2 win95-raised flex flex-col items-center gap-1 shadow animate-pulse min-w-[280px]">
                <div className={`font-pixel text-[11px] flex items-center gap-1 font-bold ${
                  bossType === 'boss_tall_shadow'
                    ? 'text-red-900'
                    : bossType === 'boss_ticket'
                    ? 'text-red-700'
                    : bossType === 'boss_mutant'
                    ? 'text-purple-900'
                    : 'text-red-700'
                }`}>
                  <span>{bossType === 'boss_tall_shadow' ? '💀' : bossType === 'boss_ticket' ? '🎟️' : bossType === 'boss_mutant' ? '🔥' : '⚠️'}</span>
                  <span>
                    {bossType === 'boss_tall_shadow'
                      ? 'STAGE 2 SUB-BOSS: COLOSSAL HUMAN ZOMBIE (ซอมบี้มนุษย์ร่างยักษ์)'
                      : bossType === 'boss_ticket'
                      ? 'PHASE 1: Z-CONDUCTOR (TICKET MASTER)'
                      : bossType === 'boss_mutant'
                      ? 'PHASE 2: TITAN GENERAL Z (MUTANT BERSERKER)'
                      : '1v1 BOSS: GENERAL TANK-Z (COLOSSUS)'}
                  </span>
                </div>
                <div className="w-64 h-4 bg-gray-900 win95-sunken overflow-hidden p-0.5">
                  <div
                    className={`h-full transition-all duration-100 ${
                      bossType === 'boss_tall_shadow'
                        ? 'bg-gradient-to-r from-red-950 via-slate-800 to-red-600'
                        : bossType === 'boss_ticket'
                        ? 'bg-gradient-to-r from-red-600 via-pink-500 to-amber-400'
                        : bossType === 'boss_mutant'
                        ? 'bg-gradient-to-r from-purple-700 via-pink-600 to-purple-500'
                        : 'bg-gradient-to-r from-red-600 to-amber-500'
                    }`}
                    style={{ width: `${Math.max(0, (bossHp / bossMaxHp) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono font-bold text-gray-800">
                  {bossHp} / {bossMaxHp} HP{' '}
                  {bossType === 'boss_tall_shadow'
                    ? '(ระวังมือมนุษย์ยักษ์ทุบพื้น, ปารถซาก & โจมตีช้าลง 100%!)'
                    : bossType === 'boss_ticket'
                    ? '(ระวังตั๋วมีดบิน & ทุ่มลงพื้น!)'
                    : bossType === 'boss_mutant'
                    ? '(กระโดดหลบคลื่นกระแทกพื้น Ground Slam!)'
                    : '(ยิง/ฟันมิสไซล์กลางอากาศได้!)'}
                </div>
              </div>
            )}

            {/* Right: Stage & Score HUD */}
            <div className="bg-[#C0C0C0]/90 text-black px-3 py-2 win95-raised flex flex-col gap-1 text-right shadow min-w-[150px]">
              <div className="font-pixel text-[11px] text-[#000080]">
                {currentStage.name.split(':')[0]}
              </div>
              <div className="flex justify-between text-xs">
                <span>คะแนน:</span>
                <span className="font-mono font-bold text-blue-900">{stats.score}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>กำจัด:</span>
                <span className="font-mono font-bold text-red-600">{stats.kills} 💀</span>
              </div>
              {currentStage.id !== 3 && (
                <div className="flex justify-between text-[11px] pt-1 border-t border-gray-400">
                  <span className="font-bold">เป้าหมายด่าน:</span>
                  <span className={`font-mono font-bold ${stageZombiesKilled >= stageZombiesTotal ? 'text-green-700 font-pixel text-[10px]' : 'text-red-700'}`}>
                    {stageZombiesKilled >= stageZombiesTotal ? '🟢 ทางออกเปิด!' : `เหลือ ${Math.max(0, stageZombiesTotal - stageZombiesKilled)} ตัว`}
                  </span>
                </div>
              )}
              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-gray-800 win95-sunken mt-0.5 overflow-hidden">
                <div
                  className="h-full bg-[#FF6B00]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Row: Active Combo */}
          <div className="flex items-end justify-between">
            {/* Combo Meter */}
            {stats.combo > 1 && (
              <div className="bg-[#1A202C]/90 text-white px-3 py-1.5 win95-raised border-2 border-yellow-400 font-pixel text-xs animate-bounce flex items-center gap-1.5">
                <span className="text-yellow-400">🔥</span>
                <span className="text-orange-400">COMBO x{stats.combo}!</span>
              </div>
            )}
            {!stats.combo && <div />}
          </div>
        </div>
      )}

      {/* Modals & Dialogs */}
      <GameModals
        status={uiStatus}
        stage={currentStage}
        stats={stats}
        showTouchControls={showTouchControls}
        onToggleTouchControls={() => setShowTouchControls((prev) => !prev)}
        onStartGame={(idx) => engine.startGame(idx ?? 0)}
        onNextStage={() => engine.nextStage()}
        onResume={() => { engine.status = 'playing'; }}
        onRestart={() => engine.startGame(engine.currentStageIndex)}
      />
    </div>
  );
};
