import { DIET_PLAN, TRAINING_PLAN, PROGRESSION_RULES, getDietDay, getTrainingDay } from "./content.js";
import { effectiveSets, fromKg, localDateKey, trendSeries, weeklyAverage } from "./metrics.js";

const ROUTES = ["today", "diet", "training", "weight", "settings"];
const MEAL_ORDER = ["breakfast", "lunch", "fruit", "dinner"];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function dateForWeekday(now, targetWeekday) {
  const date = new Date(now);
  date.setHours(12, 0, 0, 0);
  const current = date.getDay() === 0 ? 7 : date.getDay();
  const target = targetWeekday === 0 ? 7 : targetWeekday;
  date.setDate(date.getDate() + target - current);
  return localDateKey(date);
}

function latestMorningWeight(records) {
  return records
    .filter((record) => record.period === "morning")
    .sort((left, right) => right.date.localeCompare(left.date))[0] ?? null;
}

export function buildViewModel({
  state,
  route = "today",
  now = new Date(),
  trendDays = 7,
  selectedDietWeekday = now.getDay(),
  selectedTrainingWeekday = now.getDay(),
}) {
  const safeRoute = ROUTES.includes(route) ? route : "today";
  const dateKey = localDateKey(now);
  const weekday = now.getDay();
  const dietDay = getDietDay(weekday);
  const trainingDay = getTrainingDay(weekday);
  const completions = state.completions[dateKey] ?? {};
  const mealItems = MEAL_ORDER.map((key) => dietDay.meals[key]);
  const latestMorning = latestMorningWeight(state.weights);
  const unitLabel = state.settings.unit === "jin" ? "斤" : "kg";

  return {
    state,
    route: safeRoute,
    now,
    dateKey,
    weekday,
    dateLabel: new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(now),
    dietDay,
    trainingDay,
    selectedDietDay: getDietDay(selectedDietWeekday),
    selectedTrainingDay: getTrainingDay(selectedTrainingWeekday),
    selectedDietDateKey: dateForWeekday(now, selectedDietWeekday),
    selectedTrainingDateKey: dateForWeekday(now, selectedTrainingWeekday),
    completedMeals: mealItems.filter((item) => completions[item.id]).length,
    totalMeals: mealItems.length,
    completedExercises: trainingDay.exercises.filter((item) => completions[`training-${trainingDay.id}-${item.id}`]).length,
    totalExercises: trainingDay.exercises.length,
    trendDays: trendDays === 30 ? 30 : 7,
    trend: trendSeries(state.weights, trendDays === 30 ? 30 : 7, dateKey),
    weeklyAverageKg: weeklyAverage(state.weights, dateKey),
    latestMorning,
    unitLabel,
    currentWeight: latestMorning ? fromKg(latestMorning.valueKg, state.settings.unit) : null,
    initialWeight: fromKg(state.settings.initialWeightKg, state.settings.unit),
    targetWeight: fromKg(state.settings.targetWeightKg, state.settings.unit),
  };
}

function checkIcon(checked) {
  return `<span class="check-mark" aria-hidden="true">${checked ? "✓" : ""}</span>`;
}

function completionControl({ id, date, checked, label }) {
  return `<label class="completion-control">
    <input type="checkbox" data-completion-id="${escapeHtml(id)}" data-completion-date="${date}" ${checked ? "checked" : ""} />
    ${checkIcon(checked)}
    <span class="sr-only">${checked ? "取消完成" : "标记完成"}：${escapeHtml(label)}</span>
  </label>`;
}

function pageHeader(eyebrow, title, subtitle = "") {
  return `<header class="page-header">
    <span class="eyebrow">${escapeHtml(eyebrow)}</span>
    <h1>${escapeHtml(title)}</h1>
    ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
  </header>`;
}

function progressRing(completed, total) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 100;
  return `<div class="progress-ring" style="--progress:${percent * 3.6}deg" aria-label="完成 ${completed}/${total}">
    <strong>${percent}%</strong><span>今日</span>
  </div>`;
}

function mealCard(item, date, completions) {
  const checked = Boolean(completions[item.id]);
  return `<article class="card meal-card ${checked ? "is-complete" : ""}">
    <div class="card-icon meal-icon" aria-hidden="true">${item.title === "早餐" ? "☀" : item.title === "下午水果" ? "●" : item.title === "美宜佳晚餐" ? "◇" : "□"}</div>
    <div class="card-copy"><span class="card-kicker">${escapeHtml(item.title)}</span><p>${escapeHtml(item.description)}</p></div>
    ${completionControl({ id: item.id, date, checked, label: item.title })}
  </article>`;
}

