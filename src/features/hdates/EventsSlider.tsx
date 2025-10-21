import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Props = { from: number; to: number; getText: (y: number) => string };

export const EventsSlider: React.FC<Props> = ({ from, to, getText }) => {
  const swiperRef = useRef<any>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // 🔥 fade-in при каждой смене диапазона (то есть категории)
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power1.out', clearProps: 'opacity,transform' }
    );
  }, [from, to]);

  return (
    <div className="hdates-events__swiper" ref={boxRef}>
      <Swiper
        onSwiper={(s) => (swiperRef.current = s)}
        modules={[Navigation, Pagination]}
        navigation={{ prevEl: '.js-events-prev', nextEl: '.js-events-next' }}
        pagination={{ clickable: true, el: '.hdates-mobile-pagination' }}
        spaceBetween={24}
        breakpoints={{ 0: { slidesPerView: 1.5 }, 768: { slidesPerView: 3 } }}
        onInit={(swiper) => {
          const toArr = (el: any) => (Array.isArray(el) ? el : [el]);
          const prevEls = toArr((swiper.navigation as any).prevEl);
          const nextEls = toArr((swiper.navigation as any).nextEl);
          const setDis = (el: Element | null, s: boolean) =>
            el && (s ? el.setAttribute('disabled', '') : el.removeAttribute('disabled'));
          const upd = () => { prevEls.forEach((el) => setDis(el, swiper.isBeginning)); nextEls.forEach((el) => setDis(el, swiper.isEnd)); };
          swiper.on('slideChange', upd); swiper.on('update', upd); upd();
        }}
      >
        {Array.from({ length: to - from + 1 }).map((_, k) => {
          const year = from + k;
          return (
            <SwiperSlide key={year}>
              <article className="hdates-card">
                <div className="hdates-card__year">{year}</div>
                <div className="hdates-card__text">{getText(year)}</div>
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};
