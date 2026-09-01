export type EnemyType = 'normal' | 'fast' | 'leaper' | 'brute' | 'boss_tank' | 'boss_mutant' | 'boss_ticket' | 'boss_mech' | 'crow' | 'boss_tall_shadow';

export type StageId = 1 | 2 | 3;

export interface Platform {
  id: string;
  x: number;
  y: number; // Top surface Y level
  width: number;
  height: number;
  type: 'wood' | 'metal' | 'scaffold' | 'roof' | 'truck' | 'building' | 'metro';
  label?: string;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
  isSliding: boolean;
  slideTimer: number;
  slideCooldown: number;
  isMeleeing: boolean;
  meleeTimer: number;
  meleeCooldown: number;
  shootCooldown: number;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  reloadTimer: number;
  reloadDuration: number;
  health: number;
  maxHealth: number;
  state: 'idle' | 'run' | 'jump' | 'slide' | 'melee' | 'hit';
  invincibleTimer: number;
  aimAngle: number;
  runFrame: number;
  slideDustTimer: number;
  currentPlatform?: Platform | null;
  dropThroughTimer?: number;
  bombs: number;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  speed: number;
  facing: 'left' | 'right';
  state: 'idle' | 'walk' | 'leap' | 'leap_prep' | 'slam' | 'attack' | 'hit' | 'dead' | 'fly' | 'dive' | 'cast';
  attackCooldown: number;
  hitFlashTimer: number;
  isGrounded: boolean;
  animFrame: number;
  specialTimer?: number;
  missileCooldown?: number;
  targetY?: number;
  diveStartX?: number;
  diveStartY?: number;
  jumpCooldown?: number;
}

export interface TicketCard {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  life: number;
  maxLife: number;
  damage: number;
  color?: string;
}

export interface LaserBeam {
  id: string;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  angle: number;
  width: number;
  state: 'warning' | 'firing';
  timer: number;
  maxTimer: number;
  damage: number;
  color: string;
}

export interface MechHand {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  health: number;
  maxHealth: number;
  hitFlash: number;
  width: number;
  height: number;
  side: 'left' | 'right';
  state: 'grip' | 'slam_prep' | 'slam' | 'impact' | 'recovering' | 'destroyed';
  timer: number;
  targetX: number;
  targetY: number;
}

export interface MechBoss {
  active: boolean;
  introState: 'rising' | 'laugh1' | 'laugh2' | 'laugh3' | 'ready' | 'defeated';
  introTimer: number;
  riseY: number; // starts at 300, rises to 0
  arenaCenterX: number;
  arenaLeft: number;
  arenaRight: number;
  leftHand: MechHand;
  rightHand: MechHand;
  headHealth: number;
  headMaxHealth: number;
  headHitFlash: number;
  shielded: boolean;
  attackCooldown: number;
  laserPatternTimer: number;
  currentAttack: 'idle' | 'laser_spam' | 'hand_slam' | 'missile_salvo' | 'chest_laser';
  verticalPillars?: { x: number; width: number }[];
  chestLaser?: {
    angle: number;
    timer: number;
    maxTelegraph: number;
    duration: number;
    beamWidth: number;
    damage: number;
  };
  deathTimer: number;
  eyeFlash: boolean;
}

export interface ThrownCar {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  radius: number;
  damage: number;
  targetX: number;
  targetY: number;
  life: number;
  carType: number; // 0: sedan, 1: pickup, 2: rusted taxi
}

export interface TallShadowBoss {
  active: boolean;
  introState: 'walking_in' | 'roaring' | 'ready' | 'defeated';
  introTimer: number;
  x: number; // base world X
  y: number; // base ground Y
  walkTargetX: number;
  health: number;
  maxHealth: number;
  hitFlash: number;
  facing: 'left' | 'right';
  currentAttack: 'idle' | 'hand_slam' | 'car_throw' | 'crow_summon';
  attackCooldown: number;
  attackTimer: number;
  // Hand Slam attack parameters & telegraph
  slamState: 'idle' | 'prep' | 'slam' | 'impact' | 'rest' | 'retract';
  slamTimer: number;
  slamTargetX: number;
  handX: number;
  handY: number;
  handHitFlash: number;
  handDamageVulnerability: boolean;
  // Car Throw attack parameters & telegraph
  carThrowState: 'idle' | 'grab' | 'windup' | 'throw';
  carThrowTimer: number;
  carThrowTargetX: number;
  heldCarType: number;
  // Crow summon parameters
  crowSummonTimer: number;
  // Visual effects & death
  eyePulse: number;
  roarTimer: number;
  deathTimer: number;
}

export interface FallingRock {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  rotation: number;
  vRot: number;
  life: number;
  targetX: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  damage: number;
  radius: number;
  isMelee?: boolean;
}

export interface Missile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  health: number;
  maxHealth: number;
  angle: number;
  turnSpeed: number;
  life: number;
  trailTimer: number;
}

export type ParticleType = 'blood' | 'spark' | 'smoke' | 'shell' | 'dust' | 'debris' | 'text' | 'explosion' | 'muzzle' | 'gib' | 'feather' | 'shockwave';

export type GibType = 'head' | 'torso' | 'arm' | 'leg' | 'bone' | 'chunk' | 'wing' | 'beak' | 'feather';

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: ParticleType;
  text?: string;
  gravity?: number;
  rotation?: number;
  vRot?: number;
  gibType?: GibType;
  enemyType?: EnemyType;
  bounces?: number;
}

export interface StageConfig {
  id: StageId;
  name: string;
  thaiName: string;
  description: string;
  mapLength: number;
  bgTheme: 'village' | 'forest' | 'city';
  spawnRate: number; // spawns per interval
  maxZombiesAtOnce: number;
  enemyPool: EnemyType[];
  skyColorTop: string;
  skyColorBottom: string;
  groundColor: string;
  accentColor: string;
}

export type GameStatus = 'menu' | 'playing' | 'paused' | 'stage_clear' | 'game_over' | 'victory';

export interface GameStats {
  score: number;
  kills: number;
  totalShots: number;
  meleeKills: number;
  slideKills: number;
  missilesDestroyed: number;
  damageDealt: number;
  timeSeconds: number;
  combo: number;
  maxCombo: number;
  comboTimer: number;
}

export interface Bomb {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  fuse: number;
  maxFuse: number;
  rotation: number;
  vRot: number;
}

export interface KeyControls {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  slide: boolean;
  melee: boolean;
  bomb: boolean;
  shoot: boolean;
  reload: boolean;
  mouseX: number;
  mouseY: number;
  mouseWorldX: number;
  mouseWorldY: number;
}
