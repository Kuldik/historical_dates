export const CATEGORIES = [
  'Информатика',
  'Наука',
  'Литература',
  'Кинематограф',
  'Игры',
  'Политика'
] as const;

export type Category = typeof CATEGORIES[number];
