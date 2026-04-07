"use client";
import { useRef, useEffect, memo } from "react";
import { useInView } from "@/hooks/useInView";

const KATAKANA =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
const CHARS = KATAKANA + "0123456789ABCDEF";

const MatrixRain = memo(function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ref: containerRef, isInView } = useInView({ rootMargin: "50px" });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let columns: number;
    let drops: number[];
    const fontSize = 16;
    let lastFrame = 0;
    const targetFPS = 25;
    const frameInterval = 1000 / targetFPS;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = new Array(columns).fill(1).map(() => Math.random() * -100);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = (timestamp: number) => {
      animId = requestAnimationFrame(draw);

      const elapsed = timestamp - lastFrame;
      if (elapsed < frameInterval) return;
      lastFrame = timestamp - (elapsed % frameInterval);

      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = "rgba(34, 211, 238, 0.3)";
        ctx.shadowColor = "rgba(34, 211, 238, 0.5)";
        ctx.shadowBlur = 8;
        ctx.fillText(char, x, y);

        if (drops[i] > 2) {
          const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillStyle = "rgba(34, 211, 238, 0.15)";
          ctx.shadowBlur = 4;
          ctx.fillText(trailChar, x, y - fontSize * 2);
        }
        ctx.shadowBlur = 0;

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += 0.5 + Math.random() * 0.5;
      }
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[3] pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: isInView ? 0.4 : 0 }}
      />
    </div>
  );
});

export default MatrixRain;
