import React, { useEffect, useRef } from 'react';

const MATH_GLYPHS = [
  '∑', 'π', '∫', '√x', '∞',
  'e^{iπ} + 1 = 0',
  '∮', '∇', 'lim x→0',
  'binom(n, k)', 'ℝ', 'ℂ',
  'φ', 'λ', 'θ', 'Δ', 'Ω',
  'a² + b² = c²',
  'det(A) ≠ 0',
  'P(A|B)',
  'd/dx',
  'x^n + y^n ≠ z^n',
  '∭', '∂f/∂x', '∀x ∈ ℝ'
];

export default function MathBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates for interactive parallax
    let mouse = { x: width / 2, y: height / 2 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Create particles
    const particleCount = Math.min(38, Math.floor(width / 35));
    const particles = Array.from({ length: particleCount }, () => ({
      text: MATH_GLYPHS[Math.floor(Math.random() * MATH_GLYPHS.length)],
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.floor(Math.random() * 16) + 14,
      speedX: (Math.random() - 0.5) * 0.45,
      speedY: (Math.random() - 0.5) * 0.45 - 0.15,
      opacity: Math.random() * 0.25 + 0.08,
      rotation: (Math.random() - 0.5) * 0.4,
      rotSpeed: (Math.random() - 0.5) * 0.003
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle background ambient gradient
      const bgGrad = ctx.createRadialGradient(
        mouse.x, mouse.y, 50,
        mouse.x, mouse.y, width * 0.7
      );
      bgGrad.addColorStop(0, 'rgba(0, 141, 218, 0.035)');
      bgGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        // Move particle
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        // Wrap around bounds
        if (p.x < -100) p.x = width + 50;
        if (p.x > width + 100) p.x = -50;
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;

        // Interactive mouse parallax drift
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let offsetX = 0;
        let offsetY = 0;
        if (dist < 180) {
          const force = (180 - dist) / 180;
          offsetX = (dx / dist) * force * 15;
          offsetY = (dy / dist) * force * 15;
        }

        ctx.save();
        ctx.translate(p.x + offsetX, p.y + offsetY);
        ctx.rotate(p.rotation);

        ctx.font = `600 ${p.size}px 'Fira Code', 'Inter', monospace`;
        ctx.fillStyle = `rgba(0, 141, 218, ${p.opacity})`;
        ctx.shadowColor = 'rgba(0, 141, 218, 0.6)';
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.text, 0, 0);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
}
