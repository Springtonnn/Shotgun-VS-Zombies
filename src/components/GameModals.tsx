import React from 'react';
import { GameStats, GameStatus, StageConfig } from '../types';
import { STAGES } from '../game/constants';
import { Trophy, Play, RotateCcw, Skull, Volume2, ShieldAlert, Crosshair, Zap, Compass } from 'lucide-react';

interface GameModalsProps {
  status: GameStatus;
  stage: StageConfig;
  stats: GameStats;
  showTouchControls: boolean;
  onToggleTouchControls: () => void;
  onStartGame: (stageIndex?: number) => void;
  onNextStage: () => void;
  onResume: () => void;
  onRestart: () => void;
}

export const GameModals: React.FC<GameModalsProps> = ({
  status,
  stage,
  stats,
  showTouchControls,
  onToggleTouchControls,
  onStartGame,
  onNextStage,
  onResume,
  onRestart,
}) => {
  if (status === 'playing') return null;

  return (
    <div className="absolute inset-0 bg-black/65 flex items-center justify-center p-4 z-30 select-none">
      {/* 1. Main Menu / Start Screen */}
      {status === 'menu' && (
        <div className="bg-[#C0C0C0] win95-raised p-2 max-w-lg w-full text-black shadow-2xl">
          {/* Title bar */}
          <div className="bg-[#000080] text-white px-3 py-1.5 flex items-center justify-between font-pixel text-xs tracking-wider">
            <div className="flex items-center gap-2">
              <span className="text-[#FF6600]">▲</span>
              <span>SHOTGUN_VS_ZOMBIES.EXE</span>
            </div>
            <span className="text-[10px] text-gray-300">v1.0 (Win95)</span>
          </div>

          <div className="p-4 space-y-4 font-thai">
            {/* Header banner */}
            <div className="bg-[#1A202C] text-white p-3 win95-sunken flex items-center justify-between">
              <div>
                <h1 className="font-pixel text-lg text-[#FF6B00]">SHOTGUN VS ZOMBIES</h1>
              </div>
              <div className="w-14 h-14 bg-[#2D3748] rounded border border-gray-600 flex items-center justify-center">
                <span className="text-3xl">▲</span>
              </div>
            </div>

            {/* Controls Guide Table */}
            <div className="bg-white p-3 win95-sunken text-xs space-y-2">
              <div className="font-bold text-[#000080] border-b pb-1 flex items-center gap-1">
                <Crosshair className="w-4 h-4" /> คู่มือการควบคุม (Controls)
              </div>
              <div className="grid grid-cols-2 gap-2 text-[13px]">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 bg-[#C0C0C0] win95-raised font-mono font-bold text-xs">A / D</kbd>
                  <span>เดินซ้าย / ขวา</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 bg-[#C0C0C0] win95-raised font-mono font-bold text-xs">W</kbd>
                  <span>กระโดด (Jump)</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 bg-[#C0C0C0] win95-raised font-mono font-bold text-xs">S</kbd>
                  <span>สไลด์หลบ (Slide)</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 bg-[#C0C0C0] win95-raised font-mono font-bold text-xs">Left Click</kbd>
                  <span>ยิงปืนลูกซอง (Shotgun)</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 bg-[#C0C0C0] win95-raised font-mono font-bold text-xs">Right Click</kbd>
                  <span>ปาระเบิด💣 (ฆ่า 10 ตัวได้ +1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 bg-[#C0C0C0] win95-raised font-mono font-bold text-xs">F / E / V</kbd>
                  <span>ฟาดด้ามปืน🗡️ (Melee)</span>
                </div>
              </div>
            </div>

            {/* Stages overview */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {STAGES.map((s, idx) => (
                <div key={s.id} className="bg-[#DFDFDF] p-2 win95-raised flex flex-col justify-between">
                  <div className="font-bold text-[#000080] text-[11px] mb-1">ด่านที่ {s.id}</div>
                  <div className="text-[10px] text-gray-700">{s.name.split(':')[1]}</div>
                  <button
                    onClick={() => onStartGame(idx)}
                    className="mt-2 py-1 px-1 bg-[#C0C0C0] win95-raised win95-button-active text-[10px] font-bold text-[#000080] hover:bg-white"
                  >
                    เล่นด่าน {s.id}
                  </button>
                </div>
              ))}
            </div>

            {/* Touch Pad Controls Toggle Option */}
            <div className="bg-[#DFDFDF] p-2.5 win95-sunken flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🎮</span>
                <div className="text-left">
                  <div className="font-bold text-xs text-[#000080]">ปุ่มสัมผัสหน้าจอ (Touch Pad)</div>
                  <div className="text-[10px] text-gray-600">สำหรับเล่นบนมือถือ/แท็บเล็ต</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleTouchControls}
                className={`px-3 py-1 text-xs font-bold win95-raised win95-button-active flex items-center gap-1 cursor-pointer transition-colors ${
                  showTouchControls
                    ? 'bg-[#008080] text-white hover:bg-[#009999]'
                    : 'bg-[#C0C0C0] text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span>{showTouchControls ? '🟢 เปิดใช้งาน (ON)' : '⚪ ปิดใช้งาน (OFF)'}</span>
              </button>
            </div>

            {/* Start Button */}
            <button
              onClick={() => onStartGame(0)}
              className="w-full py-3 bg-[#008080] text-white font-pixel text-sm win95-raised win95-button-active hover:bg-[#009999] flex items-center justify-center gap-2 cursor-pointer shadow"
            >
              <Play className="w-5 h-5 fill-current" />
              START GAME (เริ่มเกม)
            </button>
          </div>
        </div>
      )}

      {/* 2. Stage Clear Modal */}
      {status === 'stage_clear' && (
        <div className="bg-[#C0C0C0] win95-raised p-2 max-w-md w-full text-black shadow-2xl">
          <div className="bg-[#008080] text-white px-3 py-1.5 flex items-center justify-between font-pixel text-xs">
            <span>STAGE_CLEARED.SYS</span>
            <span>SUCCESS</span>
          </div>

          <div className="p-4 space-y-4 font-thai text-center">
            <div className="text-4xl animate-bounce">🏆</div>
            <h2 className="font-pixel text-lg text-[#008000]">STAGE CLEARED!</h2>
            <p className="text-sm font-bold text-gray-800">{stage.thaiName}</p>

            <div className="bg-white p-3 win95-sunken text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span>คะแนน (Score):</span>
                <span className="font-mono font-bold text-[#000080]">{stats.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>กำจัดซอมบี้ (Zombies Killed):</span>
                <span className="font-mono font-bold text-red-600">{stats.kills} ตัว</span>
              </div>
              <div className="flex justify-between">
                <span>คอมโบสูงสุด (Max Combo):</span>
                <span className="font-mono font-bold text-orange-600">{stats.maxCombo}x</span>
              </div>
              <div className="flex justify-between">
                <span>ฟาดด้ามปืน (Melee Kills):</span>
                <span className="font-mono font-bold">{stats.meleeKills}</span>
              </div>
            </div>

            <button
              onClick={onNextStage}
              className="w-full py-3 bg-[#000080] text-white font-pixel text-xs win95-raised win95-button-active hover:bg-[#1084D0] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              NEXT STAGE (ไปด่านถัดไป)
            </button>
          </div>
        </div>
      )}

      {/* 3. Game Over Modal */}
      {status === 'game_over' && (
        <div className="bg-[#C0C0C0] win95-raised p-2 max-w-md w-full text-black shadow-2xl">
          <div className="bg-[#800000] text-white px-3 py-1.5 flex items-center justify-between font-pixel text-xs">
            <span>FATAL_ERROR.LOG</span>
            <span>SYSTEM FAILURE</span>
          </div>

          <div className="p-4 space-y-4 font-thai text-center">
            <div className="text-4xl">💀</div>
            <h2 className="font-pixel text-lg text-red-600">GAME OVER</h2>
            <p className="text-xs text-gray-700">คุณถูกฝูงซอมบี้รุมโจมตีจนสิ้นชีพ!</p>

            <div className="bg-white p-3 win95-sunken text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span>คะแนนสะสม:</span>
                <span className="font-mono font-bold text-[#000080]">{stats.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>สังหารไปทั้งหมด:</span>
                <span className="font-mono font-bold text-red-600">{stats.kills} ตัว</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onRestart}
                className="flex-1 py-2.5 bg-[#800000] text-white font-pixel text-xs win95-raised win95-button-active hover:bg-red-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                ลองใหม่ (RETRY)
              </button>
              <button
                onClick={() => onStartGame(0)}
                className="flex-1 py-2.5 bg-[#C0C0C0] text-black font-pixel text-xs win95-raised win95-button-active hover:bg-gray-200 cursor-pointer"
              >
                เมนูหลัก (MENU)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Victory Modal (Completed all 3 stages + defeated Mech Boss) */}
      {status === 'victory' && (
        <div className="bg-[#C0C0C0] win95-raised p-2 max-w-lg w-full text-black shadow-2xl">
          <div className="bg-[#000080] text-white px-3 py-1.5 flex items-center justify-between font-pixel text-xs">
            <span>VICTORY_PARADE.EXE</span>
            <span>CHAMPION</span>
          </div>

          <div className="p-5 space-y-4 font-thai text-center">
            <div className="text-5xl animate-bounce">🎉 ▲ 🏆</div>
            <h2 className="font-pixel text-xl text-[#FF6B00]">ALL STAGES CLEARED!</h2>
            <p className="text-sm font-bold text-[#000080]">
              ยอดเยี่ยมมาก! คุณได้ทำลายหุ่นยนต์และกอบกู้เมืองสำเร็จ!
            </p>

            <div className="bg-white p-4 win95-sunken text-left text-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold">คะแนนรวมทั้งหมด:</span>
                <span className="font-mono font-bold text-[#000080] text-base">{stats.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>กำจัดซอมบี้รวม:</span>
                <span className="font-mono font-bold text-red-600">{stats.kills} ตัว</span>
              </div>
              <div className="flex justify-between">
                <span>ยิงสกัดมิสไซล์กลางอากาศ:</span>
                <span className="font-mono font-bold text-orange-600">{stats.missilesDestroyed} ลูก</span>
              </div>
              <div className="flex justify-between">
                <span>ฟาดด้ามปืนสังหาร (Melee):</span>
                <span className="font-mono font-bold">{stats.meleeKills} ครั้ง</span>
              </div>
              <div className="flex justify-between">
                <span>สไลด์สังหาร (Slide):</span>
                <span className="font-mono font-bold">{stats.slideKills} ครั้ง</span>
              </div>
              <div className="flex justify-between">
                <span>คอมโบสูงสุด:</span>
                <span className="font-mono font-bold text-purple-600">{stats.maxCombo}x</span>
              </div>
            </div>

            <button
              onClick={() => onStartGame(0)}
              className="w-full py-3 bg-[#008080] text-white font-pixel text-xs win95-raised win95-button-active hover:bg-[#009999] flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              PLAY AGAIN (เล่นใหม่อีกครั้ง)
            </button>
          </div>
        </div>
      )}

      {/* 5. Pause Modal */}
      {status === 'paused' && (
        <div className="bg-[#C0C0C0] win95-raised p-2 max-w-sm w-full text-black shadow-2xl">
          <div className="bg-[#000080] text-white px-3 py-1 flex items-center justify-between font-pixel text-xs">
            <span>GAME_PAUSED.SYS</span>
            <span>PAUSED</span>
          </div>
          <div className="p-4 space-y-3 font-thai text-center">
            <h2 className="font-pixel text-sm text-[#000080]">เกมหยุดชั่วคราว</h2>
            <p className="text-xs text-gray-700">กดปุ่มด้านล่างหรือกด ESC เพื่อเล่นต่อ</p>
            <div className="space-y-2">
              <button
                onClick={onResume}
                className="w-full py-2 bg-[#008080] text-white font-pixel text-xs win95-raised win95-button-active cursor-pointer"
              >
                เล่นต่อ (RESUME)
              </button>
              <button
                type="button"
                onClick={onToggleTouchControls}
                className="w-full py-2 bg-[#DFDFDF] text-black font-thai text-xs win95-raised win95-button-active flex items-center justify-center gap-1.5 cursor-pointer font-bold"
              >
                <span>🎮 ปุ่มสัมผัส (Touch Pad):</span>
                <span className={showTouchControls ? 'text-green-700 font-extrabold' : 'text-gray-600'}>
                  {showTouchControls ? 'เปิด ON' : 'ปิด OFF'}
                </span>
              </button>
              <button
                onClick={onRestart}
                className="w-full py-2 bg-[#C0C0C0] text-black font-pixel text-xs win95-raised win95-button-active cursor-pointer"
              >
                เริ่มด่านใหม่ (RESTART)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
