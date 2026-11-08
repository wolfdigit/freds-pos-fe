const TAIPEI_TIME_ZONE = 'Asia/Taipei';

/**
 * 收據抬頭時間。帶 Z 或數字時區的時間是絕對時刻，顯示為台灣時間。
 * 沒有時區的字串視為已寫好的鐘面，不再依機器時區或台北時區平移。
 * 無法解析或缺少的值原樣退回，不補造日期。
 */
export function formatReceiptDateTime(value: string | null | undefined): string {
  if (value == null) return '';
  const raw = value.trim();
  if (!raw) return raw;

  if (hasExplicitTimeZone(raw)) {
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;
    return formatInstantInTaipei(parsed);
  }

  return formatNaiveWallClock(raw);
}

function hasExplicitTimeZone(value: string): boolean {
  return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
}

function formatInstantInTaipei(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TAIPEI_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${read('year')}-${read('month')}-${read('day')} ${read('hour')}:${read('minute')}:${read('second')}`;
}

function formatNaiveWallClock(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return value;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = match[6] === undefined ? null : Number(match[6]);
  if (!isValidWallClock(year, month, day, hour, minute, second)) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  const clock = second === null ? `${pad(hour)}:${pad(minute)}` : `${pad(hour)}:${pad(minute)}:${pad(second)}`;
  return `${match[1]}-${match[2]}-${match[3]} ${clock}`;
}

function isValidWallClock(year: number, month: number, day: number, hour: number, minute: number, second: number | null): boolean {
  if (month < 1 || month > 12 || day < 1 || hour > 23 || minute > 59 || (second !== null && second > 59)) return false;
  const probe = new Date(Date.UTC(year, month - 1, day));
  return probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day;
}

/**
 * 格式化 ISO 字串為 "YYYY-MM-DD HH:mm" 顯示
 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 格式化為 "YYYY-MM-DD" 顯示
 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
