import React, { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { CATEGORIES, type Category } from '@/data/categories';
import { buildRangesEndingWith } from '@/data/ranges';
import { eventsForYear } from '@/data/events';

import arrowLeft from '@/assets/arrow-left.svg';
import arrowRight from '@/assets/arrow-right.svg';
import arrowDatesLeft from '@/assets/arrow-dates-left.svg';
import arrowDatesRight from '@/assets/arrow-dates-right.svg';

const ORBIT_W = 536;
const ORBIT_H = 530;
const DOTS_COUNT = 6;
const ANGLE_STEP = 360 / DOTS_COUNT;
const TARGET_ANGLE = -20; // угол, в который «приводим» активную категорию (позиция как на скринах)

type Range = { start: number; end: number };

export const HistoricalDates: React.FC = () => {
  // вычисляем 6 отрезков так, чтобы последний заканчивался текущим годом
  const ranges = useMemo<Range[]>(() => buildRangesEndingWith(2025), []); // зафиксировали под ТЗ
  const [activeIndex, setActiveIndex] = useState(0); // 0..5
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[1]); // старт — «Наука», можно поменять

  const orbitRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement[]>([]);

  // вращение круга к активной категории — каждая категория привязана к фиксированному индексу 0..5
  const categoryIndex = useMemo(
    () => CATEGORIES.indexOf(activeCategory),
    [activeCategory]
  );

  useEffect(() => {
    if (!orbitRef.current) return;
    // приводим так, чтобы точка категории оказалась в TARGET_ANGLE
    const currentRotation = gsap.getProperty(orbitRef.current, 'rotate') as number;
    const desired = TARGET_ANGLE - categoryIndex * ANGLE_STEP;
    gsap.to(orbitRef.current, { rotate: desired, duration: 0.6, ease: 'power2.out' });

    // небольшая «жизнь» точкам
    dotsRef.current.forEach((el, i) => {
      if (!el) return;
      const bubble = el.querySelector('.hdates__dot-bubble') as HTMLElement | null;
      const label = el.querySelector('.hdates__dot-label') as HTMLElement | null;
      el.onmouseenter = () => {
        gsap.to(bubble, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
        gsap.to(label, { opacity: 1, duration: 0.4, ease: 'power2.out' });
      };
      el.onmouseleave = () => {
        gsap.to(bubble, { opacity: 0, scale: 0.7, duration: 0.4, ease: 'power2.out' });
        gsap.to(label, { opacity: 0, duration: 0.4, ease: 'power2.out' });
      };
    });
  }, [categoryIndex]);

  const range = ranges[activeIndex];

  // числа «пересчитываются» (анимация числа)
  const startRef = useRef<HTMLSpanElement>(null);
  const endRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const animateNumber = (el: HTMLSpanElement | null, from: number, to: number) => {
      if (!el) return;
      const obj = { val: from };
      gsap.to(obj, {
        val: to,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.val).toString(); }
      });
    };
    animateNumber(startRef.current, parseInt(startRef.current?.textContent || '0', 10) || range.start, range.start);
    animateNumber(endRef.current, parseInt(endRef.current?.textContent || '0', 10) || range.end, range.end);
  }, [range.start, range.end]);

  // координаты точек по окружности
  const cx = ORBIT_W / 2, cy = ORBIT_H / 2;
  const rx = ORBIT_W / 2 - 12; // чуть внутрь линии
  const ry = ORBIT_H / 2 - 12;

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < ranges.length - 1;

  return (
    <section className="hdates" aria-label="Исторические даты">
      <div className="hdates__grid-line" aria-hidden="true"></div>
      <div className="hdates__grid-line hdates__grid-line--h" aria-hidden="true"></div>

      <h2 className="hdates__title">
        <span className="hdates__title-bar" aria-hidden="true"></span>
        Исторические даты
      </h2>

      <div className="hdates__years" role="group" aria-label="Активный временной отрезок">
        <span className="hdates__year hdates__year--start" ref={startRef}>{range.start}</span>
        <span className="hdates__year hdates__year--end" ref={endRef}>{range.end}</span>
      </div>

      {/* Центральная окружность и точки */}
      <div className="hdates__orbit" ref={orbitRef} aria-hidden="false">
        {/* 6 точек */}
        {Array.from({ length: DOTS_COUNT }).map((_, i) => {
          const angle = (i * ANGLE_STEP - 90) * (Math.PI / 180); // 0° вверх
          const x = cx + rx * Math.cos(angle);
          const y = cy + ry * Math.sin(angle);
          const cat = CATEGORIES[i];

          return (
            <div
              key={i}
              ref={(el) => { if (el) dotsRef.current[i] = el; }}
              className="hdates__dot"
              style={{ left: x, top: y }}
              role="button"
              aria-label={`Перейти к промежутку: ${cat}`}
              onClick={() => setActiveCategory(cat)}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' ? setActiveCategory(cat) : null)}
            >
              <div className="hdates__dot-bubble">{i + 1}</div>
              <div className="hdates__dot-label">{cat}</div>
            </div>
          );
        })}
      </div>

      {/* Кнопки смены временных отрезков */}
      <div className="hdates__nav" aria-label="Переключение временных отрезков">
        <button
          className="hdates__nav-btn"
          onClick={() => canPrev && setActiveIndex((v) => v - 1)}
          disabled={!canPrev}
          aria-label="Предыдущий отрезок"
        >
          <img src={arrowLeft} width="18" height="18" alt="" aria-hidden="true" />
        </button>
        <button
          className="hdates__nav-btn"
          onClick={() => canNext && setActiveIndex((v) => v + 1)}
          disabled={!canNext}
          aria-label="Следующий отрезок"
        >
          <img src={arrowRight} width="18" height="18" alt="" aria-hidden="true" />
        </button>
      </div>

      {/* Нижний слайдер событий */}
      <div className="hdates-events">
        <div className="hdates-events__top">
          <div className="hdates-events__counter">
            {String(activeIndex + 1).padStart(2, '0')}/{String(ranges.length).padStart(2, '0')}
          </div>
          <div className="hdates-events__nav">
            {/* кнопки навигации Swiper (присваиваются через className) */}
            <button className="hdates-events__btn js-events-prev" aria-label="Предыдущие события">
              <img src={arrowDatesLeft} width="16" height="16" alt="" aria-hidden="true" />
            </button>
            <button className="hdates-events__btn js-events-next" aria-label="Следующие события">
              <img src={arrowDatesRight} width="16" height="16" alt="" aria-hidden="true" />
            </button>
          </div>
        </div>

        <Swiper
            modules={[Navigation, Pagination]}
            navigation={{ prevEl: '.js-events-prev', nextEl: '.js-events-next' }}
            pagination={{ clickable: true }}
            spaceBetween={24}
            breakpoints={{ 0: { slidesPerView: 1.5 }, 768: { slidesPerView: 3 } }}
            onInit={(swiper) => {
                // реальный DOM из swiper.navigation.* (а не из params)
                const toArray = (el: any) => (Array.isArray(el) ? el : [el]);
                const prevEls = toArray((swiper.navigation as any).prevEl);
                const nextEls = toArray((swiper.navigation as any).nextEl);

                const setDisabledAttr = (el: Element | null, state: boolean) => {
                if (!el) return;
                // безопасно на всех браузерах
                if ((el as any).toggleAttribute) {
                    (el as any).toggleAttribute('disabled', state);
                } else {
                    state ? (el as HTMLElement).setAttribute('disabled', '')
                        : (el as HTMLElement).removeAttribute('disabled');
                }
                };

                const updateButtons = () => {
                prevEls.forEach((el) => setDisabledAttr(el as Element, swiper.isBeginning));
                nextEls.forEach((el) => setDisabledAttr(el as Element, swiper.isEnd));
                };

                swiper.on('slideChange', updateButtons);
                swiper.on('update', updateButtons);
                updateButtons();
            }}
        >
          {Array.from({ length: range.end - range.start + 1 }).map((_, k) => {
            const year = range.start + k;
            const text = eventsForYear(year, activeCategory);
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
