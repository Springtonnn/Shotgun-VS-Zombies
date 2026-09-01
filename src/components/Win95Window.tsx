import React, { useState, useEffect } from 'react';
import { GameEngine } from '../game/engine';
import { GameCanvas } from './GameCanvas';
import { sound } from '../audio';
import { Volume2, VolumeX, Monitor, HelpCircle, RefreshCw, Layers, Gamepad2, Info, X } from 'lucide-react';
import { STAGES } from '../game/constants';

interface Win95WindowProps {
  engine: GameEngine;
}

export const Win95Window: React.FC<Win95WindowProps> = ({ engine }) => {
  const [scanlines, setScanlines] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [musicOn, setMusicOn] = useState<boolean>(true);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [clockStr, setClockStr] = useState<string>('');

  // Update system tray clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setClockStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const res = sound.toggleSound();
    setSoundOn(res);
  };

  const handleToggleMusic = () => {
    const res = sound.toggleMusic();
    setMusicOn(res);
  };

  return (
    <div className="w-full min-h-screen bg-[#008080] flex flex-col justify-between p-0.5 sm:p-2 md:p-4 select-none relative overflow-hidden">
      {/* Desktop Background Icons (Windows 95 aesthetic) */}
      <div className="absolute top-4 left-4 hidden sm:flex flex-col gap-5 z-0 pointer-events-auto">
        <div
          onClick={() => setShowHelp(true)}
          className="flex flex-col items-center w-16 text-center cursor-pointer group"
        >
          <div className="w-10 h-10 bg-[#C0C0C0] win95-raised flex items-center justify-center text-xl group-active:translate-y-0.5">
            📖
          </div>
          <span className="text-[11px] text-white font-pixel mt-1 px-1 bg-[#000080] rounded">
            Manual.txt
          </span>
        </div>

        <div
          onClick={() => engine.startGame(0)}
          className="flex flex-col items-center w-16 text-center cursor-pointer group"
        >
          <div className="w-10 h-10 bg-[#C0C0C0] win95-raised flex items-center justify-center text-xl group-active:translate-y-0.5">
            ▲
          </div>
          <span className="text-[11px] text-white font-pixel mt-1 px-1 bg-[#000080] rounded">
            Game.exe
          </span>
        </div>
      </div>

      {/* Main Game Window Container */}
      <div className="flex-1 flex items-center justify-center z-10 my-auto w-full">
        <div className="w-full max-w-[980px] bg-[#C0C0C0] win95-raised flex flex-col shadow-2xl">
          {/* Windows 95 Navy Title Bar */}
          <div className="bg-gradient-to-r from-[#000080] to-[#1084D0] text-white px-2 py-1 flex items-center justify-between font-pixel text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#FF6600] font-bold">▲</span>
              <span className="truncate">
                Shotgun vs Zombies - [{engine.currentStage.name}]
              </span>
            </div>
            {/* Window control buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => (engine.status = engine.status === 'paused' ? 'playing' : 'paused')}
                className="w-5 h-4 bg-[#C0C0C0] win95-raised win95-button-active text-black text-[10px] font-bold flex items-center justify-center"
              >
                _
              </button>
              <button
                onClick={() => setScanlines(!scanlines)}
                title="Toggle Scanlines"
                className="w-5 h-4 bg-[#C0C0C0] win95-raised win95-button-active text-black text-[10px] font-bold flex items-center justify-center"
              >
                □
              </button>
              <button
                onClick={() => (engine.status = 'menu')}
                className="w-5 h-4 bg-[#C0C0C0] win95-raised win95-button-active text-black text-[10px] font-bold flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>

          {/* Windows 95 Menu Bar */}
          <div className="bg-[#C0C0C0] border-b border-gray-400 px-2 py-0.5 flex items-center gap-4 text-xs font-thai relative">
            {/* Game Menu */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'game' ? null : 'game')}
                className={`px-2 py-0.5 hover:bg-[#000080] hover:text-white cursor-pointer ${
                  activeMenu === 'game' ? 'bg-[#000080] text-white' : ''
                }`}
              >
                เกม (Game)
              </button>
              {activeMenu === 'game' && (
                <div className="absolute left-0 top-full mt-0.5 bg-[#C0C0C0] win95-raised py-1 w-44 z-50 text-black shadow-lg text-xs">
                  <button
                    onClick={() => {
                      engine.startGame(0);
                      setActiveMenu(null);
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white"
                  >
                    เริ่มเกมใหม่ (New Game)
                  </button>
                  <button
                    onClick={() => {
                      engine.startGame(engine.currentStageIndex);
                      setActiveMenu(null);
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white"
                  >
                    เริ่มด่านนี้ใหม่ (Restart Stage)
                  </button>
                  <div className="border-t border-gray-400 my-1" />
                  <div className="px-3 py-0.5 text-[11px] text-gray-600 font-bold">เลือกด่าน (Stage):</div>
                  {STAGES.map((st, i) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        engine.startGame(i);
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-4 py-1 hover:bg-[#000080] hover:text-white text-xs"
                    >
                      ด่านที่ {st.id} ({st.bgTheme})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Audio Menu */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'audio' ? null : 'audio')}
                className={`px-2 py-0.5 hover:bg-[#000080] hover:text-white cursor-pointer ${
                  activeMenu === 'audio' ? 'bg-[#000080] text-white' : ''
                }`}
              >
                เสียง (Audio)
              </button>
              {activeMenu === 'audio' && (
                <div className="absolute left-0 top-full mt-0.5 bg-[#C0C0C0] win95-raised py-1 w-44 z-50 text-black shadow-lg text-xs">
                  <button
                    onClick={() => {
                      handleToggleSound();
                      setActiveMenu(null);
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white flex justify-between"
                  >
                    <span>เสียงเอฟเฟกต์ (SFX)</span>
                    <span>{soundOn ? '✓' : ''}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleToggleMusic();
                      setActiveMenu(null);
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white flex justify-between"
                  >
                    <span>เพลงสังเคราะห์ (BGM)</span>
                    <span>{musicOn ? '✓' : ''}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Display Menu */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'display' ? null : 'display')}
                className={`px-2 py-0.5 hover:bg-[#000080] hover:text-white cursor-pointer ${
                  activeMenu === 'display' ? 'bg-[#000080] text-white' : ''
                }`}
              >
                การแสดงผล (Display)
              </button>
              {activeMenu === 'display' && (
                <div className="absolute left-0 top-full mt-0.5 bg-[#C0C0C0] win95-raised py-1 w-44 z-50 text-black shadow-lg text-xs">
                  <button
                    onClick={() => {
                      setScanlines(!scanlines);
                      setActiveMenu(null);
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white flex justify-between"
                  >
                    <span>เส้นสแกน CRT (Scanlines)</span>
                    <span>{scanlines ? '✓' : ''}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Help Menu */}
            <button
              onClick={() => setShowHelp(true)}
              className="px-2 py-0.5 hover:bg-[#000080] hover:text-white cursor-pointer"
            >
              คู่มือ / ปุ่มกด (Help)
            </button>
          </div>

          {/* Window Canvas Body */}
          <div className="p-1.5 bg-[#808080]">
            <GameCanvas engine={engine} scanlines={scanlines} />
          </div>

          {/* Windows 95 Status Bar at Bottom of Window */}
          <div className="bg-[#C0C0C0] px-2 py-1 flex items-center justify-between text-[11px] font-thai text-gray-800 border-t border-gray-400">
            <div className="flex items-center gap-3">
              <span className="win95-sunken px-2 py-0.5 bg-gray-200">
                สถานะ: {engine.status === 'playing' ? 'กำลังเล่น' : engine.status}
              </span>
              <span className="win95-sunken px-2 py-0.5 bg-gray-200 hidden sm:inline">
                อาวุธ: ลูกซองคู่กาย (กระสุนไม่จำกัด)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="win95-sunken px-2 py-0.5 bg-gray-200">
                60 FPS
              </span>
              <span className="win95-sunken px-2 py-0.5 bg-gray-200">
                DirectX 95
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual / Help Dialog */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#C0C0C0] win95-raised p-2 max-w-lg w-full text-black shadow-2xl">
            <div className="bg-[#000080] text-white px-3 py-1 flex items-center justify-between font-pixel text-xs">
              <span>MANUAL.HLP - คำแนะนำเกม</span>
              <button
                onClick={() => setShowHelp(false)}
                className="w-4 h-4 bg-[#C0C0C0] text-black text-xs font-bold flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-3 font-thai text-xs leading-relaxed max-h-[70vh] overflow-y-auto">
              <div className="font-bold text-sm text-[#000080] border-b pb-1">
                🕹️ ระบบการเล่นและการควบคุม (Keyboard & Mouse)
              </div>
              <ul className="space-y-1.5 list-disc pl-5">
                <li><b>A / D</b> : วิ่งไปทางซ้ายหรือขวาอย่างรวดเร็วและคล่องแคล่ว</li>
                <li><b>W</b> : กระโดดหลบซอมบี้หรือสิ่งกีดขวาง</li>
                <li>
                  <b>S</b> : สไลด์หลบการโจมตี เป็นอมตะชั่วขณะ และสร้างความเสียหายศัตรู
                </li>
                <li>
                  <b>Left Mouse Click</b> : ยิงปืนลูกซองกระจาย 6 เม็ด (R เพื่อรีโหลด)
                </li>
                <li>
                  <b>Right Mouse Click / Space</b> : ปาระเบิดยุทธวิธี (600 DMG! สังหารครบทุกๆ 10 ตัวได้ระเบิด +1 ลูก)
                </li>
                <li>
                  <b>F / E / V</b> : ฟาดด้ามปืน (Melee) สังหารซอมบี้ทั่วไปในครั้งเดียว (1-Hit Kill!)
                </li>
              </ul>

              <div className="font-bold text-sm text-[#000080] border-b pt-2 pb-1">
                📱 การควบคุมสำหรับมือถือ (Touchscreen Controls)
              </div>
              <ul className="space-y-1.5 list-disc pl-5">
                <li><b>ปุ่มวงกลมด้านซ้ายล่าง</b> : 🗡️ ฟาดด้ามปืนประชิด (1-Hit Kill) และ 💣 ปาระเบิดยุทธวิธี</li>
                <li><b>ปุ่มลูกศรเหลี่ยมด้านขวาล่าง (D-Pad)</b> : ▲ โดด, ▼ สไลด์, ◀ ซ้าย, ▶ ขวา, 🔄 รีโหลด</li>
                <li><b>แตะบนหน้าจอเกม</b> : เล็งและยิงปืนลูกซองไปยังตำแหน่งที่แตะทันที</li>
                <li><b>เปิด-ปิดปุ่มควบคุม Pad</b> : สามารถกดเปิด/ปิดปุ่มสัมผัสได้ที่หน้าเมนูหลัก (Menu) หรือหน้าหยุดเกม (Pause)</li>
                <li><b>รองรับการเล่นแนวนอน (Landscape)</b> : พลิกมือถือแนวนอนเพื่อการควบคุมที่สะดวกและมุมมองที่กว้างเต็มตา</li>
              </ul>

              <div className="font-bold text-sm text-[#000080] border-b pt-2 pb-1">
                🗺️ รายละเอียดทั้ง 3 ด่าน & ศัตรู
              </div>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>
                  <b>ด่าน 1 (หมู่บ้าน)</b>: ซอมบี้เดินช้า (ยกมือ 2 ข้าง) และซอมบี้วิ่งเร็ว
                </li>
                <li>
                  <b>ด่าน 2 (ป่า)</b>: ฝูงซอมบี้จำนวนมหาศาลล้อมกรอบมาเป็นฝูง
                </li>
                <li>
                  <b>ด่าน 3 (หุ่นยนต์)</b>: มีซอมบี้กระโดด ซอมบี้กล้ามโต และบอสใหญ่
                  <b>บอสจักรกลยักษ์ (Giga Mecha-Z)</b> ที่จะยิงเลเซอร์ ปล่อยหมัดจรวด และยิงมิสไซล์ตามติด
                  (เราสามารถใช้ปืนลูกซองยิงทำลายมิสไซล์หรือมือจักรกลได้!)
                </li>
              </ul>

              <button
                onClick={() => setShowHelp(false)}
                className="w-full py-2 bg-[#008080] text-white font-pixel text-xs win95-raised win95-button-active cursor-pointer mt-4"
              >
                ปิดหน้าต่าง (OK)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Windows 95 Desktop Taskbar at Bottom */}
      <div className="w-full bg-[#C0C0C0] win95-raised px-1 py-0.5 flex items-center justify-between z-20 font-thai text-xs mt-2">
        <div className="flex items-center gap-2">
          {/* Start Button */}
          <button
            onClick={() => engine.startGame(0)}
            className="flex items-center gap-1.5 px-2 py-1 bg-[#C0C0C0] win95-raised win95-button-active font-bold text-black cursor-pointer"
          >
            <span className="text-base">🪟</span>
            <span className="font-pixel text-[11px]">Start</span>
          </button>

          {/* Active Task */}
          <div className="px-3 py-1 bg-gray-200 win95-sunken font-bold flex items-center gap-1.5 text-black">
            <span className="text-[#FF6600]">▲</span>
            <span className="text-xs">Shotgun vs Zombies</span>
          </div>
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-3 bg-gray-200 win95-sunken px-3 py-1 text-black font-mono text-xs">
          <button
            onClick={handleToggleSound}
            title={soundOn ? 'Sound On' : 'Sound Off'}
            className="cursor-pointer hover:text-blue-700"
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-red-600" />}
          </button>
          <button
            onClick={() => setScanlines(!scanlines)}
            title="Toggle CRT Scanline Effect"
            className="cursor-pointer hover:text-blue-700"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <span className="font-bold">{clockStr || '12:00 PM'}</span>
        </div>
      </div>
    </div>
  );
};
