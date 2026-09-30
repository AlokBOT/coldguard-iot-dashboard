import { useEffect, useState } from "react";
import { onValue, ref, update } from "firebase/database";
import { db } from "./firebase";

export type ThresholdLimits = {
  tempLimit: number;
  humidityMin: number;
  humidityMax: number;
  gasLimit: number;
};

export const DEFAULT_THRESHOLDS: ThresholdLimits = {
  tempLimit: 8,
  humidityMin: 80,
  humidityMax: 95,
  gasLimit: 100,
};

function parseThresholds(value: unknown): ThresholdLimits {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const numberOrDefault = (key: string, fallback: number) => {
    const parsed = Number(record[key]);
    return record[key] !== undefined && Number.isFinite(parsed)
      ? parsed
      : fallback;
  };

  return {
    tempLimit: numberOrDefault("temp_limit", DEFAULT_THRESHOLDS.tempLimit),
    humidityMin: numberOrDefault(
      "humidity_min",
      DEFAULT_THRESHOLDS.humidityMin,
    ),
    humidityMax: numberOrDefault(
      "humidity_max",
      DEFAULT_THRESHOLDS.humidityMax,
    ),
    gasLimit: Math.round(
      numberOrDefault("gas_limit", DEFAULT_THRESHOLDS.gasLimit),
    ),
  };
}

export function useThresholds() {
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  useEffect(() => {
    const thresholdsRef = ref(db, "settings/thresholds");
    const unsubscribe = onValue(
      thresholdsRef,
      (snapshot) => {
        setThresholds(parseThresholds(snapshot.val()));
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
        setSaveStatus("error");
      },
    );

    return unsubscribe;
  }, []);

  const updateThresholds = async (newLimits: Partial<ThresholdLimits>) => {
    const nextLimits = { ...thresholds, ...newLimits };
    setSaveStatus("saving");

    try {
      await update(ref(db, "settings/thresholds"), {
        temp_limit: nextLimits.tempLimit,
        gas_limit: Math.round(nextLimits.gasLimit),
        humidity_min: nextLimits.humidityMin,
        humidity_max: nextLimits.humidityMax,
      });
      setThresholds(nextLimits);
      setSaveStatus("saved");
      return true;
    } catch {
      setSaveStatus("error");
      return false;
    }
  };

  return { thresholds, isLoading, saveStatus, updateThresholds };
}
