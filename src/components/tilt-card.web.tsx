import { useRef, type ReactNode } from 'react';

/**
 * Tilt 3D sutil seguindo o cursor (web). Escreve o transform direto no nó DOM
 * (sem re-render) para ficar suave — discreto e profissional, não exagerado.
 */
export function TiltCard({ children, max = 5 }: { children: ReactNode; max?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  function aoMover(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform =
      `perspective(1100px) rotateX(${(-py * max).toFixed(2)}deg) ` +
      `rotateY(${(px * max).toFixed(2)}deg) translateY(-3px)`;
  }

  function aoSair() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  }

  return (
    <div
      ref={ref}
      onMouseMove={aoMover}
      onMouseLeave={aoSair}
      style={{
        transition: 'transform 280ms cubic-bezier(0.2,0.84,0.2,1)',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}>
      {children}
    </div>
  );
}
