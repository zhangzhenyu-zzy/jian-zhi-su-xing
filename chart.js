import { fromKg } from "./metrics.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export function chartGeometry(points, width = 320, height = 180) {
  const padding = { left: 28, right: 12, top: 16, bottom: 32 };
  const values = points.flatMap((point) => [point.morningKg, point.eveningKg]).filter(Number.isFinite);
  if (values.length === 0) {
    return { empty: true, morning: [], evening: [], min: null, max: null };
  }

  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    min -= 0.5;
    max += 0.5;
  } else {
    const extra = Math.max((max - min) * 0.18, 0.2);
    min -= extra;
    max += extra;
  }

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const xFor = (index) => padding.left + (points.length === 1 ? chartWidth / 2 : (index / (points.length - 1)) * chartWidth);
  const yFor = (value) => padding.top + ((max - value) / (max - min)) * chartHeight;
  const mapSeries = (key) => points.flatMap((point, index) => {
    const value = point[key];
    return Number.isFinite(value) ? [{ x: xFor(index), y: yFor(value), valueKg: value, date: point.date }] : [];
  });

  return {
    empty: false,
    morning: mapSeries("morningKg"),
    evening: mapSeries("eveningKg"),
    min,
    max,
    padding,
    width,
    height,
  };
}

function createSvgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
}

export function renderWeightChart(svg, points, unit = "jin") {
  const width = 360;
  const height = 200;
  const geometry = chartGeometry(points, width, height);
  svg.replaceChildren();
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("role", "img");

  if (geometry.empty) {
    const text = createSvgElement("text", { x: width / 2, y: height / 2, "text-anchor": "middle", class: "chart-empty" });
    text.textContent = "记录体重后显示趋势";
    svg.append(text);
    svg.setAttribute("aria-label", "暂无体重趋势数据");
    return;
  }

  const grid = createSvgElement("g", { class: "chart-grid" });
  for (let index = 0; index < 3; index += 1) {
    const y = 22 + index * 58;
    grid.append(createSvgElement("line", { x1: 28, y1: y, x2: 348, y2: y }));
  }
  svg.append(grid);

  const appendSeries = (series, className, label) => {
    if (series.length === 0) return;
    const polyline = createSvgElement("polyline", {
      points: series.map((point) => `${point.x},${point.y}`).join(" "),
      class: `chart-line ${className}`,
      fill: "none",
    });
    svg.append(polyline);
    for (const point of series) {
      const circle = createSvgElement("circle", { cx: point.x, cy: point.y, r: 4.5, class: `chart-dot ${className}` });
      const title = createSvgElement("title");
      title.textContent = `${point.date} ${label} ${fromKg(point.valueKg, unit)} ${unit === "jin" ? "斤" : "kg"}`;
      circle.append(title);
      svg.append(circle);
    }
  };

  appendSeries(geometry.morning, "morning", "早晨");
  appendSeries(geometry.evening, "evening", "晚间");
  svg.setAttribute(
    "aria-label",
    `体重趋势，早晨 ${geometry.morning.length} 条记录，晚间 ${geometry.evening.length} 条记录`,
  );
}
