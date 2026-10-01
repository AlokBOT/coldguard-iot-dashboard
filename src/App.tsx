import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  BellRing,
  Bell,
  BellOff,
  CheckCircle2,
  CircleAlert,
  CloudCog,
  Code2,
  Database,
  Download,
  Droplets,
  ExternalLink,
  GitBranch,
  Menu,
  Microchip,
  Radio,
  ShieldCheck,
  Thermometer,
  ThermometerSnowflake,
  TriangleAlert,
  LoaderCircle,
  WifiOff,
  Wind,
  X,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { LOGO_DATA_URI } from "./assets/logoData";
import { onValue, ref, set } from "firebase/database";
import { Toaster, toast } from "react-hot-toast";
import { db } from "./firebase";
import {
  useTelemetry,
  type TelemetryHistoryPoint,
  type TelemetryState,
} from "./useTelemetry";
import { useThresholds, type ThresholdLimits } from "./useThresholds";
import { ThresholdControls } from "./components/ThresholdControls";
import { TelemetryChart } from "./components/TelemetryChart";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
import { cn } from "./lib/utils";

type ScenarioKey = "normal" | "temperature" | "gas";
type StatusTone = "success" | "critical" | "offline";
type MetricKey = "air" | "humidity" | "gas";
type SensorSeverity = "normal" | "warning" | "critical";

interface CommodityPreset {
  name: string;
  description: string;
  tempLimit: number;
  humidityMin: number;
  humidityMax: number;
  gasLimit: number;
}

const COMMODITY_PRESETS: Record<string, CommodityPreset> = {
  dairy: {
    name: "Dairy & Milk",
    description: "Strict low temp to stop bacterial lactic fermentation.",
    tempLimit: 4.0,
    humidityMin: 80,
    humidityMax: 90,
    gasLimit: 300,
  },
  produce: {
    name: "Fresh Vegetables & Greens",
    description: "Moderate chill with high humidity to prevent wilting.",
    tempLimit: 7.0,
    humidityMin: 85,
    humidityMax: 95,
    gasLimit: 400,
  },
  pharma: {
    name: "Vaccines & Pharmaceuticals",
    description: "HACCP compliant 2°C–8°C cold chain safety profile.",
    tempLimit: 8.0,
    humidityMin: 35,
    humidityMax: 65,
    gasLimit: 150,
  },
  frozen: {
    name: "Deep Frozen Inventory",
    description: "Sub-zero preservation for long-term cold integrity.",
    tempLimit: -18.0,
    humidityMin: 60,
    humidityMax: 80,
    gasLimit: 200,
  },
};

type Scenario = {
  label: string;
  shortLabel: string;
  status: string;
  headline: string;
  detail: string;
  air: string;
  humidity: string;
  gas: string;
  tone: StatusTone;
  affected?: MetricKey[];
};

interface SystemEvent {
  id: string;
  timestamp: Date;
  message: string;
  type: "critical" | "success" | "info" | "warning";
}

function evaluateSensorLimits(
  telemetry: Pick<TelemetryState, "airTemp" | "humidity" | "gasPpm">,
  limits: ThresholdLimits,
) {
  const breachedMetrics: MetricKey[] = [];
  const warningMessages: string[] = [];
  const metricSeverities: Record<MetricKey, SensorSeverity> = {
    air: "normal",
    humidity: "normal",
    gas: "normal",
  };

  const recordBreach = (
    metric: MetricKey,
    severity: SensorSeverity,
    message: string,
  ) => {
    breachedMetrics.push(metric);
    metricSeverities[metric] = severity;
    warningMessages.push(message);
  };

  if (telemetry.airTemp > limits.tempLimit) {
    recordBreach("air", "critical", `Air temperature ${telemetry.airTemp.toFixed(1)}°C exceeds the ${limits.tempLimit.toFixed(1)}°C alert limit.`);
  }

  if (telemetry.humidity < limits.humidityMin) {
    recordBreach("humidity", "warning", `Humidity ${telemetry.humidity.toFixed(1)}% RH is below the configured minimum of ${limits.humidityMin}% RH.`);
  } else if (telemetry.humidity > limits.humidityMax) {
    recordBreach("humidity", "warning", `Humidity ${telemetry.humidity.toFixed(1)}% RH exceeds the configured maximum of ${limits.humidityMax}% RH.`);
  }

  if (telemetry.gasPpm > limits.gasLimit) {
    recordBreach("gas", "critical", `Spoilage gas ${Math.round(telemetry.gasPpm)} ppm exceeds the ${limits.gasLimit} ppm alert limit.`);
  }

  const severity = Object.values(metricSeverities).includes("critical")
    ? "critical"
    : breachedMetrics.length > 0
      ? "warning"
      : "normal";

  return { severity, breachedMetrics, warningMessages, metricSeverities };
}

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

function Heading({
  eyebrow,
  title,
  body,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  centered?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", centered && "mx-auto text-center")}>
      <div className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600">
        {eyebrow}
      </div>
      <div
        role="heading"
        aria-level={2}
        className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
      >
        {title}
      </div>
      <p className="mt-4 text-base leading-7 text-slate-600">{body}</p>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src={LOGO_DATA_URI}
        alt="ColdGuard Logo"
        className="w-10 h-10 object-contain rounded-xl shrink-0"
      />
      <div>
        <div className="text-lg font-extrabold tracking-tight text-slate-950">
          Cold<span className="text-blue-600">Guard</span>
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Telemetry Systems
        </div>
      </div>
    </div>
  );
}

