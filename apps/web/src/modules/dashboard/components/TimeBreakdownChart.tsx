import { motion } from 'motion/react';
import type { DailySummary } from '@web/modules/attendance';
import { formatHours } from '@web/lib/utils';

const R = 52;
const CX = 70;
const CY = 70;
const SW = 13;
const CIRC = 2 * Math.PI * R;
const GAP = 2.5; // px gap between segments

interface Segment {
  key: string;
  label: string;
  sublabel?: string;
  color: string;
  minutes: number;
}

function DonutArc({
  minutes,
  total,
  offset,
  color,
  delay,
}: {
  minutes: number;
  total: number;
  offset: number;
  color: string;
  delay: number;
}) {
  if (minutes <= 0 || total <= 0) return null;
  const arcLen = Math.max(0, (minutes / total) * CIRC - GAP);
  return (
    <motion.circle
      cx={CX}
      cy={CY}
      r={R}
      fill="none"
      stroke={color}
      strokeWidth={SW}
      strokeLinecap="butt"
      style={{ strokeDashoffset: -(offset - CIRC / 4) }}
      initial={{ strokeDasharray: `0 ${CIRC}` }}
      animate={{ strokeDasharray: `${arcLen} ${CIRC - arcLen}` }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

export function TimeBreakdownChart({ data }: { data: DailySummary[] }) {
  const totalRegular = data.reduce((s, d) => s + d.regularMinutes, 0);
  const totalOT = data.reduce((s, d) => s + d.overtimeMinutes, 0);
  const totalND = data.reduce((s, d) => s + d.nightDifferentialMinutes, 0);
  const totalLate = data.reduce((s, d) => s + d.lateMinutes, 0);
  const totalUnder = data.reduce((s, d) => s + d.undertimeMinutes, 0);
  const totalWorked = data.reduce((s, d) => s + d.workedMinutes, 0);

  // Donut shows regular + OT (they sum to totalWorked)
  const donutItems: Segment[] = [
    { key: 'regular', label: 'Regular', color: '#111111', minutes: totalRegular },
    { key: 'overtime', label: 'Overtime', color: '#10b981', minutes: totalOT },
  ].filter((s) => s.minutes > 0);

  // Legend shows all metrics including ND / late / undertime
  const allMetrics: Segment[] = [
    { key: 'regular', label: 'Regular', color: '#111111', minutes: totalRegular },
    { key: 'overtime', label: 'Overtime', color: '#10b981', minutes: totalOT },
    { key: 'nd', label: 'Night Diff', sublabel: 'of worked hrs', color: '#6366f1', minutes: totalND },
    { key: 'late', label: 'Late', sublabel: 'arrival time', color: '#f59e0b', minutes: totalLate },
    { key: 'undertime', label: 'Undertime', sublabel: 'early exit', color: '#ef4444', minutes: totalUnder },
  ].filter((s) => s.minutes > 0);

  // Compute cumulative arc offsets for donut
  let cumOffset = 0;
  const donutSegments = donutItems.map((item) => {
    const arcLen = totalWorked > 0 ? (item.minutes / totalWorked) * CIRC : 0;
    const seg = { ...item, arcOffset: cumOffset };
    cumOffset += arcLen;
    return seg;
  });

  const isEmpty = totalWorked === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="floating-card p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[#111111]">Weekly Time Breakdown</h2>
          <p className="mt-1 text-xs text-[#6b7280]">Composition of your recorded hours this week.</p>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-[#bbbbbb]">
          <svg viewBox="0 0 140 140" width={100} height={100}>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f1f1" strokeWidth={SW} strokeDasharray={`${CIRC * 0.65} ${CIRC * 0.35}`} strokeDashoffset={-(0 - CIRC / 4)} strokeLinecap="round" />
          </svg>
          <p className="text-sm font-medium">No records this week</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Donut chart */}
          <div className="shrink-0 flex justify-center">
            <div className="relative">
              <svg viewBox="0 0 140 140" width={148} height={148}>
                {/* Track ring */}
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f3f4f6" strokeWidth={SW} />

                {donutSegments.map((seg, i) => (
                  <DonutArc
                    key={seg.key}
                    minutes={seg.minutes}
                    total={totalWorked}
                    offset={seg.arcOffset}
                    color={seg.color}
                    delay={i * 0.15}
                  />
                ))}

                {/* Center label */}
                <text
                  x={CX}
                  y={CY - 7}
                  textAnchor="middle"
                  style={{ fontSize: '17px', fontWeight: 900, fill: '#111111', fontFamily: 'inherit' }}
                >
                  {formatHours(totalWorked)}
                </text>
                <text
                  x={CX}
                  y={CY + 9}
                  textAnchor="middle"
                  style={{ fontSize: '8.5px', fontWeight: 700, fill: '#9ca3af', letterSpacing: '0.08em', fontFamily: 'inherit' }}
                >
                  THIS WEEK
                </text>
              </svg>
            </div>
          </div>

          {/* Metrics legend */}
          <div className="flex-1 space-y-3 min-w-0">
            {allMetrics.map((item, i) => {
              const pct = totalWorked > 0 ? (item.minutes / totalWorked) * 100 : 0;
              return (
                <div key={item.key}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-bold text-[#374151] truncate">{item.label}</span>
                      {item.sublabel && (
                        <span className="text-[10px] text-[#9ca3af] hidden sm:inline shrink-0">
                          ({item.sublabel})
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-black text-[#111111] tabular-nums shrink-0">
                      {formatHours(item.minutes)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#f3f4f6] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{
                        delay: 0.35 + i * 0.07,
                        duration: 0.65,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
