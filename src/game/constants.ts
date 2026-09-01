import { StageConfig } from '../types';

export const CANVAS_HEIGHT = 480;
export const CANVAS_WIDTH = 800;
export const GROUND_Y = 400;

export const PLAYER_CONFIG = {
  width: 22, // Tighter hurtbox for easier dodging
  height: 52, // Tighter hurtbox
  walkSpeed: 3.1, // Grounded, tactical movement pacing (slightly slower as requested)
  jumpForce: -10.5, // Floaty, controllable jump apex
  gravity: 0.35, // Smooth airtime
  slideSpeed: 7.6,
  slideDuration: 18, // frames
  slideCooldown: 24,
  meleeDuration: 15,
  meleeCooldown: 18,
  meleeDamage: 180, // Heavy satisfying swat / swing
  meleeRange: 130, // Generous melee reach to swat flying crows and zombies
  shootCooldown: 22,
  maxAmmo: 10, // 10 rounds clip
  reloadFrames: 180, // 3 seconds at 60fps
  shotgunPellets: 6,
  pelletDamage: 18,
  pelletSpread: 0.28, // radians
  pelletSpeed: 18,
  maxHealth: 50, // Player HP set to 50 as requested
  invincibleTime: 40,
};

export const BOMB_CONFIG = {
  radius: 160,
  damage: 600,
  throwSpeed: 13,
  fuseFrames: 60, // 1 second fuse or explodes on contact with enemy
  startBombs: 1, // Start with 1 tactical bomb!
};

export const STAGE_ZOMBIE_QUOTAS: Record<number, number> = {
  1: 48, // Stage 1: Must kill all 48 zombies to open exit gate
  2: 60, // Stage 2: Must kill all 60 zombies to open exit gate
  3: 0,  // Stage 3: Defeat bosses (not required to kill all minions)
};

export const ENEMY_CONFIGS = {
  normal: {
    width: 32,
    height: 60,
    health: 42, // Increased durability
    speed: 0.75, // Slower relaxed walker zombie
    damage: 10,
    score: 100,
    color: '#3B7A57',
    name: 'Walker Zombie',
  },
  fast: {
    width: 30,
    height: 58,
    health: 34, // Increased durability
    speed: 1.55, // Comfortable runner speed
    damage: 12,
    score: 150,
    color: '#D97706',
    name: 'Runner Zombie',
  },
  leaper: {
    width: 34,
    height: 56,
    health: 55, // Increased durability
    speed: 1.0,
    leapForce: -5.6,
    leapForward: 2.8,
    damage: 18,
    score: 250,
    color: '#805AD5',
    name: 'Leaper Zombie',
  },
  brute: {
    width: 52,
    height: 76,
    health: 150, // Tough mini-tank zombie
    speed: 0.6,
    damage: 28,
    score: 400,
    color: '#9B2C2C',
    name: 'Brute Zombie',
  },
  boss_ticket: {
    width: 46,
    height: 78,
    health: 4800, // Tripled durability (3x HP, 1600 -> 4800) Phase 1 Boss
    speed: 0.8, // Reduced speed for readable, fair combat pacing
    damage: 22,
    score: 7000,
    color: '#9B2C2C',
    name: 'Ticket Master Z-Conductor (Phase 1)',
  },
  boss_mech: {
    width: 480,
    height: 380,
    health: 30600, // Quadrupled robot head health (10800) + 2x hand health (9900*2) Colossal Titan Mech
    speed: 0,
    damage: 30,
    score: 25000,
    color: '#2D3748',
    name: 'Giga Mecha-Z (Colossal Titan Phase 2)',
  },
  boss_tank: {
    width: 250,
    height: 160,
    health: 1600,
    speed: 0.55,
    damage: 40,
    score: 6000,
    color: '#2D3748',
    name: 'General Tank-Z (Colossus Phase 1)',
  },
  boss_mutant: {
    width: 80,
    height: 115,
    health: 1800,
    speed: 0.85,
    damage: 35,
    score: 10000,
    color: '#6B46C1',
    name: 'Titan General Z (Berserk Phase 2)',
  },
  crow: {
    width: 28,
    height: 22,
    health: 22, // Increased durability
    speed: 2.5,
    damage: 8,
    score: 150,
    color: '#1A202C',
    name: 'Zombie Crow',
  },
  boss_tall_shadow: {
    width: 220,
    height: 520,
    health: 6400, // Doubled durability (2x HP: 3200 -> 6400) Stage 2 Sub-Boss
    speed: 0.8,
    damage: 14, // Reduced damage by 50%
    score: 10000,
    color: '#3B4252',
    name: 'Colossal Human Zombie (ซอมบี้มนุษย์ร่างยักษ์)',
  },
};

export const STAGES: StageConfig[] = [
  {
    id: 1,
    name: 'Stage 1: Quiet Village',
    thaiName: 'ด่านที่ 1: หมู่บ้านอันเงียบสงัด',
    description: 'หมู่บ้านชานเมืองยามพลบค่ำ มีระเบียงบ้าน ลังไม้ให้ปีน ซอมบี้เดินช้าและวิ่งเร็ว',
    mapLength: 3400,
    bgTheme: 'village',
    spawnRate: 60, // Faster spawn rate for larger horde
    maxZombiesAtOnce: 14, // Higher simultaneous zombie density
    enemyPool: ['normal', 'normal', 'fast', 'fast'],
    skyColorTop: '#1A202C',
    skyColorBottom: '#4A5568',
    groundColor: '#2D3748',
    accentColor: '#ED8936',
  },
  {
    id: 2,
    name: 'Stage 2: Dark Forest & Highway Convoy',
    thaiName: 'ด่านที่ 2: ป่าทึบและขบวนซากรถบนทางหลวง',
    description: 'ป่าสนมืดมิดและทางหลวงที่มีซากรถยนต์ นั่งร้านก่อสร้าง และฝูงอีกาซอมบี้บินโฉบ!',
    mapLength: 4400,
    bgTheme: 'forest',
    spawnRate: 50, // Rapid waves
    maxZombiesAtOnce: 16, // Higher simultaneous zombie density
    enemyPool: ['normal', 'fast', 'crow', 'crow', 'fast'],
    skyColorTop: '#0D1B2A',
    skyColorBottom: '#1B263B',
    groundColor: '#1E293B',
    accentColor: '#38A169',
  },
  {
    id: 3,
    name: 'Stage 3: Ruined Station & Giga Mecha-Z',
    thaiName: 'ด่านที่ 3: สถานีรถไฟร้างและบอสจักรกลยักษ์',
    description: 'สถานีรถไฟร้างพังทลาย ซอมบี้กระโดด ซอมบี้กล้ามโต และบอสนายตรวจตั๋วมรณะที่ขับหุ่นยนต์ยักษ์!',
    mapLength: 5200,
    bgTheme: 'city',
    spawnRate: 85,
    maxZombiesAtOnce: 12,
    enemyPool: ['normal', 'fast', 'leaper', 'brute'],
    skyColorTop: '#171923',
    skyColorBottom: '#742A2A',
    groundColor: '#1A202C',
    accentColor: '#E53E3E',
  },
];
