import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TelemetryHistoryPoint } from "../useTelemetry";
import type { ThresholdLimits } from "../useThresholds";

type ChartTab = "temperature" | "gas";

export function TelemetryChart({
  activeTab,
  history,
  limits,
}: {
  activeTab: ChartTab;
  history: TelemetryHistoryPoint[];
  limits: ThresholdLimits;
}) {
  const axisStyle = { fill: "#94a3b8", fontSize: 11 };
  const tooltipStyle = {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 8,
    color: "#f8fafc",
  };

  return (
    <section className="mt-6 rounded-2xl border border-slate-700 bg-slate-950 p-5 text-white sm:p-6">
      <div className="mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
          {activeTab === "temperature"
            ? "Temperature & Humidity History"
            : "Spoilage Gas History"}
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Latest {history.length} live readings
        </p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={history}
            margin={{ top: 12, right: 10, bottom: 4, left: -12 }}
          >
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={axisStyle}
              tickLine={{ stroke: "#475569" }}
              axisLine={{ stroke: "#475569" }}
              minTickGap={24}
            />
            {activeTab === "temperature" ? (
              <>
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  domain={["auto", "auto"]}
                  tick={axisStyle}
                  tickLine={{ stroke: "#475569" }}
                  axisLine={{ stroke: "#475569" }}
                  width={48}
                  label={{
                    value: "°C",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#fb7185",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tick={axisStyle}
                  tickLine={{ stroke: "#475569" }}
                  axisLine={{ stroke: "#475569" }}
                  width={48}
                  label={{
                    value: "% RH",
                    angle: 90,
                    position: "insideRight",
                    fill: "#38bdf8",
                  }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "#cbd5e1" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
                <ReferenceLine
                  yAxisId="left"
                  y={limits.tempLimit}
                  ifOverflow="extendDomain"
                  stroke="#fb7185"
                  strokeDasharray="5 5"
                  label={{
                    value: `Air max ${limits.tempLimit}°C`,
                    fill: "#fda4af",
                    fontSize: 10,
                    position: "insideTopLeft",
                  }}
                />
                <ReferenceLine
                  yAxisId="right"
                  y={limits.humidityMin}
                  ifOverflow="extendDomain"
                  stroke="#38bdf8"
                  strokeDasharray="5 5"
                  label={{
                    value: `RH min ${limits.humidityMin}%`,
                    fill: "#7dd3fc",
                    fontSize: 10,
                    position: "insideBottomLeft",
                  }}
                />
                <ReferenceLine
                  yAxisId="right"
                  y={limits.humidityMax}
                  ifOverflow="extendDomain"
                  stroke="#38bdf8"
                  strokeDasharray="5 5"
                  label={{
                    value: `RH max ${limits.humidityMax}%`,
                    fill: "#7dd3fc",
                    fontSize: 10,
                    position: "insideTopLeft",
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="airTemp"
                  name="Air Temp (°C)"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive
                  animationDuration={250}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity (% RH)"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive
                  animationDuration={250}
                />
              </>
            ) : (
              <>
                <YAxis
                  domain={["auto", "auto"]}
                  tick={axisStyle}
                  tickLine={{ stroke: "#475569" }}
                  axisLine={{ stroke: "#475569" }}
                  width={56}
                  label={{
                    value: "ppm",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#fbbf24",
                  }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "#cbd5e1" }}
                  itemStyle={{ color: "#fbbf24" }}
                />
                <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
                <ReferenceLine
                  y={limits.gasLimit}
                  ifOverflow="extendDomain"
                  stroke="#fbbf24"
                  strokeDasharray="5 5"
                  label={{
                    value: `Gas max ${limits.gasLimit} ppm`,
                    fill: "#fcd34d",
                    fontSize: 10,
                    position: "insideTopLeft",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="gasPpm"
                  name="Spoilage Gas (ppm)"
                  stroke="#fbbf24"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive
                  animationDuration={250}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
