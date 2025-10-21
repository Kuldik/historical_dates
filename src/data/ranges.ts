// src/data/ranges.ts
import { CATEGORY_INTERVALS } from './events';
import { CATEGORY_ORDER } from './constants';
import type { Category } from './categories';

export function rangeForCategory(category: Category) {
  return CATEGORY_INTERVALS[category]; // { from, to }
}

export function indexByCategory(cat: Category) {
  return CATEGORY_ORDER.indexOf(cat);
}

export function categoryByIndex(i: number): Category {
  const len = CATEGORY_ORDER.length;
  return CATEGORY_ORDER[(i + len) % len];
}

export const TOTAL_INTERVALS = CATEGORY_ORDER.length; // 6
export { CATEGORY_ORDER };
