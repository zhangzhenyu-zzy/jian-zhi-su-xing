export const STORAGE_KEY = "fitness-tracker-state-v1";
const SCHEMA_VERSION = 1;

export function createDefaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      unit: "jin",
      trainingWeek: 1,
      initialWeightKg: 90,
      targetWeightKg: 85.5,
    },
    completions: {},
    weights: [],
  };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isValidDateKey(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function isValidWeightRecord(record) {
  return isPlainObject(record)
    && isValidDateKey(record.date)
    && (record.period === "morning" || record.period === "evening")
    && Number.isFinite(record.valueKg)
    && record.valueKg > 0
    && record.valueKg < 500;
}

function normalizeState(candidate) {
  const defaults = createDefaultState();
  if (!isPlainObject(candidate) || candidate.schemaVersion !== SCHEMA_VERSION) {
    return defaults;
  }

  const settings = isPlainObject(candidate.settings) ? candidate.settings : {};
  const unit = settings.unit === "kg" || settings.unit === "jin" ? settings.unit : defaults.settings.unit;
  const trainingWeek = [1, 2, 3, 4].includes(settings.trainingWeek)
    ? settings.trainingWeek
    : defaults.settings.trainingWeek;
  const initialWeightKg = Number.isFinite(settings.initialWeightKg)
    ? settings.initialWeightKg
    : defaults.settings.initialWeightKg;
  const targetWeightKg = Number.isFinite(settings.targetWeightKg)
    ? settings.targetWeightKg
    : defaults.settings.targetWeightKg;

  return {
    schemaVersion: SCHEMA_VERSION,
    settings: { unit, trainingWeek, initialWeightKg, targetWeightKg },
    completions: isPlainObject(candidate.completions) ? structuredClone(candidate.completions) : {},
    weights: Array.isArray(candidate.weights)
      ? candidate.weights.filter(isValidWeightRecord).map(({ date, period, valueKg }) => ({ date, period, valueKg }))
      : [],
  };
}

export function loadState(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return createDefaultState();

  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return createDefaultState();
  }
}

export function saveState(storage, state) {
  storage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
}

export function setCompletion(state, date, itemId, complete) {
  const day = { ...(state.completions[date] ?? {}) };
  if (complete) day[itemId] = true;
  else delete day[itemId];

  return {
    ...state,
    completions: {
      ...state.completions,
      [date]: day,
    },
  };
}

export function exportBackup(state) {
  return JSON.stringify(normalizeState(state), null, 2);
}

export function parseBackup(json) {
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("备份文件无法解析");
  }

  if (!isPlainObject(parsed) || parsed.schemaVersion !== SCHEMA_VERSION) {
    throw new Error("不支持的备份版本");
  }
  if (!isPlainObject(parsed.settings) || !isPlainObject(parsed.completions) || !Array.isArray(parsed.weights)) {
    throw new Error("备份内容不完整");
  }
  if (!(parsed.settings.unit === "jin" || parsed.settings.unit === "kg")) {
    throw new Error("备份内容不完整");
  }
  if (![1, 2, 3, 4].includes(parsed.settings.trainingWeek)) {
    throw new Error("备份内容不完整");
  }
  if (!Number.isFinite(parsed.settings.initialWeightKg) || !Number.isFinite(parsed.settings.targetWeightKg)) {
    throw new Error("备份内容不完整");
  }
  if (!parsed.weights.every(isValidWeightRecord)) {
    throw new Error("备份包含无效体重记录");
  }

  return normalizeState(parsed);
}

export function clearState(storage) {
  storage.removeItem(STORAGE_KEY);
}
