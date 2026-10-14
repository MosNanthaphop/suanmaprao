export const numberFormatter = new Intl.NumberFormat('th-TH');
const moneyFormatter = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 });

export function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0);
}

export function formatMoney(value) {
  return '฿' + moneyFormatter.format(Number(value) || 0);
}

export function localDateString(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

export function dateFromString(value) {
  return new Date(value + 'T12:00:00');
}

export function formatDate(value, options = {}) {
  if (!value) return '—';
  const defaults = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', Object.assign(defaults, options))
    .format(dateFromString(value));
}

export function dayDifference(from, to) {
  const first = Date.parse(from + 'T00:00:00Z');
  const second = Date.parse(to + 'T00:00:00Z');
  return Math.round((second - first) / 86400000);
}

export function getTotal(harvest) {
  return Number(harvest.quantity) * Number(harvest.pricePerCoconut);
}

export function sortHarvests(harvests) {
  return [...harvests].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}
