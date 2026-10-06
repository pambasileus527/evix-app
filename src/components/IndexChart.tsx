"use client";

import { useMemo, useState } from "react";
import type { Point } from "@/lib/evix";
import { formatMonth } from "@/lib/format";

type Props = {
  series: Point[];
  seriesLabel: string;
  compare?: { label: string; series: Point[] };
  /** 濃紺の背景の上に置くときは "ink" */
  variant?: "ink" | "light";
  ariaLabel: string;
};

const RANGES = [
  { months: 12, label: "1年" },
  { months: 36, label: "3年" },
  { months: 60, label: "5年" },
];

const W = 440;
const H = 220;
const L = 36;
const R = 428;
const T = 14;
const B = 186;

function niceStep(span: number) {
  if (span <= 12) return 2;
  if (span <= 30) return 5;
  if (span <= 60) return 10;
  return 20;
}

export default function IndexChart({ series, seriesLabel, compare, variant = "light", ariaLabel }: Props) {
  const [range, setRange] = useState(60);
  const ink = variant === "ink";
  const colors = ink
    ? { grid: "#2a3e5c", axis: "#3b5274", text: "#b8c7dd", line: "#7fb0ff", compare: "#8a97ab" }
    : { grid: "#e6eaf0", axis: "#a9b4c4", text: "#4a5568", line: "#1f5bd8", compare: "#8a97ab" };

  const view = useMemo(() => {
    const visible = series.slice(-range);
    const months = visible.map((p) => p.month);
    const cmp = compare
      ? months.map((m) => compare.series.find((p) => p.month === m)?.value ?? null)
      : [];
    const values = [...visible.map((p) => p.value), ...cmp.filter((v): v is number => v !== null)];
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const step = niceStep(hi - lo);
    const yMin = Math.floor((lo - step / 2) / step) * step;
    const yMax = Math.ceil((hi + step / 2) / step) * step;
    const ticks: number[] = [];
    for (let v = yMin; v <= yMax; v += step) ticks.push(v);
    const x = (i: number) => L + ((R - L) * i) / Math.max(1, months.length - 1);
    const y = (v: number) => B - ((B - T) * (v - yMin)) / (yMax - yMin);
    const path = (vals: (number | null)[]) =>
      vals
        .map((v, i) => (v === null ? null : `${x(i).toFixed(1)},${y(v).toFixed(1)}`))
        .filter(Boolean)
        .join(" ");
    const yearTicks = months
      .map((m, i) => ({ m, i }))
      // 両端の月ラベルと重ならないよう、端から 64px 以内の年ラベルは出さない
      .filter(({ m, i }) => m.endsWith("-01") && x(i) - L > 64 && R - x(i) > 64);
    const last = visible[visible.length - 1];
    return {
      visible,
      ticks,
      x,
      y,
      main: path(visible.map((p) => p.value)),
      cmp: compare ? path(cmp) : "",
      yearTicks,
      last,
      lastX: x(visible.length - 1),
      lastY: y(last.value),
    };
  }, [series, compare, range]);

  return (
    <div className={`chart${ink ? " on-ink" : ""}`}>
      <div className="range-tabs" role="group" aria-label="表示期間">
        {RANGES.map((r) => (
          <button
            key={r.months}
            type="button"
            aria-pressed={range === r.months}
            onClick={() => setRange(r.months)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
        {view.ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={R} y1={view.y(t)} y2={view.y(t)} stroke={colors.grid} />
            <text
              x={L - 8}
              y={view.y(t) + 4}
              textAnchor="end"
              fontSize="12"
              fill={colors.text}
              className="num"
            >
              {t}
            </text>
          </g>
        ))}
        <line x1={L} x2={R} y1={B} y2={B} stroke={colors.axis} />
        {view.yearTicks.map(({ m, i }) => (
          <text key={m} x={view.x(i)} y={H - 14} textAnchor="middle" fontSize="12" fill={colors.text}>
            {m.slice(0, 4)}
          </text>
        ))}
        <text x={L} y={H - 14} fontSize="12" fill={colors.text}>
          {formatMonth(view.visible[0].month)}
        </text>
        <text x={R} y={H - 14} textAnchor="end" fontSize="12" fill={colors.text}>
          {formatMonth(view.last.month)}
        </text>
        {compare && (
          <polyline
            points={view.cmp}
            fill="none"
            stroke={colors.compare}
            strokeWidth="2"
            strokeDasharray="6 5"
          />
        )}
        <polyline
          points={view.main}
          fill="none"
          stroke={colors.line}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={view.lastX} cy={view.lastY} r="4.5" fill={colors.line} />
      </svg>
      <div className="chart-legend">
        <span>
          <svg width="24" height="6" aria-hidden="true">
            <line x1="0" y1="3" x2="24" y2="3" stroke={colors.line} strokeWidth="3" />
          </svg>
          {seriesLabel}
        </span>
        {compare && (
          <span>
            <svg width="24" height="6" aria-hidden="true">
              <line x1="0" y1="3" x2="24" y2="3" stroke={colors.compare} strokeWidth="2" strokeDasharray="6 5" />
            </svg>
            {compare.label}
          </span>
        )}
      </div>
      <details>
        <summary>数値を表で見る</summary>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">月</th>
                <th scope="col">{seriesLabel}</th>
                {compare && <th scope="col">{compare.label}</th>}
              </tr>
            </thead>
            <tbody>
              {[...view.visible].reverse().map((p) => (
                <tr key={p.month}>
                  <td>{formatMonth(p.month)}</td>
                  <td className="num">{p.value.toFixed(1)}</td>
                  {compare && (
                    <td className="num">
                      {compare.series.find((c) => c.month === p.month)?.value.toFixed(1) ?? "―"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