function weightQuickForm(period, model) {
  const title = period === "morning" ? "晨重" : "晚重";
  return `<form class="weight-quick card" data-weight-form data-period="${period}">
    <input type="hidden" name="date" value="${model.dateKey}" />
    <input type="hidden" name="period" value="${period}" />
    <label for="today-${period}">${title}</label>
    <div class="inline-input">
      <input id="today-${period}" name="weight" inputmode="decimal" type="number" min="1" max="999" step="0.1" placeholder="输入${model.unitLabel}" required />
      <span>${model.unitLabel}</span>
      <button type="submit" class="button compact">保存</button>
    </div>
  </form>`;
}

function renderToday(model) {
  const completions = model.state.completions[model.dateKey] ?? {};
  const trainingComplete = model.trainingDay.rest || model.completedExercises === model.totalExercises;
  const total = model.totalMeals + (model.trainingDay.rest ? 0 : 1);
  const completed = model.completedMeals + (trainingComplete && !model.trainingDay.rest ? 1 : 0);
  return `${pageHeader("TODAY", model.dateLabel, "今天只做需要做的事，完成一点就是进步。")}
    <section class="hero-card">
      <div><span class="hero-label">今日计划</span><h2>${model.trainingDay.rest ? "恢复与休息" : model.trainingDay.title}</h2><p>${escapeHtml(model.trainingDay.focus)}</p></div>
      ${progressRing(completed, total)}
    </section>
    <section class="section-block"><div class="section-heading"><div><span>饮食</span><h2>${model.dietDay.label}安排</h2></div><strong>${model.completedMeals}/${model.totalMeals}</strong></div>
      <div class="card-stack">${MEAL_ORDER.map((key) => mealCard(model.dietDay.meals[key], model.dateKey, completions)).join("")}</div>
    </section>
    <section class="section-block"><div class="section-heading"><div><span>训练</span><h2>${escapeHtml(model.trainingDay.title)}</h2></div><strong>${model.trainingDay.rest ? "休息" : `${model.completedExercises}/${model.totalExercises}`}</strong></div>
      <article class="card training-preview"><div><span class="pill">${model.trainingDay.durationMinutes || "—"}${model.trainingDay.rest ? "" : " 分钟"}</span><p>${escapeHtml(model.trainingDay.focus)}</p></div>
      <a class="button secondary" href="#training">${model.trainingDay.rest ? "查看恢复建议" : "开始今日训练"}</a></article>
    </section>
    <section class="section-block"><div class="section-heading"><div><span>记录</span><h2>早晚体重</h2></div></div><div class="weight-grid">${weightQuickForm("morning", model)}${weightQuickForm("evening", model)}</div></section>`;
}

function weekdayTabs(selectedWeekday, attribute) {
  return `<div class="weekday-tabs" role="tablist" aria-label="选择星期">${DIET_PLAN.map((day) => `<button type="button" role="tab" class="weekday-tab ${day.weekday === selectedWeekday ? "is-active" : ""}" ${attribute}="${day.weekday}" aria-selected="${day.weekday === selectedWeekday}">${day.label.slice(1)}</button>`).join("")}</div>`;
}

function renderDiet(model) {
  const day = model.selectedDietDay;
  const completions = model.state.completions[model.selectedDietDateKey] ?? {};
  return `${pageHeader("NUTRITION", "七天饮食", "按计划选择，不需要计算每一口热量。")}
    ${weekdayTabs(day.weekday, "data-diet-weekday")}
    <section class="card-stack spaced">${MEAL_ORDER.map((key) => mealCard(day.meals[key], model.selectedDietDateKey, completions)).join("")}</section>
    <section class="section-block"><div class="section-heading"><div><span>总览</span><h2>一周饮食表</h2></div></div>
      <div class="week-table-wrap"><table><thead><tr><th>星期</th><th>早餐</th><th>中午</th><th>水果</th><th>晚餐</th></tr></thead><tbody>
      ${DIET_PLAN.map((item) => `<tr><th>${item.label}</th>${MEAL_ORDER.map((key) => `<td>${escapeHtml(item.meals[key].description)}</td>`).join("")}</tr>`).join("")}
      </tbody></table></div>
    </section>
    <aside class="info-card"><strong>选择提示</strong><p>午间熟食整袋蛋白质尽量不少于 25 g。关东煮优先白萝卜、海带、魔芋和豆腐，不喝汤；少选香肠、鱼丸、蟹棒、芝士丸和油豆腐。</p></aside>`;
}

