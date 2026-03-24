"use client";
import { useRef, useEffect } from "react";

// Katakana + latin + numbers for the classic cyberpunk matrix look
const KATAKANA =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
const CHARS = KATAKANA + "0123456789ABCDEF";

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let columns: number;
    let drops: number[];
    const fontSize = 16;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      // Re-initialise drops to the new column count
      drops = new Array(columns).fill(1).map(() => Math.random() * -100);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      // Fading trail – very low alpha keeps the "ghosting" minimal
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head character is brighter
        ctx.fillStyle = "rgba(0, 255, 180, 0.12)";
        ctx.fillText(char, x, y);

        // Slightly dimmer trail character a few rows up
        if (drops[i] > 2) {
          const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillStyle = "rgba(0, 255, 180, 0.06)";
          ctx.fillText(trailChar, x, y - fontSize * 2);
        }

        // Reset when off screen (with random restart delay)
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += 0.5 + Math.random() * 0.5; // variable fall speed
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[5] pointer-events-none"
      style={{ opacity: 0.18 }}
    />
  );
}
