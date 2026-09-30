import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from './firebase.ts';

export interface TelemetryState {
  airTemp: number;
  humidity: number;
  gasPpm: number;
  statusCode: string;
  updatedAt: number;
}

export interface TelemetryHistoryPoint {
  airTemp: number;
  humidity: number;
  gasPpm: number;
  time: string;
}

export function useTelemetry(deviceId: string = 'device1') {
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    airTemp: 2.4,
    humidity: 88,
    gasPpm: 128,
    statusCode: 'NOMINAL',
    updatedAt: Date.now(),
  });
  const [history, setHistory] = useState<TelemetryHistoryPoint[]>([]);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    // Listens to telemetry/device1 in your Firebase Realtime Database
    const telemetryRef = ref(db, `telemetry/${deviceId}`);

    const unsubscribe = onValue(telemetryRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();

        const air = val.airTemp ?? val.air_temp ?? val.temperature ?? 2.4;
        const hum = val.humidity ?? 88;
        const gas = val.gasPpm ?? val.gas_ppm ?? val.gas ?? 128;
        const status = val.statusCode ?? val.status_code ?? 'NOMINAL';
        const updated = val.updatedAt ?? val.updated_at ?? Date.now();

        const nextTelemetry = {
          airTemp: Number(air),
          humidity: Number(hum),
          gasPpm: Number(gas),
          statusCode: String(status),
          updatedAt: Number(updated),
        };
        setTelemetry(nextTelemetry);
        setHistory((current) => [
          ...current.slice(-29),
          {
            airTemp: nextTelemetry.airTemp,
            humidity: nextTelemetry.humidity,
            gasPpm: nextTelemetry.gasPpm,
            time: new Date().toLocaleTimeString(),
          },
        ]);

        // 60-second offline threshold check
        const ageSeconds = (Date.now() - Number(updated)) / 1000;
        setIsOffline(ageSeconds > 60);
      }
    });

    return () => unsubscribe();
  }, [deviceId]);

  return { telemetry, history, isOffline };
}