function exerciseCard(exercise, day, date, state, trainingWeek) {
  const completionId = `training-${day.id}-${exercise.id}`;
  const checked = Boolean(state.completions[date]?.[completionId]);
  const sets = effectiveSets(exercise.sets, trainingWeek);
  return `<article class="card exercise-card ${checked ? "is-complete" : ""}">
    <div class="exercise-index">${String(day.exercises.indexOf(exercise) + 1).padStart(2, "0")}</div>
    <div class="card-copy"><h3>${escapeHtml(exercise.name)}</h3><div class="exercise-meta"><strong>${sets} 组</strong><span>${escapeHtml(exercise.reps)}</span><span>休息 ${exercise.restSeconds} 秒</span></div><p>${escapeHtml(exercise.tip)}</p></div>
    ${completionControl({ id: completionId, date, checked, label: exercise.name })}
  </article>`;
}

function renderTraining(model) {
  const day = model.selectedTrainingDay;
  const weekRule = PROGRESSION_RULES.find((rule) => rule.week === model.state.settings.trainingWeek);
  return `${pageHeader("TRAINING", "六日力量计划", `当前第 ${model.state.settings.trainingWeek} 周 · ${weekRule.title}`)}
    ${weekdayTabs(day.weekday, "data-training-weekday")}
    <section class="training-hero"><div><span>${day.label}</span><h2>${escapeHtml(day.title)}</h2><p>${escapeHtml(day.focus)}</p></div><strong>${day.rest ? "休息" : `${day.durationMinutes}′`}</strong></section>
    <aside class="info-card compact-info"><strong>${escapeHtml(weekRule.title)}</strong><p>${escapeHtml(weekRule.description)}</p></aside>
    ${day.rest ? `<article class="rest-card"><div class="rest-orb">☾</div><h2>今天让身体恢复</h2><p>可以轻松散步或拉伸，但不安排正式力量训练。</p></article>` : `<div class="routine-note"><span>热身 5 分钟</span><p>${escapeHtml(day.warmup)}</p></div><section class="card-stack">${day.exercises.map((item) => exerciseCard(item, day, model.selectedTrainingDateKey, model.state, model.state.settings.trainingWeek)).join("")}</section><div class="routine-note"><span>放松 3–5 分钟</span><p>${escapeHtml(day.cooldown)}</p></div>`}`;
}

function weightRecordRow(record, model) {
  const key = `${record.date}|${record.period}`;
  const label = record.period === "morning" ? "晨重" : "晚重";
  return `<li class="record-row"><div><strong>${fromKg(record.valueKg, model.state.settings.unit)} ${model.unitLabel}</strong><span>${record.date} · ${label}</span></div><div><button type="button" class="icon-button" data-edit-weight="${key}" aria-label="编辑 ${record.date} ${label}">✎</button><button type="button" class="icon-button danger" data-delete-weight="${key}" aria-label="删除 ${record.date} ${label}">×</button></div></li>`;
}

function renderWeight(model) {
  const average = model.weeklyAverageKg === null ? "—" : `${fromKg(model.weeklyAverageKg, model.state.settings.unit)} ${model.unitLabel}`;
  const change = model.latestMorning ? fromKg(model.latestMorning.valueKg - model.state.settings.initialWeightKg, model.state.settings.unit) : null;
  const remaining = model.latestMorning ? fromKg(model.latestMorning.valueKg - model.state.settings.targetWeightKg, model.state.settings.unit) : null;
  const records = [...model.state.weights].sort((a, b) => b.date.localeCompare(a.date) || (a.period === "evening" ? -1 : 1));
  return `${pageHeader("WEIGHT", "体重趋势", "早晚分开记录，关注晨重周平均。")}
    <section class="stat-grid"><article><span>当前晨重</span><strong>${model.currentWeight ?? "—"}</strong><small>${model.currentWeight ? model.unitLabel : "暂无"}</small></article><article><span>近 7 天晨重平均</span><strong>${average === "—" ? "—" : average.split(" ")[0]}</strong><small>${average === "—" ? "暂无" : model.unitLabel}</small></article><article><span>累计变化</span><strong>${change === null ? "—" : `${change > 0 ? "+" : ""}${change}`}</strong><small>${change === null ? "暂无" : model.unitLabel}</small></article><article><span>距离目标</span><strong>${remaining === null ? "—" : Math.max(0, remaining)}</strong><small>${remaining === null ? "暂无" : model.unitLabel}</small></article></section>
    <section class="chart-card card"><div class="chart-head"><div><span>趋势</span><h2>${model.trendDays} 天</h2></div><div class="segment-control"><button type="button" data-trend-days="7" class="${model.trendDays === 7 ? "is-active" : ""}">7天</button><button type="button" data-trend-days="30" class="${model.trendDays === 30 ? "is-active" : ""}">30天</button></div></div><svg id="weight-chart"></svg><div class="chart-legend"><span class="morning">晨重</span><span class="evening">晚重</span></div></section>
    <section class="section-block"><div class="section-heading"><div><span>新增</span><h2>记录体重</h2></div></div><div class="weight-grid">${weightQuickForm("morning", model)}${weightQuickForm("evening", model)}</div></section>
    <section class="section-block"><div class="section-heading"><div><span>历史</span><h2>最近记录</h2></div></div>${records.length ? `<ul class="record-list">${records.slice(0, 20).map((record) => weightRecordRow(record, model)).join("")}</ul>` : `<div class="empty-state">还没有体重记录</div>`}</section>`;
}

