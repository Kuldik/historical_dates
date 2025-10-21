// src/data/events.ts
import type { Category } from './categories';
import { CATEGORY_ORDER } from './constants';

/** Константы таймлайна */
export const END_YEAR = 2025;
export const INTERVALS_COUNT = 6;
export const YEARS_PER_INTERVAL = 5;
export const START_YEAR = END_YEAR - INTERVALS_COUNT * YEARS_PER_INTERVAL + 1; // 1996

/** Диапазоны лет для каждого сегмента по визуальному порядку */
export const CATEGORY_INTERVALS: Record<Category, { from: number; to: number }> =
  CATEGORY_ORDER.reduce((acc, cat, idx) => {
    const from = START_YEAR + idx * YEARS_PER_INTERVAL;
    const to = from + YEARS_PER_INTERVAL - 1;
    acc[cat] = { from, to };
    return acc;
  }, {} as Record<Category, { from: number; to: number }>);

/** События по годам */
export const CATEGORY_YEAR_EVENTS: Record<Category, Record<number, string>> = {
  // 1996–2000
  'Информатика': {
    1996: 'Выпуск Java 1.0; формируется эпоха кросс-платформенной разработки.',
    1997: 'Ратифицирован стандарт IEEE 802.11 (Wi-Fi).',
    1998: 'Основана Google.',
    1999: 'Появился Napster; бум файлообмена и MP3.',
    2000: 'Запуск Windows 2000; «дотком-кризис» меняет IT-рынок.',
  },

  // 2001–2005
  'Кинематограф': {
    2001: 'Премьера «Властелин колец: Братство Кольца».',
    2002: '«Человек-паук» бьёт рекорды кассы в США.',
    2003: '«Возвращение короля» — 11 «Оскаров».',
    2004: '«Страсти Христовы» и «Шрек 2» — хиты проката года.',
    2005: '«Горбатая гора» — прорыв авторского кино на «Оскаре».',
  },

  // 2006–2010
  'Игры': {
    2006: 'Запуск Nintendo Wii; революция motion-контроля.',
    2007: 'Выход BioShock, Portal, Assassin’s Creed.',
    2008: 'Grand Theft Auto IV — рекордные продажи.',
    2009: 'Рождение Minecraft (ранние сборки/alpha).',
    2010: 'StarCraft II и Red Dead Redemption — главные релизы года.',
  },

  // 2011–2015
  'Литература': {
    2011: 'Нобелевская премия — Томас Транстрёмер.',
    2012: 'Букер — Хилари Мэнтел («Bring Up the Bodies»).',
    2013: 'Нобелевская премия — Элис Манро.',
    2014: 'Нобелевская премия — Патрик Модиано.',
    2015: 'Нобелевская премия — Светлана Алексиевич.',
  },

  // 2016–2020
  'Наука': {
    2016: 'LIGO: первое прямое наблюдение гравитационных волн.',
    2017: 'Открыты планеты TRAPPIST-1; бум CRISPR-исследований.',
    2018: 'Запущен зонд Parker Solar Probe к Солнцу.',
    2019: 'Первая фотография чёрной дыры (M87*).',
    2020: 'Глобальная пандемия COVID-19; ускоренная разработка вакцин.',
  },

  // 2021–2025
  'Политика': {
    2021: 'Инаугурация Джо Байдена; вывод войск США из Афганистана.',
    2022: 'Война в восточной Европе',
    2023: 'Индия успешно сажает Chandrayaan-3 у южного полюса Луны; саммиты G20.',
    2024: 'Швеция вступила в НАТО; «год мегавыборов» во многих странах.',
    2025: '—',
  },
};

/** Вернёт событие для данного года в рамках своей категории; иначе — пустую строку. */
export function eventsForYear(year: number, category: Category): string {
  const { from, to } = CATEGORY_INTERVALS[category];
  if (year < from || year > to) return '';
  return CATEGORY_YEAR_EVENTS[category][year] ?? '';
}
