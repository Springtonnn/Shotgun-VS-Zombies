import { sound } from '../audio';
import { Bomb, Bullet, Enemy, FallingRock, GameStats, GameStatus, KeyControls, LaserBeam, MechBoss, MechHand, Missile, Particle, Platform, Player, StageConfig, TallShadowBoss, ThrownCar, TicketCard } from '../types';
import { BOMB_CONFIG, CANVAS_HEIGHT, CANVAS_WIDTH, ENEMY_CONFIGS, GROUND_Y, PLAYER_CONFIG, STAGE_ZOMBIE_QUOTAS, STAGES } from './constants';

export class GameEngine {
  public player: Player;
  public platforms: Platform[] = [];
  public enemies: Enemy[] = [];
  public bullets: Bullet[] = [];
  public missiles: Missile[] = [];
  public bombs: Bomb[] = [];
  public particles: Particle[] = [];
  public ticketCards: TicketCard[] = [];
  public fallingRocks: FallingRock[] = [];
  public thrownCars: ThrownCar[] = [];
  public mechBoss: MechBoss | null = null;
  public tallShadowBoss: TallShadowBoss | null = null;
  public arenaLocked: boolean = false;
  public arenaLeft: number = 0;
  public arenaRight: number = 0;
  public keys: KeyControls = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    slide: false,
    melee: false,
    bomb: false,
    shoot: false,
    reload: false,
    mouseX: 0,
    mouseY: 0,
    mouseWorldX: 0,
    mouseWorldY: 0,
  };

  public currentStageIndex: number = 0;
  public status: GameStatus = 'menu';
  public stats: GameStats = {
    score: 0,
    kills: 0,
    totalShots: 0,
    meleeKills: 0,
    slideKills: 0,
    missilesDestroyed: 0,
    damageDealt: 0,
    timeSeconds: 0,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
  };

  public cameraX: number = 0;
  public screenShake: number = 0;
  public spawnTimer: number = 0;
  public bossSpawned: boolean = false;
  public bossDefeated: boolean = false;
  public gameTime: number = 0;
  public stageZombiesTotal: number = 25;
  public stageZombiesKilled: number = 0;
  public stageZombiesSpawnedCount: number = 0;

  constructor() {
    this.player = this.createInitialPlayer();
  }

  public get currentStage(): StageConfig {
    return STAGES[this.currentStageIndex];
  }

  private createInitialPlayer(): Player {
    return {
      x: 150,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      width: PLAYER_CONFIG.width,
      height: PLAYER_CONFIG.height,
      facing: 'right',
      isGrounded: true,
      isSliding: false,
      slideTimer: 0,
      slideCooldown: 0,
      isMeleeing: false,
      meleeTimer: 0,
      meleeCooldown: 0,
      shootCooldown: 0,
      ammo: PLAYER_CONFIG.maxAmmo,
      maxAmmo: PLAYER_CONFIG.maxAmmo,
      isReloading: false,
      reloadTimer: 0,
      reloadDuration: PLAYER_CONFIG.reloadFrames,
      health: PLAYER_CONFIG.maxHealth,
      maxHealth: PLAYER_CONFIG.maxHealth,
      state: 'idle',
      invincibleTimer: 0,
      aimAngle: 0,
      runFrame: 0,
      slideDustTimer: 0,
      bombs: BOMB_CONFIG.startBombs,
    };
  }

  public startGame(stageIndex: number = 0) {
    this.currentStageIndex = stageIndex;
    this.resetStage();
    this.status = 'playing';
    sound.enableAudio();
  }

  public resetStage() {
    this.player = this.createInitialPlayer();
    this.platforms = this.generatePlatforms(this.currentStageIndex);
    this.enemies = [];
    this.bullets = [];
    this.missiles = [];
    this.bombs = [];
    this.particles = [];
    this.ticketCards = [];
    this.fallingRocks = [];
    this.thrownCars = [];
    this.mechBoss = null;
    this.tallShadowBoss = null;
    this.arenaLocked = false;
    this.arenaLeft = 0;
    this.arenaRight = 0;
    this.cameraX = 0;
    this.screenShake = 0;
    this.spawnTimer = 0;
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.stats.combo = 0;
    this.stats.comboTimer = 0;
    this.stageZombiesTotal = STAGE_ZOMBIE_QUOTAS[this.currentStage.id] || 0;
    this.stageZombiesKilled = 0;
    this.stageZombiesSpawnedCount = 0;

    // Pre-populate Stage 1 & 2 initial zombies across platforms and terrain
    if (this.currentStage.id === 1) {
      const initialSpawns: { type: Enemy['type']; x: number; y?: number }[] = [
        { type: 'normal', x: 380 },
        { type: 'fast', x: 520 },
        { type: 'normal', x: 740, y: 220 },
        { type: 'fast', x: 860 },
        { type: 'normal', x: 1050 },
        { type: 'normal', x: 1150, y: 290 },
        { type: 'fast', x: 1300 },
        { type: 'normal', x: 1480, y: 200 },
        { type: 'normal', x: 1650 },
        { type: 'fast', x: 1850, y: 280 },
        { type: 'normal', x: 2050 },
        { type: 'fast', x: 2220, y: 190 },
        { type: 'normal', x: 2400 },
        { type: 'fast', x: 2600, y: 280 },
        { type: 'normal', x: 2800 },
        { type: 'normal', x: 2950, y: 200 },
        { type: 'fast', x: 3100 },
        { type: 'normal', x: 3220 },
      ];
      for (const s of initialSpawns) {
        this.spawnEnemyAt(s.type, s.x, s.y);
        this.stageZombiesSpawnedCount++;
      }
    } else if (this.currentStage.id === 2) {
      const initialSpawns: { type: Enemy['type']; x: number; y?: number }[] = [
        { type: 'normal', x: 360, y: 290 },
        { type: 'crow', x: 480, y: 150 },
        { type: 'fast', x: 620 },
        { type: 'normal', x: 720, y: 200 },
        { type: 'crow', x: 880, y: 140 },
        { type: 'fast', x: 1020, y: 130 },
        { type: 'normal', x: 1180 },
        { type: 'crow', x: 1320, y: 160 },
        { type: 'fast', x: 1460 },
        { type: 'normal', x: 1620, y: 190 },
        { type: 'crow', x: 1780, y: 140 },
        { type: 'fast', x: 1960, y: 130 },
        { type: 'normal', x: 2100 },
        { type: 'crow', x: 2280, y: 150 },
        { type: 'fast', x: 2440 },
        { type: 'normal', x: 2600, y: 190 },
        { type: 'crow', x: 2780, y: 140 },
        { type: 'fast', x: 2940, y: 270 },
        { type: 'normal', x: 3120 },
        { type: 'crow', x: 3300, y: 150 },
        { type: 'fast', x: 3480 },
        { type: 'normal', x: 3650, y: 280 },
        { type: 'crow', x: 3820, y: 140 },
        { type: 'fast', x: 4000 },
        { type: 'normal', x: 4180 },
      ];
      for (const s of initialSpawns) {
        this.spawnEnemyAt(s.type, s.x, s.y);
        this.stageZombiesSpawnedCount++;
      }
    }
  }

  // Generate tactical multi-level platforms tailored to each stage's environment
  private generatePlatforms(stageIndex: number): Platform[] {
    const list: Platform[] = [];

    if (stageIndex === 0) {
      // Stage 1: Village / Suburban Outskirts - Red tile roofs & cottage gables
      const data = [
        { x: 380, y: 290, width: 230, type: 'roof' as const, label: 'Cottage Tile Roof' },
        { x: 740, y: 220, width: 250, type: 'roof' as const, label: 'Villa Shingles' },
        { x: 1120, y: 290, width: 220, type: 'roof' as const, label: 'Porch Eaves' },
        { x: 1460, y: 200, width: 260, type: 'roof' as const, label: 'Barn Gables' },
        { x: 1840, y: 280, width: 230, type: 'roof' as const, label: 'Suburban Roof' },
        { x: 2200, y: 190, width: 250, type: 'roof' as const, label: 'Clocktower Eaves' },
        { x: 2580, y: 280, width: 220, type: 'roof' as const, label: 'Village House Roof' },
        { x: 2920, y: 200, width: 260, type: 'roof' as const, label: 'Manor Shingles' },
      ];
      data.forEach((p, idx) => {
        list.push({ id: `p1_${idx}`, x: p.x, y: p.y, width: p.width, height: 20, type: p.type, label: p.label });
      });

    } else if (stageIndex === 1) {
      // Stage 2: Highway & Forest - Construction scaffolding & Abandoned road vehicles (trucks/buses)
      const data = [
        { x: 360, y: 290, width: 210, type: 'truck' as const, label: 'Abandoned Cargo Truck' },
        { x: 680, y: 200, width: 230, type: 'scaffold' as const, label: 'Steel Scaffolding L1' },
        { x: 980, y: 130, width: 190, type: 'scaffold' as const, label: 'Tower Scaffold L2' },
        { x: 1260, y: 280, width: 240, type: 'truck' as const, label: 'Derelict Bus Roof' },
        { x: 1600, y: 190, width: 240, type: 'scaffold' as const, label: 'Highway Scaffolding' },
        { x: 1940, y: 130, width: 200, type: 'scaffold' as const, label: 'High Perch Rig' },
        { x: 2240, y: 280, width: 230, type: 'truck' as const, label: 'Military Transport Truck' },
        { x: 2580, y: 190, width: 240, type: 'scaffold' as const, label: 'Construction Platform' },
        { x: 2920, y: 270, width: 220, type: 'truck' as const, label: 'Broken Delivery Van' },
        { x: 3240, y: 160, width: 250, type: 'scaffold' as const, label: 'Bridge Scaffold Rig' },
        { x: 3600, y: 280, width: 230, type: 'truck' as const, label: 'Armored Carrier' },
        { x: 3940, y: 180, width: 240, type: 'scaffold' as const, label: 'Watch Scaffold' },
      ];
      data.forEach((p, idx) => {
        list.push({ id: `p2_${idx}`, x: p.x, y: p.y, width: p.width, height: 20, type: p.type, label: p.label });
      });

    } else {
      // Stage 3: Ruined Cyber Station & Skyline - Skyscraper rooftops/balconies & Metro train carts
      const data = [
        { x: 380, y: 290, width: 230, type: 'metro' as const, label: 'Metro Train Car 01' },
        { x: 700, y: 190, width: 260, type: 'building' as const, label: 'Skyscraper Balcony' },
        { x: 1050, y: 120, width: 210, type: 'building' as const, label: 'Rooftop Helipad' },
        { x: 1360, y: 280, width: 240, type: 'metro' as const, label: 'Transit Cart Roof' },
        { x: 1700, y: 180, width: 270, type: 'building' as const, label: 'Station Tower Roof' },
        { x: 2080, y: 290, width: 230, type: 'metro' as const, label: 'Derelict Monorail' },
        { x: 2400, y: 170, width: 260, type: 'building' as const, label: 'Neon Billboard Roof' },
        { x: 2760, y: 270, width: 240, type: 'metro' as const, label: 'Express Metro Cart' },
        { x: 3100, y: 160, width: 260, type: 'building' as const, label: 'Sky-Deck Platform' },
        { x: 3460, y: 270, width: 240, type: 'metro' as const, label: 'Freight Transport' },
        { x: 3820, y: 170, width: 270, type: 'building' as const, label: 'Metro Control Tower' },
      ];
      data.forEach((p, idx) => {
        list.push({ id: `p3_${idx}`, x: p.x, y: p.y, width: p.width, height: 22, type: p.type, label: p.label });
      });
    }

    return list;
  }

  public nextStage() {
    if (this.currentStageIndex < STAGES.length - 1) {
      this.currentStageIndex++;
      this.resetStage();
      this.status = 'playing';
    } else {
      this.status = 'victory';
      sound.playVictory();
    }
  }

  public update(deltaTime: number) {
    if (this.status !== 'playing') return;

    this.gameTime += deltaTime;
    this.stats.timeSeconds = Math.floor(this.gameTime);

    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - 0.5);
    }

    // Update Combo Timer
    if (this.stats.comboTimer > 0) {
      this.stats.comboTimer--;
      if (this.stats.comboTimer <= 0) {
        this.stats.combo = 0;
      }
    }

    this.updatePlayer();
    this.updateEnemies();
    this.updateTicketCards();
    this.updateFallingRocks();
    this.updateThrownCars();
    this.updateTallShadowBoss();
    this.updateMechBoss();
    this.updateBullets();
    this.updateMissiles();
    this.updateBombs();
    this.updateParticles();
    this.updateSpawns();
    this.updateCamera();
    this.checkStageObjectives();
  }

  private updatePlayer() {
    const p = this.player;

    // Cooldown decrements
    if (p.shootCooldown > 0) p.shootCooldown--;
    if (p.slideCooldown > 0) p.slideCooldown--;
    if (p.meleeCooldown > 0) p.meleeCooldown--;
    if (p.invincibleTimer > 0) p.invincibleTimer--;

    // Reloading State
    if (p.isReloading) {
      p.reloadTimer--;
      // Particle sparks during reload
      if (p.reloadTimer % 24 === 0) {
        sound.playReloadStart();
        this.addSparkParticle(p.x, p.y - 45, '#ECC94B');
      }
      if (p.reloadTimer <= 0) {
        p.isReloading = false;
        p.ammo = p.maxAmmo;
        sound.playReloadComplete();
        this.particles.push({
          id: Math.random().toString(),
          x: p.x,
          y: p.y - 60,
          vx: 0,
          vy: -0.6,
          color: '#48BB78',
          size: 11,
          life: 35,
          maxLife: 35,
          type: 'text',
          text: '⚡ SHOTGUN RELOADED (10/10)!',
        });
      }
    } else {
      // Manual Reload Trigger (Press R or if out of ammo)
      if (this.keys.reload && p.ammo < p.maxAmmo) {
        p.isReloading = true;
        p.reloadTimer = p.reloadDuration;
        sound.playReloadStart();
      }
    }

    // Aim Angle relative to camera
    const playerScreenX = p.x - this.cameraX;
    const playerScreenY = p.y - 45;
    const dx = this.keys.mouseX - playerScreenX;
    const dy = this.keys.mouseY - playerScreenY;
    p.aimAngle = Math.atan2(dy, dx);
    p.facing = dx >= 0 ? 'right' : 'left';

    // Slide state handling
    if (p.isSliding) {
      p.slideTimer--;
      p.slideDustTimer++;
      if (p.slideDustTimer % 3 === 0) {
        this.addDustParticle(p.x - (p.facing === 'right' ? 24 : -24), GROUND_Y);
      }

      // Slide collision with enemies (deals heavy damage and knocks back)
      for (const enemy of this.enemies) {
        if (enemy.health > 0 && Math.abs(enemy.x - p.x) < 55 && Math.abs(enemy.y - p.y) < 45) {
          this.hitEnemy(enemy, 75, 'slide');
          this.screenShake = 3;
        }
      }

      // Slide strike on Tall Shadow Boss resting hand
      if (this.tallShadowBoss && this.tallShadowBoss.active && this.tallShadowBoss.introState === 'ready') {
        const sb = this.tallShadowBoss;
        if (sb.slamState === 'rest' && Math.abs(sb.handX - p.x) < 60 && Math.abs(sb.handY - p.y) < 55) {
          sb.health -= 85;
          sb.hitFlash = 6;
          sb.handHitFlash = 8;
          this.stats.damageDealt += 85;
          this.screenShake = 6;
          this.addSparkParticle(sb.handX, sb.handY, '#FF6B00');
          sound.playMeleeHit();
          if (sb.health <= 0) {
            this.defeatTallShadowBoss();
          }
        }
      }

      if (p.slideTimer <= 0) {
        p.isSliding = false;
        p.slideCooldown = PLAYER_CONFIG.slideCooldown;
      }
    }

    // Melee state handling (Spacebar) - Enhanced high-vertical reach to easily swat crows & zombies
    if (p.isMeleeing) {
      p.meleeTimer--;
      // Hitbox check during active swing frames (broad window so nothing is missed)
      if (p.meleeTimer === 10 || p.meleeTimer === 7 || p.meleeTimer === 4) {
        const meleeHitX = p.x + (p.facing === 'right' ? 65 : -65);
        for (const enemy of this.enemies) {
          if (enemy.health > 0) {
            const isCrow = enemy.type === 'crow';
            const reachX = isCrow ? PLAYER_CONFIG.meleeRange + 35 : PLAYER_CONFIG.meleeRange;
            const reachY = isCrow ? 120 : 85; // High vertical reach to easily swat diving and flying crows!
            const targetY = isCrow ? p.y - 40 : p.y;

            if (Math.abs(enemy.x - meleeHitX) < reachX && Math.abs(enemy.y - targetY) < reachY) {
              this.hitEnemy(enemy, PLAYER_CONFIG.meleeDamage, 'melee');
              this.screenShake = 6;
              sound.playMeleeHit();
            }
          }
        }

        // Swat missiles out of the air with melee!
        for (let mIdx = this.missiles.length - 1; mIdx >= 0; mIdx--) {
          const m = this.missiles[mIdx];
          if (
            Math.abs(m.x - meleeHitX) < PLAYER_CONFIG.meleeRange + 25 &&
            Math.abs(m.y - (p.y - 35)) < 75
          ) {
            this.destroyMissile(mIdx, true);
          }
        }

        // Slice razor ticket cards out of the air!
        for (let tIdx = this.ticketCards.length - 1; tIdx >= 0; tIdx--) {
          const tc = this.ticketCards[tIdx];
          if (
            Math.abs(tc.x - meleeHitX) < PLAYER_CONFIG.meleeRange + 20 &&
            Math.abs(tc.y - (p.y - 35)) < 65
          ) {
            this.addSparkParticle(tc.x, tc.y, '#ECC94B');
            this.ticketCards.splice(tIdx, 1);
            sound.playMeleeHit();
          }
        }

        // Strike Mech Hands with melee for massive bonus damage
        if (this.mechBoss && this.mechBoss.active && this.mechBoss.introState === 'ready') {
          const mb = this.mechBoss;
          if (mb.leftHand.state !== 'destroyed' && Math.abs(mb.leftHand.x - meleeHitX) < PLAYER_CONFIG.meleeRange + 25 && Math.abs(mb.leftHand.y - p.y) < 65) {
            mb.leftHand.health -= PLAYER_CONFIG.meleeDamage * 1.5;
            mb.leftHand.hitFlash = 6;
            this.stats.damageDealt += PLAYER_CONFIG.meleeDamage * 1.5;
            this.screenShake = 8;
            this.addSparkParticle(mb.leftHand.x, mb.leftHand.y, '#ECC94B');
            sound.playMetalHit();
          }
          if (mb.rightHand.state !== 'destroyed' && Math.abs(mb.rightHand.x - meleeHitX) < PLAYER_CONFIG.meleeRange + 25 && Math.abs(mb.rightHand.y - p.y) < 65) {
            mb.rightHand.health -= PLAYER_CONFIG.meleeDamage * 1.5;
            mb.rightHand.hitFlash = 6;
            this.stats.damageDealt += PLAYER_CONFIG.meleeDamage * 1.5;
            this.screenShake = 8;
            this.addSparkParticle(mb.rightHand.x, mb.rightHand.y, '#ECC94B');
            sound.playMetalHit();
          }
        }

        // Strike Stage 2 Colossal Shadow Boss (Hand or Body) with Melee for massive damage!
        if (this.tallShadowBoss && this.tallShadowBoss.active && this.tallShadowBoss.introState === 'ready') {
          const sb = this.tallShadowBoss;
          let hitBoss = false;
          // Hit grounded / resting hand (weakpoint bonus!)
          if (Math.abs(sb.handX - meleeHitX) < PLAYER_CONFIG.meleeRange + 30 && Math.abs(sb.handY - p.y) < 85) {
            const dmg = PLAYER_CONFIG.meleeDamage * (sb.slamState === 'rest' ? 2.0 : 1.4);
            sb.health -= dmg;
            sb.hitFlash = 6;
            sb.handHitFlash = 10;
            this.stats.damageDealt += dmg;
            this.screenShake = 10;
            this.addSparkParticle(sb.handX, sb.handY, '#ECC94B');
            sound.playMeleeHit();
            hitBoss = true;
            if (sb.slamState === 'rest') {
              this.particles.push({
                id: Math.random().toString(),
                x: sb.handX,
                y: sb.handY - 30,
                vx: 0,
                vy: -1.5,
                color: '#ECC94B',
                size: 13,
                life: 30,
                maxLife: 30,
                type: 'text',
                text: '💥 WEAKPOINT MELEE CRIT!',
              });
            }
          } else if (Math.abs(sb.x - meleeHitX) < PLAYER_CONFIG.meleeRange + 50 && Math.abs(sb.y - p.y) < 140) {
            const dmg = PLAYER_CONFIG.meleeDamage * 1.2;
            sb.health -= dmg;
            sb.hitFlash = 6;
            this.stats.damageDealt += dmg;
            this.screenShake = 8;
            this.addSparkParticle(sb.x - 30, p.y - 30, '#9F7AEA');
            sound.playMeleeHit();
            hitBoss = true;
          }

          if (hitBoss && sb.health <= 0) {
            this.defeatTallShadowBoss();
          }
        }
      }
      if (p.meleeTimer <= 0) {
        p.isMeleeing = false;
        p.meleeCooldown = PLAYER_CONFIG.meleeCooldown;
      }
    }

    // === Player Platform Drop-Through / Slide Triggers ===
    if (p.dropThroughTimer && p.dropThroughTimer > 0) {
      p.dropThroughTimer--;
    }

    // Drop down through elevated platform if pressing S or Down while standing on one
    if ((this.keys.down || (this.keys.slide && p.y < GROUND_Y - 10)) && p.currentPlatform && p.y < GROUND_Y) {
      p.dropThroughTimer = 16;
      p.currentPlatform = null;
      p.isGrounded = false;
      p.y += 5;
    } else if (this.keys.slide && p.isGrounded && !p.isSliding && p.slideCooldown <= 0 && !p.isMeleeing) {
      // 1. Slide Action (S key on ground or level platform)
      p.isSliding = true;
      p.slideTimer = PLAYER_CONFIG.slideDuration;
      const slideDir = dx >= 0 ? 1 : -1;
      p.vx = slideDir * PLAYER_CONFIG.slideSpeed;
      p.invincibleTimer = PLAYER_CONFIG.slideDuration + 4;
      sound.playSlide();
    }

    // 2. Tactical Bomb Action (Right-Click or Spacebar)
    if (this.keys.bomb) {
      this.keys.bomb = false; // single consumption
      this.throwBomb();
    }

    // KeyF / KeyE / KeyV: Melee Action
    if (this.keys.melee && !p.isMeleeing && p.meleeCooldown <= 0) {
      p.isMeleeing = true;
      p.meleeTimer = PLAYER_CONFIG.meleeDuration;
      sound.playMeleeSwing();
    }

    // 3. Shoot Action (Left Click) - checks ammo
    if (this.keys.shoot && p.shootCooldown <= 0 && !p.isSliding) {
      if (p.isReloading) {
        // Can't shoot while reloading
      } else if (p.ammo <= 0) {
        // Trigger auto-reload when trying to fire empty gun
        p.isReloading = true;
        p.reloadTimer = p.reloadDuration;
        sound.playReloadStart();
      } else {
        this.fireShotgun();
      }
    }

    // 4. Movement (A/D) if not sliding
    if (!p.isSliding) {
      if (this.keys.left && !this.keys.right) {
        p.vx = -PLAYER_CONFIG.walkSpeed;
        p.runFrame++;
      } else if (this.keys.right && !this.keys.left) {
        p.vx = PLAYER_CONFIG.walkSpeed;
        p.runFrame++;
      } else {
        p.vx *= 0.7;
        if (Math.abs(p.vx) < 0.2) p.vx = 0;
      }

      // Jump (W)
      if (this.keys.jump && p.isGrounded) {
        p.vy = PLAYER_CONFIG.jumpForce;
        p.isGrounded = false;
        p.currentPlatform = null;
        sound.playJump();
        this.addDustParticle(p.x, p.y);
      }
    }

    // Physics (Gravity & Position)
    const prevY = p.y;
    p.vy += PLAYER_CONFIG.gravity;
    p.x += p.vx;
    p.y += p.vy;

    // Multi-level Platform Collision Detection
    let landedPlatform: Platform | null = null;
    if (!p.dropThroughTimer || p.dropThroughTimer <= 0) {
      for (const plat of this.platforms) {
        if (p.x + p.width / 2 >= plat.x && p.x - p.width / 2 <= plat.x + plat.width) {
          if (p.vy >= 0 && p.y >= plat.y && prevY <= plat.y + 12) {
            landedPlatform = plat;
            break;
          }
        }
      }
    }

    if (landedPlatform) {
      p.y = landedPlatform.y;
      p.vy = 0;
      p.isGrounded = true;
      p.currentPlatform = landedPlatform;
    } else if (p.y >= GROUND_Y) {
      p.y = GROUND_Y;
      p.vy = 0;
      p.isGrounded = true;
      p.currentPlatform = null;
    } else if (p.currentPlatform) {
      // Check if walked off platform edge
      if (p.x + p.width / 2 < p.currentPlatform.x || p.x - p.width / 2 > p.currentPlatform.x + p.currentPlatform.width) {
        p.currentPlatform = null;
        p.isGrounded = false;
      } else {
        p.y = p.currentPlatform.y;
        p.vy = 0;
        p.isGrounded = true;
      }
    } else {
      p.isGrounded = false;
    }

    // Map & Arena bounds
    if (this.arenaLocked) {
      if (p.x < this.arenaLeft + 35) p.x = this.arenaLeft + 35;
      if (p.x > this.arenaRight - 35) p.x = this.arenaRight - 35;
    } else {
      if (p.x < 30) p.x = 30;
      // In Stage 1 & 2: Barrier locks the area if remaining zombies > 0
      const remainingZombies = this.currentStage.id !== 3 ? Math.max(0, this.stageZombiesTotal - this.stageZombiesKilled) : 0;
      const maxAllowedX = (this.currentStage.id !== 3 && remainingZombies > 0)
        ? this.currentStage.mapLength - 140
        : this.currentStage.mapLength - 40;

      if (p.x > maxAllowedX) {
        p.x = maxAllowedX;
        p.vx = Math.min(0, p.vx);
      }
    }
  }

  // Throw Tactical Bomb (Activated by Right-Click or Spacebar)
  public throwBomb() {
    const p = this.player;
    if (p.bombs <= 0) {
      this.particles.push({
        id: Math.random().toString(),
        x: p.x,
        y: p.y - 65,
        vx: 0,
        vy: -1.0,
        color: '#E53E3E',
        size: 10,
        life: 25,
        maxLife: 25,
        type: 'text',
        text: '⚠️ NO BOMBS (KILL 10 ZOMBIES TO EARN +1)!',
      });
      return;
    }
    p.bombs--;

    sound.playMissileLaunch();
    const spawnX = p.x + (p.facing === 'right' ? 24 : -24);
    const spawnY = p.y - 38;

    const throwDir = p.facing === 'right' ? 1 : -1;
    const angle = p.aimAngle;
    const speed = BOMB_CONFIG.throwSpeed;

    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 2.5;

    this.bombs.push({
      id: Math.random().toString(),
      x: spawnX,
      y: spawnY,
      vx,
      vy,
      radius: BOMB_CONFIG.radius,
      damage: BOMB_CONFIG.damage,
      fuse: BOMB_CONFIG.fuseFrames,
      maxFuse: BOMB_CONFIG.fuseFrames,
      rotation: 0,
      vRot: throwDir * 0.25,
    });

    this.particles.push({
      id: Math.random().toString(),
      x: p.x,
      y: p.y - 65,
      vx: 0,
      vy: -1.2,
      color: '#FF6B00',
      size: 13,
      life: 35,
      maxLife: 35,
      type: 'text',
      text: '💣 TACTICAL BOMB DEPLOYED!',
    });
  }

  // Fire Shotgun: 6 pellets spread, screen shake, shells ejecting, ammo deduction
  private fireShotgun() {
    const p = this.player;
    if (p.ammo <= 0) return;

    p.ammo--;
    p.shootCooldown = PLAYER_CONFIG.shootCooldown;
    this.stats.totalShots++;
    this.screenShake = 6;
    sound.playShotgun();

    // If out of ammo, trigger 3-second auto-reload immediately
    if (p.ammo <= 0) {
      p.isReloading = true;
      p.reloadTimer = p.reloadDuration;
      setTimeout(() => {
        sound.playReloadStart();
      }, 250);
    }

    const spawnX = p.x + (p.facing === 'right' ? 32 : -32);
    const spawnY = p.y - 45;

    // Recoil
    p.vx -= (p.facing === 'right' ? 1 : -1) * 3;

    // Eject shell casing particle
    this.particles.push({
      id: Math.random().toString(),
      x: spawnX,
      y: spawnY,
      vx: (p.facing === 'right' ? -1 : 1) * (2 + Math.random() * 2),
      vy: -3 - Math.random() * 3,
      color: '#ECC94B',
      size: 4,
      life: 40,
      maxLife: 40,
      type: 'shell',
      gravity: 0.35,
      rotation: Math.random() * Math.PI,
      vRot: 0.2,
    });

    // Muzzle blast smoke
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        id: Math.random().toString(),
        x: spawnX + Math.cos(p.aimAngle) * 15,
        y: spawnY + Math.sin(p.aimAngle) * 15,
        vx: Math.cos(p.aimAngle + (Math.random() - 0.5)) * (3 + Math.random() * 3),
        vy: Math.sin(p.aimAngle + (Math.random() - 0.5)) * (3 + Math.random() * 3),
        color: '#E2E8F0',
        size: 5 + Math.random() * 5,
        life: 14,
        maxLife: 14,
        type: 'smoke',
      });
    }

    // Shotgun Pellets spread
    for (let i = 0; i < PLAYER_CONFIG.shotgunPellets; i++) {
      const spread = (Math.random() - 0.5) * PLAYER_CONFIG.pelletSpread;
      const angle = p.aimAngle + spread;
      const speed = PLAYER_CONFIG.pelletSpeed + (Math.random() - 0.5) * 3;

      this.bullets.push({
        id: Math.random().toString(),
        x: spawnX,
        y: spawnY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 28,
        maxLife: 28,
        damage: PLAYER_CONFIG.pelletDamage,
        radius: 3,
      });
    }
  }

  // Update Bullets & collision detection
  private updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      // Ground or life end
      if (b.life <= 0 || b.y > GROUND_Y + 10) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Check hit against enemies
      let hit = false;
      for (const enemy of this.enemies) {
        if (enemy.health <= 0) continue;
        const enemyHitbox = {
          x: enemy.x - enemy.width / 2,
          y: enemy.y - enemy.height,
          w: enemy.width,
          h: enemy.height,
        };

        if (
          b.x >= enemyHitbox.x &&
          b.x <= enemyHitbox.x + enemyHitbox.w &&
          b.y >= enemyHitbox.y &&
          b.y <= enemyHitbox.y + enemyHitbox.h
        ) {
          this.hitEnemy(enemy, b.damage, 'gun');
          hit = true;
          break;
        }
      }

      // Check hit against incoming homing missiles!
      if (!hit) {
        for (let mIdx = this.missiles.length - 1; mIdx >= 0; mIdx--) {
          const m = this.missiles[mIdx];
          const dist = Math.hypot(m.x - b.x, m.y - b.y);
          if (dist < 22) {
            m.health -= b.damage;
            hit = true;
            this.addSparkParticle(m.x, m.y, '#ECC94B');
            if (m.health <= 0) {
              this.destroyMissile(mIdx);
            }
            break;
          }
        }
      }

      // Check hit against spinning razor ticket cards!
      if (!hit) {
        for (let tIdx = this.ticketCards.length - 1; tIdx >= 0; tIdx--) {
          const tc = this.ticketCards[tIdx];
          const dist = Math.hypot(tc.x - b.x, tc.y - b.y);
          if (dist < 20) {
            hit = true;
            this.addSparkParticle(tc.x, tc.y, '#ECC94B');
            this.ticketCards.splice(tIdx, 1);
            break;
          }
        }
      }

      // Check hit against falling rock debris!
      if (!hit) {
        for (let rIdx = this.fallingRocks.length - 1; rIdx >= 0; rIdx--) {
          const rk = this.fallingRocks[rIdx];
          const dist = Math.hypot(rk.x - b.x, rk.y - b.y);
          if (dist < rk.radius + 6) {
            hit = true;
            this.addSparkParticle(rk.x, rk.y, '#ECC94B');
            for (let d = 0; d < 3; d++) {
              this.particles.push({
                id: Math.random().toString(),
                x: rk.x,
                y: rk.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: '#718096',
                size: 3,
                life: 14,
                maxLife: 14,
                type: 'debris',
              });
            }
            this.fallingRocks.splice(rIdx, 1);
            this.stats.score += 50;
            break;
          }
        }
      }

      // Check hit against Mech Boss (Hands & Head Core)
      if (!hit && this.mechBoss && this.mechBoss.active && this.mechBoss.introState === 'ready') {
        const mb = this.mechBoss;

        // Left Hand Hitbox
        if (mb.leftHand.state !== 'destroyed') {
          if (
            b.x >= mb.leftHand.x - 45 &&
            b.x <= mb.leftHand.x + 45 &&
            b.y >= mb.leftHand.y - 45 &&
            b.y <= mb.leftHand.y + 35
          ) {
            mb.leftHand.health -= b.damage;
            mb.leftHand.hitFlash = 5;
            this.stats.damageDealt += b.damage;
            hit = true;
            this.addSparkParticle(b.x, b.y, '#ECC94B');
            sound.playMetalHit();
          }
        }

        // Right Hand Hitbox
        if (!hit && mb.rightHand.state !== 'destroyed') {
          if (
            b.x >= mb.rightHand.x - 45 &&
            b.x <= mb.rightHand.x + 45 &&
            b.y >= mb.rightHand.y - 45 &&
            b.y <= mb.rightHand.y + 35
          ) {
            mb.rightHand.health -= b.damage;
            mb.rightHand.hitFlash = 5;
            this.stats.damageDealt += b.damage;
            hit = true;
            this.addSparkParticle(b.x, b.y, '#ECC94B');
            sound.playMetalHit();
          }
        }

        // Head / Cockpit Core Hitbox
        if (!hit) {
          const headBox = {
            x: mb.arenaCenterX - 75,
            y: 40,
            w: 150,
            h: 110,
          };
          if (
            b.x >= headBox.x &&
            b.x <= headBox.x + headBox.w &&
            b.y >= headBox.y &&
            b.y <= headBox.y + headBox.h
          ) {
            hit = true;
            if (mb.shielded) {
              // Shield absorbs bullet
              this.addSparkParticle(b.x, b.y, '#4299E1');
              sound.playMetalHit();
              this.particles.push({
                id: Math.random().toString(),
                x: b.x,
                y: b.y - 10,
                vx: 0,
                vy: -0.8,
                color: '#63B3ED',
                size: 10,
                life: 18,
                maxLife: 18,
                type: 'text',
                text: 'SHIELDED 🛡️',
              });
            } else {
              // Core takes heavy damage!
              mb.headHealth -= b.damage;
              mb.headHitFlash = 5;
              this.stats.damageDealt += b.damage;
              this.addExplosionParticle(b.x, b.y);
              sound.playExplosion();
              if (mb.headHealth <= 0) {
                mb.introState = 'defeated';
                sound.playExplosion();
                this.screenShake = 30;
              }
            }
          }
        }
      }

      // Check hit against Thrown Cars (air intercept!)
      if (!hit) {
        for (let cIdx = this.thrownCars.length - 1; cIdx >= 0; cIdx--) {
          const car = this.thrownCars[cIdx];
          const dist = Math.hypot(car.x - b.x, car.y - b.y);
          if (dist < car.radius + 12) {
            hit = true;
            this.addSparkParticle(b.x, b.y, '#ECC94B');
            sound.playMetalHit();
            car.life -= 40;
            if (car.life <= 0) {
              this.destroyThrownCar(cIdx, true);
              this.stats.score += 250;
              this.particles.push({
                id: Math.random().toString(),
                x: car.x,
                y: car.y - 25,
                vx: 0,
                vy: -1.5,
                color: '#ECC94B',
                size: 13,
                life: 35,
                maxLife: 35,
                type: 'text',
                text: '💥 CAR INTERCEPTED! +250',
              });
            }
            break;
          }
        }
      }

      // Check hit against Stage 2 Colossal Tall Shadow Sub-Boss
      if (!hit && this.tallShadowBoss && this.tallShadowBoss.active && this.tallShadowBoss.introState === 'ready') {
        const sb = this.tallShadowBoss;

        // 1. Weakpoint / Resting Hand Hitbox
        if (
          b.x >= sb.handX - 55 &&
          b.x <= sb.handX + 55 &&
          b.y >= sb.handY - 50 &&
          b.y <= sb.handY + 30
        ) {
          const mult = sb.slamState === 'rest' ? 1.6 : 1.2;
          const dmg = Math.round(b.damage * mult);
          sb.health -= dmg;
          sb.hitFlash = 5;
          sb.handHitFlash = 8;
          this.stats.damageDealt += dmg;
          hit = true;
          this.addSparkParticle(b.x, b.y, '#ECC94B');
          sound.playMetalHit();
          if (sb.slamState === 'rest') {
            this.particles.push({
              id: Math.random().toString(),
              x: b.x,
              y: b.y - 12,
              vx: 0,
              vy: -1.0,
              color: '#ECC94B',
              size: 11,
              life: 20,
              maxLife: 20,
              type: 'text',
              text: 'CRIT! 💥',
            });
          }
          if (sb.health <= 0) {
            this.defeatTallShadowBoss();
          }
        }

        // 2. Colossal Main Shadow Body Hitbox (Towers high above screen!)
        if (!hit) {
          if (
            b.x >= sb.x - 90 &&
            b.x <= sb.x + 90 &&
            b.y >= -150 &&
            b.y <= GROUND_Y
          ) {
            sb.health -= b.damage;
            sb.hitFlash = 5;
            this.stats.damageDealt += b.damage;
            hit = true;
            this.addSparkParticle(b.x, b.y, '#9F7AEA');
            sound.playZombieHit();
            if (sb.health <= 0) {
              this.defeatTallShadowBoss();
            }
          }
        }
      }

      if (hit) {
        this.bullets.splice(i, 1);
      }
    }
  }

  // Damage an enemy
  private hitEnemy(enemy: Enemy, damage: number, source: 'gun' | 'melee' | 'slide') {
    enemy.health -= damage;
    enemy.hitFlashTimer = 6;
    this.stats.damageDealt += damage;

    // Knockback
    const knockDir = enemy.x > this.player.x ? 1 : -1;
    enemy.vx = knockDir * (source === 'melee' ? 9 : (source === 'slide' ? 12 : 3));

    // Blood splatters & sparks
    for (let i = 0; i < (source === 'melee' ? 10 : 5); i++) {
      this.particles.push({
        id: Math.random().toString(),
        x: enemy.x,
        y: enemy.y - enemy.height / 2,
        vx: (Math.random() - 0.5) * 8 + knockDir * 3,
        vy: -2 - Math.random() * 5,
        color: '#E53E3E',
        size: 3 + Math.random() * 4,
        life: 25,
        maxLife: 25,
        type: 'blood',
        gravity: 0.4,
      });
    }

    // Floating damage text
    this.particles.push({
      id: Math.random().toString(),
      x: enemy.x,
      y: enemy.y - enemy.height - 10,
      vx: (Math.random() - 0.5) * 2,
      vy: -2,
      color: source === 'melee' ? '#ECC94B' : (source === 'slide' ? '#FF6B00' : '#FFFFFF'),
      size: source === 'melee' ? 13 : 10,
      life: 26,
      maxLife: 26,
      type: 'text',
      text: `-${damage}`,
    });

    if (enemy.health <= 0) {
      this.killEnemy(enemy, source);
    } else {
      sound.playZombieHit();
    }
  }

  // Enemy death with full dismemberment & gibs
  private killEnemy(enemy: Enemy, source: 'gun' | 'melee' | 'slide') {
    this.stats.kills++;
    this.stats.score += ENEMY_CONFIGS[enemy.type].score;
    this.stats.combo++;
    this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.combo);
    this.stats.comboTimer = 120; // combo window

    if (source === 'melee') this.stats.meleeKills++;
    if (source === 'slide') this.stats.slideKills++;

    // 10 KILLS REWARD: Every 10 total zombie kills gives +1 Tactical Bomb!
    if (this.stats.kills % 10 === 0 && this.stats.kills > 0) {
      this.player.bombs = (this.player.bombs || 0) + 1;
      sound.playPowerup();
      this.screenShake = 6;
      this.particles.push({
        id: Math.random().toString(),
        x: this.player.x,
        y: this.player.y - 75,
        vx: 0,
        vy: -1.5,
        color: '#ECC94B',
        size: 14,
        life: 60,
        maxLife: 60,
        type: 'text',
        text: `💣 10 KILLS! +1 BOMB (RIGHT-CLICK TO THROW)!`,
      });
    }

    // Stage 1 & 2 zombie quota tracking
    if (
      this.currentStage.id !== 3 &&
      enemy.type !== 'boss_ticket' &&
      enemy.type !== 'boss_mech' &&
      enemy.type !== 'boss_tank' &&
      enemy.type !== 'boss_mutant'
    ) {
      this.stageZombiesKilled++;
      const remaining = Math.max(0, this.stageZombiesTotal - this.stageZombiesKilled);
      if (remaining === 0) {
        sound.playVictory();
        this.screenShake = 12;
        this.particles.push({
          id: Math.random().toString(),
          x: this.player.x,
          y: 110,
          vx: 0,
          vy: -0.4,
          color: '#48BB78',
          size: 16,
          life: 95,
          maxLife: 95,
          type: 'text',
          text: '🔓 AREA CLEAR! GATE UNLOCKED! (GO TO EXIT)',
        });
      } else if (remaining === 10 || remaining === 5 || remaining === 3 || remaining === 1) {
        this.particles.push({
          id: Math.random().toString(),
          x: this.player.x,
          y: 130,
          vx: 0,
          vy: -0.5,
          color: '#ED8936',
          size: 13,
          life: 45,
          maxLife: 45,
          type: 'text',
          text: `⚠️ ZOMBIES REMAINING: ${remaining}`,
        });
      }
    }

    if (enemy.type === 'boss_ticket') {
      sound.playMechLaugh(1.0);
      this.screenShake = 24;
      // High-tech explosion & sparks shower
      for (let i = 0; i < 30; i++) {
        this.addExplosionParticle(enemy.x + (Math.random() - 0.5) * 80, enemy.y - Math.random() * 80);
      }
      this.spawnZombieGibs(enemy, source);

      // Ticket Master leaps skyward into giant robot!
      this.particles.push({
        id: Math.random().toString(),
        x: enemy.x,
        y: enemy.y - 30,
        vx: 0,
        vy: -18,
        color: '#9F7AEA',
        size: 24,
        life: 50,
        maxLife: 50,
        type: 'shockwave',
      });

      // Dramatic Transition Announcement Banner
      this.particles.push({
        id: Math.random().toString(),
        x: this.player.x,
        y: 140,
        vx: 0,
        vy: -0.3,
        color: '#E53E3E',
        size: 16,
        life: 95,
        maxLife: 95,
        type: 'text',
        text: '⚡ HAHAHA! ACTIVATING GIGA MECHA-Z!',
      });

      // Spawn Giga Mecha-Z Background Colossus
      this.spawnMechBoss(enemy.x);
    } else if (enemy.type === 'boss_tank') {
      sound.playExplosion();
      this.screenShake = 22;
      // Massive explosion shower
      for (let i = 0; i < 35; i++) {
        this.addExplosionParticle(enemy.x + (Math.random() - 0.5) * 120, enemy.y - Math.random() * 80);
      }
      this.spawnZombieGibs(enemy, source);

      // TRANSFORMATION TO PHASE 2: TITAN GENERAL Z (BERSERK MUTANT)
      const mutantCfg = ENEMY_CONFIGS.boss_mutant;
      const mutantBoss: Enemy = {
        id: 'boss_mutant',
        type: 'boss_mutant',
        x: enemy.x,
        y: GROUND_Y,
        vx: 0,
        vy: -9,
        width: mutantCfg.width,
        height: mutantCfg.height,
        health: mutantCfg.health,
        maxHealth: mutantCfg.health,
        speed: mutantCfg.speed,
        facing: 'left',
        state: 'leap',
        attackCooldown: 0,
        hitFlashTimer: 0,
        isGrounded: false,
        animFrame: 0,
        specialTimer: 0,
      };
      this.enemies.push(mutantBoss);

      // Dramatic Phase 2 Announcement Banner
      this.particles.push({
        id: Math.random().toString(),
        x: this.player.x,
        y: 150,
        vx: 0,
        vy: -0.3,
        color: '#9F7AEA',
        size: 16,
        life: 85,
        maxLife: 85,
        type: 'text',
        text: '🔥 PHASE 2: TITAN GENERAL Z (MUTANT BERSERKER)!',
      });
    } else if (enemy.type === 'boss_mutant') {
      this.bossDefeated = true;
      sound.playExplosion();
      this.screenShake = 25;
      for (let i = 0; i < 40; i++) {
        this.addExplosionParticle(enemy.x + (Math.random() - 0.5) * 80, enemy.y - Math.random() * 110);
      }
      this.spawnZombieGibs(enemy, source);
    } else {
      sound.playZombieDie();
      this.spawnZombieGibs(enemy, source);
    }

    // Remove from enemy list
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
  }

  // Spawn Severed Zombie Limbs & Gore Parts (Gibs)
  private spawnZombieGibs(enemy: Enemy, source: 'gun' | 'melee' | 'slide') {
    const p = this.player;
    const knockDir = enemy.x >= p.x ? 1 : -1;
    const baseColor = ENEMY_CONFIGS[enemy.type].color;
    const isBrute = enemy.type === 'brute';
    const isBoss = enemy.type === 'boss_tank';
    const isCrow = enemy.type === 'crow';

    // Velocity multipliers based on how they were destroyed
    const forceX = source === 'melee' ? 9 : (source === 'slide' ? 7 : 5);
    const forceY = source === 'melee' ? 9 : (source === 'slide' ? 11 : 6);

    if (isCrow) {
      // 1. Crow Head & Beak
      this.particles.push({
        id: Math.random().toString(),
        x: enemy.x,
        y: enemy.y - 10,
        vx: knockDir * (2 + Math.random() * forceX),
        vy: -4 - Math.random() * forceY,
        color: '#1A202C',
        size: 7,
        life: 90,
        maxLife: 90,
        type: 'gib',
        gibType: 'head',
        enemyType: 'crow',
        gravity: 0.4,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.5,
      });

      // 2. Left & Right Crow Wings
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          id: Math.random().toString(),
          x: enemy.x + (i === 0 ? -8 : 8),
          y: enemy.y - 6,
          vx: (i === 0 ? -1 : 1) * (2 + Math.random() * 4) + knockDir * 2,
          vy: -3 - Math.random() * forceY,
          color: '#2D3748',
          size: 11,
          life: 90,
          maxLife: 90,
          type: 'gib',
          gibType: 'wing',
          enemyType: 'crow',
          gravity: 0.35,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.4,
        });
      }

      // 3. Beak piece
      this.particles.push({
        id: Math.random().toString(),
        x: enemy.x,
        y: enemy.y - 8,
        vx: knockDir * 4 + (Math.random() - 0.5) * 3,
        vy: -3 - Math.random() * 4,
        color: '#ECC94B',
        size: 4,
        life: 80,
        maxLife: 80,
        type: 'gib',
        gibType: 'beak',
        enemyType: 'crow',
        gravity: 0.45,
        rotation: Math.random() * Math.PI,
        vRot: 0.3,
      });

      // 4. Black feathers fluttering in wind
      for (let i = 0; i < 10; i++) {
        this.particles.push({
          id: Math.random().toString(),
          x: enemy.x + (Math.random() - 0.5) * 16,
          y: enemy.y + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 6 + knockDir * 2,
          vy: -2 - Math.random() * 4,
          color: '#1A202C',
          size: 4,
          life: 80,
          maxLife: 80,
          type: 'feather',
          gravity: 0.08,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.25,
        });
      }

      // Blood splatter
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          id: Math.random().toString(),
          x: enemy.x,
          y: enemy.y,
          vx: (Math.random() - 0.5) * 8 + knockDir * 3,
          vy: -2 - Math.random() * 5,
          color: '#9B2C2C',
          size: 3,
          life: 25,
          maxLife: 25,
          type: 'blood',
          gravity: 0.4,
        });
      }
      return;
    }

    // 1. Head
    this.particles.push({
      id: Math.random().toString(),
      x: enemy.x,
      y: enemy.y - enemy.height * 0.85,
      vx: knockDir * (2 + Math.random() * forceX),
      vy: -5 - Math.random() * forceY,
      color: baseColor,
      size: isBrute ? 13 : (isBoss ? 16 : 9),
      life: 100,
      maxLife: 100,
      type: 'gib',
      gibType: 'head',
      enemyType: enemy.type,
      gravity: 0.45,
      rotation: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 0.45,
    });

    // 2. Torso
    this.particles.push({
      id: Math.random().toString(),
      x: enemy.x,
      y: enemy.y - enemy.height * 0.55,
      vx: knockDir * (1 + Math.random() * (forceX * 0.8)),
      vy: -3 - Math.random() * (forceY * 0.8),
      color: baseColor,
      size: isBrute ? 16 : (isBoss ? 20 : 11),
      life: 100,
      maxLife: 100,
      type: 'gib',
      gibType: 'torso',
      enemyType: enemy.type,
      gravity: 0.48,
      rotation: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 0.3,
    });

    // 3. Left & Right Arms
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        id: Math.random().toString(),
        x: enemy.x + (i === 0 ? -10 : 10),
        y: enemy.y - enemy.height * 0.6,
        vx: (i === 0 ? -1 : 1) * (2 + Math.random() * 4) + knockDir * 2,
        vy: -4 - Math.random() * forceY,
        color: baseColor,
        size: isBrute ? 12 : 8,
        life: 90,
        maxLife: 90,
        type: 'gib',
        gibType: 'arm',
        enemyType: enemy.type,
        gravity: 0.42,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.5,
      });
    }

    // 4. Left & Right Legs
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        id: Math.random().toString(),
        x: enemy.x + (i === 0 ? -8 : 8),
        y: enemy.y - enemy.height * 0.25,
        vx: (i === 0 ? -1 : 1) * (2 + Math.random() * 4) + knockDir * 1.5,
        vy: -3 - Math.random() * (forceY * 0.7),
        color: '#1A202C', // pants / dark limb color
        size: isBrute ? 13 : 8,
        life: 90,
        maxLife: 90,
        type: 'gib',
        gibType: 'leg',
        enemyType: enemy.type,
        gravity: 0.46,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.4,
      });
    }

    // 5. Bone shards and bloody chunks
    const numChunks = isBrute ? 10 : 6;
    for (let i = 0; i < numChunks; i++) {
      const isBone = i % 2 === 0;
      this.particles.push({
        id: Math.random().toString(),
        x: enemy.x + (Math.random() - 0.5) * 20,
        y: enemy.y - Math.random() * enemy.height * 0.8,
        vx: (Math.random() - 0.5) * 8 + knockDir * 3,
        vy: -2 - Math.random() * 8,
        color: isBone ? '#EDF2F7' : '#9B2C2C',
        size: isBone ? 4 : 5,
        life: 80,
        maxLife: 80,
        type: 'gib',
        gibType: isBone ? 'bone' : 'chunk',
        enemyType: enemy.type,
        gravity: 0.5,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.6,
      });
    }

    // Extra blood splatters on kill
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        id: Math.random().toString(),
        x: enemy.x,
        y: enemy.y - enemy.height / 2,
        vx: (Math.random() - 0.5) * 12 + knockDir * 4,
        vy: -3 - Math.random() * 7,
        color: '#9B2C2C',
        size: 3 + Math.random() * 5,
        life: 30,
        maxLife: 30,
        type: 'blood',
        gravity: 0.45,
      });
    }
  }

  // Update Enemies behavior & AI
  private updateEnemies() {
    const p = this.player;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      if (e.hitFlashTimer > 0) e.hitFlashTimer--;
      if (e.attackCooldown > 0) e.attackCooldown--;

      e.animFrame++;

      const distToPlayer = p.x - e.x;
      e.facing = distToPlayer >= 0 ? 'right' : 'left';
      const moveDir = distToPlayer >= 0 ? 1 : -1;

      // Type-specific AI
      if (e.type === 'crow') {
        // === ZOMBIE CROW (อีกาซอมบี้) AERIAL & DIVE AI ===
        e.specialTimer = (e.specialTimer || 0) + 1;

        if (e.state === 'dive') {
          // Diving towards player with high speed
          e.x += e.vx;
          e.y += e.vy;

          // Check if reached low altitude, passed player, or timed out
          if (e.y >= GROUND_Y - 24 || e.specialTimer > 45) {
            e.state = 'fly';
            e.specialTimer = 0;
            e.targetY = 120 + Math.random() * 120;
          }
        } else {
          // Flying / hovering / undulating path
          const targetY = e.targetY || 160;
          const wave = Math.sin(e.animFrame * 0.12) * 1.6;
          e.vy = (targetY - e.y) * 0.05 + wave;
          e.vx = moveDir * e.speed;

          e.x += e.vx;
          e.y += e.vy;

          // Initiate Dive Attack when near player
          if (Math.abs(distToPlayer) < 280 && Math.abs(distToPlayer) > 30 && e.specialTimer > 80) {
            e.state = 'dive';
            e.specialTimer = 0;
            const angle = Math.atan2(p.y - 35 - e.y, p.x - e.x);
            const diveSpeed = 5.6;
            e.vx = Math.cos(angle) * diveSpeed;
            e.vy = Math.sin(angle) * diveSpeed;
            sound.playCrowCaw();
          }
        }

      } else if (e.type === 'boss_ticket') {
        // Phase 1 Final Boss: Z-Conductor (Ticket Master Zombie)
        // Attacks: Razor Ticket Fan Barrage & Homing Sky Leap Ground Stomp
        e.specialTimer = (e.specialTimer || 0) + 1;

        if (e.state === 'cast') {
          // Razor Ticket Throwing stance - longer telegraph for player reaction
          e.vx = 0;
          if (e.specialTimer % 4 === 0) {
            this.addSparkParticle(e.x + (e.facing === 'right' ? 25 : -25), e.y - 40, '#ECC94B');
          }
          if (e.specialTimer >= 32) {
            // Throw 3 razor ticket cards with moderate speed
            const baseAngle = Math.atan2(p.y - 30 - e.y, p.x - e.x);
            const cardSpeed = 4.2;
            const cardAngles = [baseAngle - 0.22, baseAngle, baseAngle + 0.22];

            for (const angle of cardAngles) {
              this.ticketCards.push({
                id: Math.random().toString(),
                x: e.x + (e.facing === 'right' ? 25 : -25),
                y: e.y - 40,
                vx: Math.cos(angle) * cardSpeed,
                vy: Math.sin(angle) * cardSpeed,
                angle: Math.random() * Math.PI,
                life: 90,
                maxLife: 90,
                damage: 18,
                color: '#E53E3E',
              });
            }

            sound.playCardThrow();
            this.particles.push({
              id: Math.random().toString(),
              x: e.x,
              y: e.y - 60,
              vx: 0,
              vy: -0.6,
              color: '#ECC94B',
              size: 11,
              life: 30,
              maxLife: 30,
              type: 'text',
              text: '🎟️ RAZOR TICKETS!',
            });

            e.state = 'walk';
            e.specialTimer = 0;
          }
        } else if (e.state === 'leap_prep') {
          // Charging leap with distinct glowing aura telegraph
          e.vx = 0;
          if (e.specialTimer % 4 === 0) {
            this.addSparkParticle(e.x + (Math.random() - 0.5) * 35, e.y - Math.random() * 50, '#E53E3E');
          }
          if (e.specialTimer >= 42) {
            // Launch straight up into the sky!
            e.state = 'leap';
            e.isGrounded = false;
            e.vy = -24;
            e.vx = 0;
            e.specialTimer = 0;
            sound.playJump();
            this.addDustParticle(e.x, e.y);
            this.screenShake = 8;
          }
        } else if (e.state === 'leap') {
          // Ascending and hanging in sky while ground warning pulses at landing target
          e.y += e.vy;
          e.vy += 0.5;
          if (e.specialTimer >= 62) {
            // Sky apex reached! Plunge down towards target
            e.state = 'slam';
            e.x = e.diveStartX !== undefined ? e.diveStartX : p.x;
            e.y = -80;
            e.vy = 22;
            e.vx = 0;
            sound.playMissileLaunch();
          }
        } else if (e.state === 'slam') {
          e.y += e.vy;

          if (e.specialTimer % 2 === 0) {
            this.particles.push({
              id: Math.random().toString(),
              x: e.x + (Math.random() - 0.5) * 30,
              y: e.y - 20,
              vx: 0,
              vy: -4,
              color: '#FF0055',
              size: 6,
              life: 14,
              maxLife: 14,
              type: 'smoke',
            });
          }

          if (e.y >= GROUND_Y) {
            e.y = GROUND_Y;
            e.vy = 0;
            e.vx = 0;
            e.isGrounded = true;
            e.state = 'attack';
            e.specialTimer = 0;
            this.screenShake = 22;
            sound.playExplosion();
            sound.playMeleeHit();

            // Twin expanding Ground Shockwaves (moderate speed)
            this.particles.push({
              id: Math.random().toString(),
              x: e.x - 20,
              y: GROUND_Y - 8,
              vx: -6.5,
              vy: 0,
              color: '#FF0055',
              size: 26,
              life: 34,
              maxLife: 34,
              type: 'shockwave',
            });
            this.particles.push({
              id: Math.random().toString(),
              x: e.x + 20,
              y: GROUND_Y - 8,
              vx: 6.5,
              vy: 0,
              color: '#FF0055',
              size: 26,
              life: 34,
              maxLife: 34,
              type: 'shockwave',
            });

            // Exactly 4 to 5 Falling Rocks with predetermined ground landing spots
            const rockCount = Math.random() < 0.5 ? 4 : 5;
            const arenaMin = this.arenaLocked ? this.arenaLeft + 60 : e.x - 260;
            const arenaMax = this.arenaLocked ? this.arenaRight - 60 : e.x + 260;
            const step = (arenaMax - arenaMin) / (rockCount + 1);

            for (let k = 0; k < rockCount; k++) {
              const targetX = Math.max(arenaMin + 20, Math.min(arenaMax - 20, arenaMin + (k + 1) * step + (Math.random() - 0.5) * 30));
              const dropVy = 3.2 + Math.random() * 1.2;
              const dropY = -30 - k * 35;
              const dropVx = (Math.random() - 0.5) * 0.6;
              const timeToGround = (GROUND_Y - dropY) / dropVy;
              const initialX = targetX - dropVx * timeToGround;

              this.fallingRocks.push({
                id: Math.random().toString(),
                x: initialX,
                y: dropY,
                vx: dropVx,
                vy: dropVy,
                radius: 12 + Math.random() * 5,
                damage: 16,
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.15,
                life: 240,
                targetX: targetX,
              });
            }

            // Upward blasting rock fragments
            for (let d = 0; d < 12; d++) {
              this.particles.push({
                id: Math.random().toString(),
                x: e.x + (Math.random() - 0.5) * 50,
                y: GROUND_Y - 6,
                vx: (Math.random() - 0.5) * 12,
                vy: -4 - Math.random() * 7,
                color: '#4A5568',
                size: 4 + Math.random() * 4,
                life: 30,
                maxLife: 30,
                type: 'debris',
                gravity: 0.45,
              });
            }

            // Damage player if grounded near stomp
            const dist = Math.abs(p.x - e.x);
            if (dist < 100 && (p.isGrounded || p.y >= GROUND_Y - 30) && p.invincibleTimer <= 0 && !p.isSliding) {
              this.hurtPlayer(28);
              p.vy = -7;
              p.vx = (p.x > e.x ? 1 : -1) * 8;
            }
          }
        } else if (e.state === 'attack') {
          // Impact recovery pose
          e.vx = 0;
          if (e.specialTimer >= 36) {
            e.state = 'idle';
            e.specialTimer = 0;
          }
        } else if (e.state === 'idle') {
          // Vulnerable breathing pause after heavy attack
          e.vx = 0;
          if (e.specialTimer >= 75) {
            e.state = 'walk';
            e.specialTimer = 0;
          }
        } else {
          // Walk / approach player at steady readable pace
          e.vx = moveDir * e.speed;
          e.y = GROUND_Y;
          e.isGrounded = true;

          // Close range Ticket punch
          if (Math.abs(distToPlayer) < 65 && e.specialTimer > 75) {
            e.state = 'attack';
            e.specialTimer = 0;
            sound.playMeleeSwing();
            if (Math.abs(p.x - e.x) < 70 && p.invincibleTimer <= 0 && !p.isSliding) {
              this.hurtPlayer(22);
              p.vx = moveDir * 6;
            }
          } else if (e.specialTimer > 110) {
            // Alternate between Razor Tickets and Sky Leap Stomp!
            e.specialTimer = 0;
            const chooseLeap = Math.random() < 0.5;
            if (chooseLeap) {
              // Homing leap stomp!
              e.state = 'leap_prep';
              const minX = this.arenaLocked ? this.arenaLeft + 70 : 120;
              const maxX = this.arenaLocked ? this.arenaRight - 70 : this.currentStage.mapLength - 120;
              e.diveStartX = Math.max(minX, Math.min(maxX, p.x + (Math.random() - 0.5) * 60));
            } else {
              // Cast Razor Tickets!
              e.state = 'cast';
            }
          }
        }

      } else if (e.type === 'boss_tank') {
        // Boss AI: Move slowly, launch salvo of homing missiles, fire cannon
        e.vx = moveDir * e.speed;
        e.missileCooldown = (e.missileCooldown || 0) - 1;

        if (e.missileCooldown <= 0) {
          e.missileCooldown = 110; // fire missiles regularly
          // Launch heavy warhead missiles from giant turret pod
          this.spawnHomingMissile(e.x - 50, e.y - 110);
          if (e.health < e.maxHealth * 0.6) {
            // Enraged phase: double barrage!
            setTimeout(() => {
              if (this.status === 'playing' && !this.bossDefeated) {
                this.spawnHomingMissile(e.x - 30, e.y - 120);
                sound.playMissileLaunch();
              }
            }, 300);
          }
          sound.playMissileLaunch();
        }

        e.vy += PLAYER_CONFIG.gravity;
        e.x += e.vx;
        e.y += e.vy;
        if (e.y >= GROUND_Y) {
          e.y = GROUND_Y;
          e.vy = 0;
          e.isGrounded = true;
        }

      } else if (e.type === 'boss_mutant') {
        // Phase 2 Boss: Titan General Z (Mutant Berserker)
        // Mechanics: Super-Leap sky-high, plunge & ground slam at point near player, emit shockwaves & falling rocks
        e.specialTimer = (e.specialTimer || 0) + 1;

        if (e.state === 'leap_prep') {
          // Crouching, muscle swelling, charging massive kinetic leap
          e.vx = 0;
          if (e.specialTimer % 4 === 0) {
            this.addSparkParticle(e.x + (Math.random() - 0.5) * 40, e.y - Math.random() * 60, '#9F7AEA');
          }
          if (e.specialTimer >= 42) {
            // Launch straight up into the sky!
            e.state = 'leap';
            e.isGrounded = false;
            e.vy = -24;
            e.vx = 0;
            e.specialTimer = 0;
            sound.playJump();
            this.addDustParticle(e.x, e.y);
            this.screenShake = 8;
          }
        } else if (e.state === 'leap') {
          // Mid-air ascent and hang in high sky while ground warning marker is active
          e.y += e.vy;
          e.vy += 0.5;
          if (e.specialTimer >= 62) {
            // Apex reached! Plunge down for Ground Slam
            e.state = 'slam';
            e.x = e.diveStartX !== undefined ? e.diveStartX : p.x;
            e.y = -80;
            e.vy = 22;
            e.vx = 0;
            sound.playMissileLaunch();
          }
        } else if (e.state === 'slam') {
          // High-speed plunge
          e.y += e.vy;

          if (e.specialTimer % 2 === 0) {
            this.particles.push({
              id: Math.random().toString(),
              x: e.x + (Math.random() - 0.5) * 30,
              y: e.y - 20,
              vx: 0,
              vy: -4,
              color: '#9F7AEA',
              size: 5,
              life: 14,
              maxLife: 14,
              type: 'smoke',
            });
          }

          if (e.y >= GROUND_Y) {
            // IMPACT CRUSH & GROUND SLAM!
            e.y = GROUND_Y;
            e.vy = 0;
            e.vx = 0;
            e.isGrounded = true;
            e.state = 'attack';
            e.specialTimer = 0;
            this.screenShake = 22;
            sound.playExplosion();
            sound.playMeleeHit();

            // Spawn twin ground shockwaves
            this.particles.push({
              id: Math.random().toString(),
              x: e.x - 20,
              y: GROUND_Y - 8,
              vx: -6.5,
              vy: 0,
              color: '#9F7AEA',
              size: 26,
              life: 34,
              maxLife: 34,
              type: 'shockwave',
            });
            this.particles.push({
              id: Math.random().toString(),
              x: e.x + 20,
              y: GROUND_Y - 8,
              vx: 6.5,
              vy: 0,
              color: '#9F7AEA',
              size: 26,
              life: 34,
              maxLife: 34,
              type: 'shockwave',
            });

            // Scatter 4 to 5 Falling Rocks with predetermined landing spots
            const rockCount = Math.random() < 0.5 ? 4 : 5;
            const arenaMin = this.arenaLocked ? this.arenaLeft + 60 : e.x - 260;
            const arenaMax = this.arenaLocked ? this.arenaRight - 60 : e.x + 260;
            const step = (arenaMax - arenaMin) / (rockCount + 1);

            for (let k = 0; k < rockCount; k++) {
              const targetX = Math.max(arenaMin + 20, Math.min(arenaMax - 20, arenaMin + (k + 1) * step + (Math.random() - 0.5) * 30));
              const dropVy = 3.2 + Math.random() * 1.2;
              const dropY = -30 - k * 35;
              const dropVx = (Math.random() - 0.5) * 0.6;
              const timeToGround = (GROUND_Y - dropY) / dropVy;
              const initialX = targetX - dropVx * timeToGround;

              this.fallingRocks.push({
                id: Math.random().toString(),
                x: initialX,
                y: dropY,
                vx: dropVx,
                vy: dropVy,
                radius: 12 + Math.random() * 5,
                damage: 16,
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.15,
                life: 240,
                targetX: targetX,
              });
            }

            // Rock & concrete debris shower
            for (let d = 0; d < 12; d++) {
              this.particles.push({
                id: Math.random().toString(),
                x: e.x + (Math.random() - 0.5) * 50,
                y: GROUND_Y - 6,
                vx: (Math.random() - 0.5) * 12,
                vy: -4 - Math.random() * 7,
                color: '#4A5568',
                size: 4 + Math.random() * 4,
                life: 30,
                maxLife: 30,
                type: 'debris',
                gravity: 0.45,
              });
            }

            // Damage player if caught in slam zone and not jumped over
            const dist = Math.abs(p.x - e.x);
            if (dist < 100 && (p.isGrounded || p.y >= GROUND_Y - 30) && p.invincibleTimer <= 0 && !p.isSliding) {
              this.hurtPlayer(28);
              p.vy = -7;
              p.vx = (p.x > e.x ? 1 : -1) * 8;
            }
          }
        } else if (e.state === 'attack') {
          // Slam impact pose
          e.vx = 0;
          if (e.specialTimer >= 36) {
            e.state = 'idle';
            e.specialTimer = 0;
          }
        } else if (e.state === 'idle') {
          // Vulnerable recovery pause
          e.vx = 0;
          if (e.specialTimer >= 75) {
            e.state = 'walk';
            e.specialTimer = 0;
          }
        } else {
          // Walk / stalk state
          e.vx = moveDir * e.speed;
          e.y = GROUND_Y;
          e.isGrounded = true;

          // Close range Titan punch
          if (Math.abs(distToPlayer) < 55 && e.specialTimer > 95) {
            e.state = 'attack';
            e.specialTimer = 0;
            sound.playMeleeSwing();
            if (Math.abs(p.x - e.x) < 65 && p.invincibleTimer <= 0 && !p.isSliding) {
              this.hurtPlayer(22);
              p.vx = moveDir * 6;
            }
          } else if (e.specialTimer > 230) {
            // Trigger Leap attack: randomly target near player (+- 140px)
            e.state = 'leap_prep';
            e.specialTimer = 0;
            const targetX = Math.max(120, Math.min(this.currentStage.mapLength - 120, p.x + (Math.random() - 0.5) * 140));
            e.diveStartX = targetX;
          }
        }

      } else if (e.type === 'leaper') {
        // Leaper AI: Crouch then leap through air!
        e.specialTimer = (e.specialTimer || 0) + 1;
        if (e.isGrounded && Math.abs(distToPlayer) < 260 && e.specialTimer > 90) {
          e.vy = ENEMY_CONFIGS.leaper.leapForce;
          e.vx = moveDir * ENEMY_CONFIGS.leaper.leapForward;
          e.isGrounded = false;
          e.specialTimer = 0;
          this.addDustParticle(e.x, e.y);
        } else if (e.isGrounded) {
          e.vx = moveDir * e.speed;
        }

        // Platform & Ground Physics for Leaper
        const prevEy = e.y;
        e.vy += PLAYER_CONFIG.gravity;
        e.x += e.vx;
        e.y += e.vy;

        let landedOnPlatform: Platform | null = null;
        for (const plat of this.platforms) {
          if (e.x + e.width / 2 >= plat.x && e.x - e.width / 2 <= plat.x + plat.width) {
            if (e.vy >= 0 && e.y >= plat.y && prevEy <= plat.y + 16) {
              landedOnPlatform = plat;
              break;
            }
          }
        }

        if (landedOnPlatform) {
          e.y = landedOnPlatform.y;
          e.vy = 0;
          e.isGrounded = true;
        } else if (e.y >= GROUND_Y) {
          e.y = GROUND_Y;
          e.vy = 0;
          e.isGrounded = true;
        } else {
          e.isGrounded = false;
        }

      } else {
        // Normal, Fast, Brute zombies - with AI to jump onto elevated platforms!
        e.jumpCooldown = (e.jumpCooldown || 0) - 1;

        // Check if should jump up towards player on platform or jump onto nearby elevated structure
        if (e.isGrounded && e.jumpCooldown <= 0) {
          const playerIsAbove = p.y < e.y - 25 && Math.abs(p.x - e.x) < 240;
          const nearElevatedPlatform = this.platforms.some(
            plat => Math.abs(plat.x + plat.width / 2 - e.x) < plat.width / 2 + 40 && plat.y < e.y - 35 && plat.y > e.y - 190
          );

          if (playerIsAbove || nearElevatedPlatform) {
            // Leap upwards to scale platforms
            e.vy = e.type === 'fast' ? -10.4 : (e.type === 'brute' ? -8.6 : -9.5);
            e.isGrounded = false;
            e.jumpCooldown = 100 + Math.floor(Math.random() * 80);
            this.addDustParticle(e.x, e.y);
          }
        }

        e.vx = moveDir * e.speed;

        const prevEy = e.y;
        e.vy += PLAYER_CONFIG.gravity;
        e.x += e.vx;
        e.y += e.vy;

        // Platform & Ground Physics for Ground Zombies
        let landedOnPlatform: Platform | null = null;
        for (const plat of this.platforms) {
          if (e.x + e.width / 2 >= plat.x && e.x - e.width / 2 <= plat.x + plat.width) {
            if (e.vy >= 0 && e.y >= plat.y && prevEy <= plat.y + 16) {
              landedOnPlatform = plat;
              break;
            }
          }
        }

        if (landedOnPlatform) {
          e.y = landedOnPlatform.y;
          e.vy = 0;
          e.isGrounded = true;
        } else if (e.y >= GROUND_Y) {
          e.y = GROUND_Y;
          e.vy = 0;
          e.isGrounded = true;
        } else {
          e.isGrounded = false;
        }
      }

      // Attack player on contact
      const contactWidth = e.type === 'crow' ? 32 : (e.width + PLAYER_CONFIG.width) / 2 - 2;
      const contactHeight = e.type === 'crow' ? 35 : 30;
      if (
        e.attackCooldown <= 0 &&
        Math.abs(e.x - p.x) < contactWidth &&
        Math.abs(e.y - (e.type === 'crow' ? p.y - 30 : p.y)) < contactHeight &&
        p.invincibleTimer <= 0
      ) {
        let baseDamage = ENEMY_CONFIGS[e.type].damage;
        // User request: Nerf damage from random minions during boss battle
        if (
          this.currentStage.id === 3 &&
          (this.bossSpawned || this.mechBoss?.active) &&
          e.type !== 'boss_ticket' &&
          e.type !== 'boss_mech'
        ) {
          baseDamage = Math.max(3, Math.floor(baseDamage * 0.35));
        }

        this.hurtPlayer(baseDamage);
        e.attackCooldown = 45;
        if (e.type === 'crow') {
          // Crow bounces back up after hit
          e.state = 'fly';
          e.specialTimer = 0;
          e.vy = -4.5;
          e.targetY = 120 + Math.random() * 120;
        }
      }
    }
  }

  // Spawn Homing Missile from Boss
  private spawnHomingMissile(x: number, y: number) {
    this.missiles.push({
      id: Math.random().toString(),
      x,
      y,
      vx: -2.0,
      vy: -3.5,
      speed: 2.2, // Slower, readable missile speed as requested (nerfed from 4.6)
      health: 24, // Easily destroyed with shotgun pellets or melee swing
      maxHealth: 24,
      angle: Math.PI,
      turnSpeed: 0.024, // Wide gentle turn arc giving player plenty of reaction time
      life: 380,
      trailTimer: 0,
    });
  }

  // Update Missiles
  private updateMissiles() {
    const p = this.player;

    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      m.life--;
      m.trailTimer++;

      // Smoke trail
      if (m.trailTimer % 3 === 0) {
        this.particles.push({
          id: Math.random().toString(),
          x: m.x - Math.cos(m.angle) * 12,
          y: m.y - Math.sin(m.angle) * 12,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1,
          color: '#CBD5E0',
          size: 4 + Math.random() * 4,
          life: 18,
          maxLife: 18,
          type: 'smoke',
        });
      }

      // Homing angle calculation
      const targetAngle = Math.atan2(p.y - 30 - m.y, p.x - m.x);
      let angleDiff = targetAngle - m.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

      m.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), m.turnSpeed);
      m.vx = Math.cos(m.angle) * m.speed;
      m.vy = Math.sin(m.angle) * m.speed;

      m.x += m.vx;
      m.y += m.vy;

      // Explode on ground
      if (m.y >= GROUND_Y) {
        this.destroyMissile(i, true);
        continue;
      }

      // Hit player (Tighter, responsive hurtbox)
      if (Math.abs(m.x - p.x) < 18 && Math.abs(m.y - (p.y - 28)) < 22) {
        if (p.invincibleTimer <= 0) {
          this.hurtPlayer(30);
        }
        this.destroyMissile(i, true);
        continue;
      }

      if (m.life <= 0) {
        this.destroyMissile(i, false);
      }
    }
  }

  // Destroy Missile (shot by player or impact)
  private destroyMissile(index: number, hitSomething: boolean = true) {
    const m = this.missiles[index];
    if (!m) return;
    this.missiles.splice(index, 1);

    if (hitSomething) {
      sound.playExplosion();
      this.screenShake = 8;
      this.addExplosionParticle(m.x, m.y);
      this.stats.missilesDestroyed++;
      this.stats.score += 150;

      // Floating bonus text
      this.particles.push({
        id: Math.random().toString(),
        x: m.x,
        y: m.y - 15,
        vx: 0,
        vy: -2,
        color: '#ECC94B',
        size: 11,
        life: 24,
        maxLife: 24,
        type: 'text',
        text: '+150 INTERCEPT!',
      });
    }
  }

  // Update thrown Tactical Bombs physics, fuse, bounce, and detonations
  private updateBombs() {
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const b = this.bombs[i];
      b.fuse--;
      b.rotation += b.vRot;

      // Gravity & Air Resistance
      b.vy += 0.38;
      b.vx *= 0.985;

      const prevX = b.x;
      const prevY = b.y;
      b.x += b.vx;
      b.y += b.vy;

      // Fuse spark particles
      if (b.fuse % 3 === 0) {
        this.addSparkParticle(
          b.x + Math.sin(b.rotation) * 6,
          b.y - 8 + Math.cos(b.rotation) * 6,
          '#ECC94B'
        );
      }

      // Platform & Ground Bounce
      let bounced = false;
      for (const plat of this.platforms) {
        if (b.x >= plat.x && b.x <= plat.x + plat.width) {
          if (b.vy >= 0 && b.y >= plat.y && prevY <= plat.y + 12) {
            b.y = plat.y;
            b.vy = -b.vy * 0.45;
            b.vx *= 0.75;
            b.vRot *= 0.6;
            bounced = true;
            break;
          }
        }
      }

      if (!bounced && b.y >= GROUND_Y) {
        b.y = GROUND_Y;
        b.vy = -b.vy * 0.45;
        b.vx *= 0.75;
        b.vRot *= 0.6;
      }

      // Check direct collision with any living enemy
      let hitEnemy = false;
      for (const enemy of this.enemies) {
        if (enemy.health <= 0) continue;
        const hitDist = (enemy.width + 20) / 2;
        if (Math.hypot(b.x - enemy.x, b.y - (enemy.y - enemy.height / 2)) < hitDist) {
          hitEnemy = true;
          break;
        }
      }

      // Check collision with missiles
      for (let mIdx = this.missiles.length - 1; mIdx >= 0; mIdx--) {
        const m = this.missiles[mIdx];
        if (Math.hypot(b.x - m.x, b.y - m.y) < 28) {
          this.destroyMissile(mIdx, true);
          hitEnemy = true;
          break;
        }
      }

      // Detonate if fuse finished or collided
      if (b.fuse <= 0 || hitEnemy) {
        this.detonateBomb(i);
      }
    }
  }

  private detonateBomb(index: number) {
    const b = this.bombs[index];
    if (!b) return;
    this.bombs.splice(index, 1);

    sound.playExplosion();
    this.screenShake = 22;

    // Big explosive fireball & shockwave
    this.addExplosionParticle(b.x, b.y - 10);
    for (let k = 0; k < 6; k++) {
      this.particles.push({
        id: Math.random().toString(),
        x: b.x + (Math.random() - 0.5) * 40,
        y: b.y - 10 + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 6,
        vy: -2 - Math.random() * 5,
        color: '#FF6B00',
        size: 24 + Math.random() * 20,
        life: 22,
        maxLife: 22,
        type: 'explosion',
      });
    }

    // Fiery blast shockwaves
    this.particles.push({
      id: Math.random().toString(),
      x: b.x,
      y: b.y,
      vx: 0,
      vy: 0,
      color: '#FF8800',
      size: 40,
      life: 25,
      maxLife: 25,
      type: 'shockwave',
    });

    // Blasting debris flying in all directions
    for (let d = 0; d < 14; d++) {
      this.particles.push({
        id: Math.random().toString(),
        x: b.x,
        y: b.y - 10,
        vx: (Math.random() - 0.5) * 14,
        vy: -4 - Math.random() * 9,
        color: '#ECC94B',
        size: 3 + Math.random() * 4,
        life: 30,
        maxLife: 30,
        type: 'debris',
        gravity: 0.4,
      });
    }

    // Damage all enemies in blast radius
    for (const enemy of this.enemies) {
      if (enemy.health <= 0) continue;
      const dist = Math.hypot(b.x - enemy.x, b.y - (enemy.y - enemy.height / 2));
      if (dist <= b.radius) {
        const falloff = 1 - dist / (b.radius * 1.3);
        const actualDmg = Math.round(b.damage * Math.max(0.5, falloff));
        this.hitEnemy(enemy, actualDmg, 'gun');
        enemy.vx = (enemy.x >= b.x ? 1 : -1) * (10 * falloff);
        enemy.vy = -6 * falloff;
        enemy.isGrounded = false;
      }
    }

    // Destroy ticket cards in radius
    for (let cIdx = this.ticketCards.length - 1; cIdx >= 0; cIdx--) {
      const card = this.ticketCards[cIdx];
      if (Math.hypot(b.x - card.x, b.y - card.y) <= b.radius) {
        this.addSparkParticle(card.x, card.y, '#ECC94B');
        this.ticketCards.splice(cIdx, 1);
      }
    }

    // Destroy homing missiles in radius
    for (let mIdx = this.missiles.length - 1; mIdx >= 0; mIdx--) {
      const m = this.missiles[mIdx];
      if (Math.hypot(b.x - m.x, b.y - m.y) <= b.radius) {
        this.destroyMissile(mIdx, true);
      }
    }

    // Destroy thrown cars in radius
    for (let cIdx = this.thrownCars.length - 1; cIdx >= 0; cIdx--) {
      const car = this.thrownCars[cIdx];
      if (Math.hypot(b.x - car.x, b.y - car.y) <= b.radius + 30) {
        this.destroyThrownCar(cIdx, true);
        this.stats.score += 250;
      }
    }

    // Damage Tall Shadow Sub-Boss in Stage 2
    if (this.tallShadowBoss && this.tallShadowBoss.active && this.tallShadowBoss.introState === 'ready') {
      const sb = this.tallShadowBoss;
      let hit = false;
      if (Math.hypot(b.x - sb.handX, b.y - sb.handY) <= b.radius + 60) {
        sb.health -= b.damage * 1.5;
        sb.hitFlash = 12;
        sb.handHitFlash = 15;
        this.stats.damageDealt += b.damage * 1.5;
        sound.playZombieHit();
        hit = true;
      } else if (Math.hypot(b.x - sb.x, b.y - 200) <= b.radius + 120) {
        sb.health -= b.damage;
        sb.hitFlash = 12;
        this.stats.damageDealt += b.damage;
        sound.playZombieHit();
        hit = true;
      }
      if (hit && sb.health <= 0) {
        this.defeatTallShadowBoss();
      }
    }

    // Damage Mech Boss Hands if in radius
    if (this.mechBoss && this.mechBoss.active) {
      const mech = this.mechBoss;
      if (mech.leftHand.health > 0 && Math.hypot(b.x - mech.leftHand.x, b.y - mech.leftHand.y) <= b.radius + 60) {
        mech.leftHand.health = Math.max(0, mech.leftHand.health - b.damage);
        mech.leftHand.hitFlash = 12;
        sound.playZombieHit();
      }
      if (mech.rightHand.health > 0 && Math.hypot(b.x - mech.rightHand.x, b.y - mech.rightHand.y) <= b.radius + 60) {
        mech.rightHand.health = Math.max(0, mech.rightHand.health - b.damage);
        mech.rightHand.hitFlash = 12;
        sound.playZombieHit();
      }
      if (!mech.shielded && mech.headHealth > 0 && Math.hypot(b.x - mech.arenaCenterX, b.y - 120) <= b.radius + 80) {
        mech.headHealth = Math.max(0, mech.headHealth - b.damage);
        mech.headHitFlash = 14;
        sound.playZombieHit();
      }
    }

    // Floating tactical blast text
    this.particles.push({
      id: Math.random().toString(),
      x: b.x,
      y: b.y - 35,
      vx: 0,
      vy: -1.5,
      color: '#FF0055',
      size: 15,
      life: 35,
      maxLife: 35,
      type: 'text',
      text: '💥 MEGA EXPLOSION!',
    });
  }

  // Hurt Player
  public hurtPlayer(damage: number) {
    const p = this.player;
    if (p.invincibleTimer > 0) return;

    p.health = Math.max(0, p.health - damage);
    p.invincibleTimer = PLAYER_CONFIG.invincibleTime;
    this.screenShake = 10;
    sound.playPlayerHurt();

    // Damage indicator
    this.particles.push({
      id: Math.random().toString(),
      x: p.x,
      y: p.y - 65,
      vx: 0,
      vy: -2,
      color: '#E53E3E',
      size: 14,
      life: 30,
      maxLife: 30,
      type: 'text',
      text: `-${damage} HP`,
    });

    if (p.health <= 0) {
      this.status = 'game_over';
    }
  }

  // Spawn Waves and Hordes based on stage
  private updateSpawns() {
    const stage = this.currentStage;
    this.spawnTimer++;

    // Boss Spawn condition for Stage 3
    if (stage.id === 3 && this.player.x >= 4000 && !this.bossSpawned) {
      this.spawnBoss();
      return;
    }

    // Occasional zombie entries during Stage 3 Boss fight
    if (stage.id === 3 && this.bossSpawned && !this.bossDefeated) {
      const bothHandsDestroyed = this.mechBoss && this.mechBoss.active &&
        this.mechBoss.leftHand.state === 'destroyed' &&
        this.mechBoss.rightHand.state === 'destroyed';

      // When both hands are destroyed, reduce surrounding zombie spawns by 75%
      // (Interval increases 4x from 240 frames (~4s) to 960 frames (~16s), max minion quota reduced to 1)
      const spawnInterval = bothHandsDestroyed ? 960 : 240;
      const maxMinions = bothHandsDestroyed ? 1 : 2;

      const minionCount = this.enemies.filter(e => e.type !== 'boss_ticket' && e.type !== 'boss_mech').length;
      if (this.spawnTimer % spawnInterval === 0 && minionCount < maxMinions) {
        const pool: Enemy['type'][] = ['normal', 'fast'];
        const randomType = pool[Math.floor(Math.random() * pool.length)];
        const spawnOnRight = Math.random() > 0.5;
        const spawnX = spawnOnRight ? this.arenaRight - 20 : this.arenaLeft + 20;
        this.spawnEnemy(randomType, spawnX);
      }
      return;
    }

    if (stage.id === 3 && this.bossDefeated) {
      return;
    }

    // In Stage 1 & 2: Stop spawning if all quota has been deployed
    if (stage.id !== 3 && this.stageZombiesSpawnedCount >= this.stageZombiesTotal) {
      return;
    }

    if (this.spawnTimer >= stage.spawnRate) {
      this.spawnTimer = 0;
      if (this.enemies.length < stage.maxZombiesAtOnce) {
        const remainingToSpawn = stage.id !== 3
          ? this.stageZombiesTotal - this.stageZombiesSpawnedCount
          : 999;
        if (remainingToSpawn <= 0) return;

        const packSize = Math.min(
          remainingToSpawn,
          Math.min(stage.maxZombiesAtOnce - this.enemies.length, Math.floor(Math.random() * 3) + 2)
        );

        const spawnAhead = Math.random() > 0.3;
        const baseSpawnX = spawnAhead
          ? this.cameraX + CANVAS_WIDTH + 60 + Math.random() * 80
          : Math.max(50, this.cameraX - 90 - Math.random() * 60);

        if (baseSpawnX < stage.mapLength - 100) {
          const pool = stage.enemyPool;
          for (let k = 0; k < packSize; k++) {
            const randomType = pool[Math.floor(Math.random() * pool.length)];
            const offset = (Math.random() - 0.5) * 80;
            const finalX = Math.max(40, Math.min(stage.mapLength - 100, baseSpawnX + offset));
            this.spawnEnemy(randomType, finalX);
            if (stage.id !== 3) {
              this.stageZombiesSpawnedCount++;
            }
          }
        }
      }
    }
  }

  public spawnEnemyAt(type: Enemy['type'], x: number, customY?: number) {
    const cfg = ENEMY_CONFIGS[type];
    const isCrow = type === 'crow';
    const spawnY = customY !== undefined ? customY : (isCrow ? 130 + Math.random() * 100 : GROUND_Y);

    this.enemies.push({
      id: Math.random().toString(),
      type,
      x,
      y: spawnY,
      vx: 0,
      vy: 0,
      width: cfg.width,
      height: cfg.height,
      health: cfg.health,
      maxHealth: cfg.health,
      speed: cfg.speed + (Math.random() - 0.5) * 0.3,
      facing: 'left',
      state: isCrow ? 'fly' : 'walk',
      attackCooldown: 0,
      hitFlashTimer: 0,
      isGrounded: !isCrow && (customY === undefined || customY >= GROUND_Y),
      animFrame: Math.floor(Math.random() * 50),
      targetY: isCrow ? (customY !== undefined ? customY : 130 + Math.random() * 110) : undefined,
    });
  }

  private spawnEnemy(type: Enemy['type'], x: number, customY?: number) {
    this.spawnEnemyAt(type, x, customY);
  }

  private spawnBoss() {
    this.bossSpawned = true;

    // Lock camera tightly to Boss Arena (eliminating jumping/sliding camera anomalies)
    const arenaCenterX = 4500;
    this.arenaLocked = true;
    this.arenaLeft = arenaCenterX - 380;
    this.arenaRight = arenaCenterX + 380;

    // Wipe non-boss enemies for the boss introduction
    for (const enemy of this.enemies) {
      if (enemy.type !== 'boss_ticket') {
        this.addExplosionParticle(enemy.x, enemy.y - enemy.height / 2);
      }
    }
    this.enemies = [];

    const cfg = ENEMY_CONFIGS.boss_ticket;
    this.enemies.push({
      id: 'boss_ticket',
      type: 'boss_ticket',
      x: arenaCenterX + 220,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      width: cfg.width,
      height: cfg.height,
      health: cfg.health,
      maxHealth: cfg.health,
      speed: cfg.speed,
      facing: 'left',
      state: 'walk',
      attackCooldown: 0,
      hitFlashTimer: 0,
      isGrounded: true,
      animFrame: 0,
      specialTimer: 0,
    });

    // Dramatic screen shake and text
    this.screenShake = 20;
    this.particles.push({
      id: Math.random().toString(),
      x: this.player.x,
      y: 160,
      vx: 0,
      vy: -0.5,
      color: '#E53E3E',
      size: 16,
      life: 80,
      maxLife: 80,
      type: 'text',
      text: '⚠️ FINAL BOSS: Z-CONDUCTOR (TICKET MASTER)!',
    });
  }

  // Update razor ticket cards thrown by Boss
  private updateTicketCards() {
    const p = this.player;
    for (let i = this.ticketCards.length - 1; i >= 0; i--) {
      const card = this.ticketCards[i];
      card.x += card.vx;
      card.y += card.vy;
      card.angle += 0.25;
      card.life--;

      if (card.life % 3 === 0) {
        this.addSparkParticle(card.x, card.y, '#ECC94B');
      }

      // Check hit on player
      if (Math.hypot(p.x - card.x, p.y - 35 - card.y) < 26) {
        if (!p.isSliding && p.invincibleTimer <= 0) {
          this.hurtPlayer(card.damage);
          this.ticketCards.splice(i, 1);
          continue;
        }
      }

      // Check ground collision or expiration
      if (card.life <= 0 || card.y >= GROUND_Y) {
        this.addSparkParticle(card.x, card.y, '#ECC94B');
        this.ticketCards.splice(i, 1);
      }
    }
  }

  // Update falling rocks debris falling from the shattered sky
  private updateFallingRocks() {
    const p = this.player;
    for (let i = this.fallingRocks.length - 1; i >= 0; i--) {
      const rock = this.fallingRocks[i];
      rock.x += rock.vx;
      rock.y += rock.vy;
      rock.rotation += rock.vRot;
      rock.life--;

      // Check collision with player
      if (Math.hypot(p.x - rock.x, (p.y - 30) - rock.y) < rock.radius + 18) {
        if (!p.isSliding && p.invincibleTimer <= 0) {
          this.hurtPlayer(rock.damage);
          sound.playMeleeHit();
          this.addExplosionParticle(rock.x, rock.y);
          this.fallingRocks.splice(i, 1);
          continue;
        }
      }

      // Check ground collision -> shatter into floor fragments
      if (rock.y >= GROUND_Y) {
        sound.playMeleeHit();
        for (let d = 0; d < 4; d++) {
          this.particles.push({
            id: Math.random().toString(),
            x: rock.x,
            y: GROUND_Y - 4,
            vx: (Math.random() - 0.5) * 8,
            vy: -2 - Math.random() * 4,
            color: '#718096',
            size: 3 + Math.random() * 3,
            life: 18,
            maxLife: 18,
            type: 'debris',
            gravity: 0.4,
          });
        }
        this.fallingRocks.splice(i, 1);
        continue;
      }

      if (rock.life <= 0) {
        this.fallingRocks.splice(i, 1);
      }
    }
  }

  // Spawn Giga Mecha-Z Background Boss
  private spawnMechBoss(arenaCenterX: number) {
    this.arenaLocked = true;
    this.arenaLeft = arenaCenterX - 380;
    this.arenaRight = arenaCenterX + 380;

    this.mechBoss = {
      active: true,
      introState: 'rising',
      introTimer: 0,
      riseY: 340,
      arenaCenterX,
      arenaLeft: this.arenaLeft,
      arenaRight: this.arenaRight,
      leftHand: {
        x: arenaCenterX - 240,
        y: GROUND_Y - 20,
        baseX: arenaCenterX - 240,
        baseY: GROUND_Y - 20,
        vx: 0,
        vy: 0,
        health: 9900, // Doubled hand durability (2x Hand HP: 4950 -> 9900)
        maxHealth: 9900,
        hitFlash: 0,
        width: 80,
        height: 70,
        side: 'left',
        state: 'grip',
        timer: 0,
        targetX: 0,
        targetY: 0,
      },
      rightHand: {
        x: arenaCenterX + 240,
        y: GROUND_Y - 20,
        baseX: arenaCenterX + 240,
        baseY: GROUND_Y - 20,
        vx: 0,
        vy: 0,
        health: 9900, // Doubled hand durability (2x Hand HP: 4950 -> 9900)
        maxHealth: 9900,
        hitFlash: 0,
        width: 80,
        height: 70,
        side: 'right',
        state: 'grip',
        timer: 0,
        targetX: 0,
        targetY: 0,
      },
      headHealth: 10800, // Quadrupled Robot Head Core Durability (4x HP: 2700 -> 10800)
      headMaxHealth: 10800,
      headHitFlash: 0,
      shielded: true,
      attackCooldown: 100,
      laserPatternTimer: 0,
      currentAttack: 'idle',
      deathTimer: 0,
      eyeFlash: false,
    };
  }

  // Update Giga Mecha-Z State Machine & Boss AI
  private updateMechBoss() {
    const mech = this.mechBoss;
    if (!mech || !mech.active) return;
    const p = this.player;

    // 1. Intro sequence state machine (Rising -> Laughing 3 times -> Ready)
    if (mech.introState === 'rising') {
      mech.riseY -= 2.2;
      this.screenShake = 3;
      if (mech.riseY <= 0) {
        mech.riseY = 0;
        mech.introState = 'laugh1';
        mech.introTimer = 0;
        sound.playMechLaugh(0.85);
        this.particles.push({
          id: Math.random().toString(),
          x: mech.arenaCenterX,
          y: 130,
          vx: 0,
          vy: -0.4,
          color: '#ECC94B',
          size: 16,
          life: 45,
          maxLife: 45,
          type: 'text',
          text: '🤖 GIGA MECHA-Z: HA!',
        });
      }
      return;
    }

    if (mech.introState === 'laugh1') {
      mech.introTimer++;
      mech.eyeFlash = true;
      if (mech.introTimer >= 36) {
        mech.introState = 'laugh2';
        mech.introTimer = 0;
        sound.playMechLaugh(1.05);
        this.particles.push({
          id: Math.random().toString(),
          x: mech.arenaCenterX,
          y: 130,
          vx: 0,
          vy: -0.4,
          color: '#ECC94B',
          size: 16,
          life: 45,
          maxLife: 45,
          type: 'text',
          text: '🤖 GIGA MECHA-Z: HA HA!!',
        });
      }
      return;
    }

    if (mech.introState === 'laugh2') {
      mech.introTimer++;
      mech.eyeFlash = true;
      if (mech.introTimer >= 36) {
        mech.introState = 'laugh3';
        mech.introTimer = 0;
        sound.playMechLaugh(1.25);
        this.screenShake = 18;
        this.particles.push({
          id: Math.random().toString(),
          x: mech.arenaCenterX,
          y: 130,
          vx: 0,
          vy: -0.4,
          color: '#E53E3E',
          size: 18,
          life: 55,
          maxLife: 55,
          type: 'text',
          text: '🤖 GIGA MECHA-Z: MWA-HA-HA-HA!!!',
        });
      }
      return;
    }

    if (mech.introState === 'laugh3') {
      mech.introTimer++;
      mech.eyeFlash = true;
      if (mech.introTimer >= 42) {
        mech.introState = 'ready';
        mech.introTimer = 0;
        mech.attackCooldown = 70;
        mech.eyeFlash = false;
        this.particles.push({
          id: Math.random().toString(),
          x: mech.arenaCenterX,
          y: 150,
          vx: 0,
          vy: -0.4,
          color: '#63B3ED',
          size: 15,
          life: 75,
          maxLife: 75,
          type: 'text',
          text: '⚠️ DESTROY BOTH MECH HANDS TO BREAK HEAD SHIELD!',
        });
      }
      return;
    }

    // 2. Defeat sequence
    if (mech.introState === 'defeated') {
      mech.deathTimer++;
      this.screenShake = 15;
      if (mech.deathTimer % 3 === 0) {
        const explX = mech.arenaCenterX + (Math.random() - 0.5) * 360;
        const explY = 70 + Math.random() * 220;
        this.addExplosionParticle(explX, explY);
        sound.playExplosion();
      }
      if (mech.deathTimer >= 90) {
        this.bossDefeated = true;
        this.arenaLocked = false;
      }
      return;
    }

    // 3. Ready battle state
    // Hit flash decays
    if (mech.leftHand.hitFlash > 0) mech.leftHand.hitFlash--;
    if (mech.rightHand.hitFlash > 0) mech.rightHand.hitFlash--;
    if (mech.headHitFlash > 0) mech.headHitFlash--;

    // Check hand destruction & shield break
    if (mech.leftHand.health <= 0 && mech.leftHand.state !== 'destroyed') {
      mech.leftHand.state = 'destroyed';
      if (mech.currentAttack === 'hand_slam') {
        mech.currentAttack = 'idle';
        mech.attackCooldown = 45;
      }
      this.screenShake = 18;
      sound.playExplosion();
      for (let k = 0; k < 20; k++) {
        this.addExplosionParticle(mech.leftHand.x + (Math.random() - 0.5) * 60, mech.leftHand.y - Math.random() * 40);
      }
      this.particles.push({
        id: Math.random().toString(),
        x: mech.leftHand.x,
        y: mech.leftHand.y - 30,
        vx: 0,
        vy: -1,
        color: '#ECC94B',
        size: 14,
        life: 50,
        maxLife: 50,
        type: 'text',
        text: '💥 LEFT HAND DESTROYED!',
      });
    }

    if (mech.rightHand.health <= 0 && mech.rightHand.state !== 'destroyed') {
      mech.rightHand.state = 'destroyed';
      if (mech.currentAttack === 'hand_slam') {
        mech.currentAttack = 'idle';
        mech.attackCooldown = 45;
      }
      this.screenShake = 18;
      sound.playExplosion();
      for (let k = 0; k < 20; k++) {
        this.addExplosionParticle(mech.rightHand.x + (Math.random() - 0.5) * 60, mech.rightHand.y - Math.random() * 40);
      }
      this.particles.push({
        id: Math.random().toString(),
        x: mech.rightHand.x,
        y: mech.rightHand.y - 30,
        vx: 0,
        vy: -1,
        color: '#ECC94B',
        size: 14,
        life: 50,
        maxLife: 50,
        type: 'text',
        text: '💥 RIGHT HAND DESTROYED!',
      });
    }

    // Shield status check
    const bothHandsDestroyed = mech.leftHand.state === 'destroyed' && mech.rightHand.state === 'destroyed';

    if (bothHandsDestroyed) {
      // Ensure current attack never gets stuck on hand_slam
      if (mech.currentAttack === 'hand_slam') {
        mech.currentAttack = 'idle';
        mech.attackCooldown = 40;
      }

      if (mech.shielded) {
        mech.shielded = false;
        this.screenShake = 25;
        sound.playExplosion();
        for (let k = 0; k < 25; k++) {
          this.addSparkParticle(mech.arenaCenterX + (Math.random() - 0.5) * 120, 80 + (Math.random() - 0.5) * 80, '#4299E1');
        }
        this.particles.push({
          id: Math.random().toString(),
          x: mech.arenaCenterX,
          y: 130,
          vx: 0,
          vy: -0.4,
          color: '#FF6B00',
          size: 16,
          life: 90,
          maxLife: 90,
          type: 'text',
          text: '⚡ CORE SHIELD SHATTERED! SHOOT THE MECH HEAD NOW!',
        });
      }
    }

    // Update hands
    const updateSingleHand = (hand: MechHand) => {
      if (hand.state === 'destroyed') return;

      if (hand.state === 'grip') {
        hand.x += (hand.baseX - hand.x) * 0.1;
        hand.y += (hand.baseY - hand.y) * 0.1;
      } else if (hand.state === 'slam_prep') {
        hand.timer++;
        // Hover up and track towards target deliberately
        hand.y += (110 - hand.y) * 0.08;
        hand.x += (hand.targetX - hand.x) * 0.08;

        // Ground warning marker
        if (hand.timer % 5 === 0) {
          this.addSparkParticle(hand.targetX + (Math.random() - 0.5) * 40, GROUND_Y - 4, '#E53E3E');
        }

        if (hand.timer >= 90) {
          hand.state = 'slam';
          hand.timer = 0;
          hand.vy = 16;
        }
      } else if (hand.state === 'slam') {
        hand.y += hand.vy;
        if (hand.y >= GROUND_Y - 20) {
          hand.y = GROUND_Y - 20;
          hand.state = 'impact';
          hand.timer = 0;
          this.screenShake = 22;
          sound.playExplosion();

          // Shockwaves
          this.particles.push({
            id: Math.random().toString(),
            x: hand.x - 20,
            y: GROUND_Y - 8,
            vx: -5.5,
            vy: 0,
            color: '#E53E3E',
            size: 26,
            life: 34,
            maxLife: 34,
            type: 'shockwave',
          });
          this.particles.push({
            id: Math.random().toString(),
            x: hand.x + 20,
            y: GROUND_Y - 8,
            vx: 5.5,
            vy: 0,
            color: '#E53E3E',
            size: 26,
            life: 34,
            maxLife: 34,
            type: 'shockwave',
          });

          // Debris shower
          for (let d = 0; d < 12; d++) {
            this.particles.push({
              id: Math.random().toString(),
              x: hand.x + (Math.random() - 0.5) * 60,
              y: GROUND_Y - 6,
              vx: (Math.random() - 0.5) * 10,
              vy: -4 - Math.random() * 7,
              color: '#4A5568',
              size: 4 + Math.random() * 4,
              life: 30,
              maxLife: 30,
              type: 'debris',
              gravity: 0.45,
            });
          }

          // Damage player if grounded near impact
          if (Math.abs(p.x - hand.x) < 80 && (p.isGrounded || p.y >= GROUND_Y - 30) && p.invincibleTimer <= 0 && !p.isSliding) {
            this.hurtPlayer(26);
            p.vy = -7;
            p.vx = (p.x > hand.x ? 1 : -1) * 7;
          }
        }
      } else if (hand.state === 'impact') {
        hand.timer++;
        if (hand.timer >= 24) {
          hand.state = 'recovering';
          hand.timer = 0;
        }
      } else if (hand.state === 'recovering') {
        hand.timer++;
        // Vulnerable state for player to attack
        if (hand.timer % 12 === 0) {
          this.addSparkParticle(hand.x + (Math.random() - 0.5) * 30, hand.y - 20, '#ECC94B');
        }
        if (hand.timer >= 150) {
          hand.state = 'grip';
          hand.timer = 0;
          if (mech.currentAttack === 'hand_slam') {
            mech.currentAttack = 'idle';
            mech.attackCooldown = 180;
          }
        }
      }
    };

    updateSingleHand(mech.leftHand);
    updateSingleHand(mech.rightHand);

    // AI Attack Cycle (Hands, Lasers, and Missile Salvos)
    if (mech.currentAttack === 'idle') {
      if (mech.attackCooldown > 0) {
        mech.attackCooldown--;
      } else {
        if (bothHandsDestroyed) {
          // Enraged Phase: Handless Mech Unleashes Laser & Missile Barrages!
          // Chest laser chance reduced by 50% (from 0.38 -> 0.19)
          const atkRand = Math.random();
          if (atkRand < 0.19) {
            // Chest Plasma Laser Beam (Reduced chance -50%)
            mech.currentAttack = 'chest_laser';
            const coreX = mech.arenaCenterX;
            const coreY = 150 + mech.riseY;
            const initialAngle = Math.atan2((p.y - 30) - coreY, p.x - coreX);
            mech.chestLaser = {
              angle: initialAngle,
              timer: 0,
              maxTelegraph: 75,
              duration: 165,
              beamWidth: 50,
              damage: 26,
            };
            mech.eyeFlash = true;
          } else if (atkRand < 0.72) {
            // Vertical Orbital Laser Pillars with Warning Zones
            mech.currentAttack = 'laser_spam';
            mech.laserPatternTimer = 0;
            mech.eyeFlash = true;

            const p1 = mech.arenaLeft + 80 + Math.random() * 70;
            const p2 = mech.arenaCenterX + (Math.random() - 0.5) * 110;
            const p3 = mech.arenaRight - 80 - Math.random() * 70;
            mech.verticalPillars = [
              { x: p1, width: 85 },
              { x: p2, width: 85 },
              { x: p3, width: 85 },
            ];
          } else {
            // Quad Heavy Homing Missile Salvo from Shoulder Pods!
            mech.currentAttack = 'missile_salvo';
            this.spawnHomingMissile(mech.arenaCenterX - 145, 90);
            this.spawnHomingMissile(mech.arenaCenterX - 75, 80);
            this.spawnHomingMissile(mech.arenaCenterX + 75, 80);
            this.spawnHomingMissile(mech.arenaCenterX + 145, 90);
            sound.playMissileLaunch();
            mech.currentAttack = 'idle';
            mech.attackCooldown = 120;
          }
        } else {
          // Normal Phase with hands intact
          const availableHands: ('left' | 'right')[] = [];
          if (mech.leftHand.state === 'grip') availableHands.push('left');
          if (mech.rightHand.state === 'grip') availableHands.push('right');

          const rand = Math.random();
          // Hand slam probability increased by 50% (0.32 -> 0.48)
          // Chest laser probability reduced by 50% (from 0.33 window to 0.165 window -> threshold 0.48 to 0.645)
          if (availableHands.length > 0 && rand < 0.48) {
            // Hand slam attack (Increased chance +50%)
            const chosenHand = availableHands[Math.floor(Math.random() * availableHands.length)];
            const hand = chosenHand === 'left' ? mech.leftHand : mech.rightHand;
            hand.state = 'slam_prep';
            hand.timer = 0;
            hand.targetX = Math.max(mech.arenaLeft + 60, Math.min(mech.arenaRight - 60, p.x));
            mech.currentAttack = 'hand_slam';
            sound.playJump();
          } else if (rand < 0.645) {
            // Chest Plasma Beam Attack (Reduced chance -50%)
            mech.currentAttack = 'chest_laser';
            const coreX = mech.arenaCenterX;
            const coreY = 150 + mech.riseY;
            const initialAngle = Math.atan2((p.y - 30) - coreY, p.x - coreX);
            mech.chestLaser = {
              angle: initialAngle,
              timer: 0,
              maxTelegraph: 90,
              duration: 180,
              beamWidth: 44,
              damage: 26,
            };
            mech.eyeFlash = true;
          } else if (rand < 0.88) {
            // Vertical Orbital Laser Pillars attack
            mech.currentAttack = 'laser_spam';
            mech.laserPatternTimer = 0;
            mech.eyeFlash = true;

            const p1 = mech.arenaLeft + 100 + Math.random() * 60;
            const p2 = mech.arenaCenterX + (Math.random() - 0.5) * 100;
            const p3 = mech.arenaRight - 100 - Math.random() * 60;
            mech.verticalPillars = [
              { x: p1, width: 80 },
              { x: p2, width: 80 },
              { x: p3, width: 80 },
            ];
          } else {
            // Missile salvo
            mech.currentAttack = 'missile_salvo';
            this.spawnHomingMissile(mech.arenaCenterX - 130, 90);
            this.spawnHomingMissile(mech.arenaCenterX + 130, 90);
            sound.playMissileLaunch();
            mech.currentAttack = 'idle';
            mech.attackCooldown = 190;
          }
        }
      }
    } else if (mech.currentAttack === 'chest_laser') {
      const cl = mech.chestLaser;
      if (!cl) {
        mech.currentAttack = 'idle';
        return;
      }
      cl.timer++;
      const coreX = mech.arenaCenterX;
      const coreY = 150 + mech.riseY;

      if (cl.timer <= cl.maxTelegraph) {
        // Telegraph aiming phase: track player direction smoothly and predictably
        const targetAngle = Math.atan2((p.y - 30) - coreY, p.x - coreX);
        let angleDiff = targetAngle - cl.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        cl.angle += angleDiff * 0.045;

        if (cl.timer % 8 === 0) {
          sound.playLaser();
          this.addSparkParticle(coreX + Math.cos(cl.angle) * 40, coreY + Math.sin(cl.angle) * 40, '#00F0FF');
        }
      } else if (cl.timer <= cl.duration) {
        // Active Firing Phase: giant plasma beam
        if (cl.timer % 8 === 0) {
          sound.playLaser();
          this.screenShake = 5;
        }

        // Check laser collision with player
        const px = p.x - coreX;
        const py = (p.y - 30) - coreY;
        const dirX = Math.cos(cl.angle);
        const dirY = Math.sin(cl.angle);
        const proj = px * dirX + py * dirY; // distance along ray

        if (proj > 20 && proj < 1000) {
          const perpDist = Math.abs(px * (-dirY) + py * dirX);
          if (perpDist < cl.beamWidth / 2 + 12 && p.invincibleTimer <= 0 && !p.isSliding) {
            this.hurtPlayer(cl.damage);
            p.vx = dirX * 7;
            this.addSparkParticle(p.x, p.y - 30, '#00F0FF');
          }
        }
      } else {
        mech.currentAttack = 'idle';
        mech.chestLaser = undefined;
        mech.attackCooldown = bothHandsDestroyed ? 95 : 200;
        mech.eyeFlash = false;
      }
    } else if (mech.currentAttack === 'laser_spam') {
      // When both hands are destroyed and boss head health <= 50%, top vertical laser fires 25% faster (1.25x progression)
      const isEnragedFastLasers = bothHandsDestroyed && (mech.headHealth / mech.headMaxHealth) <= 0.5;
      mech.laserPatternTimer += isEnragedFastLasers ? 1.25 : 1;
      const t = Math.floor(mech.laserPatternTimer);

      if (t <= 90) {
        // Warning telegraph phase (visible ground markers & vertical warning beacons)
        if (t % 8 === 0) {
          sound.playLaser();
          if (mech.verticalPillars) {
            for (const pillar of mech.verticalPillars) {
              this.addSparkParticle(pillar.x, GROUND_Y - 6, '#FF2222');
            }
          }
        }
      } else if (t <= 160) {
        // Active Firing Phase: Vertical Energy Columns blast down!
        if (t % 10 === 0) {
          sound.playLaser();
          this.screenShake = 4;
        }

        // Damage player if inside vertical pillar zone
        if (mech.verticalPillars) {
          for (const pillar of mech.verticalPillars) {
            if (Math.abs(p.x - pillar.x) < pillar.width / 2 + 10 && p.invincibleTimer <= 0 && !p.isSliding) {
              this.hurtPlayer(20);
              p.vx = (p.x > pillar.x ? 1 : -1) * 6;
              this.addSparkParticle(p.x, p.y - 30, '#FF0055');
            }
          }
        }
      } else {
        mech.currentAttack = 'idle';
        mech.laserPatternTimer = 0;
        mech.verticalPillars = undefined;
        // 25% faster recovery in critical state (95 * 0.75 ≈ 71)
        mech.attackCooldown = isEnragedFastLasers ? 71 : (bothHandsDestroyed ? 95 : 200);
        mech.eyeFlash = false;
      }
    }
  }

  public spawnTallShadowBoss() {
    this.bossSpawned = true;
    this.arenaLocked = true;
    this.arenaLeft = this.currentStage.mapLength - 780;
    this.arenaRight = this.currentStage.mapLength - 20;

    const startX = this.currentStage.mapLength + 120;
    const targetX = this.currentStage.mapLength - 160;

    this.tallShadowBoss = {
      active: true,
      introState: 'walking_in',
      introTimer: 0,
      x: startX,
      y: GROUND_Y,
      walkTargetX: targetX,
      health: ENEMY_CONFIGS.boss_tall_shadow.health,
      maxHealth: ENEMY_CONFIGS.boss_tall_shadow.health,
      hitFlash: 0,
      facing: 'left',
      currentAttack: 'idle',
      attackCooldown: 40,
      attackTimer: 0,
      slamState: 'idle',
      slamTimer: 0,
      slamTargetX: this.player.x,
      handX: startX - 80,
      handY: 60,
      handHitFlash: 0,
      handDamageVulnerability: false,
      carThrowState: 'idle',
      carThrowTimer: 0,
      carThrowTargetX: this.player.x,
      heldCarType: 0,
      crowSummonTimer: 0,
      eyePulse: 0,
      roarTimer: 0,
      deathTimer: 0,
    };

    sound.playBossRoar();
    this.screenShake = 24;

    this.particles.push({
      id: Math.random().toString(),
      x: this.player.x,
      y: 130,
      vx: 0,
      vy: -0.5,
      color: '#E53E3E',
      size: 16,
      life: 90,
      maxLife: 90,
      type: 'text',
      text: '⚠️ DANGER! COLOSSAL HUMAN ZOMBIE AWAKENS! (ซอมบี้มนุษย์ร่างยักษ์) ⚠️',
    });
  }

  public defeatTallShadowBoss() {
    if (!this.tallShadowBoss || this.tallShadowBoss.introState === 'defeated') return;
    const sb = this.tallShadowBoss;
    sb.introState = 'defeated';
    sb.deathTimer = 0;
    sb.health = 0;
    this.bossDefeated = true;
    this.arenaLocked = false;

    this.stats.kills++;
    this.stats.score += ENEMY_CONFIGS.boss_tall_shadow.score;
    this.stats.combo++;
    this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.combo);
    this.stats.comboTimer = 180;

    sound.playVictory();
    sound.playBossRoar();
    sound.playExplosion();
    this.screenShake = 35;

    for (let i = 0; i < 35; i++) {
      this.addExplosionParticle(sb.x - 40 + (Math.random() - 0.5) * 140, GROUND_Y - Math.random() * 260);
    }

    this.particles.push({
      id: Math.random().toString(),
      x: this.player.x,
      y: 120,
      vx: 0,
      vy: -0.4,
      color: '#48BB78',
      size: 16,
      life: 100,
      maxLife: 100,
      type: 'text',
      text: '🏆 SUB-BOSS DEFEATED! +10,000 PTS! (PROCEED TO EXIT)',
    });
  }

  public updateTallShadowBoss() {
    if (!this.tallShadowBoss || !this.tallShadowBoss.active) return;
    const sb = this.tallShadowBoss;
    const p = this.player;

    if (sb.hitFlash > 0) sb.hitFlash--;
    if (sb.handHitFlash > 0) sb.handHitFlash--;
    sb.eyePulse = (sb.eyePulse + 0.06) % (Math.PI * 2);

    // Intro Phase: Walking out from right screen into view
    if (sb.introState === 'walking_in') {
      sb.x -= 1.4;
      sb.handX = sb.x - 80;
      sb.handY = 60;
      if (sb.introTimer % 10 === 0) {
        this.addDustParticle(sb.x, GROUND_Y);
        this.screenShake = 4;
      }
      sb.introTimer++;
      if (sb.x <= sb.walkTargetX) {
        sb.x = sb.walkTargetX;
        sb.introState = 'roaring';
        sb.introTimer = 0;
        sound.playBossRoar();
        this.screenShake = 28;
      }
      return;
    }

    // Intro Roar Phase
    if (sb.introState === 'roaring') {
      sb.introTimer++;
      if (sb.introTimer % 14 === 0) {
        this.screenShake = 6;
      }
      if (sb.introTimer >= 70) {
        sb.introState = 'ready';
        sb.currentAttack = 'idle';
        sb.attackCooldown = 90; // Slower initial cooldown (100% slower)
      }
      return;
    }

    // Defeated state
    if (sb.introState === 'defeated') {
      sb.deathTimer++;
      if (sb.deathTimer % 6 === 0) {
        this.addExplosionParticle(sb.x - 30 + (Math.random() - 0.5) * 120, GROUND_Y - Math.random() * 300);
      }
      if (sb.deathTimer > 90) {
        sb.active = false;
      }
      return;
    }

    // Battle AI State
    sb.facing = p.x < sb.x ? 'left' : 'right';

    // Idle cooldown management
    if (sb.currentAttack === 'idle') {
      sb.attackCooldown--;
      if (sb.attackCooldown <= 0) {
        // Choose attack
        const rand = Math.random();
        if (rand < 0.36) {
          // Attack 1: Hand Slam with telegraph (100% slower telegraph & cooldown)
          sb.currentAttack = 'hand_slam';
          sb.slamState = 'prep';
          sb.slamTimer = 0;
          sb.slamTargetX = Math.max(this.arenaLeft + 80, Math.min(this.arenaRight - 80, p.x + (p.vx > 0 ? 30 : -30)));
          sb.handX = sb.slamTargetX;
          sb.handY = -40;
        } else if (rand < 0.70) {
          // Attack 2: Car Throw with telegraph (100% slower telegraph & flight)
          sb.currentAttack = 'car_throw';
          sb.carThrowState = 'grab';
          sb.carThrowTimer = 0;
          sb.carThrowTargetX = Math.max(this.arenaLeft + 70, Math.min(this.arenaRight - 70, p.x + (Math.random() - 0.5) * 160));
          sb.heldCarType = Math.floor(Math.random() * 3);
          sb.handX = sb.x - 60;
          sb.handY = 120;
        } else {
          // Attack 3: Summon Zombie Crows
          sb.currentAttack = 'crow_summon';
          sb.crowSummonTimer = 0;
          sound.playCrowCaw();
          this.screenShake = 14;

          // Spawn crows from diverse angles
          const spawnPoints = [
            { x: this.arenaLeft + 100, y: 50 },
            { x: this.arenaRight - 100, y: 50 },
            { x: this.arenaLeft - 40, y: 130 },
            { x: this.arenaLeft - 80, y: 200 },
            { x: this.arenaRight + 40, y: 130 },
            { x: this.arenaRight + 80, y: 200 },
          ];

          spawnPoints.forEach((sp) => {
            this.spawnEnemyAt('crow', sp.x, sp.y);
          });

          this.particles.push({
            id: Math.random().toString(),
            x: this.player.x,
            y: 140,
            vx: 0,
            vy: -0.4,
            color: '#1A202C',
            size: 15,
            life: 80,
            maxLife: 80,
            type: 'text',
            text: '🦅 ZOMBIE CROWS SUMMONED! (SWAT WITH MELEE OR SHOOT!)',
          });

          sb.currentAttack = 'idle';
          sb.attackCooldown = 220; // 100% slower cooldown (was 110)
        }
      }
    } else if (sb.currentAttack === 'hand_slam') {
      // Hand Slam Attack Logic
      if (sb.slamState === 'prep') {
        sb.slamTimer++;
        sb.handX += (sb.slamTargetX - sb.handX) * 0.05;
        sb.handY += (-20 - sb.handY) * 0.05;

        // Ground danger telegraph sparks
        if (sb.slamTimer % 6 === 0) {
          this.addSparkParticle(sb.slamTargetX, GROUND_Y - 4, '#FF2222');
        }

        // 100% slower prep time (was 75 -> 150 frames = 2.5 seconds warning!)
        if (sb.slamTimer >= 150) {
          sb.slamState = 'slam';
          sb.slamTimer = 0;
        }
      } else if (sb.slamState === 'slam') {
        sb.handY += 16; // Slower downward descent
        if (sb.handY >= GROUND_Y - 20) {
          sb.handY = GROUND_Y - 20;
          sb.slamState = 'impact';
          sb.slamTimer = 0;
          this.screenShake = 24;
          sound.playExplosion();

          // Shockwave particles
          this.particles.push({
            id: Math.random().toString(),
            x: sb.slamTargetX,
            y: GROUND_Y,
            vx: 0,
            vy: 0,
            color: '#1A202C',
            size: 45,
            life: 25,
            maxLife: 25,
            type: 'shockwave',
          });

          // Flying debris
          for (let d = 0; d < 8; d++) {
            this.particles.push({
              id: Math.random().toString(),
              x: sb.slamTargetX,
              y: GROUND_Y - 8,
              vx: (Math.random() - 0.5) * 12,
              vy: -3 - Math.random() * 6,
              color: '#4A5568',
              size: 4,
              life: 20,
              maxLife: 20,
              type: 'debris',
              gravity: 0.45,
            });
          }

          // Damage check on player - 50% damage reduction (28 -> 14)
          if (Math.abs(p.x - sb.slamTargetX) < 95 && p.isGrounded && p.invincibleTimer <= 0 && !p.isSliding) {
            this.hurtPlayer(14);
            p.vy = -6;
            p.vx = (p.x > sb.slamTargetX ? 1 : -1) * 7;
          }
        }
      } else if (sb.slamState === 'impact') {
        sb.slamTimer++;
        if (sb.slamTimer >= 25) {
          sb.slamState = 'rest';
          sb.slamTimer = 0;
          sb.handDamageVulnerability = true;
        }
      } else if (sb.slamState === 'rest') {
        sb.slamTimer++;
        // Hand resting on ground - vulnerable to player attacks! (100% slower / longer opening: was 110 -> 210 frames)
        if (sb.slamTimer >= 210) {
          sb.handDamageVulnerability = false;
          sb.slamState = 'retract';
          sb.slamTimer = 0;
        }
      } else if (sb.slamState === 'retract') {
        sb.slamTimer++;
        sb.handY += (-80 - sb.handY) * 0.07;
        if (sb.slamTimer >= 45) {
          sb.slamState = 'idle';
          sb.currentAttack = 'idle';
          sb.attackCooldown = 150; // 100% slower cooldown (was 75)
          sb.handY = 60;
          sb.handX = sb.x - 80;
        }
      }
    } else if (sb.currentAttack === 'car_throw') {
      if (sb.carThrowState === 'grab') {
        sb.carThrowTimer++;
        sb.handX = sb.x - 60;
        sb.handY = 120 + Math.sin(sb.carThrowTimer * 0.07) * 10;

        // Ground danger target indicator sparks
        if (sb.carThrowTimer % 6 === 0) {
          this.addSparkParticle(sb.carThrowTargetX, GROUND_Y - 4, '#FF6B00');
        }

        // 100% slower telegraph duration (was 65 -> 130 frames)
        if (sb.carThrowTimer >= 130) {
          sb.carThrowState = 'throw';
          sb.carThrowTimer = 0;
          sound.playCarThrow();

          const spawnX = sb.handX - 40;
          const spawnY = sb.handY - 10;
          const travelFrames = 70; // 100% slower projectile flight speed (was 40)
          const vx = (sb.carThrowTargetX - spawnX) / travelFrames;
          const vy = -9.0;

          this.thrownCars.push({
            id: Math.random().toString(),
            x: spawnX,
            y: spawnY,
            vx,
            vy,
            rotation: 0,
            vRot: (Math.random() - 0.5) * 0.12,
            radius: 42,
            damage: 16, // 50% damage reduction (was 32)
            targetX: sb.carThrowTargetX,
            targetY: GROUND_Y,
            life: 200,
            carType: sb.heldCarType,
          });

          sb.carThrowState = 'idle';
          sb.currentAttack = 'idle';
          sb.attackCooldown = 170; // 100% slower cooldown (was 85)
          sb.handX = sb.x - 80;
          sb.handY = 60;
        }
      }
    }
  }

  public destroyThrownCar(index: number, explode: boolean = true) {
    const car = this.thrownCars[index];
    if (!car) return;
    this.thrownCars.splice(index, 1);

    if (explode) {
      sound.playExplosion();
      this.screenShake = 18;
      this.addExplosionParticle(car.x, car.y);

      // Flying burning car scrap pieces
      for (let i = 0; i < 10; i++) {
        this.particles.push({
          id: Math.random().toString(),
          x: car.x,
          y: car.y,
          vx: (Math.random() - 0.5) * 12,
          vy: -3 - Math.random() * 7,
          color: i % 2 === 0 ? '#FF6B00' : '#4A5568',
          size: 4 + Math.random() * 4,
          life: 25,
          maxLife: 25,
          type: 'debris',
          gravity: 0.45,
        });
      }
    }
  }

  public updateThrownCars() {
    const p = this.player;
    for (let i = this.thrownCars.length - 1; i >= 0; i--) {
      const car = this.thrownCars[i];
      car.vy += 0.45; // Gravity
      car.x += car.vx;
      car.y += car.vy;
      car.rotation += car.vRot;
      car.life--;

      // Smoke trail
      if (car.life % 3 === 0) {
        this.particles.push({
          id: Math.random().toString(),
          x: car.x,
          y: car.y,
          vx: (Math.random() - 0.5) * 2,
          vy: -1,
          color: '#4A5568',
          size: 5 + Math.random() * 4,
          life: 14,
          maxLife: 14,
          type: 'smoke',
        });
      }

      // Collision with player
      if (Math.hypot(p.x - car.x, (p.y - 30) - car.y) < car.radius + 20) {
        if (!p.isSliding && p.invincibleTimer <= 0) {
          this.hurtPlayer(car.damage);
          p.vx = (car.vx > 0 ? 1 : -1) * 9;
          p.vy = -6;
          this.destroyThrownCar(i, true);
          continue;
        }
      }

      // Ground collision
      if (car.y >= GROUND_Y - 15) {
        this.destroyThrownCar(i, true);
      }
    }
  }

  // Camera tracking player smoothly, locked to arena during Giga Mecha-Z fight
  private updateCamera() {
    if (this.arenaLocked) {
      const targetCameraX = (this.arenaLeft + this.arenaRight) / 2 - CANVAS_WIDTH / 2;
      const maxCameraX = Math.max(0, this.currentStage.mapLength - CANVAS_WIDTH);
      this.cameraX += (Math.max(0, Math.min(targetCameraX, maxCameraX)) - this.cameraX) * 0.12;
    } else {
      const targetCameraX = this.player.x - CANVAS_WIDTH / 2;
      const maxCameraX = Math.max(0, this.currentStage.mapLength - CANVAS_WIDTH);
      this.cameraX += (Math.max(0, Math.min(targetCameraX, maxCameraX)) - this.cameraX) * 0.15;
    }
  }

  // Check stage clear conditions
  private checkStageObjectives() {
    if (this.status !== 'playing') return;

    if (this.currentStage.id === 3) {
      // Stage 3: Victory strictly when Boss is defeated (all regular zombies not required)
      if (this.bossDefeated) {
        this.status = 'victory';
        sound.playVictory();
      }
    } else if (this.currentStage.id === 2) {
      // Stage 2: When all zombies are killed and player arrives near door, trigger the Sub-Boss!
      const allZombiesEliminated = this.stageZombiesKilled >= this.stageZombiesTotal;
      if (allZombiesEliminated && !this.bossSpawned && !this.tallShadowBoss && this.player.x >= this.currentStage.mapLength - 380) {
        this.spawnTallShadowBoss();
      } else if (allZombiesEliminated && this.bossDefeated && this.player.x >= this.currentStage.mapLength - 90) {
        this.status = 'stage_clear';
        sound.playVictory();
      }
    } else {
      // Stage 1: Must kill all zombies in the stage before proceeding to the exit
      const allZombiesEliminated = this.stageZombiesKilled >= this.stageZombiesTotal;
      if (allZombiesEliminated && this.player.x >= this.currentStage.mapLength - 90) {
        this.status = 'stage_clear';
        sound.playVictory();
      }
    }
  }

  // Particles & Gib Dismemberment Physics Simulation with high-performance pooling
  private updateParticles() {
    // Hard particle cap for performance optimization (keep 60+ FPS)
    if (this.particles.length > 130) {
      this.particles.splice(0, this.particles.length - 130);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life--;
      p.x += p.vx;
      p.y += p.vy;

      if (p.type === 'shockwave') {
        p.vx *= 0.95;
        p.size += 0.6;
      } else if (p.type === 'feather') {
        p.vy += p.gravity || 0.08;
        p.vx += Math.sin(p.life * 0.25) * 0.15;
        p.vx *= 0.95;
        if (p.y >= GROUND_Y) {
          p.y = GROUND_Y;
          p.vy = 0;
          p.vx = 0;
        }
      } else if (p.type === 'gib') {
        p.vy += p.gravity || 0.45;
        if (p.y >= GROUND_Y) {
          p.y = GROUND_Y;
          if (Math.abs(p.vy) > 1.2) {
            p.vy = -p.vy * 0.4;
            p.vx *= 0.7;
            p.vRot = (p.vRot || 0) * 0.6;
          } else {
            p.vy = 0;
            p.vx = 0;
            p.vRot = 0;
          }
        }

        // Emit dripping blood trail in air
        if (p.life % 6 === 0 && Math.abs(p.vy) > 1.5 && p.y < GROUND_Y && p.enemyType !== 'crow' && this.particles.length < 110) {
          this.particles.push({
            id: Math.random().toString(),
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 1,
            vy: 1 + Math.random() * 2,
            color: '#9B2C2C',
            size: 2,
            life: 18,
            maxLife: 18,
            type: 'blood',
            gravity: 0.35,
          });
        }
      } else if (p.gravity) {
        p.vy += p.gravity;
        if (p.y >= GROUND_Y) {
          p.y = GROUND_Y;
          p.vy = -p.vy * 0.4;
          p.vx *= 0.6;
        }
      }

      if (p.vRot) {
        p.rotation = (p.rotation || 0) + p.vRot;
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private addDustParticle(x: number, y: number) {
    this.particles.push({
      id: Math.random().toString(),
      x,
      y: y - 4,
      vx: (Math.random() - 0.5) * 3,
      vy: -1 - Math.random() * 2,
      color: '#CBD5E0',
      size: 4 + Math.random() * 4,
      life: 16,
      maxLife: 16,
      type: 'dust',
    });
  }

  private addSparkParticle(x: number, y: number, color: string) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color,
        size: 3,
        life: 12,
        maxLife: 12,
        type: 'spark',
      });
    }
  }

  private addExplosionParticle(x: number, y: number) {
    this.particles.push({
      id: Math.random().toString(),
      x,
      y,
      vx: 0,
      vy: 0,
      color: '#ECC94B',
      size: 38,
      life: 20,
      maxLife: 20,
      type: 'explosion',
    });
  }
}
