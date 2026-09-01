import React, { useState, useEffect } from 'react';
import { GameEngine } from '../game/engine';

interface TouchControlsProps {
  engine: GameEngine;
  bombs: number;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  meleeReady: boolean;
  slideReady: boolean;
  visible: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  engine,
  bombs,
  ammo,
  maxAmmo,
  isReloading,
  meleeReady,
  slideReady,
  visible,
}) => {
  const [activeDir, setActiveDir] = useState<{
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const [meleePressed, setMeleePressed] = useState(false);
  const [bombPressed, setBombPressed] = useState(false);

  // Sync state with engine keys
  const setDirKey = (dir: 'up' | 'down' | 'left' | 'right', pressed: boolean) => {
    setActiveDir((prev) => ({ ...prev, [dir]: pressed }));
    if (dir === 'left') engine.keys.left = pressed;
    if (dir === 'right') engine.keys.right = pressed;
    if (dir === 'up') {
      engine.keys.jump = pressed;
      engine.keys.up = pressed;
    }
    if (dir === 'down') {
      engine.keys.slide = pressed;
      engine.keys.down = pressed;
    }
  };

  const handleMeleePress = (pressed: boolean) => {
    setMeleePressed(pressed);
    engine.keys.melee = pressed;
  };

  const handleBombPress = () => {
    setBombPressed(true);
    engine.throwBomb();
    setTimeout(() => setBombPressed(false), 200);
  };

  const handleReloadPress = () => {
    if (!engine.player.isReloading && engine.player.ammo < engine.player.maxAmmo) {
      engine.player.isReloading = true;
      engine.player.reloadTimer = engine.player.reloadDuration;
    }
  };

  if (!visible) return null;

  return (
    <div
      id="touch-controls-container"
      className="absolute inset-0 pointer-events-none z-30 select-none flex flex-col justify-end p-2 sm:p-3 overflow-hidden font-thai"
    >
      {/* Controls Overlay Bar (Bottom Left: Melee & Bomb, Bottom Right: D-Pad) */}
      <div className="flex items-end justify-between w-full pointer-events-none">
        {/* Left Side: Circular Subtle Action Buttons (Melee / Bomb) */}
        <div className="pointer-events-auto flex items-end gap-2.5 bg-black/25 backdrop-blur-[2px] p-2 rounded-2xl border border-white/15 shadow-lg select-none">
          {/* Tactical Bomb Button (Circular) */}
          <button
            type="button"
            id="touch-btn-bomb"
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBombPress();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBombPress();
            }}
            className={`relative w-13 h-13 sm:w-15 sm:h-15 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
              bombPressed
                ? 'bg-amber-500/60 border-amber-300 scale-95 shadow-inner'
                : bombs > 0
                ? 'bg-black/40 border-amber-400/60 text-amber-200 hover:bg-black/50'
                : 'bg-black/30 border-gray-500/40 text-gray-400'
            }`}
            title="ปาระเบิดยุทธวิธี (Bomb)"
          >
            <span className="text-xl sm:text-2xl leading-none">💣</span>
            <span className="text-[8px] sm:text-[9px] font-bold mt-0.5">ระเบิด</span>
            {/* Bomb Counter Badge */}
            <span
              className={`absolute -top-1 -right-1 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                bombs > 0
                  ? 'bg-amber-400 text-black border-amber-100 animate-pulse'
                  : 'bg-gray-700 text-gray-300 border-gray-600'
              }`}
            >
              {bombs}
            </span>
          </button>

          {/* Gun Melee Bash Button (Circular) */}
          <button
            type="button"
            id="touch-btn-melee"
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMeleePress(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMeleePress(false);
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMeleePress(false);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMeleePress(true);
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMeleePress(false);
            }}
            onMouseLeave={() => handleMeleePress(false)}
            className={`w-15 h-15 sm:w-18 sm:h-18 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
              meleePressed
                ? 'bg-blue-600/60 border-cyan-300 scale-95 shadow-inner'
                : meleeReady
                ? 'bg-black/45 border-cyan-400/60 text-cyan-200 hover:bg-black/55 shadow-md'
                : 'bg-black/30 border-gray-500/40 text-gray-400'
            }`}
            title="ฟาดด้ามปืน (Melee)"
          >
            <span className="text-2xl sm:text-3xl leading-none">🗡️</span>
            <span className="text-[9px] sm:text-[10px] font-bold mt-0.5">ฟาดด้าม</span>
          </button>
        </div>

        {/* Right Side: Directional Buttons (Square subtle D-Pad: Up, Down, Left, Right) */}
        <div className="pointer-events-auto flex flex-col items-center gap-1 bg-black/25 backdrop-blur-[2px] p-2 rounded-xl border border-white/15 shadow-lg select-none">
          {/* Top: Up Button (Jump) */}
          <button
            type="button"
            id="touch-btn-up"
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirKey('up', true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirKey('up', false);
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirKey('up', false);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirKey('up', true);
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirKey('up', false);
            }}
            onMouseLeave={() => setDirKey('up', false)}
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-lg border flex flex-col items-center justify-center transition-all ${
              activeDir.up
                ? 'bg-white/40 border-white text-white scale-95 shadow-inner'
                : 'bg-black/40 border-white/30 text-white/80 hover:bg-black/50'
            }`}
            title="กระโดด (Jump)"
          >
            <span className="text-base sm:text-lg leading-none">▲</span>
            <span className="text-[8px] sm:text-[9px] font-bold opacity-75">โดด</span>
          </button>

          {/* Middle: Left, Center Blank, Right */}
          <div className="flex items-center gap-1">
            {/* Left Button */}
            <button
              type="button"
              id="touch-btn-left"
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirKey('left', true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirKey('left', false);
              }}
              onTouchCancel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirKey('left', false);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirKey('left', true);
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirKey('left', false);
              }}
              onMouseLeave={() => setDirKey('left', false)}
              className={`w-11 h-11 sm:w-13 sm:h-13 rounded-lg border flex flex-col items-center justify-center transition-all ${
                activeDir.left
                  ? 'bg-white/40 border-white text-white scale-95 shadow-inner'
                  : 'bg-black/40 border-white/30 text-white/80 hover:bg-black/50'
              }`}
              title="เดินซ้าย (Left)"
            >
              <span className="text-base sm:text-lg leading-none">◀</span>
              <span className="text-[8px] sm:text-[9px] font-bold opacity-75">ซ้าย</span>
            </button>

            {/* Center: Reload / Status */}
            <button
              type="button"
              id="touch-btn-reload"
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleReloadPress();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleReloadPress();
              }}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg border flex flex-col items-center justify-center transition-all ${
                isReloading
                  ? 'bg-amber-600/50 border-amber-400 text-amber-200 animate-pulse'
                  : 'bg-black/30 border-white/20 text-white/60 hover:bg-black/40'
              }`}
              title="รีโหลดกระสุน (Reload)"
            >
              <span className="text-xs sm:text-sm">🔄</span>
              <span className="text-[7px] font-mono leading-none">
                {isReloading ? '...' : `${ammo}`}
              </span>
            </button>

            {/* Right Button */}
            <button
              type="button"
              id="touch-btn-right"
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirKey('right', true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirKey('right', false);
              }}
              onTouchCancel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirKey('right', false);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirKey('right', true);
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirKey('right', false);
              }}
              onMouseLeave={() => setDirKey('right', false)}
              className={`w-11 h-11 sm:w-13 sm:h-13 rounded-lg border flex flex-col items-center justify-center transition-all ${
                activeDir.right
                  ? 'bg-white/40 border-white text-white scale-95 shadow-inner'
                  : 'bg-black/40 border-white/30 text-white/80 hover:bg-black/50'
              }`}
              title="เดินขวา (Right)"
            >
              <span className="text-base sm:text-lg leading-none">▶</span>
              <span className="text-[8px] sm:text-[9px] font-bold opacity-75">ขวา</span>
            </button>
          </div>

          {/* Bottom: Down Button (Slide / Drop Platform) */}
          <button
            type="button"
            id="touch-btn-down"
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirKey('down', true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirKey('down', false);
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirKey('down', false);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirKey('down', true);
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirKey('down', false);
            }}
            onMouseLeave={() => setDirKey('down', false)}
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-lg border flex flex-col items-center justify-center transition-all ${
              activeDir.down
                ? 'bg-white/40 border-white text-white scale-95 shadow-inner'
                : slideReady
                ? 'bg-black/40 border-white/30 text-white/80 hover:bg-black/50'
                : 'bg-black/30 border-white/10 text-white/40'
            }`}
            title="สไลด์ (Slide)"
          >
            <span className="text-base sm:text-lg leading-none">▼</span>
            <span className="text-[8px] sm:text-[9px] font-bold opacity-75">สไลด์</span>
          </button>
        </div>
      </div>
    </div>
  );
};
