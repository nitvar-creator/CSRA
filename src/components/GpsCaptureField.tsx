"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export type GpsValue = {
  lat: number | null;
  lng: number | null;
  manual_text: string | null;
};

type Props = {
  value: GpsValue;
  onChange: (value: GpsValue) => void;
  required?: boolean;
};

type Status =
  | "idle"
  | "requesting"
  | "captured"
  | "denied"
  | "unsupported"
  | "error"
  | "manual";

export default function GpsCaptureField({ value, onChange, required }: Props) {
  const [status, setStatus] = useState<Status>(() => {
    if (value.lat != null && value.lng != null) return "captured";
    if (
      typeof window !== "undefined" &&
      !("geolocation" in navigator)
    ) {
      return "unsupported";
    }
    return "idle";
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const requestLocation = () => {
    if (
      typeof window === "undefined" ||
      !("geolocation" in navigator)
    ) {
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");

    // Safety timeout in case the browser never fires success/error.
    clearTimer();
    timeoutRef.current = setTimeout(() => {
      setStatus((prev) => (prev === "requesting" ? "error" : prev));
      onChange({ lat: null, lng: null, manual_text: value.manual_text });
    }, 15000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimer();
        onChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          manual_text: null,
        });
        setStatus("captured");
      },
      (error) => {
        clearTimer();
        let nextStatus: Status = "error";
        if (error.code === error.PERMISSION_DENIED) nextStatus = "denied";
        else if (error.code === error.POSITION_UNAVAILABLE) nextStatus = "error";
        else if (error.code === error.TIMEOUT) nextStatus = "error";
        setStatus(nextStatus);
        onChange({ lat: null, lng: null, manual_text: value.manual_text });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ lat: null, lng: null, manual_text: e.target.value });
  };

  const handleManualLink = () => {
    setStatus("manual");
  };

  const handleChangeLocation = () => {
    setStatus("idle");
    onChange({ lat: null, lng: null, manual_text: value.manual_text });
  };

  const showManualInput =
    status === "denied" ||
    status === "unsupported" ||
    status === "error" ||
    status === "manual";

  const manualEmpty = !value.manual_text || value.manual_text.trim() === "";
  const hasCoords = value.lat != null && value.lng != null;
  const ariaInvalid = required && showManualInput && manualEmpty && !hasCoords;

  return (
    <div
      role="group"
      aria-label="Location"
      className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6"
    >
      <label className="block text-sm font-semibold text-slate-700 mb-3">
        Location
      </label>

      {status === "idle" && (
        <div className="flex flex-col items-stretch gap-3">
          <button
            type="button"
            onClick={requestLocation}
            aria-label="Use my current location"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgb(219,39,119,0.25)] transition-all"
          >
            <MapPin className="h-5 w-5" />
            Use my current location
          </button>
          <button
            type="button"
            onClick={handleManualLink}
            aria-label="Enter location manually"
            className="text-sm font-medium text-pink-600 hover:text-pink-700 hover:underline self-center"
          >
            or enter location manually
          </button>
        </div>
      )}

      {status === "requesting" && (
        <div
          aria-live="polite"
          className="flex items-center justify-center gap-3 py-6 text-slate-600"
        >
          <Loader2 className="h-5 w-5 animate-spin text-pink-600" />
          <span className="font-medium">Getting your location…</span>
        </div>
      )}

      {status === "captured" && (
        <div className="rounded-xl bg-pink-50 border border-pink-100 p-4">
          <div className="flex items-center gap-2 text-pink-700 font-semibold">
            <CheckCircle2 className="h-5 w-5" />
            Location captured
          </div>
          {hasCoords && (
            <div className="mt-2 text-sm text-slate-600 font-mono">
              {value.lat!.toFixed(4)}, {value.lng!.toFixed(4)}
            </div>
          )}
          <button
            type="button"
            onClick={handleChangeLocation}
            aria-label="Change location"
            className="mt-3 text-sm font-medium text-pink-600 hover:text-pink-700 hover:underline"
          >
            Change
          </button>
        </div>
      )}

      {showManualInput && (
        <div className="space-y-3">
          {status !== "manual" && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-800 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Couldn&apos;t access GPS. Please type your location.</span>
            </div>
          )}
          <textarea
            name="location_text"
            rows={2}
            value={value.manual_text ?? ""}
            onChange={handleChange}
            aria-label="Manual location"
            aria-invalid={ariaInvalid || undefined}
            required={required && !hasCoords}
            placeholder="Describe your location (village, landmark, etc.)"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500 focus:bg-white transition-colors resize-none"
          />
          {status === "manual" && (
            <button
              type="button"
              onClick={requestLocation}
              aria-label="Try using my current location again"
              className="text-sm font-medium text-pink-600 hover:text-pink-700 hover:underline"
            >
              Try GPS instead
            </button>
          )}
        </div>
      )}
    </div>
  );
}
