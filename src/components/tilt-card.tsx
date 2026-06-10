import { type ReactNode } from 'react';

/** Nativo: sem tilt (efeito 3D é exclusivo do web). Passa o conteúdo adiante. */
export function TiltCard({ children }: { children: ReactNode; max?: number }) {
  return <>{children}</>;
}
