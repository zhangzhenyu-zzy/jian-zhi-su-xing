function pad(value) {
  return String(value).padStart(2, "0");
}

function roundOne(value) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function shiftDateKey(key, days) {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toKg(value, unit) {
  const numeric = Number(value);
  return unit === "jin" ? numeric / 2 : numeric;
}

export function fromKg(valueKg, unit) {
  const numeric = Number(valueKg);
  return roundOne(unit === "jin" ? numeric * 2 : numeric);
}

export function upsertWeight(records, record) {
  if (
    !record ||
    !/^\d{4}-\d{2}-\d{2}$/.test(record.date) ||
    !(record.period === "morning" || record.period === "evening") ||
    !Number.isFinite(record.valueKg) ||
    record.valueKg <= 0 ||
    record.valueKg >= 500
  ) {
    throw new Error("请输入有效体重");
  }

  const next = records.filter(
    (item) => !(item.date === record.date && item.period === record.period),
  );
  next.push({ ...record, valueKg: roundOne(record.valueKg) });
  return next.sort((left, right) => {
    const byDate = left.date.localeCompare(right.date);
    if (byDate !== 0) return byDate;
    return left.period === "morning" ? -1 : 1;
  });
}

export function removeWeight(records, date, period) {
  return records.filter((item) => !(item.date === date && item.period === period));
}

export function weeklyAverage(records, endDate) {
  const startDate = shiftDateKey(endDate, -6);
  const values = records
    .filter((record) => record.period === "morning" && record.date >= startDate && record.date <= endDate)
    .map((record) => record.valueKg);

  if (values.length === 0) return null;
  return roundOne(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function trendSeries(records, days, endDate) {
  const requestedDays = days === 30 ? 30 : 7;
  const recordMap = new Map();
  for (const record of records) {
    if (!recordMap.has(record.date)) {
      recordMap.set(record.date, { morningKg: null, eveningKg: null });
    }
    recordMap.get(record.date)[record.period === "morning" ? "morningKg" : "eveningKg"] = record.valueKg;
  }

  return Array.from({ length: requestedDays }, (_, index) => {
    const date = shiftDateKey(endDate, index - requestedDays + 1);
    const values = recordMap.get(date) ?? { morningKg: null, eveningKg: null };
    return { date, morningKg: values.morningKg, eveningKg: values.eveningKg };
  });
}

export function effectiveSets(plannedSets, trainingWeek) {
  if (trainingWeek === 1) return Math.min(2, plannedSets);
  if (trainingWeek === 2) return Math.min(3, plannedSets);
  return plannedSets;
}
