import { renderWeightChart } from "./chart.js";
import { fromKg, removeWeight, toKg, upsertWeight } from "./metrics.js";
import {
  clearState,
  createDefaultState,
  exportBackup,
  loadState,
  parseBackup,
  saveState,
  setCompletion,
} from "./storage.js";
import { buildViewModel, renderApp } from "./views.js";

const root = document.querySelector("#app");
let state = loadState(localStorage);
let trendDays = 7;
let selectedDietWeekday = new Date().getDay();
let selectedTrainingWeekday = new Date().getDay();

function routeFromHash() {
  return window.location.hash.replace(/^#/, "") || "today";
}

function model() {
  return buildViewModel({
    state,
    route: routeFromHash(),
    now: new Date(),
    trendDays,
    selectedDietWeekday,
    selectedTrainingWeekday,
  });
}

function paint() {
  const current = model();
  renderApp(root, current);
  const chart = document.querySelector("#weight-chart");
  if (chart) renderWeightChart(chart, current.trend, current.state.settings.unit);
}

function persist(nextState) {
  state = nextState;
  saveState(localStorage, state);
  paint();
}

function toast(message) {
  const element = document.querySelector("#toast");
  if (!element) return;
  element.textContent = message;
  element.classList.add("is-visible");
  window.setTimeout(() => element.classList.remove("is-visible"), 2200);
}

function saveWeight(form) {
  const fields = new FormData(form);
  const weight = Number(fields.get("weight"));
  try {
    const weights = upsertWeight(state.weights, {
      date: String(fields.get("date")),
      period: String(fields.get("period")),
      valueKg: toKg(weight, state.settings.unit),
    });
    persist({ ...state, weights });
    toast("体重已保存在本机");
  } catch (error) {
    toast(error.message);
  }
}

function editWeight(key) {
  const [date, period] = key.split("|");
  const record = state.weights.find((item) => item.date === date && item.period === period);
  if (!record) return;
  const current = fromKg(record.valueKg, state.settings.unit);
  const entered = window.prompt(`修改${period === "morning" ? "晨重" : "晚重"}（${state.settings.unit === "jin" ? "斤" : "kg"}）`, current);
  if (entered === null) return;
  try {
    const weights = upsertWeight(state.weights, { date, period, valueKg: toKg(Number(entered), state.settings.unit) });
    persist({ ...state, weights });
    toast("体重记录已更新");
  } catch (error) {
    toast(error.message);
  }
}

function downloadBackup() {
  const blob = new Blob([exportBackup(state)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `减脂塑形助手备份-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast("备份已导出");
}

async function importBackup(file) {
  if (!file) return;
  try {
    const restored = parseBackup(await file.text());
    if (!window.confirm("恢复备份会替换当前本机记录，确定继续吗？")) return;
    persist(restored);
    toast("备份已恢复");
  } catch (error) {
    toast(error.message);
  }
}

root.addEventListener("change", (event) => {
  const completion = event.target.closest("[data-completion-id]");
  if (completion) {
    persist(setCompletion(
      state,
      completion.dataset.completionDate,
      completion.dataset.completionId,
      completion.checked,
    ));
    toast(completion.checked ? "已完成" : "已取消完成");
    return;
  }

  if (event.target.id === "backup-file") importBackup(event.target.files?.[0]);
});

root.addEventListener("submit", (event) => {
  event.preventDefault();
  const weightForm = event.target.closest("[data-weight-form]");
  if (weightForm) {
    saveWeight(weightForm);
    return;
  }

  const settingsForm = event.target.closest("[data-settings-form]");
  if (settingsForm) {
    const fields = new FormData(settingsForm);
    const unit = fields.get("unit") === "kg" ? "kg" : "jin";
    const initialWeightKg = toKg(Number(fields.get("initialWeight")), unit);
    const targetWeightKg = toKg(Number(fields.get("targetWeight")), unit);
    if (![initialWeightKg, targetWeightKg].every((value) => value > 0 && value < 500)) {
      toast("请输入有效体重");
      return;
    }
    persist({
      ...state,
      settings: {
        unit,
        trainingWeek: Number(fields.get("trainingWeek")),
        initialWeightKg,
        targetWeightKg,
      },
    });
    toast("设置已保存");
  }
});

root.addEventListener("click", (event) => {
  const dietTab = event.target.closest("[data-diet-weekday]");
  if (dietTab) {
    selectedDietWeekday = Number(dietTab.dataset.dietWeekday);
    paint();
    return;
  }

  const trainingTab = event.target.closest("[data-training-weekday]");
  if (trainingTab) {
    selectedTrainingWeekday = Number(trainingTab.dataset.trainingWeekday);
    paint();
    return;
  }

  const trendButton = event.target.closest("[data-trend-days]");
  if (trendButton) {
    trendDays = Number(trendButton.dataset.trendDays) === 30 ? 30 : 7;
    paint();
    return;
  }

  const editButton = event.target.closest("[data-edit-weight]");
  if (editButton) {
    editWeight(editButton.dataset.editWeight);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-weight]");
  if (deleteButton) {
    const [date, period] = deleteButton.dataset.deleteWeight.split("|");
    if (window.confirm("删除这条体重记录吗？")) {
      persist({ ...state, weights: removeWeight(state.weights, date, period) });
      toast("记录已删除");
    }
    return;
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "export") downloadBackup();
  if (action === "import") document.querySelector("#backup-file")?.click();
  if (action === "clear" && window.confirm("确定清除这台设备上的全部记录吗？此操作不可撤销。")) {
    clearState(localStorage);
    state = createDefaultState();
    paint();
    toast("本机数据已清除");
  }
});

window.addEventListener("hashchange", paint);
paint();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // The app remains usable online if this browser cannot register the offline shell.
    });
  });
}
