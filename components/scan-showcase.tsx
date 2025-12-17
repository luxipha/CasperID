"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const CARD_WIDTH = 400;
const CARD_HEIGHT = 250;
const CARD_GAP = 60;
const CARD_SOURCES = ["/id-cards/id-1.png", "/id-cards/id-2.png", "/id-cards/id-3.png"];
const BEAM_OFFSET = 150;

function createGradientFallback(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#6366f1");
  gradient.addColorStop(1, "#0ea5e9");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  return canvas.toDataURL();
}

export default function ScanShowcase() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardLineRef = useRef<HTMLDivElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scannerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleRAF = useRef<number>(0);

  const calcAsciiDimensions = (width: number, height: number) => {
    const fontSize = 11;
    const lineHeight = 13;
    const charWidth = 6;
    const w = Math.floor(width / charWidth);
    const h = Math.floor(height / lineHeight);
    return { w, h, fontSize, lineHeight };
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scannerCanvas = scannerCanvasRef.current;
    const cardLine = cardLineRef.current;
    if (!scannerCanvas || !cardLine) return;

    let animationId = 0;

    // Card stream with images only
    cardLine.innerHTML = "";
    const fallback = createGradientFallback(CARD_WIDTH, CARD_HEIGHT);
    const CARD_COUNT = 8;
    for (let i = 0; i < CARD_COUNT; i++) {
      const wrapper = document.createElement("div");
      wrapper.className = "card-wrapper";
      wrapper.style.width = `${CARD_WIDTH}px`;
      wrapper.style.height = `${CARD_HEIGHT}px`;
      const normal = document.createElement("div");
      normal.className = "card card-normal";
      const img = document.createElement("img");
      img.className = "card-image";
      img.style.width = "100%";
      img.style.height = "100%";
      img.src = CARD_SOURCES[i % CARD_SOURCES.length];
      img.alt = "ID Card";
      img.onerror = () => {
        img.src = fallback;
      };
      normal.appendChild(img);

      // Add ASCII layer
      const ascii = document.createElement("div");
      ascii.className = "card card-ascii";
      const asciiContent = document.createElement("div");
      asciiContent.className = "ascii-content";
      const { w, h } = calcAsciiDimensions(CARD_WIDTH, CARD_HEIGHT);
      asciiContent.style.fontSize = "11px";
      asciiContent.style.lineHeight = "13px";
      asciiContent.textContent = generateAscii(w, h);
      ascii.appendChild(asciiContent);

      wrapper.appendChild(normal);
      wrapper.appendChild(ascii);
      cardLine.appendChild(wrapper);
    }
    // Duplicate for seamless looping
    cardLine.innerHTML += cardLine.innerHTML;

    // Start just off-screen to the left so cards slide in immediately
    const totalWidth = cardLine.children.length * (CARD_WIDTH + CARD_GAP);
    const halfWidth = totalWidth / 2;
    let pos = -halfWidth; // start with first set centered
    const vel = 160;
    const direction = 1; // flow left to right

    const updateCards = () => {
      pos += (vel / 60) * direction;
      if (pos > 0) pos = -halfWidth;
      (cardLine as HTMLDivElement).style.transform = `translateX(${pos}px)`;

      // Beam window in viewport coordinates
      const beamWidth = 300;
      const scannerRect = scannerCanvas.getBoundingClientRect();
      const beamCenter = scannerRect.left + scannerRect.width / 2 + BEAM_OFFSET;
      const windowStart = beamCenter - beamWidth / 2;
      const windowEnd = beamCenter + beamWidth / 2;

      const cards = Array.from(cardLine.children) as HTMLDivElement[];
      cards.forEach((wrapper) => {
        const rect = wrapper.getBoundingClientRect();
        const cardLeft = rect.left;
        const cardRight = rect.right;
        const overlap = Math.max(0, Math.min(cardRight, windowEnd) - Math.max(cardLeft, windowStart));
        const asciiVisible = overlap > 0;

        const normalCard = wrapper.querySelector(".card-normal") as HTMLElement | null;
        const asciiCard = wrapper.querySelector(".card-ascii") as HTMLElement | null;
        if (!normalCard || !asciiCard) return;

        normalCard.style.opacity = "1";
        normalCard.style.clipPath = "inset(0 0 0 0)";

        if (asciiVisible) {
          const leftInset = Math.max(0, windowStart - cardLeft);
          const rightInset = Math.max(0, cardRight - windowEnd);
          asciiCard.style.clipPath = `inset(0 ${rightInset}px 0 ${leftInset}px)`;
          asciiCard.style.opacity = "1";
        } else {
          asciiCard.style.opacity = "0";
        }
      });
    };

    // Center scanner only + 2D particles
    const sctx = scannerCanvas.getContext("2d");
    const scanner = { x: window.innerWidth / 2 + BEAM_OFFSET, w: 4, h: 300, fade: 60 };
    scannerCanvas.width = window.innerWidth;
    scannerCanvas.height = 300;

    // 2D particle layer on scanner canvas
    const baseMaxParticles = 200;
    const scanMaxParticles = 400;
    const fadeZone = 60;
    let currentMaxParticles = baseMaxParticles;
    const transitionSpeed = 0.05;
    const scanningActive = true; // always on for now
    const particles2D: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      life: number;
      decay: number;
    }[] = [];

    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = 16;
    spriteCanvas.height = 16;
    const spriteCtx = spriteCanvas.getContext("2d");
    if (spriteCtx) {
      const half = spriteCanvas.width / 2;
      const g = spriteCtx.createRadialGradient(half, half, 0, half, half, half);
      g.addColorStop(0, "rgba(255, 255, 255, 1)");
      g.addColorStop(0.3, "rgba(196, 181, 253, 0.8)");
      g.addColorStop(0.7, "rgba(139, 92, 246, 0.4)");
      g.addColorStop(1, "transparent");
      spriteCtx.fillStyle = g;
      spriteCtx.beginPath();
      spriteCtx.arc(half, half, half, 0, Math.PI * 2);
      spriteCtx.fill();
    }

    const resetParticle2D = (p: (typeof particles2D)[number]) => {
      p.x = scanner.x + (Math.random() - 0.5) * scanner.w * 2;
      p.y = Math.random() * scanner.h;
      p.vx = -(Math.random() * 0.8 + 0.2); // drift left
      p.vy = (Math.random() - 0.5) * 0.3;
      p.alpha = Math.random() * 0.4 + 0.6;
      p.life = 1;
      p.decay = Math.random() * 0.015 + 0.005;
    };

    for (let i = 0; i < baseMaxParticles; i++) {
      const p = { x: 0, y: 0, vx: 0, vy: 0, alpha: 1, life: 1, decay: 0.01 };
      resetParticle2D(p);
      particles2D.push(p);
    }

    const drawParticles2D = () => {
      if (!sctx) return;
      particles2D.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.x > scannerCanvas.width + 10 || p.life <= 0) {
          resetParticle2D(p);
        }
        const fadeAlpha =
          p.y < fadeZone
            ? p.y / fadeZone
            : p.y > scanner.h - fadeZone
            ? (scanner.h - p.y) / fadeZone
            : 1;
        sctx.globalAlpha = p.alpha * Math.max(0, Math.min(1, fadeAlpha)) * p.life;
        sctx.drawImage(spriteCanvas, p.x, p.y, 8, 8);
      });
      sctx.globalAlpha = 1;

      // ramp particle count if scanning
      const targetMax = scanningActive ? scanMaxParticles : baseMaxParticles;
      currentMaxParticles += (targetMax - currentMaxParticles) * transitionSpeed;
      const needed = Math.floor(currentMaxParticles);
      if (needed > particles2D.length) {
        const toAdd = Math.min(needed - particles2D.length, 200); // cap per frame
        for (let i = 0; i < toAdd; i++) {
          const p = { x: 0, y: 0, vx: 0, vy: 0, alpha: 1, life: 1, decay: 0.01 };
          resetParticle2D(p);
          particles2D.push(p);
        }
      }
    };

    let phase = 0;

    const drawScanner = () => {
      if (!sctx) return;
      sctx.clearRect(0, 0, scannerCanvas.width, scannerCanvas.height);
      drawParticles2D();
      const pulse = 1 + Math.sin(phase) * 0.12;
      phase += 0.08;

      const lineWidth = scanner.w * pulse;
      const center = scanner.x;
      const h = scanner.h;
      const fade = scanner.fade;

      // Core
      const core = sctx.createLinearGradient(center - lineWidth / 2, 0, center + lineWidth / 2, 0);
      core.addColorStop(0, "rgba(147,51,234,0)");
      core.addColorStop(0.3, "rgba(147,51,234,0.9)");
      core.addColorStop(0.5, "rgba(147,51,234,1)");
      core.addColorStop(0.7, "rgba(147,51,234,0.9)");
      core.addColorStop(1, "rgba(147,51,234,0)");
      sctx.globalAlpha = 1;
      sctx.fillStyle = core;
      sctx.fillRect(center - lineWidth / 2, 0, lineWidth, h);

      // Glow 1
      const glow1 = sctx.createLinearGradient(center - lineWidth * 2, 0, center + lineWidth * 2, 0);
      glow1.addColorStop(0, "rgba(139,92,246,0)");
      glow1.addColorStop(0.5, "rgba(196,181,253,0.8)");
      glow1.addColorStop(1, "rgba(139,92,246,0)");
      sctx.globalAlpha = 0.8;
      sctx.fillStyle = glow1;
      sctx.fillRect(center - lineWidth * 2, 0, lineWidth * 4, h);

      // Glow 2
      const glow2 = sctx.createLinearGradient(center - lineWidth * 4, 0, center + lineWidth * 4, 0);
      glow2.addColorStop(0, "rgba(139,92,246,0)");
      glow2.addColorStop(0.5, "rgba(139,92,246,0.4)");
      glow2.addColorStop(1, "rgba(139,92,246,0)");
      sctx.globalAlpha = 0.6;
      sctx.fillStyle = glow2;
      sctx.fillRect(center - lineWidth * 4, 0, lineWidth * 8, h);

      // Vertical fade mask
      const vGrad = sctx.createLinearGradient(0, 0, 0, h);
      vGrad.addColorStop(0, "rgba(255,255,255,0)");
      vGrad.addColorStop(fade / h, "rgba(255,255,255,1)");
      vGrad.addColorStop(1 - fade / h, "rgba(255,255,255,1)");
      vGrad.addColorStop(1, "rgba(255,255,255,0)");

      sctx.globalCompositeOperation = "destination-in";
      sctx.globalAlpha = 1;
      sctx.fillStyle = vGrad;
      sctx.fillRect(0, 0, scannerCanvas.width, h);
      sctx.globalCompositeOperation = "source-over";
    };

    const tick = () => {
      updateCards();
      drawScanner();
      animationId = requestAnimationFrame(tick);
    };

    tick();

    const onResize = () => {
      scannerCanvas.width = window.innerWidth;
      scanner.x = window.innerWidth / 2 + BEAM_OFFSET;
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Three.js particle layer
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -window.innerWidth / 2,
      window.innerWidth / 2,
      125,
      -125,
      1,
      1000
    );
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, 250);
    renderer.setClearColor(0x000000, 0);

    const particleCount = 400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const alphas = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount);

    const texCanvas = document.createElement("canvas");
    texCanvas.width = 64;
    texCanvas.height = 64;
    const ctx = texCanvas.getContext("2d");
    if (ctx) {
      const half = texCanvas.width / 2;
      const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
      grad.addColorStop(0.02, "#ffffff");
      grad.addColorStop(0.15, "#9aa8ff"); // soft lavender to stand out on #EDEFFD
      grad.addColorStop(0.35, "#1A237E"); // deep indigo core
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(half, half, half, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(texCanvas);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * window.innerWidth * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
      positions[i * 3 + 2] = 0;

      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;

      velocities[i] = -(Math.random() * 60 + 30); // drift right-to-left
      alphas[i] = (Math.random() * 0.6) + 0.4;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: { pointTexture: { value: texture }, size: { value: 15.0 } },
      vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        varying vec3 vColor;
        uniform float size;
        void main() {
          vAlpha = alpha;
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
          gl_FragColor = vec4(vColor, vAlpha) * texture2D(pointTexture, gl_PointCoord);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const animateParticles = () => {
      const posAttr = particles.geometry.getAttribute("position") as THREE.BufferAttribute;
      const alphaAttr = particles.geometry.getAttribute("alpha") as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;
      const alphaArray = alphaAttr.array as Float32Array;
      const time = Date.now() * 0.001;

      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i] * 0.016;
        if (posArray[i * 3] < -window.innerWidth / 2 - 100) {
          posArray[i * 3] = window.innerWidth / 2 + 100;
          posArray[i * 3 + 1] = (Math.random() - 0.5) * 250;
        }
        posArray[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.5;

        const twinkle = Math.floor(Math.random() * 10);
        if (twinkle === 1 && alphaArray[i] > 0) {
          alphaArray[i] -= 0.05;
        } else if (twinkle === 2 && alphaArray[i] < 1) {
          alphaArray[i] += 0.05;
        }
        alphaArray[i] = Math.max(0, Math.min(1, alphaArray[i]));
      }

      posAttr.needsUpdate = true;
      alphaAttr.needsUpdate = true;
      renderer.render(scene, camera);
      particleRAF.current = requestAnimationFrame(animateParticles);
    };

    animateParticles();

    const handleResize = () => {
      camera.left = -window.innerWidth / 2;
      camera.right = window.innerWidth / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 250);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(particleRAF.current);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="scan-shell">
      {/* Base layout with center scanner only */}
      <canvas ref={particleCanvasRef} className="particle" />
      <canvas ref={scannerCanvasRef} className="scanner" />
      <div className="card-stream">
        <div ref={cardLineRef} className="card-line" />
      </div>
      <style jsx global>{`
        .scan-shell {
          position: relative;
          width: 110%;
          height: 400px;
          overflow: hidden;
          background: transparent;
          border-radius: 24px;
        }
        .particle {
          position: absolute;
          top: 25%;
          left: 0;
          width: 100%;
          height: 250px;
          pointer-events: none;
          filter: drop-shadow(0 0 12px rgba(147,51,234,0.4));
          z-index: 1;
        }
        .scanner {
          position: absolute;
          top: calc(50% - 150px);
          left: 0;
          width: 100%;
          height: 300px;
          pointer-events: none;
          mix-blend-mode: screen;
          z-index: 3;
        }
        .card-stream {
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 260px;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          overflow: visible;
          z-index: 2;
        }
        .card-line {
          display: flex;
          gap: ${CARD_GAP}px;
          will-change: transform;
          align-items: center;
          padding-left: 40px;
        }
        .card-wrapper {
          position: relative;
          width: ${CARD_WIDTH}px;
          height: ${CARD_HEIGHT}px;
          flex-shrink: 0;
        }
        .card {
          position: absolute;
          top: 0;
          left: 0;
          width: ${CARD_WIDTH}px;
          height: ${CARD_HEIGHT}px;
          border-radius: 16px;
          overflow: hidden;
        }
        .card-normal {
          box-shadow: 0 20px 40px rgba(0,0,0,0.35);
          clip-path: inset(0 var(--clip-right, 0%) 0 0);
          z-index: 1;
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
        }
        .card-ascii {
          background: blue;
          z-index: 2;
        }
        .ascii-content {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          color: #1A237E;
          background: #EDEFFD;
          font-family: "Courier New", monospace;
          font-size: 11px;
          line-height: 13px;
          white-space: pre;
          overflow: hidden;
          margin: 0;
          padding: 0;
          text-align: left;
          vertical-align: top;
          box-sizing: border-box;
        }
        /* ASCII and scan effects disabled */
        @media (max-width: 1024px) {
          .scan-shell { height: 560px; }
          .card-wrapper { width: 280px; height: 180px; }
          .card { width: 280px; height: 180px; }
        }
      `}</style>
    </div>
  );
}

function generateAscii(width: number, height: number) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789(){}[]<>;:,._-+=!@#$%^&*|\\/\"'`~?";
  let out = "";
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      line += chars[Math.floor(Math.random() * chars.length)];
    }
    out += line + (y < height - 1 ? "\n" : "");
  }
  return out;
}

function particleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "#fff");
  g.addColorStop(0.1, "#c084fc");
  g.addColorStop(0.3, "#1e293b");
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.Texture(canvas);
  tex.needsUpdate = true;
  return tex;
}
