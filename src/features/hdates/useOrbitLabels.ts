// src/features/hdates/useOrbitLabels.ts
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

type Opts = {
  activeIdx: number;
  hoverIdx: number | null;
  angleStep: number;
  dotsAngleOffset: number;
  targetAngle: number;

  // ✅ главное исправление — принимаем те же типы, что возвращает useRef(...)
  stageRef: React.MutableRefObject<HTMLDivElement | null>;
  orbitRef: React.MutableRefObject<HTMLDivElement | null>;
  activeLabelRef: React.MutableRefObject<HTMLDivElement | null>;
  hoverLabelRef: React.MutableRefObject<HTMLDivElement | null>;

  positionLabelAtIndex: (idx: number, el: HTMLElement | null) => void;
};

export function useOrbitLabels({
  activeIdx,
  hoverIdx,
  angleStep,
  dotsAngleOffset,
  targetAngle,
  stageRef,
  orbitRef,
  activeLabelRef,
  hoverLabelRef,
  positionLabelAtIndex,
}: Opts) {
  const bubblesTextRef = useRef<NodeListOf<HTMLElement> | null>(null);

  useEffect(() => {
    const orbit = orbitRef.current;
    if (!orbit) return;
    const desired = targetAngle - (activeIdx * angleStep + dotsAngleOffset);

    gsap.to(orbit, {
      rotate: desired,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => {
        const rot = (gsap.getProperty(orbit, 'rotate') as number) || 0;
        if (!bubblesTextRef.current) {
          bubblesTextRef.current = orbit.querySelectorAll<HTMLElement>('.hdates__dot-bubble-text');
        }
        bubblesTextRef.current.forEach((el) => gsap.set(el, { rotate: -rot }));
        positionLabelAtIndex(activeIdx, activeLabelRef.current);
        if (hoverIdx !== null) positionLabelAtIndex(hoverIdx, hoverLabelRef.current);
      },
      onComplete: () => {
        positionLabelAtIndex(activeIdx, activeLabelRef.current);
        if (hoverIdx !== null) positionLabelAtIndex(hoverIdx, hoverLabelRef.current);
      },
    });
  }, [activeIdx, hoverIdx, angleStep, dotsAngleOffset, targetAngle]);

  useEffect(() => {
    const onResize = () => {
      positionLabelAtIndex(activeIdx, activeLabelRef.current);
      if (hoverIdx !== null) positionLabelAtIndex(hoverIdx, hoverLabelRef.current);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeIdx, hoverIdx, stageRef, orbitRef, activeLabelRef, hoverLabelRef, positionLabelAtIndex]);
}
