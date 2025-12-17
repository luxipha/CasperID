"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const CARD_WIDTH = 400;
const CARD_HEIGHT = 250;
const CARD_GAP = 60;
const CARD_SOURCES = ["/id-cards/id-1.png", "/id-cards/id-2.png", "/id-cards/id-3.png"];

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
      wrapper.appendChild(normal);
      cardLine.appendChild(wrapper);
    }

    // Start just off-screen to the left so cards slide in immediately
    let pos = -(CARD_WIDTH + CARD_GAP);
    const vel = 160;
    const direction = 1; // slide from left to right
    const totalWidth = cardLine.children.length * (CARD_WIDTH + CARD_GAP);

    const updateCards = () => {
      pos += (vel / 60) * direction;
      if (pos > totalWidth) pos = -(CARD_WIDTH + CARD_GAP);
      (cardLine as HTMLDivElement).style.transform = `translateX(${pos}px)`;
    };

    // Center scanner only
    const sctx = scannerCanvas.getContext("2d");
    const scanner = { x: window.innerWidth / 2, w: 4, h: 300, fade: 60 };
    scannerCanvas.width = window.innerWidth;
    scannerCanvas.height = 300;

    let phase = 0;

    const drawScanner = () => {
      if (!sctx) return;
      sctx.clearRect(0, 0, scannerCanvas.width, scannerCanvas.height);
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
      scanner.x = window.innerWidth / 2;
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="scan-shell">
      {/* Base layout with center scanner only */}
      <canvas ref={particleCanvasRef} className="particle" style={{ display: "none" }} />
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
        }
        .scanner {
          position: absolute;
          top: calc(50% - 150px);
          left: 0;
          width: 100%;
          height: 300px;
          pointer-events: none;
          mix-blend-mode: screen;
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
          clip-path: inset(0 0 0 var(--clip-right, 0%));
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
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