function renderSettings(model) {
  return `${pageHeader("SETTINGS", "设置与备份", "所有记录只保存在这台 iPhone。")}
    <form class="settings-form card" data-settings-form>
      <label>体重单位<select name="unit"><option value="jin" ${model.state.settings.unit === "jin" ? "selected" : ""}>斤</option><option value="kg" ${model.state.settings.unit === "kg" ? "selected" : ""}>公斤</option></select></label>
      <label>当前训练周<select name="trainingWeek">${[1, 2, 3, 4].map((week) => `<option value="${week}" ${model.state.settings.trainingWeek === week ? "selected" : ""}>第 ${week} 周</option>`).join("")}</select></label>
      <label>初始体重（${model.unitLabel}）<input name="initialWeight" type="number" step="0.1" min="1" value="${model.initialWeight}" required /></label>
      <label>阶段目标（${model.unitLabel}）<input name="targetWeight" type="number" step="0.1" min="1" value="${model.targetWeight}" required /></label>
      <button class="button" type="submit">保存设置</button>
    </form>
    <section class="section-block"><div class="section-heading"><div><span>本机数据</span><h2>备份与恢复</h2></div></div><div class="action-list card"><button type="button" data-action="export"><span>导出备份</span><small>保存 JSON 文件</small></button><button type="button" data-action="import"><span>恢复备份</span><small>从文件替换本机记录</small></button><input id="backup-file" type="file" accept="application/json,.json" hidden /><button type="button" class="danger-row" data-action="clear"><span>清除本机数据</span><small>此操作不可撤销</small></button></div></section>
    <aside class="privacy-card"><span aria-hidden="true">⌁</span><div><strong>隐私说明</strong><p>应用没有账号、广告和统计脚本。删除应用或清理 Safari 网站数据前，请先导出备份。</p></div></aside>`;
}

function navIcon(route) {
  const paths = {
    today: "M12 3a9 9 0 1 0 9 9h-9V3Zm0 0v9l6.4 3.7",
    diet: "M5 3v8m4-8v8M7 3v18m7-18v7a3 3 0 0 0 6 0V3m-3 10v8",
    training: "M4 9v6m3-8v10m10-10v10m3-8v6M7 12h10",
    weight: "M5 5h14v14H5zM9 9a3 3 0 0 1 6 0",
    settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4",
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[route]}" /></svg>`;
}

function bottomNav(active) {
  const items = [
    ["today", "今日"],
    ["diet", "饮食"],
    ["training", "训练"],
    ["weight", "体重"],
    ["settings", "设置"],
  ];
  return `<nav class="bottom-nav" aria-label="主导航">${items.map(([route, label]) => `<a href="#${route}" class="${active === route ? "is-active" : ""}" ${active === route ? 'aria-current="page"' : ""}>${navIcon(route)}<span>${label}</span></a>`).join("")}</nav>`;
}

export function renderPage(model) {
  const content = {
    today: renderToday,
    diet: renderDiet,
    training: renderTraining,
    weight: renderWeight,
    settings: renderSettings,
  }[model.route](model);
  return `<div class="app-shell"><main class="page-content">${content}</main>${bottomNav(model.route)}<div id="toast" class="toast" role="status" aria-live="polite"></div></div>`;
}

export function renderApp(root, model) {
  root.innerHTML = renderPage(model);
}
