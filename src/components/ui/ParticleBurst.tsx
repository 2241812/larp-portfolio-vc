"use client";
import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
}

const CYAN_SHADES = [
  "#22d3ee",
  "#06b6d4",
  "#0891b2",
  "#67e8f9",
  "#a5f3fc",
  "#ffffff",
];

export interface ParticleBurstRef {
  burst: (x?: number, y?: number) => void;
}

const ParticleBurst = forwardRef<ParticleBurstRef>(function ParticleBurst(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current = particles.current.filter((p) => p.life > 0);

      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.vx *= 0.99; // friction
        p.life--;
        p.rotation += p.rotSpeed;

        const alpha = p.life / p.maxLife;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }

      animId.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    burst(x?: number, y?: number) {
      const cx = x ?? window.innerWidth / 2;
      const cy = y ?? window.innerHeight / 2;

      for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 8;
        particles.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          life: 40 + Math.random() * 40,
          maxLife: 80,
          size: 3 + Math.random() * 5,
          color: CYAN_SHADES[Math.floor(Math.random() * CYAN_SHADES.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.3,
        });
      }
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[60] pointer-events-none"
    />
  );
});

export default ParticleBurst;
