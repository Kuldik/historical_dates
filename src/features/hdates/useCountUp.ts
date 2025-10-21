// src/features/hdates/useCountUp.ts
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function useCountUp(from: number, to: number, startEl: HTMLSpanElement | null, endEl: HTMLSpanElement | null) {
  const prev = useRef({ from, to });

  useEffect(() => {
    const animate = (el: HTMLSpanElement | null, a: number, b: number) => {
      if (!el) return;
      const obj = { v: a };
      gsap.fromTo(obj, { v: a }, { v: b, duration: 0.6, ease: 'power2.out', onUpdate: () => {
            el.textContent = Math.round(obj.v).toString();
          }, });
    };
    animate(startEl, prev.current.from, from);
    animate(endEl, prev.current.to, to);
    prev.current = { from, to };
  }, [from, to, startEl, endEl]);
}
