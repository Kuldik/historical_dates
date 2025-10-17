import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import type { Category } from '@/data/categories';
import {
  CATEGORY_ORDER,
  rangeForCategory,
  categoryByIndex,
  indexByCategory,
} from '@/data/ranges';
import { eventsForYear } from '@/data/events';

import arrowLeft from '@/assets/arrow-left.svg';
import arrowRight from '@/assets/arrow-right.svg';
import arrowDatesLeft from '@/assets/arrow-dates-left.svg';
import arrowDatesRight from '@/assets/arrow-dates-right.svg';

const ORBIT_W = 536; // должен совпадать с --orbit-w в scss
const ORBIT_H = 530; // должен совпадать с --orbit-h в scss
const DOTS_COUNT = 6;
const ANGLE_STEP = 360 / DOTS_COUNT;
const TARGET_ANGLE = 20;

const EVENTS_FADE_DURATION = 0.5;

// сдвиг всех точек вдоль дуги (в градусах). + по часовой, - против
const DOTS_ANGLE_OFFSET = 8;

// Смещение лейблов относительно центра точки: вправо и чуть выше
const LABEL_GAP_X = 36;
const LABEL_OFFSET_Y = 12;

export const HistoricalDates: React.FC = () => {
  // состояние
  const [activeCat, setActiveCat] = useState<Category>('Наука');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const activeIdx = indexByCategory(activeCat);
  const { from, to } = rangeForCategory(activeCat);

  // refs
  const stageRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<any>(null);

  const activeLabelRef = useRef<HTMLDivElement>(null);
  const hoverLabelRef = useRef<HTMLDivElement>(null);

  const bubblesTextRef = useRef<NodeListOf<HTMLElement> | null>(null);
  const startRef = useRef<HTMLSpanElement>(null);
  const endRef = useRef<HTMLSpanElement>(null);
  const prevYearsRef = useRef<{ from: number; to: number }>({ from, to });
  const eventsWrapRef = useRef<HTMLDivElement>(null);

  // поставить лейбл у точки с индексом idx
  const positionLabelAtIndex = (idx: number, el: HTMLElement | null) => {
    const stage = stageRef.current;
    const orbit = orbitRef.current;
    if (!stage || !orbit || !el) return;

    const dot: HTMLElement | null = orbit.querySelector(`.hdates__dot[data-idx="${idx}"]`);
    if (!dot) return;

    const dotRect = dot.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    const cx = dotRect.left + dotRect.width / 2 - stageRect.left;
    const cy = dotRect.top + dotRect.height / 2 - stageRect.top;

    el.style.left = `${cx + LABEL_GAP_X}px`;
    el.style.top = `${cy - LABEL_OFFSET_Y}px`;
    el.style.transform = 'translate(0, -50%)';
  };

  // орбита вращается, цифры в пузырях контр-вращаются; лейблы репозиционируются
  useEffect(() => {
    const orbit = orbitRef.current;
    if (!orbit) return;

    // с учётом общего сдвига точек по дуге
    const desired = TARGET_ANGLE - (activeIdx * ANGLE_STEP + DOTS_ANGLE_OFFSET);

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

        // репозиционирование обоих лейблов на каждом тике
        positionLabelAtIndex(activeIdx, activeLabelRef.current);
        if (hoverIdx !== null) positionLabelAtIndex(hoverIdx, hoverLabelRef.current);
      },
      onComplete: () => {
        positionLabelAtIndex(activeIdx, activeLabelRef.current);
        if (hoverIdx !== null) positionLabelAtIndex(hoverIdx, hoverLabelRef.current);
      },
    });
  }, [activeIdx, hoverIdx]);

  // count-up больших чисел
  useEffect(() => {
    const animate = (el: HTMLSpanElement | null, fromVal: number, toVal: number) => {
      if (!el) return;
      const obj = { v: fromVal };
      gsap.fromTo(
        obj,
        { v: fromVal },
        {
          v: toVal,
          duration: 0.6,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(obj.v).toString();
          },
        },
      );
    };
    animate(startRef.current, prevYearsRef.current.from, from);
    animate(endRef.current, prevYearsRef.current.to, to);
    prevYearsRef.current = { from, to };
  }, [from, to]);

  // стрелки категорий
  const prevCategory = () => setActiveCat(categoryByIndex(activeIdx - 1));
  const nextCategory = () => setActiveCat(categoryByIndex(activeIdx + 1));

  // при смене категории: слайдер в начало + fade-in блока + переставить активный лейбл
  useEffect(() => {
    if (swiperRef.current) swiperRef.current.slideTo(0, 400);
    if (eventsWrapRef.current) {
      gsap.fromTo(
        eventsWrapRef.current,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: EVENTS_FADE_DURATION, ease: 'power1.out' },
      );
    }
    gsap.delayedCall(0, () => {
      positionLabelAtIndex(activeIdx, activeLabelRef.current);
      gsap.set(activeLabelRef.current, { autoAlpha: 1 });
    });
  }, [activeCat, activeIdx]);

  // первоначальная раскладка + ресайз
  useEffect(() => {
    positionLabelAtIndex(activeIdx, activeLabelRef.current);
    gsap.set(activeLabelRef.current, { autoAlpha: 1 });

    const onResize = () => {
      positionLabelAtIndex(activeIdx, activeLabelRef.current);
      if (hoverIdx !== null) positionLabelAtIndex(hoverIdx, hoverLabelRef.current);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="hdates" aria-label="Исторические даты">
      {/* сетка */}
      <div className="hdates__grid-line" aria-hidden="true" />
      <div className="hdates__grid-line hdates__grid-line--h" aria-hidden="true" />
      <div className="hdates__grid-line hdates__grid-line--left" aria-hidden="true" />
      <div className="hdates__grid-line hdates__grid-line--right" aria-hidden="true" />

      {/* заголовок */}
      <h2 className="hdates__title">
        <span className="hdates__title-bar" aria-hidden="true" />
        Исторические даты
      </h2>

      <div className="hdates__stage" ref={stageRef}>
        {/* большие числа */}
        <div className="hdates__years" role="group" aria-label="Активный временной отрезок">
          <span className="hdates__year hdates__year--start" ref={startRef}>
            {from}
          </span>
          <span className="hdates__year hdates__year--end" ref={endRef}>
            {to}
          </span>
        </div>

        {/* орбита с точками */}
        <div className="hdates__orbit" ref={orbitRef}>
          {Array.from({ length: DOTS_COUNT }).map((_, i) => {
            const cx = ORBIT_W / 2;
            const cy = ORBIT_H / 2;
            const BORDER_W = 0.5;
            const rx = ORBIT_W / 2 - BORDER_W / 2;
            const ry = ORBIT_H / 2 - BORDER_W / 2;

            // общий сдвиг точек по дуге
            const angle = ((i * ANGLE_STEP + DOTS_ANGLE_OFFSET) - 90) * (Math.PI / 180);
            const x = cx + rx * Math.cos(angle);
            const y = cy + ry * Math.sin(angle);

            const cat = CATEGORY_ORDER[i];
            const isActive = i === activeIdx;

            return (
              <button
                key={i}
                type="button"
                className={`hdates__dot ${isActive ? 'is-active' : ''}`}
                style={{ left: x, top: y }}
                data-idx={i}
                aria-pressed={isActive}
                aria-label={`Категория: ${cat}`}
                onClick={() => setActiveCat(cat)}
                onMouseEnter={() => {
                  setHoverIdx(i);
                  gsap.delayedCall(0, () => {
                    positionLabelAtIndex(i, hoverLabelRef.current);
                    gsap.to(hoverLabelRef.current, { autoAlpha: 1, duration: 0.2 });
                  });
                }}
                onMouseLeave={() => {
                  setHoverIdx(null);
                  gsap.to(hoverLabelRef.current, { autoAlpha: 0, duration: 0.2 });
                }}
              >
                <span className="hdates__dot-bubble">
                  <span className="hdates__dot-bubble-text">{i + 1}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Плавающие лейблы: активный (всегда виден) и hover (только при наведении) */}
        <div className="hdates__float-label hdates__float-label--active" ref={activeLabelRef}>
          {activeCat}
        </div>
        <div
          className="hdates__float-label hdates__float-label--hover"
          ref={hoverLabelRef}
          style={{ opacity: 0 }}
        >
          {hoverIdx !== null ? CATEGORY_ORDER[hoverIdx] : ''}
        </div>

        {/* стрелки категорий */}
        <div className="hdates__nav" aria-label="Переключение категорий">
          <button className="hdates__nav-btn" onClick={prevCategory} aria-label="Назад">
            <img src={arrowLeft} width={56} height={56} alt="" />
          </button>
          <button className="hdates__nav-btn" onClick={nextCategory} aria-label="Вперёд">
            <img src={arrowRight} width={56} height={56} alt="" />
          </button>
        </div>
      </div>

      {/* нижний блок со слайдером событий */}
      <div className="hdates-events" ref={eventsWrapRef}>
        <div className="hdates-events__top">
          <div className="hdates-events__counter">
            {String(activeIdx + 1).padStart(2, '0')}/{String(CATEGORY_ORDER.length).padStart(2, '0')}
          </div>
        </div>

        {/* внешние стрелки Swiper */}
        <div className="hdates-events__arrows">
          <button
            className="hdates-events__btn hdates-events__btn--prev js-events-prev"
            aria-label="Предыдущие годы"
          >
            <img src={arrowDatesLeft} width={64} height={64} alt="" />
          </button>
          <button
            className="hdates-events__btn hdates-events__btn--next js-events-next"
            aria-label="Следующие годы"
          >
            <img src={arrowDatesRight} width={64} height={64} alt="" />
          </button>
        </div>

        <Swiper
          onSwiper={(s) => (swiperRef.current = s)}
          modules={[Navigation, Pagination]}
          navigation={{ prevEl: '.js-events-prev', nextEl: '.js-events-next' }}
          pagination={{ clickable: true }}
          spaceBetween={24}
          breakpoints={{ 0: { slidesPerView: 1.5 }, 768: { slidesPerView: 3 } }}
          onInit={(swiper) => {
            const toArr = (el: any) => (Array.isArray(el) ? el : [el]);
            const prevEls = toArr((swiper.navigation as any).prevEl);
            const nextEls = toArr((swiper.navigation as any).nextEl);
            const setDis = (el: Element | null, s: boolean) =>
              el && (s ? el.setAttribute('disabled', '') : el.removeAttribute('disabled'));
            const upd = () => {
              prevEls.forEach((el) => setDis(el, swiper.isBeginning));
              nextEls.forEach((el) => setDis(el, swiper.isEnd));
            };
            swiper.on('slideChange', upd);
            swiper.on('update', upd);
            upd();
          }}
        >
          {Array.from({ length: to - from + 1 }).map((_, k) => {
            const year = from + k;
            const text = eventsForYear(year, activeCat);
            return (
              <SwiperSlide key={year}>
                <article className="hdates-card">
                  <div className="hdates-card__year">{year}</div>
                  <div className="hdates-card__text">{text}</div>
                </article>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};