function Navigation({ onExportCSV }: { onExportCSV: () => void }) {
  const [open, setOpen] = useState(false);
  const links = [
    ["Overview", "overview"],
    ["Hardware & Sensors", "hardware"],
    ["Operating Rules", "thresholds"],
    ["Architecture", "architecture"],
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map(([label, id]) => (
            <Button key={id} variant="ghost" onClick={() => scrollTo(id)}>
              {label}
            </Button>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="outline"
            className="gap-2 border-slate-600 bg-slate-800/50 px-4 text-slate-300 hover:bg-slate-700 hover:text-white"
            onClick={onExportCSV}
          >
            <Download className="size-4" aria-hidden="true" />
            Export CSV Log
          </Button>
          <Button onClick={() => scrollTo("simulator")}>
            Launch Monitoring App
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <Button
          className="lg:hidden"
          variant="ghost"
          size="icon"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>
      {open && (
        <nav
          className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map(([label, id]) => (
              <Button
                className="justify-start"
                key={id}
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  scrollTo(id);
                }}
              >
                {label}
              </Button>
            ))}
            <Button
              className="mt-2"
              onClick={() => {
                setOpen(false);
                scrollTo("simulator");
              }}
            >
              Launch Monitoring App
              <ArrowRight className="size-4" />
            </Button>
            <Button
              className="justify-start"
              variant="outline"
              onClick={() => {
                setOpen(false);
                onExportCSV();
              }}
            >
              <Download className="size-4" aria-hidden="true" />
              Export CSV Log
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}

const metricConfig = [
  { key: "air", label: "Air Temp", unit: "°C", icon: Thermometer },
  { key: "humidity", label: "Humidity", unit: "% RH", icon: Droplets },
  { key: "gas", label: "Spoilage Gas", unit: "ppm", icon: Wind },
] as const;

function TelemetryCard({
  scenario,
  activeScenario,
  isOffline,
  limits,
}: {
  scenario: Scenario;
  activeScenario: ScenarioKey;
  isOffline: boolean;
  limits: ThresholdLimits;
}) {
  const sensorLimits = evaluateSensorLimits({
    airTemp: Number(scenario.air),
    humidity: Number(scenario.humidity),
    gasPpm: Number(scenario.gas),
  }, limits);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 p-5 text-white shadow-2xl shadow-blue-950/20 sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="relative">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
              <Radio className="size-3.5" />
              Live telemetry
            </div>
            <div className="text-xl font-bold">Chamber A</div>
            <div className="mt-1 text-sm text-slate-400">Produce & Dairy</div>
          </div>
          <Badge
            variant={
              scenario.tone === "success"
                ? "success"
                : scenario.tone === "critical"
                  ? "critical"
                  : "offline"
            }
            className="max-w-full whitespace-normal break-words border-white/10 text-center sm:text-left"
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                scenario.tone === "success" &&
                  "animate-pulse bg-emerald-500",
                scenario.tone === "critical" && "animate-pulse bg-red-500",
                isOffline && "bg-slate-500",
              )}
            />
            {scenario.status}
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metricConfig.map(({ key, label, unit, icon: Icon }) => {
            const metricSeverity = sensorLimits.metricSeverities[key];
            const affected = scenario.affected?.includes(key) ?? false;
            const hasAlert = affected || metricSeverity !== "normal";
            const value = Number(scenario[key]);
            const isLow = key === "humidity" && value < limits.humidityMin;
            return (
              <div
                key={key}
                className={cn(
                  "rounded-2xl border border-white/10 bg-white/5 p-4 transition-all",
                  metricSeverity === "warning" &&
                    "border-amber-500/50 bg-amber-500/10",
                  (metricSeverity === "critical" ||
                    (affected && metricSeverity === "normal")) &&
                    "animate-pulse border-red-500/60 bg-red-500/10",
                  isOffline && "opacity-60",
                )}
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2 text-xs text-slate-400">
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon
                      className={cn(
                        "size-4 shrink-0 text-cyan-400",
                        metricSeverity === "warning" && "text-amber-400",
                        hasAlert && metricSeverity !== "warning" && "text-red-400",
                      )}
                    />
                    <span className="truncate">{label}</span>
                  </div>
                  {hasAlert ? (
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        metricSeverity === "warning"
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-red-500/15 text-red-300",
                      )}
                    >
                      {isLow ? "▼ LOW" : "▲ HIGH"}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      NORMAL
                    </span>
                  )}
                </div>
                <div className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
                  {scenario[key]}
                  <span className="ml-1 text-xs font-medium text-slate-400">
                    {unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-slate-400">
          <span className="break-words">
            {activeScenario === "normal"
              ? isOffline
                ? "Sensors are offline"
                : "All sensors are live"
              : activeScenario === "temperature"
                ? isOffline
                  ? "DHT11 is offline"
                  : "DHT11 is live"
                : isOffline
                  ? "MQ-135 is offline"
                  : "MQ-135 is live"}
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            <Activity
              className={cn(
                "size-3.5",
                isOffline ? "text-slate-500" : "text-emerald-400",
              )}
            />
            Device CG-001
          </span>
        </div>
      </div>
    </div>
  );
}

function Hero({
  scenario,
  activeScenario,
  isOffline,
  limits,
}: {
  scenario: Scenario;
  activeScenario: ScenarioKey;
  isOffline: boolean;
  limits: ThresholdLimits;
}) {
  return (
    <section
      id="overview"
      className="relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <Badge className="mb-6">
            <Zap className="size-3.5" />
            Autonomous cold-chain intelligence
          </Badge>
          <div
            role="heading"
            aria-level={1}
            className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-6xl"
          >
            Precision cold chain telemetry.{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Spoilage prevented.
            </span>
          </div>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Replace delayed paper logs with continuous, multi-sensor visibility.
            ColdGuard tracks chamber conditions, product core temperature, and
            spoilage indicators before quality is compromised.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => scrollTo("simulator")}>
              Launch App
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo("hardware")}
            >
              Explore Hardware Specs
              <ArrowDown className="size-4" />
            </Button>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-slate-200">
            {[
              ["15–30s", "Cloud sync"],
              ["4 sensors", "Cross-validation"],
              ["24/7", "Alert readiness"],
            ].map(([value, label]) => (
              <div key={label} className="px-4 first:pl-0">
                <div className="font-mono text-lg font-bold text-slate-950">
                  {value}
                </div>
                <div className="mt-1 text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-5 -z-10 rounded-3xl bg-gradient-to-br from-blue-200/60 to-cyan-100/50 blur-2xl" />
          <TelemetryCard
            scenario={scenario}
            activeScenario={activeScenario}
            isOffline={isOffline}
            limits={limits}
          />
          <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl sm:-left-8">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-950">
                Cloud synchronized
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                Firebase stream active
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSolution() {
  const manual = [
    "Delayed response between checks",
    "Handwritten transcription errors",
    "Blind spots outside working hours",
    "Costly waste discovered too late",
  ];
  const coldguard = [
    "15–30 second cloud telemetry",
    "Automatic threshold detection",
    "Multi-sensor context and history",
    "HACCP-oriented event records",
  ];

  return (
    <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Heading
          centered
          eyebrow="Why ColdGuard"
          title="From reactive checks to continuous assurance"
          body="Manual snapshots show what happened at one moment. ColdGuard provides the context operators need to identify drift, stale sensors, and threshold breaches as they happen."
        />
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-2">
          <Card className="overflow-hidden border-slate-200">
            <CardContent className="p-7 sm:p-8">
              <div className="mb-7 flex items-center justify-between">
                <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                  <Code2 className="size-6" />
                </div>
                <Badge variant="offline">Legacy process</Badge>
              </div>
              <div className="text-xl font-bold text-slate-950">
                Traditional Manual Logging
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Periodic checks leave critical gaps between recorded values.
              </p>
              <div className="mt-7 grid gap-4">
                {manual.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-600"
                  >
                    <XCircle className="size-5 shrink-0 text-red-400" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-blue-200 shadow-xl shadow-blue-900/5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />
            <CardContent className="p-7 sm:p-8">
              <div className="mb-7 flex items-center justify-between">
                <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <ShieldCheck className="size-6" />
                </div>
                <Badge variant="success">Always monitoring</Badge>
              </div>
              <div className="text-xl font-bold text-slate-950">
                ColdGuard Autonomous Monitoring
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                A live operational layer for safer, faster decision-making.
              </p>
              <div className="mt-7 grid gap-4">
                {coldguard.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-slate-700"
                  >
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

const hardware: {
  label: string;
  title: string;
  body: string;
  detail: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Edge compute",
    title: "ESP32 Microcontroller",
    body: "Wi-Fi telemetry client collecting every sensor stream at the edge.",
    detail: "Push interval: 15–30 seconds",
    icon: Microchip,
  },
  {
    label: "Ambient sensing",
    title: "DHT11 / DHT22",
    body: "Continuous chamber air temperature and relative humidity monitoring.",
    detail: "Digital temperature + RH",
    icon: Droplets,
  },
  {
    label: "Quality sensing",
    title: "MQ-135 Gas Sensor",
    body: "Detects ammonia, sulfides, and spoilage-related volatile compounds.",
    detail: "VOC output in ppm",
    icon: Wind,
  },
];

function Hardware() {
  return (
    <section id="hardware" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Heading
          eyebrow="Hardware & Sensors"
          title="Three sensing layers. One complete chamber picture."
          body="Purpose-built components distinguish ambient conditions from spoilage-related air quality risk."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hardware.map(({ label, title, body, detail, icon: Icon }, index) => (
            <Card
              key={title}
              className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5"
            >
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-8 flex items-start justify-between">
                  <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="size-6" />
                  </div>
                  <span className="font-mono text-xs text-slate-300">
                    0{index + 1}
                  </span>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  {label}
                </div>
                <div className="mt-2 text-lg font-bold text-slate-950">
                  {title}
                </div>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
                  {body}
                </p>
                <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                  <Radio className="size-3.5 text-emerald-500" />
                  {detail}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const thresholds = [
  {
    id: "air",
    tab: "Air Temp",
    title: "Air Temperature",
    icon: Thermometer,
    safe: "1°C to 4°C",
    warning: "Above 4°C",
    critical: "Sustained >15 min",
    note: "Tracks chamber-level thermal conditions and door-cycle recovery.",
  },
  {
    id: "humidity",
    tab: "Humidity",
    title: "Relative Humidity",
    icon: Droplets,
    safe: "85% to 95% RH",
    warning: "Outside target",
    critical: "Frost / desiccation",
    note: "Balances moisture retention against frost and condensation risk.",
  },
  {
    id: "gas",
    tab: "Gas / VOC",
    title: "Spoilage Gas / VOC",
    icon: Wind,
    safe: "Below 350 ppm",
    warning: "350–600 ppm",
    critical: "Above 600 ppm",
    note: "Surfaces elevated volatile compounds associated with product decay.",
  },
];

function Thresholds({ limits }: { limits: ThresholdLimits }) {
  const activeThresholds = thresholds.map((item) => {
    if (item.id === "air") {
      return {
        ...item,
        safe: `At or below ${limits.tempLimit}°C`,
        warning: `Above ${limits.tempLimit}°C`,
        critical: "Configured alert limit",
      };
    }
    if (item.id === "humidity") {
      return {
        ...item,
        safe: `${limits.humidityMin}% to ${limits.humidityMax}% RH`,
        warning: `Below ${limits.humidityMin}% or above ${limits.humidityMax}%`,
        critical: "Configured alert limits",
      };
    }
    return {
      ...item,
      safe: `At or below ${limits.gasLimit} ppm`,
      warning: `Above ${limits.gasLimit} ppm`,
      critical: "Configured alert limit",
    };
  });

  return (
    <section id="thresholds" className="bg-slate-950 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <Badge className="border-blue-400/20 bg-blue-400/10 text-blue-300">
              Operating rules
            </Badge>
            <div
              role="heading"
              aria-level={2}
              className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Strict limits. Clear escalation.
            </div>
            <p className="mt-4 max-w-lg leading-7 text-slate-400">
              ColdGuard translates complex telemetry into an immediate,
              operator-friendly safety state.
            </p>
            <div className="mt-8 grid gap-3">
              {[
                ["Safe / Normal", "bg-emerald-500"],
                ["Warning / Investigate", "bg-amber-500"],
                ["Critical / Act now", "bg-red-500"],
                ["Offline / Last known", "bg-slate-500"],
              ].map(([label, color]) => (
                <div
                  key={label}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <span className={cn("size-2 rounded-full", color)} />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <Tabs defaultValue="air">
            <TabsList className="w-full grid-cols-3 gap-2 border-slate-700 bg-slate-900">
              {activeThresholds.map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className="w-full text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white"
                >
                  {item.tab}
                </TabsTrigger>
              ))}
            </TabsList>
            {activeThresholds.map(
              ({
                id,
                title,
                icon: Icon,
                safe,
                warning,
                critical,
                note,
              }) => (
                <TabsContent
                  key={id}
                  value={id}
                  className="content-switch"
                >
                  <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-11 place-items-center rounded-xl bg-blue-500/10 text-blue-400">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-widest text-slate-500">
                            Sensor rule
                          </div>
                          <div className="mt-1 text-lg font-bold">{title}</div>
                        </div>
                      </div>
                      <Badge variant="dark">Policy CG-SAFE-01</Badge>
                    </div>
                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                      {[
                        ["Safe range", safe, "emerald"],
                        ["Warning", warning, "amber"],
                        ["Critical", critical, "red"],
                      ].map(([label, value, tone]) => (
                        <div
                          key={label}
                          className={cn(
                            "rounded-2xl border p-5",
                            tone === "emerald" &&
                              "border-emerald-500/20 bg-emerald-500/5",
                            tone === "amber" &&
                              "border-amber-500/20 bg-amber-500/5",
                            tone === "red" &&
                              "border-red-500/20 bg-red-500/5",
                          )}
                        >
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            {label}
                          </div>
                          <div className="mt-2 font-mono text-lg font-bold">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-950/60 p-4 text-sm leading-6 text-slate-400">
                      <CircleAlert className="mt-0.5 size-4 shrink-0 text-blue-400" />
                      {note}
                    </div>
                  </div>
                </TabsContent>
              ),
            )}
          </Tabs>
        </div>
      </div>
    </section>
  );
}

function Simulator({
  active,
  setActive,
  dynamicScenarios,
  isOffline,
  limits,
  isThresholdsLoading,
  saveStatus,
  onThresholdsSave,
  selectedPreset,
  presetDescription,
  onPresetChange,
  history,
  telemetry,
  eventLog,
  isThermalRunaway,
  tempDelta,
  isAlertSilenced,
  isAlarmUpdating,
  alarmFeedback,
  onToggleAlarm,
}: {
  active: ScenarioKey;
  setActive: (key: ScenarioKey) => void;
  dynamicScenarios: Record<ScenarioKey, Scenario>;
  isOffline: boolean;
  limits: ThresholdLimits;
  isThresholdsLoading: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  onThresholdsSave: (newLimits: Partial<ThresholdLimits>) => Promise<boolean>;
  selectedPreset: string;
  presetDescription: string;
  onPresetChange: (presetKey: string) => void;
  history: TelemetryHistoryPoint[];
  telemetry: TelemetryState;
  eventLog: SystemEvent[];
  isThermalRunaway: boolean;
  tempDelta: number;
  isAlertSilenced: boolean;
  isAlarmUpdating: boolean;
  alarmFeedback: "idle" | "saved" | "error";
  onToggleAlarm: () => Promise<void>;
}) {
  const scenario = dynamicScenarios[active];
  const isCritical = scenario.tone === "critical" || isThermalRunaway;
  const gasRatio =
    limits.gasLimit > 0
      ? Math.min((telemetry.gasPpm / limits.gasLimit) * 100, 100)
      : telemetry.gasPpm > 0
        ? 100
        : 0;
  const humidityRatio = Math.min(telemetry.humidity, 100);
  const riskIndex = Math.min(
    Math.max(Math.round(gasRatio * 0.7 + humidityRatio * 0.3), 0),
    100,
  );
  let riskTier = "Optimal Preservation";
  let riskColor = "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
  let progressColor = "bg-emerald-400";

  if (riskIndex >= 71) {
    riskTier = "Active Decay Risk / Immediate Ventilation Needed";
    riskColor = "text-red-400 bg-red-400/10 border-red-400/30";
    progressColor = "bg-red-500";
  } else if (riskIndex >= 31) {
    riskTier = "Ethylene / VOC Accumulation";
    riskColor = "text-amber-400 bg-amber-400/10 border-amber-400/30";
    progressColor = "bg-amber-400";
  }
  const options: { key: ScenarioKey; icon: LucideIcon }[] = [
    { key: "normal", icon: CheckCircle2 },
    { key: "temperature", icon: Thermometer },
    { key: "gas", icon: Wind },
  ];

  return (
    <section id="simulator" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Heading
          centered
          eyebrow="Interactive demo"
          title="Put the monitoring logic to the test"
          body="Trigger realistic chamber events and watch ColdGuard translate raw sensor values into an actionable operational state."
        />
        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2">
          {options.map(({ key, icon: Icon }) => (
            <Button
              key={key}
              variant={active === key ? "primary" : "state"}
              aria-pressed={active === key}
              onClick={() => setActive(key)}
            >
              <Icon className="size-4" />
              {dynamicScenarios[key].label}
            </Button>
          ))}
        </div>
        <div
          key={active}
          className="content-switch mx-auto mt-8 grid max-w-5xl items-start gap-5 lg:grid-cols-2"
        >
          <div className="flex min-w-0 flex-col gap-6">
            <TelemetryCard
              scenario={scenario}
              activeScenario={active}
              isOffline={isOffline}
              limits={limits}
            />
            <ThresholdControls
              activeTab={active}
              limits={limits}
              isLoading={isThresholdsLoading}
              saveStatus={saveStatus}
              onSave={onThresholdsSave}
              selectedPreset={selectedPreset}
              presetDescription={presetDescription}
              onPresetChange={onPresetChange}
            />
          </div>
          <Card className="min-w-0 border-slate-700 bg-slate-950 text-white shadow-2xl shadow-blue-950/20">
            <CardContent className="min-w-0 p-6 sm:p-7">
              {isOffline ? (
                <div>
                  <div className="grid size-12 place-items-center rounded-xl bg-slate-800 text-slate-300">
                    <WifiOff className="size-6" />
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-white">
                    Telemetry connection interrupted
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    No heartbeat received for 60 seconds. Showing the last known snapshot.
                  </p>
                  <hr className="my-6 border-slate-700" />
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-400">System state</span>
                      <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                        Offline
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-400">Alert engine</span>
                      <span className="text-sm font-medium text-slate-300">
                        Triggered
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-400">Cloud path</span>
                      <span className="font-mono text-xs text-slate-400">
                        telemetry/device1
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
              <div
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-xl",
                  scenario.tone === "success" &&
                    "bg-emerald-50 text-emerald-600",
                  scenario.tone === "critical" && "bg-red-50 text-red-600",
                  scenario.tone === "offline" && "bg-slate-100 text-slate-600",
                )}
              >
                {scenario.tone === "success" && (
                  <CheckCircle2 className="size-7" />
                )}
                {scenario.tone === "critical" && (
                  <BellRing className="size-7 animate-pulse" />
                )}
                {scenario.tone === "offline" && (
                  <WifiOff className="size-7" />
                )}
              </div>
              <div
                className="mt-5 break-words whitespace-normal text-center text-xl font-bold text-white sm:text-left"
                aria-live="polite"
              >
                {scenario.headline}
              </div>
              <p className="mt-3 break-words whitespace-normal text-center text-sm leading-6 text-slate-300 sm:text-left">
                {scenario.detail}
              </p>
              {active === "gas" && (
                <section className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Spoilage Gas Risk Index
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        Composite air quality score
                      </p>
                    </div>
                    <div className="font-mono text-2xl font-bold text-white">
                      {riskIndex}
                      <span className="ml-1 text-xs font-medium text-slate-400">
                        / 100
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "mt-3 inline-flex max-w-full rounded-lg border px-3 py-2 text-xs font-semibold leading-5",
                      riskColor,
                    )}
                  >
                    {riskTier}
                  </div>
                  <div
                    className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800"
                    role="progressbar"
                    aria-label="Spoilage gas risk index"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={riskIndex}
                  >
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-500",
                        progressColor,
                      )}
                      style={{ width: `${riskIndex}%` }}
                    />
                  </div>
                </section>
              )}
              {active === "temperature" && isThermalRunaway && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-400" role="alert">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  <p className="break-words">
                    Virtual Influx Event Detected — Rapid Thermal Gradient (+{tempDelta.toFixed(1)}°C in 15s). Possible door open or compressor anomaly.
                  </p>
                </div>
              )}
              {isCritical && (
                <div className="mt-5">
                  <Button
                    className={cn(
                      "w-full whitespace-normal text-center sm:w-auto",
                      isAlertSilenced
                        ? "border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                        : "animate-pulse border border-red-400 bg-red-600 text-white shadow-lg shadow-red-950/30 hover:bg-red-500 hover:text-white",
                    )}
                    variant="ghost"
                    disabled={isAlarmUpdating || isAlertSilenced}
                    onClick={() => void onToggleAlarm()}
                  >
                    {isAlarmUpdating ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : isAlertSilenced ? (
                      <Bell className="size-4" />
                    ) : (
                      <BellOff className="size-4" />
                    )}
                    {isAlarmUpdating
                      ? "Updating hardware alarm..."
                      : isAlertSilenced
                        ? "Hardware Alarm Snoozed (auto-restores in 4s)"
                        : "Turn Off Buzzer & Red LED"}
                  </Button>
                  {alarmFeedback !== "idle" && !isAlarmUpdating && (
                    <p
                      className={cn(
                        "mt-2 text-xs",
                        alarmFeedback === "error"
                          ? "text-red-300"
                          : "text-emerald-300",
                      )}
                      role={alarmFeedback === "error" ? "alert" : "status"}
                    >
                      {alarmFeedback === "error"
                        ? "Could not update the hardware alarm. Try again."
                        : "Hardware alarm command synced."}
                    </p>
                  )}
                </div>
              )}
              {active !== "normal" && (
                <TelemetryChart
                  activeTab={active}
                  history={history}
                  limits={limits}
                />
              )}
              <section className="mt-6 border-t border-white/10 pt-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  System Event Log
                </h3>
                {eventLog.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    No recent anomalies detected.
                  </p>
                ) : (
                  <div className="mt-6 space-y-4 border-l-2 border-slate-700 pl-4">
                    {eventLog.map((event) => (
                      <div key={event.id} className="relative min-w-0 break-words">
                        <span
                          className={cn(
                            "absolute -left-[21px] top-1 size-3 rounded-full border-2 bg-slate-800",
                            event.type === "critical" && "border-red-400",
                            event.type === "success" && "border-emerald-400",
                            event.type === "info" && "border-blue-400",
                            event.type === "warning" && "border-amber-400",
                          )}
                          aria-hidden="true"
                        />
                        <p className="text-[11px] text-slate-500">
                          {event.timestamp.toLocaleTimeString()}
                        </p>
                        <p className="mt-1 text-sm leading-5 text-slate-300">
                          {event.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Architecture() {
  const flow = [
    {
      title: "ESP32 Hardware",
      label: "Sense & transmit",
      detail: "DHT11 • MQ-135",
      icon: Microchip,
    },
    {
      title: "Firebase Realtime DB",
      label: "Stream & persist",
      detail: "telemetry/device1",
      icon: Database,
    },
    {
      title: "Dashboard & Alerts",
      label: "Visualize & respond",
      detail: "Web UI • FCM-ready",
      icon: CloudCog,
    },
  ];

  return (
    <section
      id="architecture"
      className="border-y border-slate-200 bg-slate-50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Heading
          centered
          eyebrow="Cloud Architecture"
          title="From chamber edge to operator action"
          body="A direct telemetry pipeline keeps the prototype understandable, responsive, and ready for future alert delivery."
        />
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-10">
          {flow.map(({ title, label, detail, icon: Icon }, index) => (
            <div key={title} className="relative flex flex-col">
              <Card className="h-full border-slate-200 bg-white transition-shadow hover:shadow-lg">
                <CardContent className="flex h-full flex-col p-6 sm:p-7">
                  <div className="mb-8 flex items-start justify-between">
                    <div className="grid size-12 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                      <Icon className="size-6" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-xs text-slate-400">
                      0{index + 1}
                    </span>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    {label}
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-slate-950">
                    {title}
                  </h3>
                  <p className="mt-3 flex-1 break-words font-mono text-sm text-slate-500">
                    {detail}
                  </p>
                </CardContent>
              </Card>
              {index < flow.length - 1 && (
                <>
                  <div className="mt-3 flex justify-center text-blue-500 md:hidden">
                    <ArrowDown className="size-5" aria-hidden="true" />
                  </div>
                  <div className="absolute -right-8 top-1/2 hidden -translate-y-1/2 text-blue-500 md:block">
                    <ArrowRight className="size-6" aria-hidden="true" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mx-auto mt-6 flex max-w-6xl items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
          <TriangleAlert className="mt-1 size-4 shrink-0 text-amber-700" aria-hidden="true" />
          <p className="min-w-0">
            Prototype note: Firebase streams are active in the source system.
            Production authentication, hardened security rules, and FCM delivery
            remain future controls.
          </p>
        </div>
      </div>
    </section>
  );
}

const TEAM_MEMBERS = [
  {
    name: "Alok Kumar",
    role: "Full-Stack & IoT Lead",
    course: "B.Tech Computer Science (AI & DS)",
    year: "3rd Year (2024-2028)",
    image: "",
  },
  {
    name: "Team Member 2",
    role: "Hardware Specialist",
    course: "B.Tech Computer Science",
    year: "3rd Year",
    image: "",
  },
  {
    name: "Team Member 3",
    role: "UI/UX & Testing",
    course: "B.Tech Computer Science",
    year: "3rd Year",
    image: "",
  },
];

function AboutUs() {
  return (
    <section
      id="about"
      className="border-t border-slate-200 bg-slate-50/50 py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Meet Team Forge-X
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            The developers and engineers behind the ColdGuard IoT telemetry
            system.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map((member) => (
            <article
              key={member.name}
              className="group relative flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div
                aria-hidden="true"
                className="mb-6 flex size-24 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-3xl font-bold text-blue-600 shadow-md ring-4 ring-white"
              >
                {member.image ? (
                  <img
                    src={member.image}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  member.name
                    .split(/\s+/)
                    .map((part) => part.charAt(0))
                    .join("")
                    .slice(0, 2)
                )}
              </div>
              <h3 className="text-xl font-semibold text-slate-950">
                {member.name}
              </h3>
              <p className="mb-4 mt-1 text-sm font-medium text-blue-600">
                {member.role}
              </p>

              <div className="w-full space-y-3 rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-600">
                <div className="flex justify-between gap-3">
                  <span className="shrink-0 font-medium text-slate-900">
                    Course:
                  </span>
                  <span className="break-words text-right">{member.course}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="shrink-0 font-medium text-slate-900">
                    Batch:
                  </span>
                  <span className="text-right">{member.year}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-slate-800 pb-10 md:grid-cols-2 md:items-end">
          <div>
            <Logo />
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-400">
              An academic IoT systems project exploring real-time cold storage
              telemetry, threshold alerting, and spoilage prevention.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="dark">React + Vite</Badge>
              <Badge variant="dark">ESP32</Badge>
              <Badge variant="dark">Firebase</Badge>
              <Badge variant="dark">Advanced MVP</Badge>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex" tabIndex={0}>
                <Button variant="outline" disabled>
                  <GitBranch className="size-4" aria-hidden="true" />
                  Repository coming soon
                  <ExternalLink className="size-3.5" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Repository URL has not been provided.</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-col gap-4 pt-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} ColdGuard. Academic prototype.</span>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => scrollTo("overview")}>
              Overview
            </Button>
            <Button variant="ghost" size="sm" onClick={() => scrollTo("hardware")}>
              Hardware
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollTo("architecture")}
            >
              Architecture
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>("normal");
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");
  const [isAlertSilenced, setIsAlertSilenced] = useState(false);
  const [isAlarmUpdating, setIsAlarmUpdating] = useState(false);
  const [alarmFeedback, setAlarmFeedback] = useState<
    "idle" | "saved" | "error"
  >("idle");
  const [eventLog, setEventLog] = useState<SystemEvent[]>([]);
  const alerted = useRef({ temp: false, humidity: false, gas: false });
  const alarmSnoozeTimeoutRef = useRef<number | null>(null);
  const { telemetry, history, isOffline } = useTelemetry("device1");
  const {
    thresholds,
    isLoading: isThresholdsLoading,
    saveStatus,
    updateThresholds,
  } = useThresholds();
  const addEvent = useCallback(
    (message: string, type: SystemEvent["type"]) => {
      const event: SystemEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: new Date(),
        message,
        type,
      };
      setEventLog((current) => [event, ...current].slice(0, 20));
    },
    [],
  );
  const { isThermalRunaway, tempDelta } = useMemo(() => {
    const historyLength = history.length;
    let isThermalRunaway = false;
    let tempDelta = 0;

    if (historyLength >= 5) {
      const current = history[historyLength - 1];
      const past = history[historyLength - 5];
      tempDelta = current.airTemp - past.airTemp;

      if (tempDelta >= 0.5) {
        isThermalRunaway = true;
      }
    }

    return { isThermalRunaway, tempDelta };
  }, [history]);

  useEffect(() => {
    if (history.length === 0) return;

    if (telemetry.airTemp > thresholds.tempLimit) {
      if (!alerted.current.temp) {
        toast.error("Critical: Air Temperature limit breached!", {
          id: "telemetry-temp-breach",
        });
        addEvent("Air temperature breach detected", "critical");
        alerted.current.temp = true;
      }
    } else if (alerted.current.temp) {
      alerted.current.temp = false;
      toast.dismiss("telemetry-temp-breach");
      addEvent("Chamber returned to nominal operating conditions", "success");
    }

    if (
      telemetry.humidity < thresholds.humidityMin ||
      telemetry.humidity > thresholds.humidityMax
    ) {
      if (!alerted.current.humidity) {
        toast.error("Warning: Humidity is outside safe limits!", {
          id: "telemetry-humidity-breach",
        });
        addEvent("Humidity outside safe limits", "warning");
        alerted.current.humidity = true;
      }
    } else if (alerted.current.humidity) {
      alerted.current.humidity = false;
      toast.dismiss("telemetry-humidity-breach");
      addEvent("Chamber returned to nominal operating conditions", "success");
    }

    if (telemetry.gasPpm > thresholds.gasLimit) {
      if (!alerted.current.gas) {
        toast.error("Critical: Spoilage Gas limit breached!", {
          id: "telemetry-gas-breach",
        });
        addEvent("Spoilage gas limit breach detected", "critical");
        alerted.current.gas = true;
      }
    } else if (alerted.current.gas) {
      alerted.current.gas = false;
      toast.dismiss("telemetry-gas-breach");
      addEvent("Chamber returned to nominal operating conditions", "success");
    }
  }, [
    telemetry,
    history.length,
    thresholds.tempLimit,
    thresholds.humidityMin,
    thresholds.humidityMax,
    thresholds.gasLimit,
    addEvent,
  ]);

  useEffect(
    () => () => {
      toast.dismiss("telemetry-temp-breach");
      toast.dismiss("telemetry-humidity-breach");
      toast.dismiss("telemetry-gas-breach");
    },
    [],
  );

  useEffect(() => {
    const alarmRef = ref(db, "controls/alert_silenced");
    const unsubscribe = onValue(
      alarmRef,
      (snapshot) => {
        setIsAlertSilenced(snapshot.val() === true);
        setAlarmFeedback("idle");
      },
      () => setAlarmFeedback("error"),
    );

    return () => {
      unsubscribe();
      if (alarmSnoozeTimeoutRef.current !== null) {
        window.clearTimeout(alarmSnoozeTimeoutRef.current);
        alarmSnoozeTimeoutRef.current = null;
      }
    };
  }, []);

  const toggleAlarmSilence = async () => {
    if (isAlarmUpdating) return;
    setIsAlarmUpdating(true);
    setAlarmFeedback("idle");
    const alarmRef = ref(db, "controls/alert_silenced");
    try {
      await set(alarmRef, true);
      setIsAlertSilenced(true);
      setAlarmFeedback("saved");
      addEvent("Hardware alarm temporarily silenced by Operator", "info");
      alarmSnoozeTimeoutRef.current = window.setTimeout(async () => {
        setIsAlarmUpdating(true);
        try {
          await set(alarmRef, false);
          setIsAlertSilenced(false);
          setAlarmFeedback("saved");
        } catch {
          setAlarmFeedback("error");
        } finally {
          setIsAlarmUpdating(false);
          alarmSnoozeTimeoutRef.current = null;
        }
      }, 4000);
    } catch {
      setAlarmFeedback("error");
    } finally {
      setIsAlarmUpdating(false);
    }
  };

  const applyPreset = (presetKey: string) => {
    if (presetKey === "custom") {
      setSelectedPreset("custom");
      return;
    }

    const preset = COMMODITY_PRESETS[presetKey];
    if (!preset) {
      setSelectedPreset("custom");
      return;
    }

    setSelectedPreset(presetKey);
    void updateThresholds({
      tempLimit: preset.tempLimit,
      humidityMin: preset.humidityMin,
      humidityMax: preset.humidityMax,
      gasLimit: preset.gasLimit,
    }).then((saved) => {
      if (saved) {
        toast.success(`Preset applied: ${preset.name}`);
      } else {
        setSelectedPreset("custom");
        toast.error(`Could not apply preset: ${preset.name}`);
      }
    });
  };

  const presetDescription =
    selectedPreset === "custom"
      ? "Custom configuration using operator-defined thresholds."
      : COMMODITY_PRESETS[selectedPreset]?.description ??
        "Select a storage profile to optimize thresholds.";

  const exportAuditLogCSV = () => {
    if (history.length === 0) {
      toast.error("No telemetry data available to export.");
      return;
    }

    const headers = "Timestamp,Air Temp (°C),Humidity (%),Gas (PPM)";
    const rows = history.map((point) => {
      const escapedTime = `"${point.time.replace(/"/g, '""')}"`;
      return `${escapedTime},${point.airTemp.toFixed(1)},${point.humidity.toFixed(1)},${point.gasPpm.toFixed(0)}`;
    });
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = `ColdGuard_Audit_Log_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    toast.success("Audit log downloaded successfully.");
  };

  const sensorLimits = evaluateSensorLimits(telemetry, thresholds);
  const liveAir = telemetry.airTemp.toFixed(1);
  const liveHumidity = Math.round(telemetry.humidity).toString();
  const liveGas = Math.round(telemetry.gasPpm).toString();
  const liveTone: StatusTone =
    sensorLimits.severity !== "normal" || isThermalRunaway
      ? "critical"
      : isOffline
        ? "offline"
        : "success";
  const liveStatus =
    isThermalRunaway
      ? "CRITICAL • THERMAL RUNAWAY PREDICTED"
      : sensorLimits.severity === "critical"
      ? "CRITICAL • THRESHOLD BREACH"
      : sensorLimits.severity === "warning"
        ? "WARNING • DRIFT DETECTED"
        : isOffline
          ? "OFFLINE • HEARTBEAT LOST"
          : "NORMAL • HEARTBEAT ACTIVE";
  const liveShortLabel =
    isThermalRunaway
      ? "Thermal runaway"
      : sensorLimits.severity === "critical"
      ? "Critical breach"
      : sensorLimits.severity === "warning"
        ? "Warning drift"
        : isOffline
          ? "Offline"
          : "Nominal";
  const liveAffectedMetrics = isThermalRunaway
    ? [...new Set([...sensorLimits.breachedMetrics, "air" as const])]
    : sensorLimits.breachedMetrics;
  const currentScenarios: Record<ScenarioKey, Scenario> = {
    normal: {
      label: "Live Firebase Feed",
      shortLabel: liveShortLabel,
      status: liveStatus,
      headline:
        isThermalRunaway
          ? "Thermal runaway trend detected"
          : sensorLimits.severity !== "normal"
          ? sensorLimits.warningMessages[0]
          : isOffline
            ? "Telemetry connection interrupted"
            : "All systems operating normally",
      detail:
        sensorLimits.severity !== "normal"
          ? [
              ...sensorLimits.warningMessages,
              ...(isThermalRunaway
                ? [`Air temperature rose ${tempDelta.toFixed(1)}°C across the last five readings (~15 seconds).`]
                : []),
            ].join(" ")
          : isThermalRunaway
            ? `Air temperature rose ${tempDelta.toFixed(1)}°C across the last five readings (~15 seconds).`
          : isOffline
            ? "No heartbeat received for 60 seconds. Showing the last known snapshot."
            : "Live sensor data streaming from Firebase.",
      air: liveAir,
      humidity: liveHumidity,
      gas: liveGas,
      tone: liveTone,
      affected: liveAffectedMetrics,
    },
    temperature: {
      label: "Measure Temp",
      shortLabel: liveShortLabel,
      status: liveStatus,
      headline: "Temperature Threshold Configuration",
      detail: "Configure temperature and humidity limits while graphing live sensor metrics.",
      air: liveAir,
      humidity: liveHumidity,
      gas: liveGas,
      tone: liveTone,
      affected: liveAffectedMetrics,
    },
    gas: {
      label: "Measure Gas/VOC spike",
      shortLabel: liveShortLabel,
      status: liveStatus,
      headline: "Air Quality Threshold Configuration",
      detail: "Configure the gas/VOC limit while graphing live sensor metrics.",
      air: liveAir,
      humidity: liveHumidity,
      gas: liveGas,
      tone: liveTone,
      affected: liveAffectedMetrics,
    },
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-slate-800 text-white border border-slate-700",
        }}
      />
      <div className="min-h-screen bg-white text-slate-950">
        <Navigation onExportCSV={exportAuditLogCSV} />
        <main>
          <Hero
            scenario={currentScenarios[activeScenario]}
            activeScenario={activeScenario}
            isOffline={isOffline}
            limits={thresholds}
          />
          <ProblemSolution />
          <Hardware />
          <Thresholds limits={thresholds} />
          <Simulator
            active={activeScenario}
            setActive={setActiveScenario}
            dynamicScenarios={currentScenarios}
            isOffline={isOffline}
            limits={thresholds}
            isThresholdsLoading={isThresholdsLoading}
            saveStatus={saveStatus}
            onThresholdsSave={updateThresholds}
            selectedPreset={selectedPreset}
            presetDescription={presetDescription}
            onPresetChange={applyPreset}
            history={history}
            telemetry={telemetry}
            eventLog={eventLog}
            isThermalRunaway={isThermalRunaway}
            tempDelta={tempDelta}
            isAlertSilenced={isAlertSilenced}
            isAlarmUpdating={isAlarmUpdating}
            alarmFeedback={alarmFeedback}
            onToggleAlarm={toggleAlarmSilence}
          />
          <Architecture />
        </main>
        <AboutUs />
        <Footer />
      </div>
    </TooltipProvider>
  );
}
