const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** UTC instant range [start, end) covering "today" in JST (fixed UTC+9, no DST). */
export function getJstTodayRangeUtc(): { startUtc: string; endUtc: string } {
  const jstNow = new Date(Date.now() + JST_OFFSET_MS);
  const jstMidnightUtcMs =
    Date.UTC(jstNow.getUTCFullYear(), jstNow.getUTCMonth(), jstNow.getUTCDate()) -
    JST_OFFSET_MS;

  return {
    startUtc: new Date(jstMidnightUtcMs).toISOString(),
    endUtc: new Date(jstMidnightUtcMs + 24 * 60 * 60 * 1000).toISOString(),
  };
}
