/** Генерирует 6 последовательных отрезков по 6 лет, чтобы последний заканчивался текущим годом (включительно) */
export function buildRangesEndingWith(yearEnd = new Date().getFullYear()) {
  const step = 6; // 1990-1995, 1996-2001 ...
  const ranges: { start: number; end: number }[] = [];

  let end = yearEnd;
  let start = end - (step - 1);

  for (let i = 0; i < 6; i++) {
    ranges.unshift({ start, end });
    end = start - 1;
    start = end - (step - 1);
  }
  return ranges;
}
