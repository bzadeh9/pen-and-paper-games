export function getValidSegmentStarts(row: boolean[], count: number): number[] {
  if (!Number.isInteger(count) || count < 1 || count > row.length) {
    return [];
  }

  const starts: number[] = [];
  for (let start = 0; start <= row.length - count; start += 1) {
    if (row.slice(start, start + count).every(Boolean)) {
      starts.push(start);
    }
  }
  return starts;
}

export function getFirstValidSegmentStart(
  row: boolean[],
  count: number
): number | null {
  const starts = getValidSegmentStarts(row, count);
  return starts.length > 0 ? starts[0] : null;
}
