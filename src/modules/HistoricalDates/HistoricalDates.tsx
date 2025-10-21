// src/components/HistoricalDates.tsx  (≈95 строк)
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { Category } from '@/data/categories';
import { CATEGORY_ORDER, rangeForCategory, categoryByIndex, indexByCategory } from '@/data/ranges';
import { eventsForYear } from '@/data/events';
import { useOrbitLabels } from '@/features/hdates/useOrbitLabels';
import { useCountUp } from '@/features/hdates/useCountUp';
import { EventsSlider } from '@/features/hdates/EventsSlider';

import arrowLeft from '@/assets/arrow-left.svg';
import arrowRight from '@/assets/arrow-right.svg';
import arrowDatesLeft from '@/assets/arrow-dates-left.svg';
import arrowDatesRight from '@/assets/arrow-dates-right.svg';

const ORBIT_W = 536, ORBIT_H = 530, DOTS = 6, ANGLE = 360 / DOTS, TARGET = 20, DOTS_SHIFT = 8;
const LABEL_GAP_X = 36, LABEL_OFFSET_Y = 12;

export const HistoricalDates: React.FC = () => {
  const [activeCat, setActiveCat] = useState<Category>('Наука');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const activeIdx = indexByCategory(activeCat);
  const { from, to } = rangeForCategory(activeCat);

  const stageRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const activeLabelRef = useRef<HTMLDivElement>(null);
  const hoverLabelRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLSpanElement>(null);
  const endRef = useRef<HTMLSpanElement>(null);

  const positionLabelAtIndex = (idx: number, el: HTMLElement | null) => {
    const stage = stageRef.current, orbit = orbitRef.current;
    if (!stage || !orbit || !el) return;
    const dot = orbit.querySelector<HTMLElement>(`.hdates__dot[data-idx="${idx}"]`);
    if (!dot) return;
    const dr = dot.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    const cx = dr.left + dr.width / 2 - sr.left, cy = dr.top + dr.height / 2 - sr.top;
    el.style.left = `${cx + LABEL_GAP_X}px`; el.style.top = `${cy - LABEL_OFFSET_Y}px`; el.style.transform = 'translate(0,-50%)';
  };

  useOrbitLabels({
    activeIdx, hoverIdx, angleStep: ANGLE, dotsAngleOffset: DOTS_SHIFT, targetAngle: TARGET,
    stageRef, orbitRef, activeLabelRef, hoverLabelRef, positionLabelAtIndex,
  });

  useCountUp(from, to, startRef.current, endRef.current);

  useEffect(() => {
    gsap.delayedCall(0, () => { positionLabelAtIndex(activeIdx, activeLabelRef.current); gsap.set(activeLabelRef.current, { autoAlpha: 1 }); });
  }, [activeIdx]);

  const prevCategory = () => setActiveCat(categoryByIndex(activeIdx - 1));
  const nextCategory = () => setActiveCat(categoryByIndex(activeIdx + 1));

  return (
    <section className="hdates" aria-label="Исторические даты">
      <div className="hdates__grid-line" aria-hidden="true" />
      <div className="hdates__grid-line hdates__grid-line--h" aria-hidden="true" />
      <div className="hdates__grid-line hdates__grid-line--left" aria-hidden="true" />
      <div className="hdates__grid-line hdates__grid-line--right" aria-hidden="true" />

      <h2 className="hdates__title"><span className="hdates__title-bar" aria-hidden="true" />Исторические<br className="hdates__title-br" /> даты</h2>

      <div className="hdates__stage" ref={stageRef}>
        <div className="hdates__years" role="group" aria-label="Активный временной отрезок">
          <span className="hdates__year hdates__year--start" ref={startRef}>{from}</span>
          <span className="hdates__year hdates__year--end" ref={endRef}>{to}</span>
        </div>

        <div className="hdates__mob-range">{activeCat}</div><div className="hdates__mob-sep" aria-hidden="true" />

        <div className="hdates__orbit" ref={orbitRef}>
          {Array.from({ length: DOTS }).map((_, i) => {
            const cx = ORBIT_W / 2, cy = ORBIT_H / 2, rx = ORBIT_W / 2 - 0.25, ry = ORBIT_H / 2 - 0.25;
            const a = ((i * ANGLE + DOTS_SHIFT) - 90) * (Math.PI / 180);
            const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
            const cat = CATEGORY_ORDER[i], isActive = i === activeIdx;
            return (
              <button
                key={i} type="button" className={`hdates__dot ${isActive ? 'is-active' : ''}`}
                style={{ left: x, top: y }} data-idx={i} aria-pressed={isActive} aria-label={`Категория: ${cat}`}
                onClick={() => setActiveCat(cat)}
                onMouseEnter={() => { setHoverIdx(i); positionLabelAtIndex(i, hoverLabelRef.current); gsap.to(hoverLabelRef.current, { autoAlpha: 1, duration: 0.2 }); }}
                onMouseLeave={() => { setHoverIdx(null); gsap.to(hoverLabelRef.current, { autoAlpha: 0, duration: 0.2 }); }}
              >
                <span className="hdates__dot-bubble"><span className="hdates__dot-bubble-text">{i + 1}</span></span>
              </button>
            );
          })}
        </div>

        <div className="hdates__float-label hdates__float-label--active" ref={activeLabelRef}>{activeCat}</div>
        <div className="hdates__float-label hdates__float-label--hover" ref={hoverLabelRef} style={{ opacity: 0 }}>
          {hoverIdx !== null ? CATEGORY_ORDER[hoverIdx] : ''}
        </div>

        <div className="hdates__nav" aria-label="Переключение категорий">
          <button className="hdates__nav-btn" onClick={prevCategory} aria-label="Назад"><img src={arrowLeft} width={56} height={56} alt="" /></button>
          <button className="hdates__nav-btn" onClick={nextCategory} aria-label="Вперёд"><img src={arrowRight} width={56} height={56} alt="" /></button>
        </div>
      </div>

      <div className="hdates-events">
        <div className="hdates-events__top"><div className="hdates-events__counter">{String(activeIdx + 1).padStart(2, '0')}/{String(CATEGORY_ORDER.length).padStart(2, '0')}</div></div>
        <div className="hdates-events__arrows">
          <button className="hdates-events__btn hdates-events__btn--prev js-events-prev" aria-label="Предыдущие годы"><img src={arrowDatesLeft} width={64} height={64} alt="" /></button>
          <button className="hdates-events__btn hdates-events__btn--next js-events-next" aria-label="Следующие годы"><img src={arrowDatesRight} width={64} height={64} alt="" /></button>
        </div>

        <EventsSlider
          key={`${activeCat}-${from}-${to}`}  
          from={from}
          to={to}
          getText={(y) => eventsForYear(y, activeCat)}
        />

        <div className="hdates-mobile-footer">
          <div className="hdates-mobile-footer__left">
            <div className="hdates-mobile-footer__counter">{String(activeIdx + 1).padStart(2, '0')}/{String(CATEGORY_ORDER.length).padStart(2, '0')}</div>
            <div className="hdates-mobile-footer__arrows">
              <button className="hdates-mobile-arrow" aria-label="Предыдущий промежуток" onClick={prevCategory}><img src={arrowLeft} width={20} height={20} alt="" /></button>
              <button className="hdates-mobile-arrow" aria-label="Следующий промежуток" onClick={nextCategory}><img src={arrowRight} width={20} height={20} alt="" /></button>
            </div>
          </div>
          <div className="hdates-mobile-pagination" />
        </div>
      </div>
    </section>
  );
};
