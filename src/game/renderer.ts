import { Bomb, Bullet, Enemy, FallingRock, MechBoss, Missile, Particle, Platform, Player, StageConfig, TallShadowBoss, ThrownCar, TicketCard } from '../types';
import { CANVAS_HEIGHT, CANVAS_WIDTH, GROUND_Y } from './constants';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  // Render multi-level tactical platforms (roofs, scaffolding, abandoned trucks, buildings, metro trains)
  public renderPlatforms(platforms: Platform[], cameraX: number) {
    const ctx = this.ctx;
    ctx.save();

    for (const plat of platforms) {
      const px = plat.x - cameraX;
      const py = plat.y;
      const pw = plat.width;
      const ph = plat.height;

      // Frustum culling
      if (px + pw < -60 || px > CANVAS_WIDTH + 60) continue;

      if (plat.type === 'roof') {
        // === Stage 1: Village Tile Roof (หลังคาบ้าน / กระเบื้องดินเผา) ===
        // Support columns under eaves
        ctx.fillStyle = '#4A2C18';
        ctx.fillRect(px + 15, py + ph, 10, GROUND_Y - (py + ph));
        ctx.fillRect(px + pw - 25, py + ph, 10, GROUND_Y - (py + ph));

        // House facade shadow wall behind
        ctx.fillStyle = 'rgba(40, 25, 20, 0.6)';
        ctx.fillRect(px + 10, py + ph, pw - 20, GROUND_Y - (py + ph));

        // Roof Slope / Shingle Base
        ctx.fillStyle = '#742A2A'; // Red ceramic tile base
        ctx.fillRect(px - 4, py, pw + 8, ph);

        // Curved ceramic tile rows (ลอนกระเบื้อง)
        ctx.fillStyle = '#9B2C2C';
        for (let tx = 0; tx < pw; tx += 18) {
          ctx.beginPath();
          ctx.arc(px + tx + 9, py + ph - 2, 8, Math.PI, 0);
          ctx.fill();
        }

        // Shingle highlight lines
        ctx.fillStyle = '#C53030';
        for (let tx = 4; tx < pw; tx += 18) {
          ctx.fillRect(px + tx, py + 2, 2, ph - 6);
        }

        // Gold/Wood Ridge Board (คิ้วหลังคา)
        ctx.fillStyle = '#ECC94B';
        ctx.fillRect(px - 8, py - 2, pw + 16, 5);
        ctx.fillStyle = '#D69E2E';
        ctx.fillRect(px - 8, py + 3, pw + 16, 2);

        // Hanging eaves end caps
        ctx.fillStyle = '#D69E2E';
        ctx.fillRect(px - 8, py + 3, 6, 8);
        ctx.fillRect(px + pw + 2, py + 3, 6, 8);

      } else if (plat.type === 'scaffold') {
        // === Stage 2: Construction Scaffolding (นั่งร้านเหล็กก่อสร้าง) ===
        // Vertical steel pipes down to ground
        ctx.fillStyle = '#4A5568';
        const p1 = px + 15;
        const p2 = px + pw - 20;
        ctx.fillRect(p1, py + ph, 6, GROUND_Y - (py + ph));
        ctx.fillRect(p2, py + ph, 6, GROUND_Y - (py + ph));
        if (pw > 180) {
          ctx.fillRect(px + pw / 2 - 3, py + ph, 6, GROUND_Y - (py + ph));
        }

        // Steel pipe cross-braces (X-bracing)
        ctx.strokeStyle = '#718096';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p1 + 3, py + ph);
        ctx.lineTo(p2 + 3, GROUND_Y);
        ctx.moveTo(p2 + 3, py + ph);
        ctx.lineTo(p1 + 3, GROUND_Y);
        ctx.stroke();

        // Pipe Joint Clamps
        ctx.fillStyle = '#ECC94B';
        ctx.fillRect(p1 - 2, py + ph + 10, 10, 6);
        ctx.fillRect(p2 - 2, py + ph + 10, 10, 6);

        // Wooden scaffolding walking planks
        ctx.fillStyle = '#7B341E';
        ctx.fillRect(px, py, pw, ph);

        // Planks separation seams
        ctx.fillStyle = '#4A2111';
        for (let wx = 30; wx < pw; wx += 40) {
          ctx.fillRect(px + wx, py, 2, ph);
        }

        // Yellow/Black Caution Safety Kickboard
        for (let sx = 0; sx < pw; sx += 20) {
          ctx.fillStyle = (sx / 20) % 2 === 0 ? '#ECC94B' : '#1A202C';
          ctx.fillRect(px + sx, py + ph - 4, 20, 4);
        }

        // Top safety handrail
        ctx.strokeStyle = '#CBD5E0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(px, py - 18);
        ctx.lineTo(px + pw, py - 18);
        ctx.moveTo(p1 + 3, py);
        ctx.lineTo(p1 + 3, py - 18);
        ctx.moveTo(p2 + 3, py);
        ctx.lineTo(p2 + 3, py - 18);
        ctx.stroke();

      } else if (plat.type === 'truck') {
        // === Stage 2: Realistic Abandoned Vehicle (รถยนต์ / รถตำรวจ / รถกระบะ / รถบรรทุกสมจริง) ===
        this.renderRealisticCar(ctx, plat, px, py, pw, ph);

      } else if (plat.type === 'building') {
        // === Stage 3: Skyscraper Terrace / Helipad (ตึกระฟ้า / ซากอาคาร) ===
        // Concrete building facade down to ground
        ctx.fillStyle = '#1A202C';
        ctx.fillRect(px, py + ph, pw, GROUND_Y - (py + ph));

        // Lighted Office Windows array in background building
        ctx.fillStyle = 'rgba(66, 153, 225, 0.4)';
        for (let by = py + ph + 15; by < GROUND_Y - 20; by += 28) {
          for (let bx = px + 15; bx < px + pw - 20; bx += 24) {
            ctx.fillRect(bx, by, 14, 16);
          }
        }

        // Reinforced Concrete Rooftop Platform
        ctx.fillStyle = '#2D3748';
        ctx.fillRect(px - 4, py, pw + 8, ph);

        // Cyan Neon Cyber Edge Trim (เส้นนีออนขอบตึก)
        ctx.fillStyle = '#00F0FF';
        ctx.fillRect(px - 6, py, pw + 12, 3);

        // Glowing Helipad circle / hazard marker
        ctx.strokeStyle = '#ECC94B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px + pw / 2, py + ph / 2, 7, 0, Math.PI * 2);
        ctx.stroke();

        // Neon warning corner beacon
        ctx.fillStyle = '#FF0055';
        ctx.beginPath();
        ctx.arc(px + 4, py - 4, 3, 0, Math.PI * 2);
        ctx.arc(px + pw - 4, py - 4, 3, 0, Math.PI * 2);
        ctx.fill();

      } else if (plat.type === 'metro') {
        // === Stage 3: High-Tech Futuristic Cyber Metro Train (ตู้รถไฟฟ้าความเร็วสูงไซเบอร์) ===
        this.renderFuturisticMetroTrain(ctx, plat, px, py, pw, ph);

      } else {
        // Default Wood Planks
        ctx.fillStyle = '#7B341E';
        ctx.fillRect(px, py, pw, ph);
        ctx.fillStyle = '#4A2111';
        for (let wx = 30; wx < pw; wx += 35) {
          ctx.fillRect(px + wx, py, 2, ph);
        }
        ctx.fillStyle = '#C05621';
        ctx.fillRect(px, py, pw, 3);
      }

      // Tactical Platform label (if present)
      if (plat.label) {
        ctx.fillStyle = 'rgba(26, 32, 44, 0.85)';
        ctx.fillRect(px + 8, py - 18, plat.label.length * 8 + 14, 16);
        ctx.fillStyle = '#ECC94B';
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(plat.label, px + 14, py - 6);
      }
    }

    ctx.restore();
  }

  // === REALISTIC POST-APOCALYPTIC AUTOMOTIVE RENDERER (STAGE 2) ===
  // Renders authentic heavy vehicles (Cargo Trucks, Highway Buses, Military Transports, Armored Carriers, Delivery Vans)
  // Perfectly grounded to GROUND_Y with solid structural bodies, chrome stacks, fuel tanks, bullbars & alloy wheels.
  private renderRealisticCar(
    ctx: CanvasRenderingContext2D,
    plat: Platform,
    px: number,
    py: number,
    pw: number,
    ph: number
  ) {
    const isBus = plat.label?.toLowerCase().includes('bus') || false;
    const isMilitary = plat.label?.toLowerCase().includes('military') || plat.label?.toLowerCase().includes('carrier') || false;
    const isVan = plat.label?.toLowerCase().includes('van') || plat.width < 225;
    const isCargoTruck = !isBus && !isMilitary && !isVan;

    const groundY = GROUND_Y;
    const bodyBottom = groundY - 10;
    const bodyTop = py + 4;
    const bodyHeight = bodyBottom - bodyTop;

    ctx.save();

    // 1. Heavy Undercarriage Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(px + pw / 2, groundY - 1, pw / 2 + 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Heavy Chassis Frame Rails, Fuel Tanks & Exhaust
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(px + 14, bodyBottom - 8, pw - 28, 10);

    // Cylindrical Diesel Fuel Tank with Chrome Straps
    const fuelTankX = px + 60;
    const fuelTankW = Math.min(65, pw - 140);
    if (fuelTankW > 30) {
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(fuelTankX, bodyBottom - 14, fuelTankW, 14, 4);
      ctx.fill();
      ctx.fillStyle = '#CBD5E0';
      ctx.fillRect(fuelTankX + 6, bodyBottom - 14, 3, 14);
      ctx.fillRect(fuelTankX + fuelTankW - 9, bodyBottom - 14, 3, 14);
      // Red diesel cap
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(fuelTankX + 14, bodyBottom - 16, 6, 3);
    }

    // Chrome Exhaust Stacks (for trucks)
    if (isCargoTruck || isMilitary) {
      const exhaustX = px + pw - 64;
      ctx.fillStyle = '#64748B';
      ctx.fillRect(exhaustX, py - 18, 6, bodyHeight + 10);
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(exhaustX + 1, py - 18, 2, bodyHeight + 10);
      // Perforated heat shield
      ctx.fillStyle = '#1E293B';
      for (let ey = py - 14; ey < py + 24; ey += 6) {
        ctx.fillRect(exhaustX - 2, ey, 10, 2);
      }
      // Exhaust curved tip
      ctx.fillStyle = '#CBD5E0';
      ctx.beginPath();
      ctx.moveTo(exhaustX, py - 18);
      ctx.lineTo(exhaustX - 8, py - 26);
      ctx.lineTo(exhaustX - 4, py - 28);
      ctx.lineTo(exhaustX + 6, py - 18);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Main Vehicle Body Architecture
    if (isBus) {
      // === DERELICT HIGHWAY PASSENGER TRANSIT BUS ===
      const busPrimary = '#D97706'; // Amber Transit
      const busTrim = '#1E293B';

      // Streamlined Main Bus Hull
      ctx.fillStyle = busPrimary;
      ctx.beginPath();
      ctx.moveTo(px + 4, bodyBottom);
      ctx.lineTo(px + pw - 8, bodyBottom);
      ctx.quadraticCurveTo(px + pw, bodyBottom - 8, px + pw, bodyBottom - 26);
      ctx.lineTo(px + pw - 2, bodyTop + 14);
      ctx.quadraticCurveTo(px + pw - 4, bodyTop, px + pw - 22, bodyTop);
      ctx.lineTo(px + 8, bodyTop);
      ctx.quadraticCurveTo(px, bodyTop + 2, px, bodyTop + 16);
      ctx.lineTo(px, bodyBottom - 10);
      ctx.quadraticCurveTo(px + 2, bodyBottom, px + 4, bodyBottom);
      ctx.closePath();
      ctx.fill();

      // Lower dark protective skirt
      ctx.fillStyle = busTrim;
      ctx.fillRect(px + 4, bodyBottom - 16, pw - 8, 16);

      // Continuous Black Window Band with Tinted Passenger Windows
      const winTop = bodyTop + 8;
      const winH = Math.min(26, bodyHeight - 44);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(px + 8, winTop, pw - 18, winH);

      // Glass panes with light blue reflections & passenger silhouettes
      for (let wx = px + 14; wx < px + pw - 60; wx += 30) {
        ctx.fillStyle = '#60A5FA';
        ctx.fillRect(wx, winTop + 2, 24, winH - 4);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(wx + 2, winTop + 3, 6, winH - 6);
        // Passenger silhouette
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.beginPath();
        ctx.arc(wx + 12, winTop + winH - 8, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Large Front Driver Windshield
      ctx.fillStyle = '#93C5FD';
      ctx.beginPath();
      ctx.moveTo(px + pw - 50, winTop);
      ctx.lineTo(px + pw - 10, winTop + 2);
      ctx.lineTo(px + pw - 4, winTop + winH);
      ctx.lineTo(px + pw - 50, winTop + winH);
      ctx.closePath();
      ctx.fill();

      // Driver Silhouette & Steering Wheel
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(px + pw - 24, winTop + winH - 10, 6, 0, Math.PI * 2);
      ctx.fill();

      // Front Passenger Bi-fold Doors
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(px + pw - 78, winTop, 22, bodyBottom - winTop - 16);
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + pw - 78, winTop, 22, bodyBottom - winTop - 16);
      ctx.beginPath();
      ctx.moveTo(px + pw - 67, winTop);
      ctx.lineTo(px + pw - 67, bodyBottom - 16);
      ctx.stroke();

      // Bus Destination Signboard ("METRO - EVAC")
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(px + pw - 46, bodyTop + 2, 38, 7);
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 5px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('EVAC-9', px + pw - 27, bodyTop + 7);

    } else if (isMilitary) {
      // === HEAVY MILITARY ARMORED TRANSPORT / CARRIER ===
      const milColor = '#1F2937'; // Heavy stealth graphite
      const milCamo = '#374151';

      // Heavy Armored Hull Geometry
      ctx.fillStyle = milColor;
      ctx.beginPath();
      ctx.moveTo(px + 4, bodyBottom);
      ctx.lineTo(px + pw - 14, bodyBottom);
      ctx.lineTo(px + pw - 2, bodyBottom - 20); // wedge bumper
      ctx.lineTo(px + pw - 8, bodyTop + 22); // slanted armored nose
      ctx.lineTo(px + pw - 34, bodyTop); // raked cab brow
      ctx.lineTo(px + 8, bodyTop); // heavy cargo roofline
      ctx.lineTo(px, bodyTop + 14);
      ctx.lineTo(px, bodyBottom - 10);
      ctx.closePath();
      ctx.fill();

      // Angular Camouflage Armor Plates
      ctx.fillStyle = milCamo;
      ctx.beginPath();
      ctx.moveTo(px + 20, bodyTop + 10);
      ctx.lineTo(px + 90, bodyTop + 10);
      ctx.lineTo(px + 60, bodyBottom - 20);
      ctx.lineTo(px + 10, bodyBottom - 20);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(px + 110, bodyTop + 12);
      ctx.lineTo(px + pw - 60, bodyTop + 12);
      ctx.lineTo(px + pw - 40, bodyBottom - 22);
      ctx.lineTo(px + 95, bodyBottom - 22);
      ctx.closePath();
      ctx.fill();

      // Steel Rivets along armor seams
      ctx.fillStyle = '#94A3B8';
      for (let rx = px + 12; rx < px + pw - 30; rx += 14) {
        ctx.fillRect(rx, bodyTop + 8, 2, 2);
        ctx.fillRect(rx, bodyBottom - 18, 2, 2);
      }

      // Slit Ballistic Bulletproof Windshield
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(px + pw - 48, bodyTop + 18, 28, 14);
      ctx.fillStyle = '#60A5FA';
      ctx.fillRect(px + pw - 46, bodyTop + 20, 24, 10);
      // Armored Metal Louvers / Grille over Glass
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(px + pw - 48, bodyTop + 24, 28, 3);

      // Military Stencil & White Star Decal
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★ ARMY', px + pw / 2 - 10, bodyBottom - 32);

    } else if (isVan) {
      // === BROKEN SURVIVOR DELIVERY VAN ===
      const vanColor = '#475569';
      ctx.fillStyle = vanColor;
      ctx.beginPath();
      ctx.moveTo(px + 6, bodyBottom);
      ctx.lineTo(px + pw - 10, bodyBottom);
      ctx.lineTo(px + pw - 2, bodyBottom - 22);
      ctx.lineTo(px + pw - 6, bodyTop + 24);
      ctx.quadraticCurveTo(px + pw - 10, bodyTop, px + pw - 36, bodyTop);
      ctx.lineTo(px + 8, bodyTop);
      ctx.lineTo(px + 2, bodyTop + 12);
      ctx.lineTo(px + 2, bodyBottom - 10);
      ctx.closePath();
      ctx.fill();

      // Lower bumper & side moulding
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(px + 6, bodyBottom - 14, pw - 12, 14);

      // Slanted Driver Windshield
      ctx.fillStyle = '#93C5FD';
      ctx.beginPath();
      ctx.moveTo(px + pw - 34, bodyTop + 6);
      ctx.lineTo(px + pw - 12, bodyTop + 24);
      ctx.lineTo(px + pw - 34, bodyTop + 24);
      ctx.closePath();
      ctx.fill();

      // Side sliding delivery door
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 30, bodyTop + 12, pw - 80, bodyBottom - bodyTop - 26);

    } else {
      // === HEAVY HIGHWAY CARGO TRUCK ===
      const cabColor = '#2563EB'; // Vibrant Highway Blue
      const boxColor = '#E2E8F0'; // Heavy Corrugated Cargo Box

      const cabW = Math.min(75, pw * 0.35);
      const cabStartX = px + pw - cabW;

      // 1. Cargo Box (Rear 65%)
      ctx.fillStyle = boxColor;
      ctx.fillRect(px + 4, bodyTop, cabStartX - px - 6, bodyHeight - 10);
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 4, bodyTop, cabStartX - px - 6, bodyHeight - 10);

      // Corrugated vertical reinforcement ribs
      for (let rx = px + 16; rx < cabStartX - 16; rx += 14) {
        ctx.fillStyle = '#CBD5E0';
        ctx.fillRect(rx, bodyTop + 4, 5, bodyHeight - 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(rx + 5, bodyTop + 4, 2, bodyHeight - 18);
      }

      // Cargo Company Logo
      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CARGO', (px + cabStartX) / 2 - 2, bodyTop + bodyHeight / 2 - 4);

      // 2. High-Cab Truck Tractor Front
      ctx.fillStyle = cabColor;
      ctx.beginPath();
      ctx.moveTo(cabStartX, bodyBottom);
      ctx.lineTo(px + pw - 10, bodyBottom);
      ctx.quadraticCurveTo(px + pw, bodyBottom - 6, px + pw, bodyBottom - 24);
      ctx.lineTo(px + pw - 2, bodyTop + 18);
      ctx.quadraticCurveTo(px + pw - 6, bodyTop, px + pw - 24, bodyTop);
      ctx.lineTo(cabStartX, bodyTop);
      ctx.closePath();
      ctx.fill();

      // Truck Windshield Glass
      ctx.fillStyle = '#93C5FD';
      ctx.beginPath();
      ctx.moveTo(cabStartX + 12, bodyTop + 8);
      ctx.lineTo(px + pw - 12, bodyTop + 14);
      ctx.lineTo(px + pw - 8, bodyTop + 32);
      ctx.lineTo(cabStartX + 12, bodyTop + 32);
      ctx.closePath();
      ctx.fill();

      // Chrome Sun-Visor over windshield
      ctx.fillStyle = '#CBD5E0';
      ctx.fillRect(cabStartX + 10, bodyTop + 6, cabW - 16, 4);

      // Side Door Window & Chrome Mirror
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(cabStartX + 8, bodyTop + 12, 16, 18);
      ctx.fillStyle = '#93C5FD';
      ctx.fillRect(cabStartX + 10, bodyTop + 14, 12, 14);
      // Large West-Coast Side Mirror
      ctx.fillStyle = '#CBD5E0';
      ctx.fillRect(cabStartX + 2, bodyTop + 12, 4, 16);
      ctx.fillRect(cabStartX + 6, bodyTop + 14, 2, 4);
      ctx.fillRect(cabStartX + 6, bodyTop + 22, 2, 4);
    }

    // 4. Front Radiator Grille, Push Bullbar & Xenon Headlights
    const noseX = px + pw - 10;
    const grilleY = bodyBottom - 26;

    // Heavy Front Push Bullbar
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(noseX, grilleY - 6, 10, 26);
    ctx.fillStyle = '#475569';
    ctx.fillRect(noseX + 1, grilleY - 4, 4, 22);

    // Chrome Radiator Slats
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(noseX - 8, grilleY - 2, 8, 16);
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(noseX - 7, grilleY + 2, 6, 2);
    ctx.fillRect(noseX - 7, grilleY + 6, 6, 2);
    ctx.fillRect(noseX - 7, grilleY + 10, 6, 2);

    // Xenon Dual Headlights with Crystal Glow
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(noseX - 10, grilleY - 14, 12, 10, 2);
    ctx.fill();
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(noseX - 4, grilleY - 9, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F59E0B'; // Amber blinker
    ctx.fillRect(noseX - 1, grilleY - 12, 3, 7);

    // 5. Rear Taillight Cluster & Mudflaps
    const tailX = px + 2;
    const tailY = bodyBottom - 22;
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.roundRect(tailX, tailY, 7, 12, 2);
    ctx.fill();
    ctx.fillStyle = '#FEF2F2';
    ctx.fillRect(tailX + 1, tailY + 4, 5, 2.5);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(tailX + 1, tailY + 8, 5, 2.5);

    // Heavy Rubber Mud Flaps with Reflectors
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(px + 4, bodyBottom - 6, 8, 12);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(px + 6, bodyBottom + 1, 4, 3);

    // 6. Heavy 5-Spoke Alloy Wheels with Brake Discs & Lug Nuts
    const wheelRadius = 18;
    const frontWheelX = px + pw - 38;
    const rearWheelX = px + 42;
    const wheelY = groundY - wheelRadius + 3;

    const drawHeavyWheel = (wx: number, wy: number) => {
      // Arched Wheel Well Shadow
      ctx.fillStyle = '#050B14';
      ctx.beginPath();
      ctx.arc(wx, wy, wheelRadius + 4, Math.PI, 0);
      ctx.fill();

      // Heavy Protective Fender Arch
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(wx, wy, wheelRadius + 4, Math.PI, 0);
      ctx.stroke();

      // Deep Black Rubber Tire
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(wx, wy, wheelRadius, 0, Math.PI * 2);
      ctx.fill();

      // Tire Radial Treads
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(a) * (wheelRadius - 4), wy + Math.sin(a) * (wheelRadius - 4));
        ctx.lineTo(wx + Math.cos(a) * wheelRadius, wy + Math.sin(a) * wheelRadius);
        ctx.stroke();
      }

      // Gunmetal Rim Base
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(wx, wy, wheelRadius - 5, 0, Math.PI * 2);
      ctx.fill();

      // Ventilated Steel Brake Rotor & Red Performance Caliper
      ctx.fillStyle = '#64748B';
      ctx.beginPath();
      ctx.arc(wx, wy, wheelRadius - 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(wx - wheelRadius + 7, wy - 4, 4, 8);

      // Heavy 5-Spoke Mag Alloy
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2.5;
      for (let s = 0; s < 5; s++) {
        const ang = (s * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + Math.cos(ang) * (wheelRadius - 6), wy + Math.sin(ang) * (wheelRadius - 6));
        ctx.stroke();
      }

      // Chrome Center Hub & Lug Nuts
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.arc(wx, wy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(wx, wy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    };

    drawHeavyWheel(frontWheelX, wheelY);
    drawHeavyWheel(rearWheelX, wheelY);
    if ((isCargoTruck || isMilitary) && pw > 210) {
      // Tandem Double Rear Axle for heavy transports
      drawHeavyWheel(rearWheelX + 32, wheelY);
    }

    // 7. Tactical Anti-Slip Roof Walkway Deck (Solid, seamless walking platform for player)
    ctx.fillStyle = '#334155';
    ctx.fillRect(px - 4, py, pw + 8, ph);
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(px - 4, py, pw + 8, 3); // Chrome top highlight

    // Diamond plate anti-slip pattern
    ctx.fillStyle = '#475569';
    for (let dx = 6; dx < pw; dx += 14) {
      ctx.fillRect(px + dx, py + 4, 3, ph - 7);
    }

    // Safety Hazard Striping along platform edge
    for (let hx = 0; hx < pw; hx += 16) {
      ctx.fillStyle = (hx / 16) % 2 === 0 ? '#F59E0B' : '#DC2626';
      ctx.fillRect(px + hx, py + ph - 4, 16, 4);
    }

    ctx.restore();
  }

  // === HIGH-TECH FUTURISTIC CYBER METRO TRAIN RENDERER (STAGE 3) ===
  // Remodeled cutting-edge high-speed mag-lev train carriage with aerodynamic bullet nose,
  // glowing panoramic observation windows, sliding transit doors, articulated roof pantograph & track underglow.
  private renderFuturisticMetroTrain(
    ctx: CanvasRenderingContext2D,
    plat: Platform,
    px: number,
    py: number,
    pw: number,
    ph: number
  ) {
    const groundY = GROUND_Y;
    const bodyBottom = groundY - 12;
    const bodyTop = py + 4;
    const bodyHeight = bodyBottom - bodyTop;

    ctx.save();

    // 1. Electric Blue / Cyan Track Underglow & Ground Shadow
    const underglow = ctx.createRadialGradient(px + pw / 2, groundY - 2, 8, px + pw / 2, groundY - 2, pw / 2 + 20);
    underglow.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    underglow.addColorStop(0.5, 'rgba(128, 90, 213, 0.25)');
    underglow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = underglow;
    ctx.beginPath();
    ctx.ellipse(px + pw / 2, groundY - 2, pw / 2 + 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. High-Speed Rail Bogies & Magnetic Suspension Skids
    ctx.fillStyle = '#1A202C';
    ctx.fillRect(px + 12, bodyBottom - 10, pw - 24, 12);

    const drawCyberBogie = (bx: number) => {
      // Bogie Steel Frame
      ctx.fillStyle = '#2D3748';
      ctx.fillRect(bx - 26, bodyBottom - 6, 52, 10);
      // Double Steel Rail Wheels
      ctx.fillStyle = '#4A5568';
      ctx.beginPath();
      ctx.arc(bx - 16, groundY - 8, 8, 0, Math.PI * 2);
      ctx.arc(bx + 16, groundY - 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#CBD5E0';
      ctx.beginPath();
      ctx.arc(bx - 16, groundY - 8, 3, 0, Math.PI * 2);
      ctx.arc(bx + 16, groundY - 8, 3, 0, Math.PI * 2);
      ctx.fill();
      // Mag-lev linear motor induction coils (Glowing Cyan)
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(bx - 10, groundY - 5, 20, 3);
    };

    drawCyberBogie(px + 45);
    drawCyberBogie(px + pw - 45);
    if (pw > 230) {
      drawCyberBogie(px + pw / 2);
    }

    // 3. Futuristic Train Carriage Body (Titanium Cyber Chassis)
    ctx.fillStyle = '#171923'; // Dark titanium cyber alloy
    ctx.beginPath();
    ctx.moveTo(px + 6, bodyBottom);
    ctx.lineTo(px + pw - 18, bodyBottom);
    // Aerodynamic Bullet Nose slope
    ctx.quadraticCurveTo(px + pw + 2, bodyBottom - 8, px + pw, bodyBottom - 28);
    ctx.lineTo(px + pw - 4, bodyTop + 14);
    ctx.quadraticCurveTo(px + pw - 8, bodyTop, px + pw - 30, bodyTop);
    ctx.lineTo(px + 8, bodyTop);
    ctx.quadraticCurveTo(px, bodyTop + 4, px, bodyTop + 18);
    ctx.lineTo(px, bodyBottom - 10);
    ctx.quadraticCurveTo(px + 2, bodyBottom, px + 6, bodyBottom);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4A5568';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. Cyber Speed Neon Racing Stripes (Cyan & Purple)
    ctx.fillStyle = '#00F0FF';
    ctx.fillRect(px + 4, bodyBottom - 20, pw - 12, 3);
    ctx.fillStyle = '#9F7AEA';
    ctx.fillRect(px + 4, bodyBottom - 24, pw - 14, 2);

    // 5. Panoramic Observation Passenger Windows
    const winY = bodyTop + 10;
    const winHeight = Math.min(26, bodyHeight - 48);
    const winSpacing = 36;

    for (let wx = px + 18; wx < px + pw - 65; wx += winSpacing) {
      // Window Frame
      ctx.fillStyle = '#0D1117';
      ctx.beginPath();
      ctx.roundRect(wx, winY, 26, winHeight, 4);
      ctx.fill();
      ctx.strokeStyle = '#2D3748';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Glowing Passenger Interior (Warm Amber / Cyan matrix)
      const isAlt = (wx / winSpacing) % 2 === 0;
      ctx.fillStyle = isAlt ? 'rgba(254, 215, 102, 0.85)' : 'rgba(99, 179, 237, 0.85)';
      ctx.fillRect(wx + 2, winY + 2, 22, winHeight - 4);

      // Glass reflection shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(wx + 3, winY + 3, 5, winHeight - 6);

      // Passenger Silhouette in Window
      ctx.fillStyle = 'rgba(26, 32, 44, 0.7)';
      ctx.beginPath();
      ctx.arc(wx + 13, winY + winHeight - 7, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Aerodynamic Cockpit Windshield (Sleek Bullet Front)
    ctx.fillStyle = '#00F0FF';
    ctx.beginPath();
    ctx.moveTo(px + pw - 52, winY);
    ctx.lineTo(px + pw - 16, winY + 4);
    ctx.lineTo(px + pw - 8, winY + winHeight);
    ctx.lineTo(px + pw - 52, winY + winHeight);
    ctx.closePath();
    ctx.fill();

    // High-Tech Digital HUD Display in Cockpit
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(px + pw - 38, winY + 6, 16, 8);
    ctx.fillStyle = '#FF0055';
    ctx.font = 'bold 5px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('99', px + pw - 30, winY + 12);

    // 7. Pneumatic Double Sliding Transit Doors
    const doorX = px + pw / 2 - 16;
    ctx.fillStyle = '#1A202C';
    ctx.fillRect(doorX, winY - 2, 32, bodyBottom - winY - 14);
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(doorX, winY - 2, 32, bodyBottom - winY - 14);

    // Door Center Line & Caution Stencil
    ctx.strokeStyle = '#718096';
    ctx.beginPath();
    ctx.moveTo(doorX + 16, winY - 2);
    ctx.lineTo(doorX + 16, bodyBottom - 16);
    ctx.stroke();

    // Door Warning Hazard LED strip
    const doorFlash = Math.sin(Date.now() * 0.005) > 0;
    ctx.fillStyle = doorFlash ? '#ECC94B' : '#E53E3E';
    ctx.fillRect(doorX + 4, winY + winHeight + 6, 24, 3);

    // 8. Articulated Cyber High-Voltage Pantograph on Roof
    const pantoX = px + 40;
    ctx.strokeStyle = '#ECC94B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pantoX - 12, py);
    ctx.lineTo(pantoX, py - 18);
    ctx.lineTo(pantoX + 12, py);
    ctx.stroke();

    // Top Contact Collector Shoe Bar
    ctx.fillStyle = '#CBD5E0';
    ctx.fillRect(pantoX - 16, py - 20, 32, 4);

    // Electric Arc Sparks crackling from Pantograph
    if (Math.random() < 0.4) {
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pantoX - 10 + Math.random() * 20, py - 20);
      ctx.lineTo(pantoX - 10 + Math.random() * 20, py - 26);
      ctx.lineTo(pantoX - 10 + Math.random() * 20, py - 22);
      ctx.stroke();
    }

    // 9. Roof-Mounted HVAC Cooling Turbines
    const hvacX = px + pw - 75;
    ctx.fillStyle = '#2D3748';
    ctx.beginPath();
    ctx.roundRect(hvacX, py - 8, 36, 8, 3);
    ctx.fill();
    ctx.fillStyle = '#00F0FF';
    ctx.fillRect(hvacX + 4, py - 6, 28, 2);

    // 10. Solid Diamond-Plate Tactical Roof Platform (Full Walkable Surface for Player)
    ctx.fillStyle = '#2D3748';
    ctx.fillRect(px - 4, py, pw + 8, ph);
    ctx.fillStyle = '#00F0FF'; // Cyber cyan edge trim
    ctx.fillRect(px - 4, py, pw + 8, 3);

    // Anti-slip Diamond Grid
    ctx.fillStyle = '#4A5568';
    for (let dx = 8; dx < pw; dx += 16) {
      ctx.fillRect(px + dx, py + 4, 3, ph - 7);
    }

    // Safety Warning LED Strip along bottom edge of roof
    for (let hx = 0; hx < pw; hx += 20) {
      ctx.fillStyle = '#ECC94B';
      ctx.fillRect(px + hx, py + ph - 3, 10, 3);
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(px + hx + 10, py + ph - 3, 10, 3);
    }

    ctx.restore();
  }

  // Clear and render background
  public renderBackground(cameraX: number, stage: StageConfig, time: number) {
    const ctx = this.ctx;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGrad.addColorStop(0, stage.skyColorTop);
    skyGrad.addColorStop(0.7, stage.skyColorBottom);
    skyGrad.addColorStop(1, stage.groundColor);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Blood / Eerie Atmospheric Moon with Creeping Dark Cloud Strata
    const moonX = CANVAS_WIDTH - 120;
    const moonY = 70;
    const isForestOrVillage = stage.bgTheme === 'forest' || stage.bgTheme === 'village';

    // Moon Outer Atmospheric Horror Glow
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 70);
    if (stage.bgTheme === 'forest') {
      moonGlow.addColorStop(0, 'rgba(120, 220, 200, 0.45)');
      moonGlow.addColorStop(0.5, 'rgba(38, 166, 154, 0.2)');
      moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (stage.bgTheme === 'village') {
      moonGlow.addColorStop(0, 'rgba(255, 140, 60, 0.55)');
      moonGlow.addColorStop(0.5, 'rgba(197, 48, 48, 0.25)');
      moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      moonGlow.addColorStop(0, 'rgba(255, 240, 200, 0.4)');
      moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 70, 0, Math.PI * 2);
    ctx.fill();

    // Solid Moon Body
    ctx.fillStyle = stage.bgTheme === 'forest' ? '#E6FFFA' : stage.bgTheme === 'village' ? '#FEEBC8' : '#FFF8E7';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 30, 0, Math.PI * 2);
    ctx.fill();

    // Dark Craters / Lunar Silhouette Shadow
    ctx.fillStyle = stage.bgTheme === 'forest' ? '#234E52' : stage.bgTheme === 'village' ? '#7B341E' : stage.skyColorTop;
    ctx.beginPath();
    ctx.arc(moonX + 12, moonY - 6, 25, 0, Math.PI * 2);
    ctx.fill();

    // Creeping wisps of dark clouds across moon
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.fillRect(moonX - 55, moonY + 4, 110, 6);
    ctx.fillRect(moonX - 35, moonY - 14, 80, 4);

    // Parallax Multipliers: Village & Forest are brought much closer as requested
    const farFactor = isForestOrVillage ? 0.22 : 0.1;
    const midFactor = isForestOrVillage ? 0.48 : 0.3;
    const nearFactor = isForestOrVillage ? 0.78 : 0.6;

    // Distant Parallax Layer 1 (Distant Silhouette Mountains & Ruined Mills)
    this.renderFarScenery(cameraX * farFactor, stage);

    // Mid Parallax Layer 2 (Haunted Cottages, Dense Dark Pines, Towering Gables)
    this.renderMidScenery(cameraX * midFactor, stage, time);

    // Near Parallax Layer 3 (Dilapidated Fences, Giant Gnarly Trees, Creepy Streetlamps & Fog)
    this.renderNearScenery(cameraX * nearFactor, stage);

    // Ground rendering (1.0)
    this.renderGround(cameraX, stage);
  }

  private renderFarScenery(offset: number, stage: StageConfig) {
    const ctx = this.ctx;
    ctx.save();

    if (stage.bgTheme === 'village') {
      // === Stage 1: Closer Dark Gothic Mountains, Ruined Windmills & Church Spires ===
      ctx.fillStyle = 'rgba(15, 20, 30, 0.65)';
      for (let x = -150 - (offset % 800); x < CANVAS_WIDTH + 800; x += 360) {
        // Jagged mountain silhouette
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y - 20);
        ctx.lineTo(x + 100, GROUND_Y - 160);
        ctx.lineTo(x + 180, GROUND_Y - 110);
        ctx.lineTo(x + 280, GROUND_Y - 200);
        ctx.lineTo(x + 380, GROUND_Y - 20);
        ctx.closePath();
        ctx.fill();

        // Broken Haunted Windmill Tower
        ctx.fillRect(x + 170, GROUND_Y - 170, 26, 60);
        ctx.beginPath();
        ctx.moveTo(x + 165, GROUND_Y - 170);
        ctx.lineTo(x + 183, GROUND_Y - 195);
        ctx.lineTo(x + 201, GROUND_Y - 170);
        ctx.fill();

        // Broken Windmill Blades
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 183, GROUND_Y - 180);
        ctx.lineTo(x + 155, GROUND_Y - 215);
        ctx.moveTo(x + 183, GROUND_Y - 180);
        ctx.lineTo(x + 215, GROUND_Y - 160);
        ctx.moveTo(x + 183, GROUND_Y - 180);
        ctx.lineTo(x + 195, GROUND_Y - 218);
        ctx.stroke();
      }
    } else if (stage.bgTheme === 'forest') {
      // === Stage 2: Towering Dark Pine Ridges & Dense Haunted Mountain Wilderness ===
      ctx.fillStyle = 'rgba(10, 24, 20, 0.75)';
      for (let x = -100 - (offset % 500); x < CANVAS_WIDTH + 500; x += 110) {
        // High steep mountain pine silhouettes
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y - 20);
        ctx.lineTo(x + 55, GROUND_Y - 240);
        ctx.lineTo(x + 110, GROUND_Y - 20);
        ctx.fill();

        // Second overlapping pine layer
        ctx.beginPath();
        ctx.moveTo(x + 35, GROUND_Y - 20);
        ctx.lineTo(x + 85, GROUND_Y - 210);
        ctx.lineTo(x + 135, GROUND_Y - 20);
        ctx.fill();
      }
    } else {
      // === Stage 3: Intricate Cyber Megacity Skyline & Sky Bridges ===
      // Sweeping Sky Searchlight Beams (fixed screen space)
      const searchAngle1 = Math.sin(Date.now() * 0.001) * 0.4 - 0.2;
      const searchAngle2 = Math.cos(Date.now() * 0.0008) * 0.5 + 0.1;

      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#63B3ED';
      ctx.beginPath();
      ctx.moveTo(180, GROUND_Y - 80);
      ctx.lineTo(180 + Math.tan(searchAngle1 - 0.1) * 360, 0);
      ctx.lineTo(180 + Math.tan(searchAngle1 + 0.1) * 360, 0);
      ctx.fill();

      ctx.fillStyle = '#9F7AEA';
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH - 220, GROUND_Y - 80);
      ctx.lineTo(CANVAS_WIDTH - 220 + Math.tan(searchAngle2 - 0.12) * 360, 0);
      ctx.lineTo(CANVAS_WIDTH - 220 + Math.tan(searchAngle2 + 0.12) * 360, 0);
      ctx.fill();
      ctx.restore();

      // Distant Megastructure Towers using deterministic index-based world coords
      const towerSpacing = 120;
      const startIdx = Math.floor(offset / towerSpacing) - 2;
      const endIdx = Math.ceil((offset + CANVAS_WIDTH) / towerSpacing) + 2;

      ctx.fillStyle = '#0F131D';
      for (let i = startIdx; i <= endIdx; i++) {
        const worldX = i * towerSpacing;
        const screenX = worldX - offset;

        // Stable height based on building index
        const randSeed = Math.abs(Math.sin(i * 127.1) * 43758.5453) % 1;
        const height = 180 + Math.floor(randSeed * 140);
        const bWidth = 80;

        ctx.fillRect(screenX, GROUND_Y - height, bWidth, height);

        // Tower spire & red blinker beacon
        ctx.fillRect(screenX + bWidth / 2 - 2, GROUND_Y - height - 24, 4, 24);
        if (Math.floor(Date.now() / 600 + i) % 2 === 0) {
          ctx.fillStyle = '#FF2222';
          ctx.beginPath();
          ctx.arc(screenX + bWidth / 2, GROUND_Y - height - 24, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0F131D';
        }

        // Sky Bridge connections between towers
        if (i % 2 === 0) {
          ctx.fillStyle = 'rgba(20, 26, 40, 0.7)';
          ctx.fillRect(screenX + bWidth, GROUND_Y - height + 40, 50, 8);
          ctx.fillStyle = '#0F131D';
        }
      }
    }
    ctx.restore();
  }

  private renderMidScenery(offset: number, stage: StageConfig, time: number) {
    const ctx = this.ctx;
    ctx.save();

    if (stage.bgTheme === 'village') {
      // === Stage 1: Closer Dilapidated Victorian Cottages, Gothic Church Spire & Candlelit Windows ===
      ctx.fillStyle = 'rgba(25, 30, 42, 0.88)';
      for (let x = -250 - (offset % 900); x < CANVAS_WIDTH + 900; x += 300) {
        // Large Gothic House with Gables & Chimney
        ctx.fillRect(x, GROUND_Y - 130, 160, 130);

        // High Steep Roof Gable
        ctx.beginPath();
        ctx.moveTo(x - 14, GROUND_Y - 130);
        ctx.lineTo(x + 80, GROUND_Y - 200);
        ctx.lineTo(x + 174, GROUND_Y - 130);
        ctx.closePath();
        ctx.fill();

        // Brick Chimney with Spooky Smoke
        ctx.fillRect(x + 120, GROUND_Y - 215, 20, 85);
        ctx.fillStyle = 'rgba(200, 200, 200, 0.12)';
        ctx.beginPath();
        ctx.arc(x + 130, GROUND_Y - 225, 12, 0, Math.PI * 2);
        ctx.arc(x + 138, GROUND_Y - 245, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(25, 30, 42, 0.88)';

        // Church Belltower Cross on every alternate building
        ctx.fillRect(x + 76, GROUND_Y - 225, 8, 25);
        ctx.fillRect(x + 68, GROUND_Y - 218, 24, 6);

        // Sinister Crows perched on roof peak
        ctx.fillStyle = '#05070B';
        ctx.beginPath();
        ctx.arc(x + 80, GROUND_Y - 204, 4, 0, Math.PI * 2);
        ctx.arc(x + 86, GROUND_Y - 202, 3, 0, Math.PI * 2);
        ctx.fill();

        // Creepy Flickering Candlelit / Jack-o-Lantern Gothic Windows
        const candleFlicker = Math.sin(time * 0.006 + x) * 0.15 + 0.85;
        ctx.fillStyle = `rgba(245, 158, 11, ${0.75 * candleFlicker})`;
        // Upper Arched Attic Window
        ctx.beginPath();
        ctx.arc(x + 80, GROUND_Y - 160, 14, Math.PI, 0);
        ctx.rect(x + 66, GROUND_Y - 160, 28, 22);
        ctx.fill();
        // Lower Ground Windows
        ctx.fillRect(x + 25, GROUND_Y - 95, 28, 38);
        ctx.fillRect(x + 105, GROUND_Y - 95, 28, 38);

        // Window Mullion Cross Bars
        ctx.fillStyle = '#1A202C';
        ctx.fillRect(x + 79, GROUND_Y - 170, 2, 32);
        ctx.fillRect(x + 66, GROUND_Y - 150, 28, 2);
        ctx.fillRect(x + 38, GROUND_Y - 95, 2, 38);
        ctx.fillRect(x + 25, GROUND_Y - 76, 28, 2);
        ctx.fillRect(x + 118, GROUND_Y - 95, 2, 38);
        ctx.fillRect(x + 105, GROUND_Y - 76, 28, 2);

        ctx.fillStyle = 'rgba(25, 30, 42, 0.88)';
      }

      // Rolling Ground Fog Sheets across Village (Creeping graveyard mist)
      ctx.fillStyle = 'rgba(254, 215, 102, 0.04)';
      const mistOffset = Math.sin(time * 0.0015) * 20;
      ctx.fillRect(0, GROUND_Y - 60 + mistOffset, CANVAS_WIDTH, 50);

    } else if (stage.bgTheme === 'forest') {
      // === Stage 2: Massive Gnarled Ancient Dead Oaks & Towering Deep Pines ===
      ctx.fillStyle = 'rgba(12, 28, 20, 0.92)';
      for (let x = -150 - (offset % 600); x < CANVAS_WIDTH + 600; x += 120) {
        // Multi-tiered dense dark pine trees
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y);
        ctx.lineTo(x + 50, GROUND_Y - 260);
        ctx.lineTo(x + 100, GROUND_Y);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + 15, GROUND_Y);
        ctx.lineTo(x + 50, GROUND_Y - 220);
        ctx.lineTo(x + 85, GROUND_Y);
        ctx.fill();

        // Gnarled twisted dead tree branches reaching into sky
        ctx.strokeStyle = '#08140E';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x + 80, GROUND_Y - 40);
        ctx.lineTo(x + 110, GROUND_Y - 140);
        ctx.lineTo(x + 140, GROUND_Y - 190);
        ctx.moveTo(x + 110, GROUND_Y - 140);
        ctx.lineTo(x + 85, GROUND_Y - 180);
        ctx.stroke();

        // Spooky Glowing Red / Yellow Demonic Beast Eyes peering from the woods
        if ((x + 500) % 240 === 0) {
          const eyeBlink = Math.sin(time * 0.003 + x) > -0.7;
          if (eyeBlink) {
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.arc(x + 45, GROUND_Y - 90, 2.5, 0, Math.PI * 2);
            ctx.arc(x + 54, GROUND_Y - 90, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#F59E0B';
            ctx.fillRect(x + 46, GROUND_Y - 91, 1, 1);
            ctx.fillRect(x + 55, GROUND_Y - 91, 1, 1);
          }
        }
      }

      // Spooky Toxic Emerald Mist / Swamp Fog Sheets
      ctx.fillStyle = 'rgba(72, 187, 120, 0.07)';
      const fogWave = Math.sin(time * 0.002) * 14;
      ctx.fillRect(0, GROUND_Y - 120 + fogWave, CANVAS_WIDTH, 80);
      ctx.fillStyle = 'rgba(200, 230, 220, 0.05)';
      ctx.fillRect(0, GROUND_Y - 70 - fogWave * 0.5, CANVAS_WIDTH, 50);

    } else {
      // === Stage 3: Neo Metro Central & Glowing Cyber Cityscape ===
      // Overhead Elevated Monorail Track in Mid-ground
      ctx.fillStyle = '#171D28';
      ctx.fillRect(0, GROUND_Y - 170, CANVAS_WIDTH, 14);
      ctx.fillStyle = '#2D3748';
      ctx.fillRect(0, GROUND_Y - 174, CANVAS_WIDTH, 4);

      // Monorail Support Pylons (stable index loop)
      const pylonSpacing = 260;
      const pylonStart = Math.floor(offset / pylonSpacing) - 1;
      const pylonEnd = Math.ceil((offset + CANVAS_WIDTH) / pylonSpacing) + 1;
      for (let pi = pylonStart; pi <= pylonEnd; pi++) {
        const px = pi * pylonSpacing - offset;
        ctx.fillStyle = '#1A202C';
        ctx.fillRect(px, GROUND_Y - 170, 22, 170);
        ctx.fillStyle = '#CBD5E0';
        ctx.fillRect(px + 4, GROUND_Y - 160, 14, 4);
      }

      // City Buildings with Neon Billboards & Lighted Window Grids (stable index loop)
      const bSpacing = 160;
      const bStart = Math.floor(offset / bSpacing) - 2;
      const bEnd = Math.ceil((offset + CANVAS_WIDTH) / bSpacing) + 2;

      for (let i = bStart; i <= bEnd; i++) {
        const screenX = i * bSpacing - offset;
        const randSeed = Math.abs(Math.sin(i * 91.7) * 43758.5453) % 1;
        const bHeight = 190 + Math.floor(randSeed * 120);
        const bWidth = 135;

        // Building Facade
        ctx.fillStyle = '#181E29';
        ctx.fillRect(screenX, GROUND_Y - bHeight, bWidth, bHeight);

        // Rooftop AC / HVAC and Water Tower
        ctx.fillStyle = '#2D3748';
        ctx.fillRect(screenX + 15, GROUND_Y - bHeight - 16, 28, 16);
        ctx.fillRect(screenX + 60, GROUND_Y - bHeight - 24, 20, 24);

        // Deterministic Glowing Windows Grid
        const numRows = Math.floor((bHeight - 45) / 26);
        for (let row = 0; row < numRows; row++) {
          const wy = GROUND_Y - bHeight + 25 + row * 26;
          for (let col = 0; col < 4; col++) {
            const wx = screenX + 15 + col * 28;
            const isLit = (i * 7 + row * 11 + col * 13) % 3 !== 0;
            if (isLit) {
              ctx.fillStyle = (i + row + col) % 2 === 0 ? 'rgba(246, 173, 85, 0.75)' : 'rgba(99, 179, 237, 0.75)';
              ctx.fillRect(wx, wy, 15, 14);
            }
          }
        }

        // Holographic / Neon Billboards on stable building indices
        if (i % 3 === 0) {
          ctx.fillStyle = 'rgba(26, 32, 44, 0.9)';
          ctx.fillRect(screenX + 15, GROUND_Y - bHeight + 35, 105, 32);
          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = 2;
          ctx.strokeRect(screenX + 15, GROUND_Y - bHeight + 35, 105, 32);

          ctx.fillStyle = '#00F0FF';
          ctx.font = 'bold 8px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('Z-TRANSIT', screenX + 67, GROUND_Y - bHeight + 54);
        } else if (i % 3 === 1) {
          ctx.fillStyle = 'rgba(26, 32, 44, 0.9)';
          ctx.fillRect(screenX + 15, GROUND_Y - bHeight + 35, 105, 32);
          ctx.strokeStyle = '#E53E3E';
          ctx.lineWidth = 2;
          ctx.strokeRect(screenX + 15, GROUND_Y - bHeight + 35, 105, 32);

          ctx.fillStyle = '#E53E3E';
          ctx.font = 'bold 7px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('ZONE: CLOSED', screenX + 67, GROUND_Y - bHeight + 54);
        }
      }
    }
    ctx.restore();
  }

  private renderNearScenery(offset: number, stage: StageConfig) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#0B0F17';

    if (stage.bgTheme === 'village') {
      // === Stage 1: Weathered Picket Fences, Spooky Gas Streetlamps, and Gnarled Dead Oaks ===
      for (let x = -150 - (offset % 600); x < CANVAS_WIDTH + 600; x += 320) {
        // Antique Victorian Gas Lamp Post
        ctx.fillStyle = '#1A202C';
        ctx.fillRect(x + 40, GROUND_Y - 165, 8, 165);
        ctx.fillRect(x + 32, GROUND_Y - 170, 24, 6);

        // Ornate Lamp Glass Lantern Housing
        ctx.fillStyle = '#2D3748';
        ctx.beginPath();
        ctx.moveTo(x + 30, GROUND_Y - 170);
        ctx.lineTo(x + 58, GROUND_Y - 170);
        ctx.lineTo(x + 52, GROUND_Y - 200);
        ctx.lineTo(x + 36, GROUND_Y - 200);
        ctx.closePath();
        ctx.fill();

        // Glowing Gaslight Flame
        const flameGlow = ctx.createRadialGradient(x + 44, GROUND_Y - 185, 2, x + 44, GROUND_Y - 185, 65);
        flameGlow.addColorStop(0, 'rgba(254, 215, 102, 0.7)');
        flameGlow.addColorStop(0.4, 'rgba(245, 158, 11, 0.3)');
        flameGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = flameGlow;
        ctx.beginPath();
        ctx.arc(x + 44, GROUND_Y - 185, 65, 0, Math.PI * 2);
        ctx.fill();

        // Gas Lamp Flame Core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + 44, GROUND_Y - 185, 5, 0, Math.PI * 2);
        ctx.fill();

        // Broken Gothic Cemetery Iron Fence with Fleur-de-lis Spikes
        ctx.fillStyle = '#111620';
        for (let fx = 0; fx < 220; fx += 22) {
          ctx.fillRect(x + 65 + fx, GROUND_Y - 45, 6, 45);
          // Spear tip on fence
          ctx.beginPath();
          ctx.moveTo(x + 68 + fx, GROUND_Y - 52);
          ctx.lineTo(x + 64 + fx, GROUND_Y - 45);
          ctx.lineTo(x + 72 + fx, GROUND_Y - 45);
          ctx.fill();
        }
        ctx.fillRect(x + 60, GROUND_Y - 36, 230, 4);
        ctx.fillRect(x + 60, GROUND_Y - 18, 230, 4);

        // Twisted Gnarly Barren Tree Trunk in foreground
        ctx.beginPath();
        ctx.moveTo(x + 220, GROUND_Y);
        ctx.lineTo(x + 235, GROUND_Y - 150);
        ctx.lineTo(x + 210, GROUND_Y - 210);
        ctx.lineTo(x + 245, GROUND_Y - 145);
        ctx.lineTo(x + 270, GROUND_Y - 200);
        ctx.lineTo(x + 250, GROUND_Y);
        ctx.closePath();
        ctx.fill();
      }
    } else if (stage.bgTheme === 'forest') {
      // === Stage 2: Rusted Highway Guardrails, Biohazard Warning Signs, Giant Boulders & Twisted Spruce ===
      for (let x = -150 - (offset % 500); x < CANVAS_WIDTH + 500; x += 250) {
        // Massive Mossy Woodland Boulder
        ctx.fillStyle = '#17252A';
        ctx.beginPath();
        ctx.ellipse(x + 40, GROUND_Y - 12, 34, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2B7A78';
        ctx.beginPath();
        ctx.ellipse(x + 36, GROUND_Y - 18, 22, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rusted Highway Armco Guardrail
        ctx.fillStyle = '#4A5568';
        ctx.fillRect(x + 75, GROUND_Y - 38, 140, 14);
        ctx.fillStyle = '#1A202C';
        ctx.fillRect(x + 75, GROUND_Y - 32, 140, 4); // rail center crease
        ctx.fillRect(x + 85, GROUND_Y - 24, 10, 24);
        ctx.fillRect(x + 195, GROUND_Y - 24, 10, 24);
        // Blood streaks on highway barrier
        ctx.fillStyle = '#742A2A';
        ctx.fillRect(x + 110, GROUND_Y - 36, 18, 8);
        ctx.fillRect(x + 155, GROUND_Y - 38, 12, 10);

        // Twisted Dead Pine Trunk with Hanging Moss
        ctx.fillStyle = '#0D1B2A';
        ctx.beginPath();
        ctx.moveTo(x + 20, GROUND_Y);
        ctx.lineTo(x + 28, GROUND_Y - 180);
        ctx.lineTo(x + 8, GROUND_Y - 230);
        ctx.lineTo(x + 34, GROUND_Y - 175);
        ctx.lineTo(x + 55, GROUND_Y - 225);
        ctx.lineTo(x + 40, GROUND_Y);
        ctx.closePath();
        ctx.fill();

        // Rusted Biohazard Warning Sign ("DANGER: INFESTED FOREST")
        if ((x + 300) % 500 === 0) {
          ctx.fillStyle = '#78350F';
          ctx.fillRect(x + 130, GROUND_Y - 95, 6, 95);
          ctx.fillStyle = '#D97706';
          ctx.fillRect(x + 105, GROUND_Y - 135, 56, 40);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 105, GROUND_Y - 135, 56, 40);
          // Yellow Biohazard Symbol silhouette
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 6px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('☣ DANGER', x + 133, GROUND_Y - 120);
          ctx.fillText('INFESTED', x + 133, GROUND_Y - 105);
        }
      }
    } else {
      // === Stage 3: Metro Station Platform Girders, Digital Screens & Sirens (stable index loop) ===
      const pylonSpacing = 280;
      const pStart = Math.floor(offset / pylonSpacing) - 1;
      const pEnd = Math.ceil((offset + CANVAS_WIDTH) / pylonSpacing) + 1;

      for (let i = pStart; i <= pEnd; i++) {
        const x = i * pylonSpacing - offset;

        // Station Steel I-Beam Pylon
        ctx.fillStyle = '#1A202C';
        ctx.fillRect(x + 20, GROUND_Y - 150, 12, 150);
        ctx.fillStyle = '#4A5568';
        ctx.fillRect(x + 16, GROUND_Y - 152, 20, 6);

        // Flashing Yellow Alarm Beacon on pole
        const beaconFlash = Math.floor(Date.now() / 250 + i) % 2 === 0;
        ctx.fillStyle = beaconFlash ? '#ECC94B' : '#744210';
        ctx.beginPath();
        ctx.arc(x + 26, GROUND_Y - 160, 6, 0, Math.PI * 2);
        ctx.fill();

        if (beaconFlash) {
          const bglow = ctx.createRadialGradient(x + 26, GROUND_Y - 160, 1, x + 26, GROUND_Y - 160, 30);
          bglow.addColorStop(0, 'rgba(236, 201, 75, 0.45)');
          bglow.addColorStop(1, 'rgba(236, 201, 75, 0)');
          ctx.fillStyle = bglow;
          ctx.beginPath();
          ctx.arc(x + 26, GROUND_Y - 160, 30, 0, Math.PI * 2);
          ctx.fill();
        }

        // Broken Electronic Departure Monitor hanging from beam
        ctx.fillStyle = '#0D1117';
        ctx.fillRect(x + 35, GROUND_Y - 130, 65, 30);
        ctx.strokeStyle = '#4A5568';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 35, GROUND_Y - 130, 65, 30);

        ctx.fillStyle = '#FF0055';
        ctx.font = 'bold 6px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EVACUATE', x + 67, GROUND_Y - 114);
        ctx.fillStyle = '#63B3ED';
        ctx.fillText('NO TRAINS', x + 67, GROUND_Y - 105);

        // Barrier Railing along platform edge
        ctx.fillStyle = '#2D3748';
        ctx.fillRect(x + 20, GROUND_Y - 36, 120, 4);
        ctx.fillRect(x + 20, GROUND_Y - 18, 120, 4);
        for (let rx = 0; rx < 120; rx += 25) {
          ctx.fillRect(x + 20 + rx, GROUND_Y - 38, 4, 38);
        }
      }
    }
    ctx.restore();
  }

  private renderGround(cameraX: number, stage: StageConfig) {
    const ctx = this.ctx;
    ctx.save();

    // Road surface
    ctx.fillStyle = stage.groundColor;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Road line pattern / curb
    ctx.fillStyle = '#718096';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 4);

    // Dashed road stripe
    ctx.fillStyle = '#CBD5E0';
    const dashOffset = (cameraX % 60);
    for (let x = -dashOffset; x < CANVAS_WIDTH; x += 60) {
      ctx.fillRect(x, GROUND_Y + 28, 34, 4);
    }

    // Finish line if near end of map
    const finishScreenX = stage.mapLength - cameraX;
    if (finishScreenX > -200 && finishScreenX < CANVAS_WIDTH + 200) {
      ctx.fillStyle = '#ECC94B';
      ctx.fillRect(finishScreenX - 10, GROUND_Y - 180, 8, 180);
      ctx.fillRect(finishScreenX + 110, GROUND_Y - 180, 8, 180);
      // Banner
      ctx.fillStyle = '#DD6B20';
      ctx.fillRect(finishScreenX - 10, GROUND_Y - 180, 128, 32);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillText(stage.id === 3 ? 'BOSS ZONE' : 'STAGE CLEAR', finishScreenX - 2, GROUND_Y - 160);

      // Hazard stripes on ground
      for (let gx = 0; gx < 120; gx += 16) {
        ctx.fillStyle = (gx / 16) % 2 === 0 ? '#ECC94B' : '#1A202C';
        ctx.fillRect(finishScreenX - 10 + gx, GROUND_Y, 16, CANVAS_HEIGHT - GROUND_Y);
      }
    }

    ctx.restore();
  }

  // Draw the Player (Traffic sign pictogram character with orange cone hat & shotgun)
  public renderPlayer(player: Player, cameraX: number) {
    const ctx = this.ctx;
    const px = player.x - cameraX;
    const py = player.y;

    ctx.save();
    ctx.translate(px, py);

    // Flashing when invincible
    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    const isLeft = player.facing === 'left';
    const playerScale = 1.35;
    if (isLeft) {
      ctx.scale(-playerScale, playerScale);
    } else {
      ctx.scale(playerScale, playerScale);
    }

    // Character Base (Sleek Pictogram Body: Neutral Traffic Sign Slate)
    const bodyColor = '#E2E8F0';
    const outlineColor = '#1A202C';

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = outlineColor;
    ctx.fillStyle = bodyColor;

    if (player.isSliding) {
      // === SLIDE ATTACK POSE ===
      // Speed trail aura
      ctx.fillStyle = 'rgba(255, 107, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(-15, -12, 35, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sliding legs extended
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(25, -6);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-15, -10);
      ctx.lineTo(15, -4);
      ctx.stroke();

      // Torso angled back
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(-20, -22);
      ctx.stroke();

      // Head
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(-24, -28, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cone Hat on Head (Angled)
      this.drawConeHat(ctx, -24, -36, -0.2);

      // Shotgun held forward low
      this.drawShotgun(ctx, 5, -12, 0.1, player.meleeTimer > 0);

    } else if (player.isMeleeing) {
      // === MELEE BASH / SWING POSE (HUGE SWEEPING ARC) ===
      const meleeProgress = player.meleeTimer / 14; // 1 -> 0
      const swingAngle = -1.4 + (1 - meleeProgress) * 3.1;

      // Legs plant wide
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(-14, 0);
      ctx.moveTo(0, -24);
      ctx.lineTo(20, 0);
      ctx.stroke();

      // Torso lunging deep forward
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(12, -42);
      ctx.stroke();

      // Head
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(14, -48, 9, 0, Math.PI * 2);
      ctx.fill();

      // Cone Hat
      this.drawConeHat(ctx, 14, -56, 0.2);

      // Huge Sweeping Wind Shockwave & Melee Slash Arc
      ctx.save();
      // Outer golden-orange shockwave crescent
      ctx.strokeStyle = 'rgba(255, 170, 0, 0.65)';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(10, -32, 62, -1.3, swingAngle);
      ctx.stroke();

      // Inner intense white cutting trail
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(10, -32, 60, Math.max(-1.3, swingAngle - 1.2), swingAngle);
      ctx.stroke();

      // Impact sparkle at head of swing
      const tipX = 10 + Math.cos(swingAngle) * 60;
      const tipY = -32 + Math.sin(swingAngle) * 60;
      ctx.fillStyle = '#ECC94B';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Shotgun being swung as a blunt club with extended reach
      this.drawShotgun(ctx, 10, -32, swingAngle, true);

    } else {
      // === STANDARD RUN / JUMP / IDLE POSE ===
      const isRunning = Math.abs(player.vx) > 0.5 && player.isGrounded;
      const isJumping = !player.isGrounded;
      const runOffset = isRunning ? Math.sin(player.runFrame * 0.35) * 14 : 0;

      // Legs
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';

      if (isJumping) {
        // Jump bent knees
        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.lineTo(-8, -14);
        ctx.lineTo(-4, -4);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.lineTo(8, -10);
        ctx.lineTo(14, -2);
        ctx.stroke();
      } else {
        // Run cycle
        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.lineTo(-runOffset, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.lineTo(runOffset, 0);
        ctx.stroke();
      }

      // Torso
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(0, -44);
      ctx.stroke();

      // Head (Pictogram Circle)
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(0, -52, 9, 0, Math.PI * 2);
      ctx.fill();

      // Iconic Traffic Cone Hat!
      this.drawConeHat(ctx, 0, -60, isRunning ? Math.sin(player.runFrame * 0.35) * 0.08 : 0);

      // Shotgun aiming towards cursor
      let aim = player.aimAngle;
      if (isLeft) {
        aim = Math.PI - aim;
      }
      this.drawShotgun(ctx, 2, -38, aim, false);
    }

    ctx.restore();
  }

  // Draw the iconic bright orange traffic cone hat with reflective stripes
  private drawConeHat(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Black cone base plate
    ctx.fillStyle = '#1A202C';
    ctx.fillRect(-12, 0, 24, 4);

    // Orange cone body
    ctx.fillStyle = '#FF6B00';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(0, -22);
    ctx.lineTo(10, 0);
    ctx.closePath();
    ctx.fill();

    // White reflective band
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-6, -7);
    ctx.lineTo(0, -20);
    ctx.lineTo(6, -7);
    ctx.lineTo(4, -13);
    ctx.lineTo(0, -20);
    ctx.lineTo(-4, -13);
    ctx.closePath();
    ctx.fill();

    // Cone tip rounding
    ctx.fillStyle = '#FF6B00';
    ctx.beginPath();
    ctx.arc(0, -22, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Shotgun Weapon
  private drawShotgun(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, isMelee: boolean) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    if (isMelee) {
      // Holding by barrel, swinging wooden stock
      ctx.fillStyle = '#8D4925'; // Walnut stock
      ctx.fillRect(-22, -4, 18, 7);
      ctx.fillStyle = '#4A5568'; // Steel receiver & barrel
      ctx.fillRect(-4, -3, 26, 5);
      ctx.fillStyle = '#2D3748';
      ctx.fillRect(8, 2, 10, 3); // Pump
    } else {
      // Standard shooting hold
      ctx.fillStyle = '#8D4925'; // Stock
      ctx.fillRect(-16, 2, 14, 6);
      ctx.fillStyle = '#2D3748'; // Receiver
      ctx.fillRect(-2, -3, 14, 8);
      ctx.fillStyle = '#718096'; // Dual barrel
      ctx.fillRect(12, -2, 22, 4);
      ctx.fillRect(12, 2, 18, 3); // Tube magazine
      ctx.fillStyle = '#1A202C'; // Grip / pump slide
      ctx.fillRect(16, 1, 9, 5);
    }

    ctx.restore();
  }

  // Render Zombies
  public renderEnemy(enemy: Enemy, cameraX: number) {
    const ctx = this.ctx;

    // If Boss is in leap or sky slam state, render Ground Landing Warning Telegraph Indicator!
    if (
      (enemy.type === 'boss_ticket' || enemy.type === 'boss_mutant') &&
      (enemy.state === 'leap' || enemy.state === 'leap_prep') &&
      enemy.diveStartX !== undefined
    ) {
      const targetScreenX = enemy.diveStartX - cameraX;
      ctx.save();

      // Ground warning beacon / crosshair
      const pulse = 0.4 + Math.abs(Math.sin(Date.now() * 0.012)) * 0.5;
      ctx.fillStyle = `rgba(229, 62, 62, ${pulse * 0.45})`;
      ctx.beginPath();
      ctx.ellipse(targetScreenX, GROUND_Y - 4, 80, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing red danger ring
      ctx.strokeStyle = '#FF0055';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(targetScreenX, GROUND_Y - 4, 72, 18, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair lines
      ctx.beginPath();
      ctx.moveTo(targetScreenX - 90, GROUND_Y - 4);
      ctx.lineTo(targetScreenX + 90, GROUND_Y - 4);
      ctx.stroke();

      // Vertical warning beacon line to sky
      ctx.strokeStyle = `rgba(255, 0, 85, ${pulse * 0.85})`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(targetScreenX, GROUND_Y - 4);
      ctx.lineTo(targetScreenX, 0);
      ctx.stroke();
      ctx.setLineDash([]);

      // Warning text floating above ground
      if (Math.floor(Date.now() / 200) % 2 === 0) {
        ctx.fillStyle = '#FF0055';
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ SLAM INCOMING ⚠️', targetScreenX, GROUND_Y - 45);
      }

      ctx.restore();
    }

    const ex = enemy.x - cameraX;
    const ey = enemy.y;

    if (ex < -200 || ex > CANVAS_WIDTH + 200) return;

    ctx.save();
    ctx.translate(ex, ey);

    const isLeft = enemy.facing === 'left';
    const enemyScale = enemy.type === 'boss_tank' ? 1.75 : (enemy.type === 'boss_mutant' || enemy.type === 'boss_ticket' ? 1.55 : 1.3);
    if (isLeft) {
      ctx.scale(-enemyScale, enemyScale);
    } else {
      ctx.scale(enemyScale, enemyScale);
    }

    // Hit flash effect
    if (enemy.hitFlashTimer > 0) {
      ctx.filter = 'brightness(2.5)';
    }

    if (enemy.type === 'boss_ticket') {
      this.renderBossTicket(ctx, enemy);
    } else if (enemy.type === 'boss_tank') {
      this.renderBossTank(ctx, enemy);
    } else if (enemy.type === 'boss_mutant') {
      this.renderBossMutant(ctx, enemy);
    } else {
      this.renderZombieCreature(ctx, enemy);
    }

    // Health bar above enemy head (exclude bosses which are shown in top HUD)
    if (enemy.health < enemy.maxHealth && enemy.type !== 'boss_tank' && enemy.type !== 'boss_mutant' && enemy.type !== 'boss_ticket') {
      const barW = 36;
      const barH = 5;
      const hpPct = Math.max(0, enemy.health / enemy.maxHealth);
      ctx.fillStyle = '#1A202C';
      ctx.fillRect(-barW / 2 - 1, -enemy.height - 20, barW + 2, barH + 2);
      ctx.fillStyle = enemy.type === 'brute' ? '#E53E3E' : '#48BB78';
      ctx.fillRect(-barW / 2, -enemy.height - 19, barW * hpPct, barH);
    }

    ctx.restore();
  }

  // Render Normal, Fast, Leaper, Brute Zombie, or Zombie Crow
  private renderZombieCreature(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    if (enemy.type === 'crow') {
      // === ZOMBIE CROW (อีกาซอมบี้) ===
      const isDiving = enemy.state === 'dive';
      const wingFlap = isDiving ? 0.3 : Math.sin(enemy.animFrame * 0.45);

      // Shadow on ground when flying
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 0 - enemy.y + GROUND_Y, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dive air trails
      if (isDiving) {
        ctx.strokeStyle = 'rgba(229, 62, 62, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-20, -10);
        ctx.lineTo(-40, -18);
        ctx.moveTo(-15, -4);
        ctx.lineTo(-35, -10);
        ctx.stroke();
      }

      // Back Wing
      ctx.fillStyle = '#1A202C';
      ctx.beginPath();
      ctx.moveTo(-4, -14);
      if (isDiving) {
        ctx.lineTo(-24, -20);
        ctx.lineTo(-12, -8);
      } else {
        ctx.lineTo(-16, -14 - wingFlap * 16);
        ctx.lineTo(6, -14 - wingFlap * 12);
      }
      ctx.closePath();
      ctx.fill();

      // Crow Body (Dark corrupted feathers)
      ctx.fillStyle = '#2D3748';
      ctx.beginPath();
      ctx.ellipse(0, -12, 14, 9, isDiving ? 0.35 : 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Tail feathers
      ctx.fillStyle = '#1A202C';
      ctx.beginPath();
      ctx.moveTo(-12, -10);
      ctx.lineTo(-24, -14);
      ctx.lineTo(-22, -8);
      ctx.lineTo(-26, -6);
      ctx.lineTo(-10, -8);
      ctx.closePath();
      ctx.fill();

      // Crow Head
      ctx.fillStyle = '#1A202C';
      ctx.beginPath();
      ctx.arc(10, -16, 7, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Beak
      ctx.fillStyle = '#ECC94B';
      ctx.beginPath();
      ctx.moveTo(14, -18);
      ctx.lineTo(24, -14);
      ctx.lineTo(14, -12);
      ctx.closePath();
      ctx.fill();

      // Zombie Glowing Blood-Red Eye
      ctx.fillStyle = '#E53E3E';
      ctx.beginPath();
      ctx.arc(12, -17, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF566';
      ctx.fillRect(13, -18, 1, 1);

      // Front Wing
      ctx.fillStyle = '#2D3748';
      ctx.strokeStyle = '#1A202C';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-2, -12);
      if (isDiving) {
        ctx.lineTo(-22, -16);
        ctx.lineTo(-8, -4);
      } else {
        ctx.lineTo(-14, -12 + wingFlap * 18);
        ctx.lineTo(10, -12 + wingFlap * 14);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Zombie Talons / Claws
      ctx.strokeStyle = '#ECC94B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(4, 2);
      ctx.moveTo(-4, -4);
      ctx.lineTo(-1, 2);
      ctx.stroke();

      return;
    }

    const isBrute = enemy.type === 'brute';
    const isFast = enemy.type === 'fast';
    const isLeaper = enemy.type === 'leaper';

    // Color theme
    let skinColor = '#48BB78'; // Green Walker
    let eyeColor = '#E53E3E';

    if (isFast) {
      skinColor = '#ED8936'; // Orange-Red Runner
      eyeColor = '#FFFF00';
    } else if (isLeaper) {
      skinColor = '#9F7AEA'; // Purple Leaper
      eyeColor = '#FFFFFF';
    } else if (isBrute) {
      skinColor = '#C53030'; // Heavy Crimson Brute
      eyeColor = '#FFD700';
    }

    const walkOffset = Math.sin(enemy.animFrame * (isFast ? 0.45 : 0.25)) * (isBrute ? 8 : 12);
    const legThick = isBrute ? 10 : 5.5;

    // Legs
    ctx.strokeStyle = skinColor;
    ctx.lineWidth = legThick;
    ctx.lineCap = 'round';

    if (isLeaper && !enemy.isGrounded) {
      // Mid-air leap pose
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(-14, -6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(14, -2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(-walkOffset, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(walkOffset, 0);
      ctx.stroke();
    }

    // Torso (Lean forward aggressively)
    const lean = isFast ? 10 : (isBrute ? 6 : 4);
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(lean, -enemy.height + 12);
    ctx.stroke();

    // Arms Outstretched Forward (Iconic Zombie Pose: ยกมือ 2 ข้าง)
    const armWave = Math.sin(enemy.animFrame * 0.3) * 5;
    ctx.beginPath();
    ctx.moveTo(lean, -enemy.height + 18);
    ctx.lineTo(lean + (isBrute ? 32 : 24), -enemy.height + 22 + armWave);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(lean, -enemy.height + 22);
    ctx.lineTo(lean + (isBrute ? 28 : 20), -enemy.height + 14 - armWave);
    ctx.stroke();

    // Head
    const headRadius = isBrute ? 13 : 8.5;
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(lean + 2, -enemy.height + 4, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Eyes
    ctx.fillStyle = eyeColor;
    ctx.fillRect(lean + 4, -enemy.height + 2, 3, 3);

    // Tattered clothes / silhouette markings
    ctx.fillStyle = '#2D3748';
    ctx.fillRect(lean - 4, -enemy.height + 16, isBrute ? 12 : 8, 6);
  }

  // Boss Phase 1: Z-Conductor (Ticket Master Zombie - Red Uniform, Purple Skin, Ticket Puncher)
  private renderBossTicket(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    const isCast = enemy.state === 'cast';
    const isPrep = enemy.state === 'leap_prep';
    const isLeap = enemy.state === 'leap';
    const isSlam = enemy.state === 'slam';
    const isImpact = enemy.state === 'attack';

    // Purple Corrupted Zombie Skin & Red Uniform
    const skinColor = '#6B46C1'; // Dark Purple Zombie Flesh
    const skinHighlight = '#9F7AEA'; // Radiant Purple
    const uniformRed = '#9B2C2C'; // Crimson Conductor Suit
    const uniformTrim = '#ECC94B'; // Gold Buttons & Trim

    // 1. Demonic Shadow / Mist Aura Swirling at Feet
    if (enemy.isGrounded) {
      const auraPulse = Math.sin(Date.now() * 0.005) * 4;
      const auraGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 36 + auraPulse);
      auraGrad.addColorStop(0, 'rgba(107, 70, 193, 0.6)');
      auraGrad.addColorStop(0.6, 'rgba(155, 44, 44, 0.3)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 38 + auraPulse, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Leaping / Slamming Crimson Aura
    if (isSlam || isLeap) {
      const leapGrad = ctx.createRadialGradient(0, -35, 10, 0, -35, 52);
      leapGrad.addColorStop(0, 'rgba(236, 201, 75, 0.6)');
      leapGrad.addColorStop(0.5, 'rgba(229, 62, 62, 0.45)');
      leapGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = leapGrad;
      ctx.beginPath();
      ctx.arc(0, -35, 52, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Fluttering Tattered Coat Tails in Wind
    const coatFlutter = Math.sin(enemy.animFrame * 0.35) * 8;
    ctx.fillStyle = '#742A2A';
    ctx.beginPath();
    ctx.moveTo(-16, -30);
    ctx.lineTo(-24 - coatFlutter, -6);
    ctx.lineTo(-14, -4);
    ctx.lineTo(14, -4);
    ctx.lineTo(24 + coatFlutter, -6);
    ctx.lineTo(16, -30);
    ctx.closePath();
    ctx.fill();
    // Gold trim on coat hem
    ctx.strokeStyle = uniformTrim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-24 - coatFlutter, -6);
    ctx.lineTo(24 + coatFlutter, -6);
    ctx.stroke();

    // 3. Legs (Formal Conductor Uniform Pants)
    const walkAnim = Math.sin(enemy.animFrame * 0.3) * 12;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1A202C'; // Dark Charcoal Trousers

    if (isPrep || isImpact) {
      // Crouching
      ctx.beginPath();
      ctx.moveTo(-10, -22);
      ctx.lineTo(-20, -10);
      ctx.lineTo(-14, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(10, -22);
      ctx.lineTo(20, -10);
      ctx.lineTo(14, 0);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-8, -22);
      ctx.lineTo(-12 - walkAnim, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(8, -22);
      ctx.lineTo(12 + walkAnim, 0);
      ctx.stroke();
    }

    // Polished Black Shoes with Spats
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-18 - (isPrep ? 0 : walkAnim), -4, 12, 5);
    ctx.fillRect(8 + (isPrep ? 0 : walkAnim), -4, 12, 5);

    // 4. Torso (Double-Breasted Red Conductor Coat with Gold Epaulettes & Skull Buckle)
    ctx.fillStyle = uniformRed;
    ctx.fillRect(-18, -55, 36, 34);
    ctx.strokeStyle = '#1A202C';
    ctx.lineWidth = 2;
    ctx.strokeRect(-18, -55, 36, 34);

    // Gold Aiguillette Braids across Chest
    ctx.strokeStyle = uniformTrim;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-2, -45, 12, 0, Math.PI * 0.85);
    ctx.stroke();

    // Golden Buttons
    ctx.fillStyle = uniformTrim;
    for (let by = -48; by <= -28; by += 10) {
      ctx.beginPath();
      ctx.arc(-8, by, 2.5, 0, Math.PI * 2);
      ctx.arc(8, by, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gold Skull Belt Buckle
    ctx.fillStyle = '#ECC94B';
    ctx.fillRect(-6, -26, 12, 7);
    ctx.fillStyle = '#1A202C';
    ctx.fillRect(-3, -24, 2, 2);
    ctx.fillRect(1, -24, 2, 2);

    // Gold Shoulder Epaulettes with Tassels
    ctx.fillStyle = uniformTrim;
    ctx.fillRect(-24, -56, 12, 6);
    ctx.fillRect(12, -56, 12, 6);
    for (let tx = -23; tx < -12; tx += 3) {
      ctx.fillRect(tx, -50, 2, 5);
    }
    for (let tx = 13; tx < 24; tx += 3) {
      ctx.fillRect(tx, -50, 2, 5);
    }

    // 5. Arms & Golden Cyber Ticket Puncher Claw
    ctx.lineWidth = 9;
    ctx.strokeStyle = uniformRed;

    if (isCast) {
      // Raising Ticket Puncher to cast razor cards!
      ctx.beginPath();
      ctx.moveTo(-16, -50);
      ctx.lineTo(-28, -60);
      ctx.lineTo(-20, -78);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(16, -50);
      ctx.lineTo(28, -60);
      ctx.lineTo(24, -78);
      ctx.stroke();

      // Glowing Ticket Puncher Claw in hand (with electric sparks)
      ctx.fillStyle = '#ECC94B';
      ctx.fillRect(18, -86, 16, 18);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(18, -86, 16, 18);

      // Plasma spark arc
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(26, -86);
      ctx.lineTo(34, -96);
      ctx.lineTo(22, -94);
      ctx.stroke();

      // Orbiting Razor Ticket Cards effect
      ctx.fillStyle = '#FFF5F5';
      ctx.fillRect(6, -96, 12, 7);
      ctx.fillRect(30, -94, 12, 7);
      ctx.fillRect(18, -108, 12, 7);
      ctx.strokeStyle = '#ECC94B';
      ctx.lineWidth = 1;
      ctx.strokeRect(6, -96, 12, 7);
      ctx.strokeRect(30, -94, 12, 7);
      ctx.strokeRect(18, -108, 12, 7);

    } else if (isImpact) {
      // Ground Slam Pose
      ctx.beginPath();
      ctx.moveTo(-16, -50);
      ctx.lineTo(-20, -10);
      ctx.lineTo(-10, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(16, -50);
      ctx.lineTo(20, -10);
      ctx.lineTo(10, 0);
      ctx.stroke();

      // Puncher slamming floor with impact sparks
      ctx.fillStyle = '#ECC94B';
      ctx.fillRect(4, -8, 20, 14);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, -8, 20, 14);

    } else {
      // Stalking forward with puncher claw ready
      const armSwing = Math.sin(enemy.animFrame * 0.3) * 8;
      ctx.beginPath();
      ctx.moveTo(-16, -50);
      ctx.lineTo(-24 - armSwing, -34);
      ctx.lineTo(-20 - armSwing, -20);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(16, -50);
      ctx.lineTo(24 + armSwing, -34);
      ctx.lineTo(22 + armSwing, -20);
      ctx.stroke();

      // Cyber Ticket Puncher Claw on front hand
      ctx.fillStyle = '#ECC94B';
      ctx.fillRect(16 + armSwing, -28, 16, 16);
      ctx.strokeStyle = '#1A202C';
      ctx.lineWidth = 2;
      ctx.strokeRect(16 + armSwing, -28, 16, 16);

      // Claws teeth
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(28 + armSwing, -26, 6, 3);
      ctx.fillRect(28 + armSwing, -18, 6, 3);

      // Purple Zombie Hand on back hand
      ctx.fillStyle = skinHighlight;
      ctx.beginPath();
      ctx.arc(-20 - armSwing, -18, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Head & Station Master Peaked Cap
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -66, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1A202C';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Peaked Station Conductor Cap
    ctx.fillStyle = uniformRed;
    ctx.beginPath();
    ctx.moveTo(-18, -72);
    ctx.lineTo(18, -72);
    ctx.lineTo(14, -86);
    ctx.lineTo(-14, -86);
    ctx.closePath();
    ctx.fill();

    // Gold Winged Conductor Badge & Ribbon
    ctx.fillStyle = uniformTrim;
    ctx.fillRect(-6, -82, 12, 7);
    ctx.fillRect(-16, -75, 32, 3);

    // Shiny Black Visor
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-17, -73, 34, 4);

    // Glowing Blood-Red Demonic Eyes with Fiery Yellow Pupils
    ctx.fillStyle = '#E53E3E';
    ctx.fillRect(2, -68, 5, 4);
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(4, -67, 3, 2);

    // Exposed Vampire Fangs with Dripping Acid Slime
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2, -59, 3, 4);
    ctx.fillRect(7, -59, 3, 4);
    ctx.fillStyle = '#48BB78'; // Acid drop
    ctx.fillRect(4, -55, 2, 3);
  }

  // Boss: General Tank-Z (รถถังซอมบี้ขนาดยักษ์ Colossus)
  private renderBossTank(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    // 1. Heavy Tank Chassis Ground Shadow & Mud Spray
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 96, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Heavy Caterpillar Treads with Armor Skirts
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(-94, -24, 188, 26, 10);
    ctx.fill();
    ctx.strokeStyle = '#4A5568';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Tread Wheels (Large steel rollers with red hubcaps)
    const anim = (enemy.animFrame * 0.4) % 28;
    for (let wx = -80 + anim; wx < 90; wx += 28) {
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(wx, -11, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(wx, -11, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Heavy Sloped Armor Hull (Camouflage Plates)
    ctx.fillStyle = '#1F2937'; // Heavy dark composite steel
    ctx.fillRect(-82, -58, 164, 44);

    // Upper Armor Glacis Plate Slopes
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.moveTo(-82, -58);
    ctx.lineTo(82, -58);
    ctx.lineTo(74, -36);
    ctx.lineTo(-74, -36);
    ctx.closePath();
    ctx.fill();

    // Welded Steel Rivets along Glacis
    ctx.fillStyle = '#9CA3AF';
    for (let rx = -76; rx <= 76; rx += 14) {
      ctx.fillRect(rx, -56, 2.5, 2.5);
      ctx.fillRect(rx, -38, 2.5, 2.5);
    }

    // Yellow & Black Hazard Chevron Decals on Hull
    for (let hx = -68; hx < 68; hx += 18) {
      ctx.fillStyle = '#ECC94B';
      ctx.beginPath();
      ctx.moveTo(hx, -48);
      ctx.lineTo(hx + 8, -48);
      ctx.lineTo(hx + 14, -36);
      ctx.lineTo(hx + 6, -36);
      ctx.closePath();
      ctx.fill();
    }

    // Heavy Spiked Cowcatcher Bulldozer Plow on Front
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.moveTo(82, -45);
    ctx.lineTo(102, -18);
    ctx.lineTo(102, 0);
    ctx.lineTo(82, -8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Steel Spikes on Plow
    ctx.fillStyle = '#CBD5E0';
    for (let py = -16; py <= -4; py += 6) {
      ctx.beginPath();
      ctx.moveTo(102, py);
      ctx.lineTo(110, py + 2);
      ctx.lineTo(102, py + 4);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Heavy Double Turret Dome with Thermal Shrouds
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.arc(0, -58, 40, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Turret Side Armor Plates
    ctx.fillStyle = '#742A2A';
    ctx.fillRect(-36, -72, 72, 14);

    // 4. Twin Heavy Siege Cannon Barrels
    // Upper Main Cannon
    ctx.fillStyle = '#111827';
    ctx.fillRect(15, -70, 80, 15);
    ctx.fillStyle = '#4B5563';
    ctx.fillRect(15, -69, 80, 4); // chrome highlight
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(92, -73, 14, 21); // Massive Muzzle Brake
    ctx.fillStyle = '#EF4444'; // Glowing heat ring
    ctx.fillRect(40, -68, 6, 11);
    ctx.fillRect(65, -68, 6, 11);

    // Lower Main Cannon
    ctx.fillStyle = '#111827';
    ctx.fillRect(12, -52, 74, 15);
    ctx.fillStyle = '#4B5563';
    ctx.fillRect(12, -51, 74, 4);
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(84, -55, 14, 21);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(36, -50, 6, 11);
    ctx.fillRect(60, -50, 6, 11);

    // 5. Heavy 8-Cell Salvo Missile Pod on Rear of Turret
    ctx.fillStyle = '#991B1B'; // Deep military crimson
    ctx.fillRect(-66, -82, 38, 32);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-66, -82, 38, 32);

    // Rocket Tubes with glowing active warheads
    for (let rx = -60; rx <= -38; rx += 11) {
      for (let ry = -77; ry <= -57; ry += 10) {
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(rx, ry, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ECC94B';
        ctx.beginPath();
        ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 6. Dual Smoking Exhaust Manifolds with Animated Backfire Sparks
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-78, -66, 8, 14);
    ctx.fillRect(-70, -66, 8, 14);
    if (Math.random() < 0.6) {
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(-74, -70 - Math.random() * 8, 2 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Zombie General Commander in Top Turret Hatch!
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.ellipse(0, -78, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Zombie Commander Body
    ctx.fillStyle = '#15803D'; // Mutated Emerald Zombie Flesh
    ctx.beginPath();
    ctx.arc(0, -82, 13, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Blood-Red Eyes with Evil Yellow Pupils
    ctx.fillStyle = '#E53E3E';
    ctx.fillRect(4, -84, 5, 4);
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(6, -83, 2, 2);

    // Military General Officer Cap with Gold Eagle & Stars
    ctx.fillStyle = '#742A2A';
    ctx.fillRect(-16, -96, 32, 10);
    ctx.fillStyle = '#ECC94B';
    ctx.fillRect(-4, -94, 8, 8); // Gold star
    ctx.fillRect(-14, -88, 28, 2); // Gold braid
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, -90, 20, 4); // Visor

    // Raised Zombie Claw Commanding Fire
    ctx.strokeStyle = '#15803D';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(8, -76);
    ctx.lineTo(26, -92);
    ctx.stroke();
    ctx.fillStyle = '#EF4444'; // Blood on claw
    ctx.fillRect(24, -95, 4, 4);

    // Tactical Flashing Warning Beacon on Hull
    const beaconFlash = Math.sin(enemy.animFrame * 0.25) > 0;
    ctx.fillStyle = beaconFlash ? '#FF0000' : '#7F1D1D';
    ctx.beginPath();
    ctx.arc(-72, -64, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Boss Phase 2: Titan General Z (ซอมบี้กล้ามโตตัวใหญ่ระดับยักษ์ Titan Berserker)
  private renderBossMutant(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    const isPrep = enemy.state === 'leap_prep';
    const isLeap = enemy.state === 'leap';
    const isSlam = enemy.state === 'slam';
    const isImpact = enemy.state === 'attack';

    // Muscle shake during leap preparation
    const shakeX = isPrep ? (Math.random() - 0.5) * 5 : 0;
    const shakeY = isPrep ? (Math.random() - 0.5) * 3 : 0;

    // Mutated Skin & Muscle Colors
    const skinColor = '#553C9A'; // Corrupted Dark Purple
    const muscleHighlight = '#805AD5'; // Radiant Purple
    const veinColor = isPrep ? '#FF0055' : '#EF4444'; // Pulsating Bioluminescent Blood Veins

    // 1. Volcanic Ground Fissures & Shadow
    if (enemy.isGrounded) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 44, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ground fissure glowing cracks
      ctx.strokeStyle = '#9F7AEA';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-32, 0);
      ctx.lineTo(-14, 2);
      ctx.lineTo(0, 0);
      ctx.lineTo(18, 3);
      ctx.lineTo(34, 0);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Pulsating Titan Demonic Aura during Leap / Slam
    if (isSlam || isLeap || isPrep) {
      const auraGrad = ctx.createRadialGradient(0, -45, 10, 0, -45, 60);
      auraGrad.addColorStop(0, 'rgba(159, 122, 234, 0.5)');
      auraGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.35)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, -45, 60, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Heavy Mutated Legs with Torn Combat Pants
    const walkAnim = Math.sin(enemy.animFrame * 0.3) * 14;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1E293B'; // Heavy tactical combat pants

    if (isPrep || isImpact) {
      // Deep crouching squat
      ctx.beginPath();
      ctx.moveTo(-18, -30);
      ctx.lineTo(-34, -12);
      ctx.lineTo(-26, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(18, -30);
      ctx.lineTo(34, -12);
      ctx.lineTo(26, 0);
      ctx.stroke();
    } else if (isLeap || isSlam) {
      // Airborne tucked legs
      ctx.beginPath();
      ctx.moveTo(-16, -30);
      ctx.lineTo(-24, -18);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(16, -30);
      ctx.lineTo(24, -18);
      ctx.stroke();
    } else {
      // Lumbering stride
      ctx.beginPath();
      ctx.moveTo(-14, -30);
      ctx.lineTo(-16 - walkAnim, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(14, -30);
      ctx.lineTo(16 + walkAnim, 0);
      ctx.stroke();
    }

    // Heavy Steel-Toe Combat Boots
    ctx.fillStyle = '#0F172A';
    if (isPrep || isImpact) {
      ctx.fillRect(-36, -8, 18, 9);
      ctx.fillRect(18, -8, 18, 9);
    }

    // 3. Colossal Muscular Torso (V-taper Titan Berserker Body)
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.moveTo(-38, -78);
    ctx.lineTo(38, -78);
    ctx.lineTo(24, -32);
    ctx.lineTo(-24, -32);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1A202C';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Defined Massive Pectorals & 6-Pack Abs
    ctx.fillStyle = muscleHighlight;
    ctx.fillRect(-32, -74, 28, 20);
    ctx.fillRect(4, -74, 28, 20);
    ctx.fillRect(-18, -50, 16, 8);
    ctx.fillRect(2, -50, 16, 8);
    ctx.fillRect(-18, -40, 16, 7);
    ctx.fillRect(2, -40, 7, 7);

    // Pulsating Bioluminescent Corrupted Veins
    const veinFlow = Math.sin(Date.now() * 0.008);
    ctx.strokeStyle = veinColor;
    ctx.lineWidth = 2.5 + veinFlow * 0.5;
    ctx.beginPath();
    ctx.moveTo(-28, -72);
    ctx.lineTo(-16, -60);
    ctx.lineTo(-8, -48);
    ctx.moveTo(28, -72);
    ctx.lineTo(16, -60);
    ctx.lineTo(8, -48);
    ctx.stroke();

    // Jagged Demonic Bone Spikes Growing Out of Back
    ctx.fillStyle = '#EDF2F7';
    ctx.beginPath();
    ctx.moveTo(-36, -72);
    ctx.lineTo(-54, -84);
    ctx.lineTo(-32, -60);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(36, -72);
    ctx.lineTo(54, -84);
    ctx.lineTo(32, -60);
    ctx.closePath();
    ctx.fill();

    // Shattered Tank Armor Plates Bolted to Shoulders with Heavy Chains
    ctx.fillStyle = '#374151';
    ctx.fillRect(-44, -82, 22, 10);
    ctx.fillRect(22, -82, 22, 10);
    ctx.fillStyle = '#9CA3AF'; // Chain links across chest
    for (let cx = -26; cx <= 26; cx += 8) {
      ctx.fillRect(cx, -62, 5, 3);
    }

    // 4. Giant Arms & Spiked Steel Knuckles
    ctx.fillStyle = skinColor;
    ctx.strokeStyle = '#1A202C';
    ctx.lineWidth = 2.5;

    if (isSlam) {
      // Double Meteor Fists pointing down!
      ctx.lineWidth = 16;
      ctx.strokeStyle = skinColor;
      ctx.beginPath();
      ctx.moveTo(-34, -72);
      ctx.lineTo(-12, -22);
      ctx.moveTo(34, -72);
      ctx.lineTo(12, -22);
      ctx.stroke();

      ctx.fillStyle = muscleHighlight;
      ctx.beginPath();
      ctx.arc(-12, -16, 18, 0, Math.PI * 2);
      ctx.arc(12, -16, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Purple lightning arc around fists
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-20, -16);
      ctx.lineTo(0, -26);
      ctx.lineTo(20, -16);
      ctx.stroke();

    } else if (isImpact) {
      // Smashed into floor with crater shockwaves
      ctx.lineWidth = 18;
      ctx.strokeStyle = skinColor;
      ctx.beginPath();
      ctx.moveTo(-34, -70);
      ctx.lineTo(-26, -10);
      ctx.lineTo(-14, 0);
      ctx.moveTo(34, -70);
      ctx.lineTo(26, -10);
      ctx.lineTo(14, 0);
      ctx.stroke();

      // Huge fists embedded in earth
      ctx.fillStyle = muscleHighlight;
      ctx.beginPath();
      ctx.arc(-14, 0, 18, 0, Math.PI * 2);
      ctx.arc(14, 0, 18, 0, Math.PI * 2);
      ctx.fill();

    } else if (isPrep) {
      // Flexing arms tight to chest
      ctx.lineWidth = 18;
      ctx.strokeStyle = skinColor;
      ctx.beginPath();
      ctx.moveTo(-34, -70);
      ctx.lineTo(-44, -50);
      ctx.lineTo(-18, -58);
      ctx.moveTo(34, -70);
      ctx.lineTo(44, -50);
      ctx.lineTo(18, -58);
      ctx.stroke();

    } else {
      // Walking / Stalking swinging giant arms
      const armSwing = Math.sin(enemy.animFrame * 0.3) * 12;
      ctx.lineWidth = 17;
      ctx.strokeStyle = skinColor;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-34, -72);
      ctx.lineTo(-44 - armSwing, -44);
      ctx.lineTo(-40 - armSwing * 1.3, -22);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(34, -72);
      ctx.lineTo(44 + armSwing, -44);
      ctx.lineTo(40 + armSwing * 1.3, -22);
      ctx.stroke();

      // Clenched Fists with Spiked Knuckles
      ctx.fillStyle = muscleHighlight;
      ctx.beginPath();
      ctx.arc(-40 - armSwing * 1.3, -22, 16, 0, Math.PI * 2);
      ctx.arc(40 + armSwing * 1.3, -22, 16, 0, Math.PI * 2);
      ctx.fill();

      // Steel Knuckle Spikes
      ctx.fillStyle = '#CBD5E0';
      ctx.fillRect(-44 - armSwing * 1.3, -24, 3, 5);
      ctx.fillRect(-38 - armSwing * 1.3, -24, 3, 5);
      ctx.fillRect(36 + armSwing * 1.3, -24, 3, 5);
      ctx.fillRect(42 + armSwing * 1.3, -24, 3, 5);
    }

    // 5. Head & Menacing Face
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -90, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1A202C';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Sharp Jawline & Exposed Demon Zombie Fangs
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(0, -85, 10, 0, Math.PI);
    ctx.fill();

    // Sharp Fangs with dripping venom
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-7, -85);
    ctx.lineTo(-5, -79);
    ctx.lineTo(-3, -85);
    ctx.moveTo(3, -85);
    ctx.lineTo(5, -79);
    ctx.lineTo(7, -85);
    ctx.fill();

    // Glowing Blood-Red Demonic Eyes (Double glowing pupils)
    ctx.fillStyle = '#E53E3E';
    ctx.beginPath();
    ctx.arc(-6, -92, 5, 0, Math.PI * 2);
    ctx.arc(6, -92, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFF00'; // Fiery Yellow Core
    ctx.fillRect(-7, -93, 2.5, 2.5);
    ctx.fillRect(5, -93, 2.5, 2.5);

    // Tattered General's Officer Cap (Torn & battered)
    ctx.fillStyle = '#742A2A';
    ctx.fillRect(-20, -108, 40, 11);
    ctx.fillStyle = '#ECC94B'; // Gold star badge
    ctx.fillRect(-5, -106, 10, 9);
    ctx.fillStyle = '#0F172A'; // Visor
    ctx.fillRect(-16, -100, 32, 4);

    ctx.restore();
  }

  // Render Bullets / Shotgun Pellets
  public renderBullets(bullets: Bullet[], cameraX: number) {
    const ctx = this.ctx;
    ctx.save();
    for (const b of bullets) {
      const bx = b.x - cameraX;
      const by = b.y;
      if (bx < -50 || bx > CANVAS_WIDTH + 50) continue;

      // Glow
      const glow = ctx.createRadialGradient(bx, by, 1, bx, by, 8);
      glow.addColorStop(0, '#FFF566');
      glow.addColorStop(0.5, '#FF8C00');
      glow.addColorStop(1, 'rgba(255, 69, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(bx, by, 8, 0, Math.PI * 2);
      ctx.fill();

      // Pellet core
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(bx, by, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Render Homing Missiles (Shootable by player!) - Made much bigger, clearer, with warning glow & health bar
  public renderMissiles(missiles: Missile[], cameraX: number) {
    const ctx = this.ctx;
    ctx.save();
    for (const m of missiles) {
      const mx = m.x - cameraX;
      const my = m.y;
      if (mx < -120 || mx > CANVAS_WIDTH + 120) continue;

      ctx.save();
      ctx.translate(mx, my);

      // Warning Aura / Glow Pulse
      const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 24);
      glow.addColorStop(0, 'rgba(255, 50, 50, 0.6)');
      glow.addColorStop(0.5, 'rgba(255, 140, 0, 0.3)');
      glow.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.rotate(m.angle);

      // Heavy Rocket Body (Larger dimensions: 28px long, 16px wide)
      ctx.fillStyle = '#C53030'; // Dark tactical red
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(-18, -8);
      ctx.lineTo(-24, -12); // Stabilizer fin top
      ctx.lineTo(-20, -4);
      ctx.lineTo(-24, 0);
      ctx.lineTo(-20, 4);
      ctx.lineTo(-24, 12); // Stabilizer fin bottom
      ctx.lineTo(-18, 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1A202C';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Yellow/Black Hazard Stripes on Missile Body
      ctx.fillStyle = '#ECC94B';
      ctx.fillRect(-6, -6, 6, 12);
      ctx.fillRect(4, -5, 6, 10);
      ctx.fillStyle = '#1A202C';
      ctx.fillRect(-3, -6, 3, 12);
      ctx.fillRect(7, -5, 3, 10);

      // Warhead Cone with Sharp Yellow/White Tip
      ctx.fillStyle = '#ECC94B';
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(10, -5);
      ctx.lineTo(10, 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(16, -2);
      ctx.lineTo(16, 2);
      ctx.closePath();
      ctx.fill();

      // Jet Thruster Exhaust Flame (Multi-stage animated fire)
      const fireLength = 16 + Math.random() * 12;
      // Outer Orange Fire
      ctx.fillStyle = '#FF6B00';
      ctx.beginPath();
      ctx.moveTo(-20, -5);
      ctx.lineTo(-20 - fireLength, 0);
      ctx.lineTo(-20, 5);
      ctx.closePath();
      ctx.fill();
      // Inner Yellow/White Core
      ctx.fillStyle = '#FFF566';
      ctx.beginPath();
      ctx.moveTo(-20, -2.5);
      ctx.lineTo(-20 - fireLength * 0.65, 0);
      ctx.lineTo(-20, 2.5);
      ctx.closePath();
      ctx.fill();

      // Health bar & "SHOOT!" label above missile (Non-rotated so it is crystal clear)
      ctx.rotate(-m.angle);
      const barW = 34;
      const barH = 5;
      ctx.fillStyle = '#1A202C';
      ctx.fillRect(-barW / 2 - 1, -26, barW + 2, barH + 2);
      const hpPct = Math.max(0, m.health / m.maxHealth);
      ctx.fillStyle = hpPct > 0.5 ? '#ECC94B' : '#E53E3E';
      ctx.fillRect(-barW / 2, -25, barW * hpPct, barH);

      // White outline around health bar
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(-barW / 2 - 1, -26, barW + 2, barH + 2);

      // Mini text prompt
      ctx.fillStyle = '#ECC94B';
      ctx.font = 'bold 8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MISSILE', 0, -30);

      ctx.restore();
    }
    ctx.restore();
  }

  // Render Particles (Explosions, Blood, Shell casings, Dust, Floating Combo Text)
  public renderParticles(particles: Particle[], cameraX: number) {
    const ctx = this.ctx;
    ctx.save();

    for (const p of particles) {
      const px = p.x - cameraX;
      const py = p.y;
      if (px < -50 || px > CANVAS_WIDTH + 50) continue;

      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;

      if (p.type === 'text') {
        ctx.fillStyle = p.color;
        ctx.font = `bold ${p.size}px "Press Start 2P", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(p.text || '', px, py);
      } else if (p.type === 'explosion') {
        const radius = p.size * (1 + (1 - alpha) * 1.5);
        const grad = ctx.createRadialGradient(px, py, 1, px, py, radius);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, '#ECC94B');
        grad.addColorStop(0.7, '#E53E3E');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'shell') {
        ctx.fillStyle = '#ECC94B';
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.rotation || 0);
        ctx.fillRect(-4, -2, 8, 4);
        ctx.restore();
      } else if (p.type === 'gib') {
        // === ZOMBIE DISMEMBERMENT PIECE (GIB) ===
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.rotation || 0);

        if (p.gibType === 'wing') {
          // Severed Crow Wing with Feather Tufts
          ctx.fillStyle = '#1A202C';
          ctx.beginPath();
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(p.size, -p.size * 0.7);
          ctx.lineTo(p.size * 0.7, 0);
          ctx.lineTo(p.size, p.size * 0.7);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#2D3748';
          ctx.beginPath();
          ctx.moveTo(-p.size * 0.5, 0);
          ctx.lineTo(p.size * 0.6, -p.size * 0.4);
          ctx.lineTo(p.size * 0.4, 0);
          ctx.closePath();
          ctx.fill();

          // Blood at wing joint
          ctx.fillStyle = '#9B2C2C';
          ctx.beginPath();
          ctx.arc(-p.size, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();

        } else if (p.gibType === 'beak') {
          // Severed Crow Beak
          ctx.fillStyle = '#ECC94B';
          ctx.beginPath();
          ctx.moveTo(-p.size, -p.size * 0.5);
          ctx.lineTo(p.size * 1.5, 0);
          ctx.lineTo(-p.size, p.size * 0.5);
          ctx.closePath();
          ctx.fill();

        } else if (p.gibType === 'head' && p.enemyType === 'crow') {
          // Severed Crow Head
          ctx.fillStyle = '#1A202C';
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ECC94B';
          ctx.beginPath();
          ctx.moveTo(p.size * 0.5, -2);
          ctx.lineTo(p.size * 1.6, 0);
          ctx.lineTo(p.size * 0.5, 2);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#E53E3E';
          ctx.fillRect(p.size * 0.2, -3, 2.5, 2.5);

          ctx.fillStyle = '#9B2C2C';
          ctx.beginPath();
          ctx.arc(-p.size * 0.7, 0, 3, 0, Math.PI * 2);
          ctx.fill();

        } else if (p.gibType === 'head') {
          // Severed Zombie Head
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#1A202C';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Zombie Yellow Eye
          ctx.fillStyle = '#ECC94B';
          ctx.beginPath();
          ctx.arc(p.size * 0.35, -p.size * 0.2, p.size * 0.25, 0, Math.PI * 2);
          ctx.fill();

          // Bloody neck stump
          ctx.fillStyle = '#9B2C2C';
          ctx.beginPath();
          ctx.arc(0, p.size * 0.8, p.size * 0.45, 0, Math.PI);
          ctx.fill();

        } else if (p.gibType === 'torso') {
          // Broken Torso & Exposed Ribs
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size, -p.size * 0.7, p.size * 2, p.size * 1.4);
          ctx.strokeStyle = '#1A202C';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-p.size, -p.size * 0.7, p.size * 2, p.size * 1.4);

          // Exposed spine/ribs (Bone)
          ctx.fillStyle = '#EDF2F7';
          ctx.fillRect(-p.size * 0.3, p.size * 0.5, p.size * 0.6, p.size * 0.6);

          // Blood patch
          ctx.fillStyle = '#9B2C2C';
          ctx.fillRect(-p.size * 0.6, 0, p.size * 1.2, p.size * 0.5);

        } else if (p.gibType === 'arm') {
          // Severed Arm Segment
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(p.size, 0);
          ctx.stroke();

          // Bone stump
          ctx.fillStyle = '#EDF2F7';
          ctx.beginPath();
          ctx.arc(-p.size, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Blood drip
          ctx.fillStyle = '#9B2C2C';
          ctx.beginPath();
          ctx.arc(-p.size + 2, 0, 3, 0, Math.PI * 2);
          ctx.fill();

        } else if (p.gibType === 'leg') {
          // Severed Leg Segment with Boot
          ctx.strokeStyle = '#2D3748';
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(p.size, 0);
          ctx.stroke();

          // Boot / foot
          ctx.fillStyle = '#1A202C';
          ctx.fillRect(p.size - 3, -3, 6, 6);

          // Bone stump
          ctx.fillStyle = '#EDF2F7';
          ctx.beginPath();
          ctx.arc(-p.size, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();

        } else if (p.gibType === 'bone') {
          // Ivory Bone Fragment
          ctx.fillStyle = '#EDF2F7';
          ctx.fillRect(-p.size * 1.5, -2, p.size * 3, 4);
          ctx.beginPath();
          ctx.arc(-p.size * 1.5, -2, 2.5, 0, Math.PI * 2);
          ctx.arc(-p.size * 1.5, 2, 2.5, 0, Math.PI * 2);
          ctx.arc(p.size * 1.5, -2, 2.5, 0, Math.PI * 2);
          ctx.arc(p.size * 1.5, 2, 2.5, 0, Math.PI * 2);
          ctx.fill();

        } else {
          // Bloody Flesh Chunk
          ctx.fillStyle = '#9B2C2C';
          ctx.beginPath();
          ctx.moveTo(-p.size, -p.size * 0.5);
          ctx.lineTo(p.size, -p.size * 0.7);
          ctx.lineTo(p.size * 0.6, p.size * 0.8);
          ctx.lineTo(-p.size * 0.8, p.size * 0.6);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      } else if (p.type === 'feather') {
        // Floating Raven / Crow Feather
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.rotation || 0);
        ctx.fillStyle = '#1A202C';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 2, p.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4A5568';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-p.size * 2.2, 0);
        ctx.lineTo(p.size * 2.2, 0);
        ctx.stroke();
        ctx.restore();
      } else if (p.type === 'shockwave') {
        // Ground Tremor Energy Shockwave Ring/Arc
        ctx.save();
        ctx.translate(px, py);
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, p.size);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.3, `rgba(159, 122, 234, ${alpha * 0.9})`);
        grad.addColorStop(0.7, `rgba(229, 62, 62, ${alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(107, 70, 193, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Jagged electric / energy crest on ground
        ctx.strokeStyle = '#ECC94B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -2, p.size * 0.7, Math.PI * 0.85, Math.PI * 0.15, true);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // Render Razor Ticket Cards (Spinning golden-edged tickets shot by Ticket Master)
  public renderTicketCards(cards: TicketCard[], cameraX: number) {
    const ctx = this.ctx;
    ctx.save();
    for (const card of cards) {
      const cx = card.x - cameraX;
      const cy = card.y;
      if (cx < -50 || cx > CANVAS_WIDTH + 50) continue;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(card.angle);

      // Glowing aura
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
      glow.addColorStop(0, 'rgba(255, 215, 0, 0.7)');
      glow.addColorStop(0.5, 'rgba(229, 62, 62, 0.4)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Card Base (Razor-Sharp Train Ticket)
      ctx.fillStyle = '#FFF5F5';
      ctx.fillRect(-12, -7, 24, 14);
      ctx.strokeStyle = '#ECC94B';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-12, -7, 24, 14);

      // Red Railway Stamp / Barcode
      ctx.fillStyle = '#E53E3E';
      ctx.fillRect(-10, -5, 8, 10);
      ctx.fillStyle = '#1A202C';
      for (let bx = 0; bx < 8; bx += 2) {
        ctx.fillRect(bx, -4, 1.2, 8);
      }

      // Razor cutting edge glint
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-12, -7);
      ctx.lineTo(-6, -7);
      ctx.lineTo(-12, -1);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  // Render Colossal Mech Boss (Background Titan Robot)
  public renderMechBoss(mech: MechBoss, cameraX: number) {
    const ctx = this.ctx;
    if (!mech || !mech.active) return;

    const mx = mech.arenaCenterX - cameraX;
    const my = mech.riseY; // 0 when fully risen

    ctx.save();

    // 1. Arena Border Forcefield Warning Walls
    const leftWallX = mech.arenaLeft - cameraX;
    const rightWallX = mech.arenaRight - cameraX;

    // Left barrier
    ctx.strokeStyle = 'rgba(229, 62, 62, 0.85)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(leftWallX, 0);
    ctx.lineTo(leftWallX, GROUND_Y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(229, 62, 62, 0.2)';
    ctx.fillRect(leftWallX - 40, 0, 40, GROUND_Y);

    // Right barrier
    ctx.strokeStyle = 'rgba(229, 62, 62, 0.85)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(rightWallX, 0);
    ctx.lineTo(rightWallX, GROUND_Y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(229, 62, 62, 0.2)';
    ctx.fillRect(rightWallX, 0, 40, GROUND_Y);

    // 2. Colossus Body (Titan Mech in Background)
    ctx.translate(mx, my);

    // Colossal Torso & Arm Shoulders
    // Huge Dual Industrial Exhaust Smokestacks with Billowing Plumes
    ctx.fillStyle = '#111827';
    ctx.fillRect(-175, 50, 28, 90);
    ctx.fillRect(147, 50, 28, 90);
    ctx.fillStyle = '#374151';
    ctx.fillRect(-178, 45, 34, 8);
    ctx.fillRect(144, 45, 34, 8);

    // Exhaust Heat Glow & Spark Flakes
    if (Math.random() < 0.7) {
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(-161, 40 - Math.random() * 15, 3 + Math.random() * 3, 0, Math.PI * 2);
      ctx.arc(161, 40 - Math.random() * 15, 3 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Heavy Pauldrons / Shoulder Armor
    ctx.fillStyle = '#1F2937';
    ctx.beginPath();
    ctx.roundRect(-220, 105, 95, 85, 14);
    ctx.fill();
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(125, 105, 95, 85, 14);
    ctx.fill();
    ctx.stroke();

    // Dual Shoulder Salvo Missile Pods (4x2 missile arrays on each shoulder)
    for (let rx = -210; rx <= -140; rx += 22) {
      for (let ry = 120; ry <= 165; ry += 22) {
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(rx, ry, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ECC94B';
        ctx.beginPath();
        ctx.arc(rx, ry, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (let rx = 145; rx <= 215; rx += 22) {
      for (let ry = 120; ry <= 165; ry += 22) {
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(rx, ry, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ECC94B';
        ctx.beginPath();
        ctx.arc(rx, ry, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Hazard Stripes on Pauldron Edges
    for (let sx = -215; sx < -130; sx += 18) {
      ctx.fillStyle = '#ECC94B';
      ctx.beginPath();
      ctx.moveTo(sx, 185);
      ctx.lineTo(sx + 10, 185);
      ctx.lineTo(sx + 16, 172);
      ctx.lineTo(sx + 6, 172);
      ctx.closePath();
      ctx.fill();
    }
    for (let sx = 135; sx < 215; sx += 18) {
      ctx.fillStyle = '#ECC94B';
      ctx.beginPath();
      ctx.moveTo(sx, 185);
      ctx.lineTo(sx + 10, 185);
      ctx.lineTo(sx + 16, 172);
      ctx.lineTo(sx + 6, 172);
      ctx.closePath();
      ctx.fill();
    }

    // Heavy Main Chassis / Chest (Dark gunmetal & reinforced composite)
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.moveTo(-145, 140);
    ctx.lineTo(145, 140);
    ctx.lineTo(118, 350);
    ctx.lineTo(-118, 350);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Front Chest Reinforced Crimson Armor Plates
    ctx.fillStyle = '#7F1D1D'; // Heavy military crimson
    ctx.fillRect(-100, 160, 200, 130);
    ctx.strokeStyle = '#ECC94B';
    ctx.lineWidth = 3;
    ctx.strokeRect(-100, 160, 200, 130);

    // Twin Cooling Fan Turbine Grilles on Chest
    const fanSpin = Date.now() * 0.02;
    for (const fx of [-65, 65]) {
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(fx, 195, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Spinning Turbine Blades
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 3;
      for (let a = 0; a < 4; a++) {
        const ang = fanSpin + (a * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(fx, 195);
        ctx.lineTo(fx + Math.cos(ang) * 18, 195 + Math.sin(ang) * 18);
        ctx.stroke();
      }
    }

    // Dynamic HUD Diagnostic Text on Chest Armor
    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TITAN-UNIT // MK-IV', 0, 180);
    ctx.fillStyle = mech.shielded ? '#38BDF8' : '#EF4444';
    ctx.fillText(mech.shielded ? 'SHIELD: ACTIVE [100%]' : 'CORE: VULNERABLE', 0, 275);

    // Glowing Central Reactor Core (High Power Dark-Matter Core)
    const coreGlow = ctx.createRadialGradient(0, 225, 5, 0, 225, 50);
    if (mech.shielded) {
      coreGlow.addColorStop(0, '#60A5FA');
      coreGlow.addColorStop(0.5, '#2563EB');
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      coreGlow.addColorStop(0, '#FEF08A');
      coreGlow.addColorStop(0.4, '#EF4444');
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(0, 225, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = mech.shielded ? '#38BDF8' : '#EF4444';
    ctx.beginPath();
    ctx.arc(0, 225, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Reactor Core Containment Ring & Radiation Fins
    ctx.strokeStyle = '#ECC94B';
    ctx.lineWidth = 3;
    for (let ang = 0; ang < Math.PI * 2; ang += Math.PI / 3) {
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 22, 225 + Math.sin(ang) * 22);
      ctx.lineTo(Math.cos(ang) * 32, 225 + Math.sin(ang) * 32);
      ctx.stroke();
    }

    // 3. Colossus Head & Heavy Armored Visor
    const headHit = mech.headHitFlash > 0;
    ctx.fillStyle = headHit ? '#FFFFFF' : '#1E293B';
    ctx.beginPath();
    ctx.moveTo(-65, 45);
    ctx.lineTo(65, 45);
    ctx.lineTo(48, 145);
    ctx.lineTo(-48, 145);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Conductor Peaked Cap on Giant Mech Head!
    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    ctx.moveTo(-75, 45);
    ctx.lineTo(75, 45);
    ctx.lineTo(60, 20);
    ctx.lineTo(-60, 20);
    ctx.closePath();
    ctx.fill();
    // Gold winged badge & double ribbons
    ctx.fillStyle = '#ECC94B';
    ctx.fillRect(-14, 25, 28, 14);
    ctx.fillRect(-65, 42, 130, 4);
    // Visor rim
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-70, 44, 140, 9);

    // Multi-Faceted Optical Sensor Visor
    const eyeFlash = mech.eyeFlash || Math.sin(Date.now() * 0.01) > 0.6;
    ctx.fillStyle = eyeFlash ? '#FF0033' : '#DC2626';
    ctx.fillRect(-40, 72, 34, 16);
    ctx.fillRect(6, 72, 34, 16);
    ctx.fillStyle = '#FEF08A'; // Pupil scanner
    ctx.fillRect(-26, 76, 10, 8);
    ctx.fillRect(16, 76, 10, 8);

    // Laser Rangefinder Crosshair on Visor
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-21, 72);
    ctx.lineTo(-21, 88);
    ctx.moveTo(21, 72);
    ctx.lineTo(21, 88);
    ctx.stroke();

    // Head Shield Dome (when active)
    if (mech.shielded) {
      ctx.save();
      const shieldGlow = ctx.createRadialGradient(0, 85, 30, 0, 85, 105);
      shieldGlow.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
      shieldGlow.addColorStop(0.8, 'rgba(56, 189, 248, 0.65)');
      shieldGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = shieldGlow;
      ctx.beginPath();
      ctx.arc(0, 85, 105, 0, Math.PI * 2);
      ctx.fill();

      // Hex ring lines & shield pulse
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 85, 96, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // Render Foreground Elements for Mech Boss (Hands gripping pavement, Laser Beams)
  public renderMechBossForeground(mech: MechBoss, cameraX: number) {
    const ctx = this.ctx;
    if (!mech || !mech.active) return;

    ctx.save();

    // 1. Render Left & Right Cybernetic Hands
    const renderHand = (hand: MechBoss['leftHand']) => {
      if (hand.state === 'destroyed') return;
      const hx = hand.x - cameraX;
      const hy = hand.y;
      const hit = hand.hitFlash > 0;

      ctx.save();
      ctx.translate(hx, hy);

      // Warning target line if preparing slam
      if (hand.state === 'slam_prep') {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, GROUND_Y - hy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ground warning marker
        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.fillRect(-50, GROUND_Y - hy - 10, 100, 10);
      }

      // Mechanical Arm Joint from background
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(hand.side === 'left' ? -90 : 90, -100);
      ctx.lineTo(0, -10);
      ctx.stroke();

      // Arm High-Pressure Fluid Hydraulics
      ctx.strokeStyle = '#ECC94B';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(hand.side === 'left' ? -75 : 75, -90);
      ctx.lineTo(0, -20);
      ctx.stroke();

      // Hand Fist Chassis Base
      ctx.fillStyle = hit ? '#FFFFFF' : '#0F172A';
      ctx.beginPath();
      ctx.roundRect(-42, -36, 84, 60, 12);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Armor plate with hazard stripes
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(-32, -28, 64, 36);
      ctx.fillStyle = '#ECC94B';
      ctx.fillRect(-22, -24, 12, 28);
      ctx.fillRect(10, -24, 12, 28);

      // Glowing Energy Conduit on Back of Hand
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(-8, -26, 16, 8);

      // Heavy Segmented Mechanical Fingers Gripping Pavement
      ctx.fillStyle = hit ? '#FFFFFF' : '#334155';
      for (let fx = -32; fx <= 22; fx += 18) {
        ctx.beginPath();
        ctx.roundRect(fx, 14, 14, 22, 5);
        ctx.fill();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Finger Plasma Cutting Torch Tip
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(fx + 3, 30, 8, 5);
        ctx.fillStyle = hit ? '#FFFFFF' : '#334155';
      }

      // Electric spark arcs when resting on ground
      if (hand.state === 'grip' && Math.random() < 0.3) {
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo((Math.random() - 0.5) * 40, 28);
        ctx.lineTo((Math.random() - 0.5) * 50, 36);
        ctx.stroke();
      }

      // Hand Health Bar (above hand)
      const barW = 60;
      const barH = 6;
      const hpPct = Math.max(0, hand.health / hand.maxHealth);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-barW / 2 - 1, -48, barW + 2, barH + 2);
      ctx.fillStyle = hpPct > 0.5 ? '#ECC94B' : '#EF4444';
      ctx.fillRect(-barW / 2, -47, barW * hpPct, barH);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(-barW / 2 - 1, -48, barW + 2, barH + 2);

      // Text indicator
      ctx.fillStyle = '#ECC94B';
      ctx.font = 'bold 7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(hand.side === 'left' ? 'L-HAND' : 'R-HAND', 0, -52);

      ctx.restore();
    };

    renderHand(mech.leftHand);
    renderHand(mech.rightHand);

    // 2. Active Vertical Orbital Laser Pillars (เสาเลเซอร์แนวตั้ง พร้อมสัญญาณเตือนที่ชัดเจน)
    if (mech.currentAttack === 'laser_spam' && mech.verticalPillars) {
      const t = mech.laserPatternTimer;

      for (const pillar of mech.verticalPillars) {
        const px = pillar.x - cameraX;
        const pw = pillar.width;

        if (t <= 90) {
          // === Warning Telegraph Phase (1 <= t <= 90) ===
          // Pulsing vertical warning beam column
          const pulse = 0.2 + Math.abs(Math.sin(t * 0.18)) * 0.35;
          ctx.fillStyle = `rgba(255, 30, 30, ${pulse})`;
          ctx.fillRect(px - pw / 2, 0, pw, GROUND_Y);

          // Boundary dashed warning lasers
          ctx.strokeStyle = '#FF2222';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.moveTo(px - pw / 2, 0);
          ctx.lineTo(px - pw / 2, GROUND_Y);
          ctx.moveTo(px + pw / 2, 0);
          ctx.lineTo(px + pw / 2, GROUND_Y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Ground Target Lock Crosshair & Warning Marker
          ctx.strokeStyle = '#FF0055';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(px, GROUND_Y - 8, 30, 0, Math.PI * 2);
          ctx.stroke();

          // Crosshair lines
          ctx.beginPath();
          ctx.moveTo(px - 36, GROUND_Y - 8);
          ctx.lineTo(px + 36, GROUND_Y - 8);
          ctx.stroke();

          // Pulsing warning text
          if (t % 12 < 8) {
            ctx.fillStyle = '#FF0055';
            ctx.font = 'bold 9px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️ DANGER ⚠️', px, GROUND_Y - 50);
          }
        } else if (t <= 160) {
          // === Active Plasma Laser Firing Phase (91 <= t <= 160) ===
          // Outer Colossal Plasma Glow
          const outerGlow = ctx.createLinearGradient(px - pw / 2 - 15, 0, px + pw / 2 + 15, 0);
          outerGlow.addColorStop(0, 'rgba(255, 0, 85, 0)');
          outerGlow.addColorStop(0.2, 'rgba(255, 0, 85, 0.6)');
          outerGlow.addColorStop(0.5, 'rgba(0, 240, 255, 0.9)');
          outerGlow.addColorStop(0.8, 'rgba(255, 0, 85, 0.6)');
          outerGlow.addColorStop(1, 'rgba(255, 0, 85, 0)');
          ctx.fillStyle = outerGlow;
          ctx.fillRect(px - pw / 2 - 20, 0, pw + 40, GROUND_Y);

          // Blinding Core White-Hot Laser Column
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(px - pw / 4, 0, pw / 2, GROUND_Y);

          // Ground Impact Blast Ring & Sparks
          const impactGlow = ctx.createRadialGradient(px, GROUND_Y, 5, px, GROUND_Y, 55);
          impactGlow.addColorStop(0, '#FFFFFF');
          impactGlow.addColorStop(0.4, '#00F0FF');
          impactGlow.addColorStop(1, 'rgba(255, 0, 85, 0)');
          ctx.fillStyle = impactGlow;
          ctx.beginPath();
          ctx.ellipse(px, GROUND_Y, 55, 20, 0, 0, Math.PI * 2);
          ctx.fill();

          // Electrical Arc Lines across the column
          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          let arcY = 0;
          ctx.moveTo(px + (Math.random() - 0.5) * pw, arcY);
          while (arcY < GROUND_Y) {
            arcY += 30 + Math.random() * 25;
            ctx.lineTo(px + (Math.random() - 0.5) * (pw * 0.8), arcY);
          }
          ctx.stroke();
        }
      }
    }

    // 3. Aimed Chest Laser Cannon (ลำแสงเลเซอร์ยิงจากกลางหน้าอก พร้อมสัญญาณเตือนทิศทาง)
    if (mech.chestLaser) {
      const cl = mech.chestLaser;
      const originX = mech.arenaCenterX - cameraX;
      const originY = 150 + mech.riseY;
      const beamLen = 950;
      const endX = originX + Math.cos(cl.angle) * beamLen;
      const endY = originY + Math.sin(cl.angle) * beamLen;

      if (cl.timer <= cl.maxTelegraph) {
        // === Telegraph Aiming Phase (Directional Warning Laser Pointer) ===
        const pulse = 0.4 + Math.abs(Math.sin(cl.timer * 0.25)) * 0.55;

        // Aiming Guideline Beam
        ctx.strokeStyle = `rgba(255, 0, 85, ${pulse * 0.9})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Core charging spark vortex
        const chargeGlow = ctx.createRadialGradient(originX, originY, 2, originX, originY, 35);
        chargeGlow.addColorStop(0, '#FFFFFF');
        chargeGlow.addColorStop(0.4, '#FF0055');
        chargeGlow.addColorStop(1, 'rgba(255, 0, 85, 0)');
        ctx.fillStyle = chargeGlow;
        ctx.beginPath();
        ctx.arc(originX, originY, 35, 0, Math.PI * 2);
        ctx.fill();

        // Target Lock Crosshairs at ground/wall intersection
        // Estimate ground intersection point
        const tGround = cl.angle > 0 ? (GROUND_Y - originY) / Math.sin(cl.angle) : beamLen;
        const groundHitX = originX + Math.cos(cl.angle) * Math.min(beamLen, Math.max(0, tGround));
        const groundHitY = originY + Math.sin(cl.angle) * Math.min(beamLen, Math.max(0, tGround));

        ctx.strokeStyle = '#FF0055';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(groundHitX, groundHitY, 26, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(groundHitX - 32, groundHitY);
        ctx.lineTo(groundHitX + 32, groundHitY);
        ctx.moveTo(groundHitX, groundHitY - 32);
        ctx.lineTo(groundHitX, groundHitY + 32);
        ctx.stroke();

        // Floating Danger Warning Text
        if (cl.timer % 12 < 8) {
          ctx.fillStyle = '#FF0055';
          ctx.font = 'bold 9px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('⚠️ AIM LOCK: CHEST CANNON ⚠️', originX, originY - 45);
        }
      } else {
        // === Firing Phase: Colossal Piercing Hyper Plasma Laser ===
        const bw = cl.beamWidth;

        // Outer Plasma Beam
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
        ctx.lineWidth = bw + 18;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Secondary Magenta Outer Flare
        ctx.strokeStyle = 'rgba(255, 0, 128, 0.85)';
        ctx.lineWidth = bw + 6;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Core White-Hot Laser
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = bw * 0.45;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Muzzle Flare & Chest Core Discharge
        const muzzleGlow = ctx.createRadialGradient(originX, originY, 5, originX, originY, 65);
        muzzleGlow.addColorStop(0, '#FFFFFF');
        muzzleGlow.addColorStop(0.35, '#00F0FF');
        muzzleGlow.addColorStop(0.7, '#FF0055');
        muzzleGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = muzzleGlow;
        ctx.beginPath();
        ctx.arc(originX, originY, 65, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    ctx.restore();
  }

  // Render falling rocks / debris projectiles scattered by Boss slam
  public renderFallingRocks(rocks: FallingRock[], cameraX: number) {
    const ctx = this.ctx;
    ctx.save();

    for (const rock of rocks) {
      const rx = rock.x - cameraX;
      const ry = rock.y;
      const targetScreenX = (rock.targetX !== undefined ? rock.targetX : rock.x) - cameraX;

      if (targetScreenX < -100 && rx < -100) continue;
      if (targetScreenX > CANVAS_WIDTH + 100 && rx > CANVAS_WIDTH + 100) continue;

      const groundDist = Math.max(0, GROUND_Y - ry);
      const proximity = Math.max(0, Math.min(1, 1 - groundDist / 380));
      const pulse = 0.4 + Math.abs(Math.sin(Date.now() * 0.015 + rock.radius)) * 0.5;

      // 1. Ground Landing Telegraph & Danger Indicator Marker (จุดที่หินจะตกลงมา)
      ctx.save();

      // Red/Orange danger landing ellipse on ground
      ctx.fillStyle = `rgba(237, 137, 54, ${0.25 + proximity * 0.45})`;
      ctx.beginPath();
      ctx.ellipse(targetScreenX, GROUND_Y - 3, rock.radius * 1.6, rock.radius * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing border ring
      ctx.strokeStyle = proximity > 0.6 ? '#E53E3E' : '#ED8936';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(targetScreenX, GROUND_Y - 3, rock.radius * 1.4, rock.radius * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Landing Target Crosshair
      ctx.strokeStyle = `rgba(229, 62, 62, ${0.5 + pulse * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(targetScreenX - rock.radius * 1.6, GROUND_Y - 3);
      ctx.lineTo(targetScreenX + rock.radius * 1.6, GROUND_Y - 3);
      ctx.stroke();

      // Downward trajectory dotted line from rock to landing spot
      if (ry < GROUND_Y - 20) {
        ctx.strokeStyle = `rgba(237, 137, 54, ${0.25 + proximity * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(targetScreenX, GROUND_Y - 3);
        ctx.stroke();
        ctx.setLineDash([]);

        // Downward warning arrow just above the landing zone
        const arrowY = GROUND_Y - 14 - Math.sin(Date.now() * 0.012) * 4;
        ctx.fillStyle = '#E53E3E';
        ctx.beginPath();
        ctx.moveTo(targetScreenX - 5, arrowY - 6);
        ctx.lineTo(targetScreenX + 5, arrowY - 6);
        ctx.lineTo(targetScreenX, arrowY);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // 2. Ground Shadow under current rock position
      const shadowScale = Math.max(0.15, 1 - groundDist / 360);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(rx, GROUND_Y - 2, rock.radius * 1.2 * shadowScale, rock.radius * 0.45 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Rock Body with rotation and fiery debris details
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(rock.rotation);

      // Faceted jagged rock polygon
      ctx.fillStyle = '#4A5568';
      ctx.strokeStyle = '#1A202C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const sides = 6;
      const r = rock.radius;
      for (let s = 0; s < sides; s++) {
        const angle = (s / sides) * Math.PI * 2;
        const dist = r * (0.8 + ((s * 3) % 4) * 0.1);
        const px = Math.cos(angle) * dist;
        const py = Math.sin(angle) * dist;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Shading facets & glowing lava/debris crack lines
      ctx.fillStyle = '#718096';
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.8);
      ctx.lineTo(r * 0.7, 0);
      ctx.lineTo(0, r * 0.7);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ED8936';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, -r * 0.3);
      ctx.lineTo(0, 0);
      ctx.lineTo(r * 0.4, r * 0.3);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  // Render Thrown Tactical Bombs
  public renderBombs(bombs: Bomb[], cameraX: number) {
    const ctx = this.ctx;
    if (!bombs || bombs.length === 0) return;

    ctx.save();

    for (const b of bombs) {
      const bx = b.x - cameraX;
      const by = b.y;

      if (bx < -80 || bx > CANVAS_WIDTH + 80) continue;

      // Ground Shadow
      const groundDist = Math.max(0, GROUND_Y - by);
      const shadowScale = Math.max(0.2, 1 - groundDist / 200);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(bx, GROUND_Y - 2, 14 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing Blast Radius Preview when close to exploding (fuse < 40)
      if (b.fuse < 45) {
        const pulse = 0.5 + 0.5 * Math.sin(b.fuse * 0.4);
        ctx.strokeStyle = `rgba(237, 137, 54, ${0.3 * pulse})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(bx, by, b.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Bomb Body
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(b.rotation);

      // Dark military steel sphere
      const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 12);
      grad.addColorStop(0, '#4A5568');
      grad.addColorStop(0.6, '#2D3748');
      grad.addColorStop(1, '#1A202C');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      // Golden hazard band
      ctx.fillStyle = '#ECC94B';
      ctx.fillRect(-11, -3, 22, 5);

      // Black hazard hazard stripes
      ctx.fillStyle = '#1A202C';
      for (let s = -8; s < 10; s += 6) {
        ctx.beginPath();
        ctx.moveTo(s, -3);
        ctx.lineTo(s + 3, -3);
        ctx.lineTo(s, 2);
        ctx.lineTo(s - 3, 2);
        ctx.fill();
      }

      // Bomb cap & Fuse nozzle
      ctx.fillStyle = '#718096';
      ctx.fillRect(-4, -15, 8, 4);

      // Burning Fuse
      const fuseFrac = b.fuse / b.maxFuse;
      ctx.strokeStyle = '#D69E2E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.quadraticCurveTo(6, -20, 4 * fuseFrac, -15 - 10 * fuseFrac);
      ctx.stroke();

      // Sparking tip
      const tipX = 4 * fuseFrac;
      const tipY = -15 - 10 * fuseFrac;
      ctx.fillStyle = '#FF0055';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 3 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ECC94B';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  // Render Quarantine Barricade / Gate at the end of the stage
  public renderStageBarricade(
    stage: StageConfig,
    stageZombiesKilled: number,
    stageZombiesTotal: number,
    cameraX: number
  ) {
    const ctx = this.ctx;
    if (stage.id === 3) return; // Stage 3 doesn't use standard barricade

    const gateX = stage.mapLength - 140 - cameraX;
    if (gateX < -150 || gateX > CANVAS_WIDTH + 150) return;

    ctx.save();
    const remaining = Math.max(0, stageZombiesTotal - stageZombiesKilled);
    const isLocked = remaining > 0;

    // Heavy Security Steel Posts
    ctx.fillStyle = '#2D3748';
    ctx.fillRect(gateX - 10, GROUND_Y - 220, 20, 220);
    ctx.fillStyle = '#4A5568';
    ctx.fillRect(gateX - 6, GROUND_Y - 215, 12, 210);

    // Hazard Stripes on post
    ctx.fillStyle = '#ECC94B';
    for (let y = GROUND_Y - 210; y < GROUND_Y; y += 30) {
      ctx.fillRect(gateX - 8, y, 16, 12);
    }

    if (isLocked) {
      // Locked State: High-voltage laser barrier + warning sign
      const time = Date.now() * 0.005;
      const pulse = 0.6 + 0.4 * Math.sin(time * 3);

      // Warning Beacon on Top
      ctx.fillStyle = '#E53E3E';
      ctx.beginPath();
      ctx.arc(gateX, GROUND_Y - 230, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(229, 62, 62, ${0.4 * pulse})`;
      ctx.beginPath();
      ctx.arc(gateX, GROUND_Y - 230, 24, 0, Math.PI * 2);
      ctx.fill();

      // Red Laser Grid
      for (let ly = GROUND_Y - 190; ly < GROUND_Y; ly += 24) {
        ctx.strokeStyle = `rgba(229, 62, 62, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FF0055';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(gateX, ly);
        ctx.lineTo(gateX + 90, ly);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Heavy Security Sign
      ctx.fillStyle = 'rgba(26, 32, 44, 0.92)';
      ctx.strokeStyle = '#E53E3E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(gateX - 90, GROUND_Y - 275, 180, 42, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FED7D7';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⛔ QUARANTINE LOCKED', gateX, GROUND_Y - 258);
      ctx.fillStyle = '#FEB2B2';
      ctx.font = '10px sans-serif';
      ctx.fillText(`ELIMINATE ${remaining} ZOMBIES TO UNLOCK`, gateX, GROUND_Y - 244);
    } else {
      // Unlocked State: Green Open Gate + EXIT neon sign
      const time = Date.now() * 0.005;
      const pulse = 0.7 + 0.3 * Math.sin(time * 4);

      // Green Beacon on Top
      ctx.fillStyle = '#48BB78';
      ctx.beginPath();
      ctx.arc(gateX, GROUND_Y - 230, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(72, 187, 120, ${0.4 * pulse})`;
      ctx.beginPath();
      ctx.arc(gateX, GROUND_Y - 230, 26, 0, Math.PI * 2);
      ctx.fill();

      // Open Gate Sign
      ctx.fillStyle = 'rgba(26, 32, 44, 0.92)';
      ctx.strokeStyle = '#48BB78';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(gateX - 85, GROUND_Y - 275, 170, 42, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#68D391';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🟢 GATE UNLOCKED', gateX, GROUND_Y - 258);
      ctx.fillStyle = '#C6F6D5';
      ctx.font = '11px sans-serif';
      ctx.fillText('PROCEED TO NEXT STAGE →', gateX, GROUND_Y - 244);
    }

    ctx.restore();
  }

  // Render Zombie Radar / Off-screen Indicators pointing to remaining zombies
  public renderZombieRadar(
    enemies: Enemy[],
    stage: StageConfig,
    stageZombiesKilled: number,
    stageZombiesTotal: number,
    cameraX: number,
    playerX: number
  ) {
    const ctx = this.ctx;
    if (stage.id === 3) return; // Stage 3 doesn't require radar

    ctx.save();

    const livingZombies = enemies.filter(
      e => e.health > 0 && e.type !== 'boss_ticket' && e.type !== 'boss_mech' && e.type !== 'boss_tank' && e.type !== 'boss_mutant'
    );

    const remainingCount = Math.max(0, stageZombiesTotal - stageZombiesKilled);
    const time = Date.now() * 0.006;
    const pulse = 0.7 + 0.3 * Math.sin(time * 3);

    // 1. Off-Screen Zombie Indicators on Left / Right screen margins
    let leftCount = 0;
    let rightCount = 0;
    let nearestLeftDist = Infinity;
    let nearestRightDist = Infinity;

    for (const e of livingZombies) {
      if (e.x < cameraX) {
        leftCount++;
        nearestLeftDist = Math.min(nearestLeftDist, (cameraX - e.x) / 10);
      } else if (e.x > cameraX + CANVAS_WIDTH) {
        rightCount++;
        nearestRightDist = Math.min(nearestRightDist, (e.x - (cameraX + CANVAS_WIDTH)) / 10);
      }
    }

    // Left Off-screen Indicator
    if (leftCount > 0) {
      const leftY = CANVAS_HEIGHT / 2 - 20;
      ctx.fillStyle = `rgba(229, 62, 62, ${pulse})`;
      ctx.beginPath();
      ctx.moveTo(12, leftY);
      ctx.lineTo(24, leftY - 10);
      ctx.lineTo(24, leftY + 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(26, 32, 44, 0.9)';
      ctx.strokeStyle = '#E53E3E';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(28, leftY - 14, 88, 28, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FEB2B2';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🧟 x${leftCount} (${Math.round(nearestLeftDist)}m)`, 34, leftY + 4);
    }

    // Right Off-screen Indicator
    if (rightCount > 0) {
      const rightY = CANVAS_HEIGHT / 2 - 20;
      ctx.fillStyle = `rgba(229, 62, 62, ${pulse})`;
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH - 12, rightY);
      ctx.lineTo(CANVAS_WIDTH - 24, rightY - 10);
      ctx.lineTo(CANVAS_WIDTH - 24, rightY + 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(26, 32, 44, 0.9)';
      ctx.strokeStyle = '#E53E3E';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(CANVAS_WIDTH - 120, rightY - 14, 92, 28, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FEB2B2';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🧟 x${rightCount} (${Math.round(nearestRightDist)}m)`, CANVAS_WIDTH - 114, rightY + 4);
    }

    // 2. On-screen Target Beacons above living zombies if 6 or fewer remain
    if (remainingCount <= 6 && remainingCount > 0) {
      for (const e of livingZombies) {
        const ex = e.x - cameraX;
        const ey = e.y - e.height - 18;
        if (ex > 20 && ex < CANVAS_WIDTH - 20) {
          // Floating animated downward red arrow beacon
          const bob = Math.sin(time * 4) * 4;
          ctx.fillStyle = '#FF0055';
          ctx.beginPath();
          ctx.moveTo(ex, ey + bob);
          ctx.lineTo(ex - 6, ey - 8 + bob);
          ctx.lineTo(ex + 6, ey - 8 + bob);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  // Render Stage 2 Sub-Boss: Colossal Human Zombie Titan (ซอมบี้มนุษย์ร่างยักษ์)
  public renderTallShadowBoss(boss: TallShadowBoss, cameraX: number) {
    if (!boss || !boss.active) return;
    const ctx = this.ctx;
    const screenX = boss.x - cameraX;
    const screenHandX = boss.handX - cameraX;
    const isHit = boss.hitFlash > 0;
    const isHandHit = boss.handHitFlash > 0;
    const time = Date.now() * 0.003;
    const pulse = 0.5 + Math.sin(time * 3) * 0.5;

    ctx.save();

    // Human Zombie Color Palette
    const cSkin = isHit ? '#FFFFFF' : '#4E5D58'; // Necrotic pale corpse skin
    const cSkinShadow = isHit ? '#FFFFFF' : '#33403B';
    const cSkinHighlight = isHit ? '#FFFFFF' : '#687D75';
    const cSuit = isHit ? '#FFFFFF' : '#1E293B'; // Shredded dark suit jacket & pants
    const cSuitDark = isHit ? '#FFFFFF' : '#0F172A';
    const cShirt = isHit ? '#FFFFFF' : '#CBD5E1'; // Tattered white shirt
    const cBlood = isHit ? '#FFFFFF' : '#7F1D1D'; // Dried coagulated blood
    const cFreshBlood = isHit ? '#FFFFFF' : '#DC2626';
    const cTie = isHit ? '#FFFFFF' : '#991B1B'; // Torn red necktie
    const cHair = isHit ? '#FFFFFF' : '#18181B'; // Dark disheveled human hair
    const cVein = isHit ? '#FFFFFF' : '#312E81'; // Necrotic infected purple veins
    const cEyeSclera = isHit ? '#FFFFFF' : '#5C1D24';
    const cEyeGlow = isHit ? '#FFFFFF' : '#EF4444';
    const cPupil = isHit ? '#FFFFFF' : '#FEF08A';
    const cTeeth = isHit ? '#FFFFFF' : '#FEF3C7';
    const cNails = isHit ? '#FFFFFF' : '#1F2937';

    // 1. Telegraph Warning Indicator for Hand Slam Attack (Slower, clear indicators)
    if (boss.currentAttack === 'hand_slam' && boss.slamState === 'prep') {
      const targetScreenX = boss.slamTargetX - cameraX;
      ctx.save();

      // Ground Hazard Circle
      const rX = 85;
      const rY = 22;
      ctx.fillStyle = `rgba(220, 38, 38, ${0.25 + pulse * 0.35})`;
      ctx.beginPath();
      ctx.ellipse(targetScreenX, GROUND_Y - 3, rX, rY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hazard Boundary Stroke
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Guide Beam from Hand to Ground
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.4})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(screenHandX, boss.handY + 20);
      ctx.lineTo(targetScreenX, GROUND_Y - 3);
      ctx.stroke();

      // Crosshairs on Ground
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(targetScreenX - 60, GROUND_Y - 3);
      ctx.lineTo(targetScreenX + 60, GROUND_Y - 3);
      ctx.moveTo(targetScreenX, GROUND_Y - 3 - rY);
      ctx.lineTo(targetScreenX, GROUND_Y - 3 + rY);
      ctx.stroke();

      // Warning Badge
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(targetScreenX - 85, GROUND_Y - 50, 170, 24, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F87171';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ DANGER: GIANT FIST SLAM! ⚠️', targetScreenX, GROUND_Y - 34);

      ctx.restore();
    }

    // 2. Telegraph Warning Indicator for Car Throw Attack
    if (boss.currentAttack === 'car_throw' && boss.carThrowState === 'grab') {
      const targetScreenX = boss.carThrowTargetX - cameraX;
      ctx.save();

      // Hazard Zone on Ground
      const cW = 80;
      const cH = 20;
      ctx.fillStyle = `rgba(234, 88, 12, ${0.3 + pulse * 0.35})`;
      ctx.beginPath();
      ctx.ellipse(targetScreenX, GROUND_Y - 3, cW, cH, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#EA580C';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([7, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Curved Trajectory Arc
      const midX = (screenHandX - 40 + targetScreenX) / 2;
      const midY = -50;
      ctx.strokeStyle = `rgba(234, 88, 12, ${0.5 + pulse * 0.4})`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(screenHandX - 40, boss.handY);
      ctx.quadraticCurveTo(midX, midY, targetScreenX, GROUND_Y - 3);
      ctx.stroke();
      ctx.setLineDash([]);

      // Warning Badge
      ctx.fillStyle = '#1A120B';
      ctx.strokeStyle = '#EA580C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(targetScreenX - 85, GROUND_Y - 50, 170, 24, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FB923C';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ FLYING CAR IMPACT! ⚠️', targetScreenX, GROUND_Y - 34);

      ctx.restore();
    }

    // 3. Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(screenX, GROUND_Y - 2, 130, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Humanoid Zombie Lower Body (Legs & Torn Suit Trousers)
    // Left Leg
    ctx.fillStyle = cSuitDark;
    ctx.strokeStyle = '#0B0F17';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(screenX - 70, 220);
    ctx.lineTo(screenX - 90, 310);
    ctx.lineTo(screenX - 95, GROUND_Y - 15);
    ctx.lineTo(screenX - 50, GROUND_Y - 15);
    ctx.lineTo(screenX - 45, 310);
    ctx.lineTo(screenX - 30, 220);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Left Boot
    ctx.fillStyle = '#090D14';
    ctx.beginPath();
    ctx.roundRect(screenX - 110, GROUND_Y - 18, 70, 18, 4);
    ctx.fill();
    ctx.stroke();

    // Right Leg
    ctx.fillStyle = cSuit;
    ctx.beginPath();
    ctx.moveTo(screenX + 25, 220);
    ctx.lineTo(screenX + 45, 310);
    ctx.lineTo(screenX + 45, GROUND_Y - 15);
    ctx.lineTo(screenX + 90, GROUND_Y - 15);
    ctx.lineTo(screenX + 85, 310);
    ctx.lineTo(screenX + 65, 220);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Boot
    ctx.fillStyle = '#090D14';
    ctx.beginPath();
    ctx.roundRect(screenX + 40, GROUND_Y - 18, 70, 18, 4);
    ctx.fill();
    ctx.stroke();

    // Torn Knee Gash on Right Leg exposing decaying flesh & bone
    ctx.fillStyle = cSkin;
    ctx.beginPath();
    ctx.ellipse(screenX + 65, 310, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cBlood;
    ctx.fillRect(screenX + 58, 305, 14, 8);

    // 5. Colossal Human Zombie Torso & Shredded Clothes (Y = 40 to 220)
    ctx.save();
    ctx.translate(screenX, 0);

    // Breathing motion
    const breathY = Math.sin(time * 2) * 3;

    // Muscular Necrotic Zombie Chest & Abs (Human Anatomy)
    ctx.fillStyle = cSkinShadow;
    ctx.strokeStyle = '#0B0F17';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-75, 40 + breathY);
    ctx.lineTo(-65, 220);
    ctx.lineTo(65, 220);
    ctx.lineTo(75, 40 + breathY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Muscular Pectoral Definition
    ctx.fillStyle = cSkin;
    // Left Pec
    ctx.beginPath();
    ctx.roundRect(-60, 60 + breathY, 55, 42, 8);
    ctx.fill();
    // Right Pec
    ctx.beginPath();
    ctx.roundRect(5, 60 + breathY, 55, 42, 8);
    ctx.fill();

    // Abdominal Muscles (6-Pack Definition)
    for (let abY = 115; abY <= 185; abY += 32) {
      ctx.fillStyle = cSkinHighlight;
      ctx.beginPath();
      ctx.roundRect(-42, abY + breathY * 0.5, 38, 24, 6);
      ctx.roundRect(4, abY + breathY * 0.5, 38, 24, 6);
      ctx.fill();
    }

    // Prominent Infected Veins running across torso
    ctx.strokeStyle = cVein;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-50, 70);
    ctx.lineTo(-30, 95);
    ctx.lineTo(-10, 130);
    ctx.lineTo(-25, 165);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(45, 75);
    ctx.lineTo(25, 105);
    ctx.lineTo(15, 145);
    ctx.stroke();

    // Shredded White Dress Shirt (Layered under torn suit jacket)
    ctx.fillStyle = cShirt;
    ctx.beginPath();
    ctx.moveTo(-70, 45 + breathY);
    ctx.lineTo(-50, 55 + breathY);
    ctx.lineTo(-45, 130);
    ctx.lineTo(-68, 145);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(70, 45 + breathY);
    ctx.lineTo(50, 55 + breathY);
    ctx.lineTo(45, 130);
    ctx.lineTo(68, 145);
    ctx.closePath();
    ctx.fill();

    // Blood Splatters on Shirt
    ctx.fillStyle = cBlood;
    ctx.fillRect(-62, 70 + breathY, 14, 28);
    ctx.fillRect(52, 85 + breathY, 12, 22);

    // Shredded Dark Business Suit Jacket (Torn wide open)
    ctx.fillStyle = cSuit;
    ctx.strokeStyle = '#0B0F17';
    ctx.lineWidth = 3;

    // Left Jacket Lapel & Side
    ctx.beginPath();
    ctx.moveTo(-78, 40 + breathY);
    ctx.lineTo(-42, 85 + breathY);
    ctx.lineTo(-62, 175);
    ctx.lineTo(-76, 215);
    ctx.lineTo(-84, 130);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Jacket Lapel & Side
    ctx.beginPath();
    ctx.moveTo(78, 40 + breathY);
    ctx.lineTo(42, 85 + breathY);
    ctx.lineTo(62, 175);
    ctx.lineTo(76, 215);
    ctx.lineTo(84, 130);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Torn Shredded Red Necktie (Hanging from collar down between pecs)
    ctx.fillStyle = cTie;
    ctx.strokeStyle = '#5B1111';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6, 45 + breathY);
    ctx.lineTo(6, 45 + breathY);
    ctx.lineTo(10, 80 + breathY);
    ctx.lineTo(4, 120 + breathY);
    ctx.lineTo(0, 135 + breathY); // Torn jagged bottom tip
    ctx.lineTo(-4, 120 + breathY);
    ctx.lineTo(-10, 80 + breathY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 6. Colossal Human Zombie Neck & Head (Human Anatomy, Face, Eyes, Hair)
    // Muscular Neck
    ctx.fillStyle = cSkin;
    ctx.strokeStyle = '#0B0F17';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-32, 45 + breathY);
    ctx.lineTo(-28, -25 + breathY);
    ctx.lineTo(28, -25 + breathY);
    ctx.lineTo(32, 45 + breathY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Torn Shirt Collar
    ctx.fillStyle = cShirt;
    ctx.beginPath();
    ctx.moveTo(-36, 42 + breathY);
    ctx.lineTo(-12, 45 + breathY);
    ctx.lineTo(-24, 25 + breathY);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(36, 42 + breathY);
    ctx.lineTo(12, 45 + breathY);
    ctx.lineTo(24, 25 + breathY);
    ctx.closePath();
    ctx.fill();

    // Human Zombie Head (Cranium, Jaw, Ears, Hair)
    const headY = -35 + breathY;

    // Human Cranium & Chin
    ctx.fillStyle = cSkin;
    ctx.strokeStyle = '#0B0F17';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-38, headY); // Left temple
    ctx.lineTo(-44, headY - 55); // Left ear
    ctx.lineTo(-32, headY - 110); // Left top skull
    ctx.lineTo(0, headY - 125); // Top crown
    ctx.lineTo(32, headY - 110); // Right top skull
    ctx.lineTo(44, headY - 55); // Right ear
    ctx.lineTo(38, headY); // Right temple
    ctx.lineTo(28, headY + 38); // Right jaw
    ctx.lineTo(0, headY + 50); // Chin
    ctx.lineTo(-28, headY + 38); // Left jaw
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Left Human Ear
    ctx.fillStyle = cSkinShadow;
    ctx.beginPath();
    ctx.ellipse(-44, headY - 45, 6, 12, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Torn Zombie Ear
    ctx.fillStyle = cSkinShadow;
    ctx.beginPath();
    ctx.moveTo(42, headY - 52);
    ctx.lineTo(48, headY - 46);
    ctx.lineTo(43, headY - 38);
    ctx.closePath();
    ctx.fill();

    // Messy Disheveled Dark Human Hair
    ctx.fillStyle = cHair;
    ctx.beginPath();
    ctx.moveTo(-44, headY - 70);
    ctx.lineTo(-38, headY - 115);
    ctx.lineTo(-22, headY - 135);
    ctx.lineTo(-5, headY - 130);
    ctx.lineTo(12, headY - 140);
    ctx.lineTo(28, headY - 130);
    ctx.lineTo(42, headY - 115);
    ctx.lineTo(46, headY - 70);
    ctx.lineTo(35, headY - 95);
    ctx.lineTo(15, headY - 110);
    ctx.lineTo(-10, headY - 105);
    ctx.lineTo(-30, headY - 95);
    ctx.closePath();
    ctx.fill();

    // Strands of hair hanging over forehead
    ctx.strokeStyle = cHair;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-15, headY - 105);
    ctx.lineTo(-18, headY - 78);
    ctx.moveTo(5, headY - 110);
    ctx.lineTo(8, headY - 72);
    ctx.moveTo(22, headY - 100);
    ctx.lineTo(18, headY - 75);
    ctx.stroke();

    // Temple Wound with Exposed Skull Bone & Blood
    ctx.fillStyle = '#E2E8F0'; // Exposed skull bone
    ctx.beginPath();
    ctx.ellipse(22, headY - 80, 8, 12, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cBlood;
    ctx.fillRect(18, headY - 72, 8, 16);

    // Deep Sunk-in Human Eye Sockets
    ctx.fillStyle = '#1A1820';
    ctx.beginPath();
    // Left socket
    ctx.ellipse(-18, headY - 50, 11, 8, 0, 0, Math.PI * 2);
    // Right socket
    ctx.ellipse(18, headY - 50, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Bloodshot Diseased Zombie Eyes
    const eyeSize = 6 + Math.sin(boss.eyePulse) * 1.5;

    // Sclera
    ctx.fillStyle = cEyeSclera;
    ctx.beginPath();
    ctx.ellipse(-18, headY - 50, 8, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(18, headY - 50, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Red Iris
    ctx.fillStyle = cEyeGlow;
    ctx.beginPath();
    ctx.arc(-18, headY - 50, eyeSize, 0, Math.PI * 2);
    ctx.arc(18, headY - 50, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Bright Center Pupil
    ctx.fillStyle = cPupil;
    ctx.beginPath();
    ctx.arc(-18, headY - 50, 2.5, 0, Math.PI * 2);
    ctx.arc(18, headY - 50, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Furrowed Brow / Wrinkles
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-28, headY - 60);
    ctx.lineTo(-10, headY - 56);
    ctx.lineTo(0, headY - 62);
    ctx.lineTo(10, headY - 56);
    ctx.lineTo(28, headY - 60);
    ctx.stroke();

    // Human Nose with Decayed Cartilage
    ctx.fillStyle = cSkinShadow;
    ctx.beginPath();
    ctx.moveTo(0, headY - 55);
    ctx.lineTo(-6, headY - 20);
    ctx.lineTo(0, headY - 14);
    ctx.lineTo(6, headY - 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dark Nostril Cavities
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(-3, headY - 18, 2.5, 0, Math.PI * 2);
    ctx.arc(3, headY - 18, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Open Decaying Human Zombie Mouth & Teeth Grimace
    ctx.fillStyle = '#11090C'; // Dark oral cavity
    ctx.strokeStyle = '#0B0F17';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-24, headY - 2);
    ctx.lineTo(24, headY - 2);
    ctx.lineTo(18, headY + 22);
    ctx.lineTo(-18, headY + 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Upper Human Teeth Row (Yellowed incisors & canines)
    ctx.fillStyle = cTeeth;
    for (let tX = -18; tX <= 14; tX += 5) {
      ctx.beginPath();
      ctx.roundRect(tX, headY - 1, 4, 7, 1);
      ctx.fill();
    }

    // Lower Human Teeth Row
    for (let tX = -14; tX <= 10; tX += 5) {
      ctx.beginPath();
      ctx.roundRect(tX, headY + 15, 4, 7, 1);
      ctx.fill();
    }

    // Blood Dripping from Mouth
    ctx.fillStyle = cFreshBlood;
    ctx.fillRect(-8, headY + 22, 4, 12);
    ctx.fillRect(6, headY + 22, 3, 8);

    ctx.restore();

    // 7. Colossal Human Zombie Arms (Shoulder, Bicep, Forearm, 5-Fingered Hand)
    // Background Left Arm (Resting on Right side of screen)
    ctx.fillStyle = cSuitDark;
    ctx.strokeStyle = '#0B0F17';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(screenX + 60, 45);
    ctx.lineTo(screenX + 115, 110);
    ctx.lineTo(screenX + 125, 200);
    ctx.lineTo(screenX + 110, 280);
    ctx.lineTo(screenX + 80, 275);
    ctx.lineTo(screenX + 95, 195);
    ctx.lineTo(screenX + 85, 115);
    ctx.lineTo(screenX + 45, 55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Left Fist Clenched
    ctx.fillStyle = cSkin;
    ctx.beginPath();
    ctx.roundRect(screenX + 85, 275, 32, 28, 6);
    ctx.fill();
    ctx.stroke();

    // Active Attacking Right Arm (Human Arm with bicep, elbow, veiny forearm)
    const sX = screenX - 60;
    const sY = 45;
    const eX = (sX + screenHandX) / 2 - 30;
    const eY = (sY + boss.handY) / 2 - 40;

    // Upper Arm / Shoulder with Torn Suit Sleeve
    ctx.fillStyle = cSuit;
    ctx.strokeStyle = '#0B0F17';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(sX - 22, sY);
    ctx.lineTo(eX - 22, eY);
    ctx.lineTo(eX + 22, eY + 10);
    ctx.lineTo(sX + 20, sY + 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Torn Sleeve Hem
    ctx.fillStyle = cShirt;
    ctx.beginPath();
    ctx.moveTo(eX - 24, eY - 2);
    ctx.lineTo(eX + 24, eY + 8);
    ctx.lineTo(eX + 20, eY + 16);
    ctx.lineTo(eX - 22, eY + 6);
    ctx.closePath();
    ctx.fill();

    // Muscular Zombie Forearm (Exposed Necrotic Flesh with Veins)
    ctx.fillStyle = cSkin;
    ctx.beginPath();
    ctx.moveTo(eX - 18, eY + 12);
    ctx.lineTo(screenHandX - 24, boss.handY - 14);
    ctx.lineTo(screenHandX + 22, boss.handY - 4);
    ctx.lineTo(eX + 20, eY + 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Forearm Veins
    ctx.strokeStyle = cVein;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eX, eY + 18);
    ctx.lineTo(screenHandX - 5, boss.handY - 10);
    ctx.stroke();

    // 8. Colossal Human Zombie Hand (5 Fingers, Thumb, Knuckles, Black Nails at screenHandX, boss.handY)
    ctx.save();
    ctx.translate(screenHandX, boss.handY);

    // Weakpoint Telegraph when Resting on Ground
    if (boss.slamState === 'rest') {
      const wR = 56 + Math.sin(time * 5) * 6;
      ctx.strokeStyle = `rgba(236, 201, 75, ${0.7 + pulse * 0.3})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([7, 5]);

      // Weakpoint Ring
      ctx.beginPath();
      ctx.arc(0, 0, wR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Weakpoint Badge
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#ECC94B';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-95, -60, 190, 26, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ECC94B';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💥 WEAKPOINT! STRIKE HAND! 💥', 0, -43);
    }

    // Human Palm & Wrist
    ctx.fillStyle = isHandHit || isHit ? '#FFFFFF' : cSkin;
    ctx.strokeStyle = isHandHit || isHit ? '#ECC94B' : '#0B0F17';
    ctx.lineWidth = 3.5;

    // Palm base
    ctx.beginPath();
    ctx.roundRect(-30, -14, 60, 42, 10);
    ctx.fill();
    ctx.stroke();

    // Palm Creases & Veins
    ctx.strokeStyle = cSkinShadow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-18, 5);
    ctx.lineTo(12, 18);
    ctx.moveTo(-12, -4);
    ctx.lineTo(18, 8);
    ctx.stroke();

    // 5 Human Fingers (Thumb on left, 4 Main Fingers)
    // 1. Human Thumb
    ctx.save();
    ctx.translate(-26, 6);
    ctx.rotate(-0.7);
    ctx.fillStyle = isHandHit || isHit ? '#FFFFFF' : cSkin;
    ctx.strokeStyle = isHandHit || isHit ? '#ECC94B' : '#0B0F17';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-8, 0, 16, 32, 6);
    ctx.fill();
    ctx.stroke();
    // Thumb nail
    ctx.fillStyle = cNails;
    ctx.beginPath();
    ctx.roundRect(-5, 20, 10, 9, 2);
    ctx.fill();
    ctx.restore();

    // 2-5: Four Human Fingers (Index, Middle, Ring, Pinky)
    const fingerConfigs = [
      { x: -16, len: 46, rot: -0.22, w: 13 }, // Index
      { x: -4, len: 54, rot: -0.05, w: 14 }, // Middle (Longest)
      { x: 9, len: 48, rot: 0.12, w: 13 }, // Ring
      { x: 21, len: 38, rot: 0.28, w: 12 }, // Pinky
    ];

    for (const f of fingerConfigs) {
      ctx.save();
      ctx.translate(f.x, 22);
      ctx.rotate(f.rot);

      // Proximal Phalanx
      ctx.fillStyle = isHandHit || isHit ? '#FFFFFF' : cSkin;
      ctx.strokeStyle = isHandHit || isHit ? '#ECC94B' : '#0B0F17';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.roundRect(-f.w / 2, 0, f.w, f.len, 5);
      ctx.fill();
      ctx.stroke();

      // Knuckle Crease Lines
      ctx.strokeStyle = cSkinShadow;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-f.w / 2 + 2, f.len * 0.4);
      ctx.lineTo(f.w / 2 - 2, f.len * 0.4);
      ctx.moveTo(-f.w / 2 + 2, f.len * 0.7);
      ctx.lineTo(f.w / 2 - 2, f.len * 0.7);
      ctx.stroke();

      // Dirty/Blackened Human Fingernail
      ctx.fillStyle = cNails;
      ctx.beginPath();
      ctx.roundRect(-f.w / 2 + 2.5, f.len - 12, f.w - 5, 10, 2);
      ctx.fill();

      // Blood on Fingertip
      ctx.fillStyle = cFreshBlood;
      ctx.fillRect(-f.w / 2 + 3, f.len - 4, f.w - 6, 3);

      ctx.restore();
    }

    // If grabbing car: render held crushed car caught in giant zombie hand
    if (boss.currentAttack === 'car_throw' && boss.carThrowState === 'grab') {
      ctx.save();
      ctx.translate(-40, -10);
      ctx.rotate(-0.15);
      this.drawCarGraphic(ctx, boss.heldCarType, 0);
      ctx.restore();
    }

    ctx.restore();
    ctx.restore();
  }

  // Helper method to draw crushed 90s car graphics
  private drawCarGraphic(ctx: CanvasRenderingContext2D, carType: number, rotation: number) {
    ctx.save();
    ctx.rotate(rotation);

    const bodyColors = ['#9B2C2C', '#2B6CB0', '#D69E2E']; // Red sedan, Blue pickup, Yellow taxi
    const roofColors = ['#742A2A', '#2C5282', '#B7791F'];
    const carColor = bodyColors[carType % 3];
    const roofColor = roofColors[carType % 3];

    // Car Body Hull
    ctx.fillStyle = carColor;
    ctx.strokeStyle = '#1A202C';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-42, -14, 84, 28, 5);
    ctx.fill();
    ctx.stroke();

    // Cabin Roof & Windows
    ctx.fillStyle = roofColor;
    ctx.fillRect(-18, -26, 42, 14);
    ctx.strokeRect(-18, -26, 42, 14);

    // Shattered Windows Glass
    ctx.fillStyle = '#63B3ED';
    ctx.fillRect(-14, -23, 16, 10);
    ctx.fillRect(5, -23, 15, 10);

    // Front/Rear Bumpers
    ctx.fillStyle = '#718096';
    ctx.fillRect(-45, -8, 6, 16);
    ctx.fillRect(39, -8, 6, 16);

    // Glowing Headlights
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(-44, -12, 4, 6);
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(40, -12, 4, 6);

    // Wheels / Tires
    ctx.fillStyle = '#1A202C';
    ctx.beginPath();
    ctx.arc(-24, 14, 9, 0, Math.PI * 2);
    ctx.arc(24, 14, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#A0AEC0';
    ctx.beginPath();
    ctx.arc(-24, 14, 4, 0, Math.PI * 2);
    ctx.arc(24, 14, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Render Thrown Cars Hurtling through the Air
  public renderThrownCars(cars: ThrownCar[], cameraX: number) {
    if (!cars || cars.length === 0) return;
    const ctx = this.ctx;

    for (const car of cars) {
      const screenX = car.x - cameraX;
      if (screenX < -100 || screenX > CANVAS_WIDTH + 100) continue;

      ctx.save();

      // Ground Shadow
      const groundDist = Math.max(0, GROUND_Y - car.y);
      const shadowScale = Math.max(0.2, 1 - groundDist / 350);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(screenX, GROUND_Y - 2, 44 * shadowScale, 14 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Render rotating car with trail
      ctx.translate(screenX, car.y);
      this.drawCarGraphic(ctx, car.carType, car.rotation);

      ctx.restore();
    }
  }
}

