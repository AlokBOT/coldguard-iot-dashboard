import { useEffect, useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { Button } from "./ui/button";
import type { ThresholdLimits } from "../useThresholds";

type ThresholdTab = "normal" | "temperature" | "gas";
type SaveStatus = "idle" | "saving" | "saved" | "error";
type Draft = Record<keyof ThresholdLimits, string>;

function createDraft(limits: ThresholdLimits): Draft {
  return {
    tempLimit: String(limits.tempLimit),
    humidityMin: String(limits.humidityMin),
    humidityMax: String(limits.humidityMax),
    gasLimit: String(limits.gasLimit),
  };
}

export function ThresholdControls({
  activeTab,
  limits,
  isLoading,
  saveStatus,
  onSave,
  selectedPreset,
  presetDescription,
  onPresetChange,
}: {
  activeTab: ThresholdTab;
  limits: ThresholdLimits;
  isLoading: boolean;
  saveStatus: SaveStatus;
  onSave: (newLimits: Partial<ThresholdLimits>) => Promise<boolean>;
  selectedPreset: string;
  presetDescription: string;
  onPresetChange: (presetKey: string) => void;
}) {
  const [draft, setDraft] = useState(() => createDraft(limits));
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    setDraft(createDraft(limits));
  }, [limits]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationMessage("");

    if (activeTab === "temperature") {
      const tempLimit = Number(draft.tempLimit);
      const humidityMin = Number(draft.humidityMin);
      const humidityMax = Number(draft.humidityMax);
      if (
        !Number.isFinite(tempLimit) ||
        !Number.isFinite(humidityMin) ||
        !Number.isFinite(humidityMax) ||
        tempLimit < -80 ||
        humidityMin < 0 ||
        humidityMax > 100 ||
        humidityMin >= humidityMax
      ) {
        setValidationMessage("Enter valid limits and keep minimum humidity below maximum.");
        return;
      }
      await onSave({ tempLimit, humidityMin, humidityMax });
      return;
    }

    if (activeTab === "gas") {
      const gasLimit = Number(draft.gasLimit);
      if (!Number.isInteger(gasLimit) || gasLimit < 0) {
        setValidationMessage("Enter a whole number of 0 ppm or higher.");
        return;
      }
      await onSave({ gasLimit });
    }
  };

  const updateField = (key: keyof ThresholdLimits, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setValidationMessage("");
    onPresetChange("custom");
  };

  const fieldClassName =
    "h-10 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 font-mono text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-50";
  const isBusy = isLoading || saveStatus === "saving";

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-950 p-5 text-white sm:p-6">
      <div className="mb-5 grid gap-2">
        <label
          className="text-xs font-semibold text-slate-300"
          htmlFor="commodity-preset"
        >
          Storage commodity preset
        </label>
        <select
          id="commodity-preset"
          className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-50"
          value={selectedPreset}
          disabled={isBusy}
          onChange={(event) => onPresetChange(event.target.value)}
        >
          <option value="dairy">Dairy &amp; Milk (4.0°C)</option>
          <option value="produce">Fresh Vegetables &amp; Greens (7.0°C)</option>
          <option value="pharma">
            Vaccines &amp; Pharmaceuticals (8.0°C)
          </option>
          <option value="frozen">Deep Frozen Inventory (-18.0°C)</option>
          <option value="custom">Custom Configuration</option>
        </select>
        <p className="text-xs text-slate-400">{presetDescription}</p>
      </div>
      {activeTab === "normal" ? (
        <>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Active thresholds
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
              Air max: {limits.tempLimit}°C
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
              Humidity: {limits.humidityMin}–{limits.humidityMax}% RH
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
              Gas max: {limits.gasLimit} ppm
            </span>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            {activeTab === "temperature"
              ? "Alert Threshold Configuration"
              : "Air Quality Threshold Configuration"}
          </h3>
          <div
            className={`mt-4 grid gap-4 ${activeTab === "temperature" ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}
          >
            {activeTab === "temperature" ? (
              <>
                <label className="grid gap-2 text-xs font-semibold text-slate-300">
                  Max Air Temperature (°C)
                  <input
                    className={fieldClassName}
                    type="number"
                    min="-80"
                    step="0.1"
                    value={draft.tempLimit}
                    disabled={isBusy}
                    onChange={(event) => updateField("tempLimit", event.target.value)}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                  <label className="grid gap-2 text-xs font-semibold text-slate-300">
                    Safe Humidity Minimum (% RH)
                    <input
                      className={fieldClassName}
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={draft.humidityMin}
                      disabled={isBusy}
                      onChange={(event) => updateField("humidityMin", event.target.value)}
                    />
                  </label>
                  <label className="grid gap-2 text-xs font-semibold text-slate-300">
                    Safe Humidity Maximum (% RH)
                    <input
                      className={fieldClassName}
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={draft.humidityMax}
                      disabled={isBusy}
                      onChange={(event) => updateField("humidityMax", event.target.value)}
                    />
                  </label>
                </div>
              </>
            ) : (
              <label className="grid gap-2 text-xs font-semibold text-slate-300">
                Max Spoilage Gas (ppm)
                <input
                  className={fieldClassName}
                  type="number"
                  min="0"
                  step="1"
                  value={draft.gasLimit}
                  disabled={isBusy}
                  onChange={(event) => updateField("gasLimit", event.target.value)}
                />
              </label>
            )}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p
              className={`min-h-5 text-xs ${saveStatus === "error" ? "text-red-300" : "text-emerald-300"}`}
              role={saveStatus === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              {validationMessage ||
                (isLoading
                  ? "Listening for saved thresholds..."
                  : saveStatus === "saving"
                    ? "Saving..."
                    : saveStatus === "saved"
                      ? "Saved to Firebase."
                      : saveStatus === "error"
                        ? "Could not sync thresholds with Firebase."
                        : "Changes apply after saving.")}
            </p>
            <Button type="submit" disabled={isBusy}>
              <Save className="size-4" aria-hidden="true" />
              {activeTab === "temperature"
                ? "Update Temperature Limits"
                : "Update Gas Limit"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}