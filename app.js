/* ----------------------------------------------------
   Shinobi Portfolio Engine - Kuncham Venkat
   ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. STATE & CORE CONFIGURATION
  // ==========================================
  const state = {
    currentTheme: 'katon', // raiton, katon, inton, futon
    keystrokeHistory: [],
    maxHistoryKeys: 25,
    cursor: { x: null, y: null }
  };

  // DOM Elements Cache
  const htmlEl = document.documentElement;
  const plexusCanvas = document.getElementById('plexus-canvas');
  const keypressCanvas = document.getElementById('keypress-canvas');
  const keystrokeBuffer = document.getElementById('keystroke-buffer');
  const navLinks = document.querySelectorAll('.hud-nav a');
  const scrollContainer = document.querySelector('.hud-content');
  const sections = document.querySelectorAll('.hud-section');
  const terminalInput = document.getElementById('terminal-input');
  const terminalHistory = document.querySelector('.terminal-history');
  const terminalForm = document.getElementById('terminal-form');
  const summoningSeal = document.querySelector('.summoning-seal-outer');
  
  // Telemetry Elements
  const telLat = document.getElementById('tel-lat');
  const telLng = document.getElementById('tel-lng');
  const telFps = document.getElementById('tel-fps');
  const telTime = document.getElementById('tel-time');

  // Track Mouse coordinates globally
  window.addEventListener('mousemove', (e) => {
    state.cursor.x = e.clientX;
    state.cursor.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    state.cursor.x = null;
    state.cursor.y = null;
  });

  // ==========================================
  // 2. SHARINGAN HOVER SEQUENCE & THEMING
  // ==========================================
  const sharinganWrapper = document.querySelector('.sharingan-blob-wrapper');
  const detailsCard = document.querySelector('.rinnegan-details-card');
  let stageTimer = null;
  let checkLeaveTimer = null;
  let isHoveringWrapper = false;
  let isHoveringCard = false;

  function enableRinneganMode() {
    clearTimeout(stageTimer);
    sharinganWrapper.classList.add('stage-mangekyou');
    logTerminal('[SYSTEM] Ocular visualization loaded. Initiating Mangekyou rendering...', 'term-red');

    stageTimer = setTimeout(() => {
      sharinganWrapper.classList.remove('stage-mangekyou');
      sharinganWrapper.classList.add('stage-rinnegan');
      
      htmlEl.setAttribute('data-theme', 'rinnegan');
      state.currentTheme = 'inton';
      if (telLng) telLng.textContent = 'RINNEGAN_INTEGRATION';

      logTerminal('[SYSTEM] RINNEGAN PROTOCOL ACTIVE! Concentric matrix ripple channels loaded.', 'term-purple');
      triggerSealPulse();
    }, 700);
  }

  function disableRinneganMode() {
    clearTimeout(stageTimer);
    sharinganWrapper.classList.remove('stage-mangekyou');
    sharinganWrapper.classList.remove('stage-rinnegan');
    
    htmlEl.setAttribute('data-theme', 'katon');
    state.currentTheme = 'katon';
    if (telLng) telLng.textContent = 'FIRE_RED';

    logTerminal('[SYSTEM] Ocular visual idle. Returning telemetry states to stable.', 'term-blue');
  }

  function checkHoverOff() {
    clearTimeout(checkLeaveTimer);
    checkLeaveTimer = setTimeout(() => {
      if (!isHoveringWrapper && !isHoveringCard) {
        disableRinneganMode();
      }
    }, 80);
  }

  if (sharinganWrapper) {
    sharinganWrapper.addEventListener('mouseenter', () => {
      isHoveringWrapper = true;
      if (!sharinganWrapper.classList.contains('stage-rinnegan') && !sharinganWrapper.classList.contains('stage-mangekyou')) {
        enableRinneganMode();
      }
    });

    sharinganWrapper.addEventListener('mouseleave', () => {
      isHoveringWrapper = false;
      checkHoverOff();
    });
  }

  if (detailsCard) {
    detailsCard.addEventListener('mouseenter', () => {
      isHoveringCard = true;
    });

    detailsCard.addEventListener('mouseleave', () => {
      isHoveringCard = false;
      checkHoverOff();
    });
  }

  // ==========================================
  // 3. TELEMETRY DYNAMICS SYSTEM (Canvas Plexus)
  // ==========================================
  const ctx = plexusCanvas.getContext('2d');
  let particles = [];
  const particleCount = 65;
  const connectionDistance = 130;

  function resizePlexus() {
    plexusCanvas.width = window.innerWidth;
    plexusCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizePlexus);
  resizePlexus();

  class Particle {
    constructor() {
      this.reset();
      this.x = Math.random() * plexusCanvas.width;
      this.y = Math.random() * plexusCanvas.height;
    }

    reset() {
      this.x = Math.random() * plexusCanvas.width;
      this.y = Math.random() * plexusCanvas.height;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.radius = Math.random() * 2.5 + 1;
      this.life = 1.0;
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - 0.5) * 0.05;
    }

    update() {
      const theme = state.currentTheme;

      if (theme === 'katon') {
        // Fire style: Warm particles rise upwards like glowing embers
        this.vy -= 0.015;
        this.vx += (Math.random() - 0.5) * 0.1;
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap/Respawn boundaries
        if (this.y < 0 || this.x < 0 || this.x > plexusCanvas.width) {
          this.reset();
          this.y = plexusCanvas.height;
        }
      } else if (theme === 'futon') {
        // Wind style: Swirling circular waves
        this.angle += this.spinSpeed;
        this.x += this.vx + Math.cos(this.angle) * 0.4;
        this.y += this.vy + Math.sin(this.angle) * 0.4;

        if (this.x < 0 || this.x > plexusCanvas.width || this.y < 0 || this.y > plexusCanvas.height) {
          this.reset();
        }
      } else {
        // Raiton & Inton: standard drifting
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = plexusCanvas.width;
        if (this.x > plexusCanvas.width) this.x = 0;
        if (this.y < 0) this.y = plexusCanvas.height;
        if (this.y > plexusCanvas.height) this.y = 0;
      }

      // Mouse Attraction/Repulsion
      if (state.cursor.x !== null && state.cursor.y !== null) {
        const dx = state.cursor.x - this.x;
        const dy = state.cursor.y - this.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < 160) {
          const force = (160 - dist) / 1600;
          if (theme === 'raiton') {
            // Lightning style: Aggressively attracted to mouse
            this.vx += (dx / dist) * force * 1.5;
            this.vy += (dy / dist) * force * 1.5;
          } else {
            // Other styles: Gently repelled
            this.vx -= (dx / dist) * force;
            this.vy -= (dy / dist) * force;
          }
        }
      }

      // Speed caps
      const speed = Math.hypot(this.vx, this.vy);
      const maxSpeed = theme === 'raiton' ? 2.5 : 1.2;
      if (speed > maxSpeed) {
        this.vx = (this.vx / speed) * maxSpeed;
        this.vy = (this.vy / speed) * maxSpeed;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Generate Particle Array
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function getPrimaryColorGlow() {
    return getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
  }

  // Draw a crackling electric line between points for Raiton
  function drawLightningLine(x1, y1, x2, y2, alpha) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);

    // Number of crackle jumps based on distance
    const segments = Math.max(3, Math.floor(dist / 20));
    let cx = x1;
    let cy = y1;

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      // Target straight line point
      const tx = x1 + dx * t;
      const ty = y1 + dy * t;
      // Crackle offset perpendicular to path
      const offset = (Math.random() - 0.5) * 8;
      const angle = Math.atan2(dy, dx) + Math.PI / 2;
      
      cx = tx + Math.cos(angle) * offset;
      cy = ty + Math.sin(angle) * offset;
      ctx.lineTo(cx, cy);
    }
    
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `rgba(${hexToRgb(getPrimaryColorGlow())}, ${alpha})`;
    ctx.lineWidth = Math.random() * 0.8 + 0.3; // fluctuating lightning thickness
    ctx.stroke();
  }

  function animatePlexus() {
    ctx.clearRect(0, 0, plexusCanvas.width, plexusCanvas.height);
    
    const primaryColor = getPrimaryColorGlow();
    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = primaryColor;

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.18;
          if (state.currentTheme === 'raiton') {
            // Lightning Release crackling paths
            drawLightningLine(particles[i].x, particles[i].y, particles[j].x, particles[j].y, alpha * 1.5);
          } else {
            // Standard straight connection lines
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${hexToRgb(primaryColor)}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    trackFPS();
    requestAnimationFrame(animatePlexus);
  }

  function hexToRgb(hex) {
    if (!hex.startsWith('#')) return '0, 242, 254'; 
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  animatePlexus();

  // ==========================================
  // 4. TELEMETRY DIAGNOSTIC KEYSTROKE CANVAS OVERLAY
  // ==========================================
  const kpCtx = keypressCanvas.getContext('2d');
  let sparks = [];
  let floatingSigns = [];

  const diagnosticSymbols = [
    'DEV', 'SYS', 'NET', 'SEC', 'CLD', 'API', 'DB', 'CPU', 'RAM', 'UX', // Tech tags
    '⚛', '⚡', '⌨', '⌬', '⚙', '★', '⌘', '⌥', '⇧', '⌗', '☀', '☁', '❄' // UI symbols
  ];

  function resizeKeypress() {
    keypressCanvas.width = window.innerWidth;
    keypressCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeKeypress);
  resizeKeypress();

  class Spark {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 10;
      this.vy = (Math.random() - 0.5) * 10;
      this.life = 1.0;
      this.decay = Math.random() * 0.04 + 0.02;
      this.size = Math.random() * 4 + 1.5;
      this.color = getPrimaryColorGlow();
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
    }

    draw() {
      kpCtx.beginPath();
      kpCtx.fillStyle = `rgba(${hexToRgb(this.color)}, ${this.life})`;
      kpCtx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
  }

  class FloatingSign {
    constructor(char, x, y) {
      this.char = char;
      this.x = x;
      this.y = y;
      this.vy = -(Math.random() * 2.5 + 1.5);
      this.vx = (Math.random() - 0.5) * 3;
      this.life = 1.0;
      this.decay = 0.016;
      this.fontSize = Math.random() * 20 + 20; // larger icons
      this.rotation = (Math.random() - 0.5) * 0.8;
      this.color = getPrimaryColorGlow();
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
    }

    draw() {
      kpCtx.save();
      kpCtx.translate(this.x, this.y);
      kpCtx.rotate(this.rotation);
      kpCtx.font = `bold ${this.fontSize}px var(--font-title)`;
      kpCtx.fillStyle = `rgba(${hexToRgb(this.color)}, ${this.life})`;
      
      kpCtx.shadowColor = this.color;
      kpCtx.shadowBlur = 12;

      kpCtx.fillText(this.char, 0, 0);
      kpCtx.restore();
    }
  }

  function animateKeypressEffects() {
    kpCtx.clearRect(0, 0, keypressCanvas.width, keypressCanvas.height);

    sparks = sparks.filter(s => s.life > 0);
    sparks.forEach(s => {
      s.update();
      s.draw();
    });

    floatingSigns = floatingSigns.filter(l => l.life > 0);
    floatingSigns.forEach(l => {
      l.update();
      l.draw();
    });

    requestAnimationFrame(animateKeypressEffects);
  }
  animateKeypressEffects();

  // Pulse effect trigger on Summoning Seal
  function triggerSealPulse() {
    if (summoningSeal) {
      summoningSeal.classList.remove('active-pulse');
      void summoningSeal.offsetWidth; // trigger reflow
      summoningSeal.classList.add('active-pulse');
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      triggerSealPulse();
      return;
    }

    const key = e.key;

    // Shortcuts for scrolls
    if (key === '1') scrollToSection('home');
    if (key === '2') scrollToSection('about');
    if (key === '3') scrollToSection('skills');
    if (key === '4') scrollToSection('projects');
    if (key === '5') scrollToSection('contact');

    // Keystroke logger updates
    updateKeystrokeLogger(key);

    // Mouse coordinates spawn points
    const spawnX = state.cursor.x !== null ? state.cursor.x : window.innerWidth / 2;
    const spawnY = state.cursor.y !== null ? state.cursor.y : window.innerHeight / 2;

    // Spawn sparks
    const sparkCount = key === ' ' ? 20 : 10;
    for (let i = 0; i < sparkCount; i++) {
      sparks.push(new Spark(spawnX, spawnY));
    }

    // Spawn Floating Hand Signs or Kanji symbols
    const randCharIndex = Math.floor(Math.random() * diagnosticSymbols.length);
    const chosenSign = diagnosticSymbols[randCharIndex];
    floatingSigns.push(new FloatingSign(chosenSign, spawnX, spawnY));
  });

  function updateKeystrokeLogger(key) {
    let cleanKey = key;
    if (key === ' ') cleanKey = 'SPACE';
    
    state.keystrokeHistory.push(cleanKey);
    if (state.keystrokeHistory.length > state.maxHistoryKeys) {
      state.keystrokeHistory.shift();
    }
    
    if (keystrokeBuffer) {
      keystrokeBuffer.textContent = state.keystrokeHistory.join(' > ');
    }
  }

  // ==========================================
  // 5. SYSTEM TELEMETRY & SMOOTH SCROLLS
  // ==========================================
  function scrollToSection(id) {
    const targetSection = document.getElementById(id);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Selected section scroll observer using IntersectionObserver
  const observerOptions = {
    root: null, // Relative to viewport for bulletproof grid scrolling
    rootMargin: '-20% 0px -20% 0px', // Detect intersection in the middle 60% of the viewport
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.id;
        
        // Update navigation active links
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${activeId}`) {
            link.classList.add('active');
          }
        });

        // Hide social links in sidebar when on contact section
        const socialLinksContainer = document.querySelector('.left-sidebar .social-links');
        if (socialLinksContainer) {
          if (activeId === 'contact') {
            socialLinksContainer.classList.add('hidden-state');
          } else {
            socialLinksContainer.classList.remove('hidden-state');
          }
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      scrollToSection(targetId);
      
      // Instantly highlight target link for snappiness
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Force scroll to top on load to prevent bottom focus scrolls
  if (scrollContainer) {
    scrollContainer.scrollTop = 0;
  }

  // Core Clock Telemetry
  setInterval(() => {
    const d = new Date();
    const hrs = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const secs = String(d.getSeconds()).padStart(2, '0');
    if (telTime) telTime.textContent = `${hrs}:${mins}:${secs}`;
  }, 1000);

  // Fluctuating location indicators
  setInterval(() => {
    if (telLat) {
      if (state.currentTheme === 'raiton') {
        telLat.textContent = 'HYDERABAD';
      } else if (state.currentTheme === 'katon') {
        telLat.textContent = 'BENGALURU';
      } else if (state.currentTheme === 'inton') {
        telLat.textContent = 'CHENNAI';
      } else {
        telLat.textContent = 'PUNE';
      }
    }
  }, 4000);

  // FPS Tracker
  let lastFpsUpdateTime = performance.now();
  let frameCount = 0;
  function trackFPS() {
    frameCount++;
    const t = performance.now();
    if (t - lastFpsUpdateTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (t - lastFpsUpdateTime));
      if (telFps) telFps.textContent = fps;
      frameCount = 0;
      lastFpsUpdateTime = t;
    }
  }

  // ==========================================
  // 6. 3D TILT EFFECT ON CARDS
  // ==========================================
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const width = rect.width;
      const height = rect.height;
      
      const rotateX = ((y / height) - 0.5) * -15;
      const rotateY = ((x / width) - 0.5) * 15;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  // ==========================================
  // 7. INTERACTIVE DIAGNOSTIC CONSOLE
  // ==========================================
  function logTerminal(message, className = '') {
    if (!terminalHistory) return;
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = message;
    terminalHistory.appendChild(line);
    
    terminalHistory.scrollTop = terminalHistory.scrollHeight;
  }

  if (terminalForm) {
    terminalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const cmd = terminalInput.value.trim();
      if (!cmd) return;

      logTerminal(`<span class="term-green">developer@local_node:~#</span> ${cmd}`);
      terminalInput.value = '';

      triggerSealPulse();

      const parts = cmd.toLowerCase().split(' ');
      const mainCmd = parts[0];

      setTimeout(() => {
        switch (mainCmd) {
          case 'help':
          case 'console':
          case 'jutsu':
            logTerminal('<strong>AVAILABLE CONSOLE COMMANDS:</strong>');
            logTerminal('  <strong>help</strong>           - Display system console commands.');
            logTerminal('  <strong>biography</strong>      - Read developer biography records.');
            logTerminal('  <strong>skills</strong>         - Load tech stack profiles.');
            logTerminal('  <strong>projects</strong>       - Inspect project release scrolls.');
            logTerminal('  <strong>contact</strong>        - Display direct node contacts.');
            logTerminal('  <strong>clear</strong>          - Flush diagnostic terminal cache.');
            logTerminal('  <strong>theme &lt;name&gt;</strong>     - Adjust interface theme: katon, rinnegan.');
            logTerminal('  <strong>send &lt;msg&gt;</strong>       - Initiate message transfer to email.');
            break;
          case 'biography':
          case 'about':
            logTerminal('[SYSTEM] Opening biography record...');
            scrollToSection('about');
            break;
          case 'skills':
            logTerminal('[SYSTEM] Fetching tech stack telemetry...');
            scrollToSection('skills');
            break;
          case 'projects':
          case 'missions':
            logTerminal('[SYSTEM] Loading project releases catalog...');
            scrollToSection('projects');
            break;
          case 'contact':
          case 'summon':
            logTerminal('[SYSTEM] Retrieving direct node directory details...');
            scrollToSection('contact');
            break;
          case 'clear':
            terminalHistory.innerHTML = '';
            logTerminal('<span class="term-green">[SYS]</span> Terminal console cache flushed.', 'term-green');
            break;
          case 'theme':
            const themeVal = parts[1];
            if (['katon', 'rinnegan'].includes(themeVal)) {
              htmlEl.setAttribute('data-theme', themeVal);
              state.currentTheme = themeVal === 'rinnegan' ? 'inton' : 'katon';
              if (telLng) telLng.textContent = themeVal === 'rinnegan' ? 'RINNEGAN_INTEGRATION' : 'FIRE_RED';
              logTerminal(`[SYSTEM] Switched theme state to: ${themeVal.toUpperCase()}`, 'term-blue');
            } else {
              logTerminal('[ERR] Unknown theme. Choose: katon (red), rinnegan (purple).', 'term-red');
            }
            break;
          case 'send':
          case 'kuchiyose':
            const messageText = cmd.substring(cmd.indexOf(' ')).trim();
            if (messageText.length > 5) {
              logTerminal('[SYSTEM] Establishing secure uplink channel...', 'term-blue');
              
              setTimeout(() => {
                triggerSealPulse();
                logTerminal('[SYSTEM] SECURE TRANSMISSION SUCCESSFUL!', 'term-green');
                logTerminal(`[SYSTEM] Message routed directly to kunchamvenkat057@gmail.com.`, 'term-green');
              }, 600);
            } else {
              logTerminal('[ERR] Command requires message text. Usage: send &lt;your message&gt;', 'term-red');
            }
            break;
          case 'hello':
          case 'hi':
            logTerminal('Uplink established. Kuncham Venkat is responsive. Type help to get started.', 'term-blue');
            break;
          default:
            logTerminal(`[ERR] Command unrecognized: '${mainCmd}'. Type 'help' for options.`, 'term-red');
        }
      });
    });
  }

});
