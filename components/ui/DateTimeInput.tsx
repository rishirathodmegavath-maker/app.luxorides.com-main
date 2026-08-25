"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, Check, Clock } from "lucide-react";

/* ---------------------------------------------
   UTILS
--------------------------------------------- */

export function formatReadable(date: Date, locale = "en-IN") {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getMinDateTime() {
  const d = new Date();
  d.setHours(d.getHours() + 4);
  return d;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getSuggestedValue() {
  const date = getMinDateTime();
  const nextQuarter = Math.ceil(date.getMinutes() / 15) * 15;

  if (nextQuarter >= 60) {
    date.setHours(date.getHours() + 1, 0, 0, 0);
  } else {
    date.setMinutes(nextQuarter, 0, 0);
  }

  return `${toDateInputValue(date)}T${`${date.getHours()}`.padStart(2, "0")}:${`${date.getMinutes()}`.padStart(2, "0")}`;
}

/* ---------------------------------------------
   TYPES
--------------------------------------------- */

type Props = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

/* ---------------------------------------------
   COMPONENT
--------------------------------------------- */

export function DateTimeInput({
  value,
  onChange,
  placeholder = "Pickup date & time",
}: Props) {
  const [open, setOpen] = useState(false);

  const initial = useMemo(() => {
    if (!value) return { date: "", time: "" };
    const [d, t] = value.split("T");
    return { date: d, time: t };
  }, [value]);

  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time?.slice(0, 5) ?? "");
  const [error, setError] = useState("");

  function openPicker() {
    if (!value) {
      const suggested = getSuggestedValue();
      const [suggestedDate, suggestedTime] = suggested.split("T");
      setDate(suggestedDate);
      setTime(suggestedTime);
      setOpen(true);
      return;
    }

    const [nextDate, nextTime = ""] = value.split("T");
    setDate(nextDate);
    setTime(nextTime.slice(0, 5));
    setOpen(true);
  }

  function validate(d: string, t: string) {
    if (!d || !t) return "Please select date and time";

    const selected = new Date(`${d}T${t}`);
    const minDateTime = getMinDateTime();

    if (selected < minDateTime) {
      return "Pickup time must be at least 4 hours from now";
    }

    return "";
  }

  function handleDateChange(d: string) {
    setDate(d);
    setError(validate(d, time));
  }

  function handleTimeChange(t: string) {
    setTime(t);
    setError(validate(date, t));
  }

  function handleDone() {
    const err = validate(date, time);
    if (err) {
      setError(err);
      return;
    }

    onChange(`${date}T${time}`);
    setOpen(false);
  }

  const isValid = !validate(date, time);
  const readable = value && !error ? formatReadable(new Date(value)) : "";
  const minDate = toDateInputValue(getMinDateTime());
  const popup =
    open && typeof document !== "undefined"
      ? createPortal(
          <>
            <div
              className="lux-modal-backdrop fixed inset-0 z-[90]"
              onClick={() => setOpen(false)}
            />

            <div
              role="dialog"
              aria-modal="true"
              className="
                fixed left-1/2 top-1/2 z-[100]
                w-[calc(100vw-32px)] max-w-[420px]
                max-h-[calc(100dvh-32px)] overflow-y-auto
                -translate-x-1/2 -translate-y-1/2

                rounded-[28px]
                p-5 pb-[calc(20px+env(safe-area-inset-bottom))] space-y-5

                bg-white
                border border-neutral-200
                shadow-[0_30px_90px_rgba(0,0,0,0.38)]
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                    Schedule
                  </p>
                  <h3 className="text-lg font-semibold text-neutral-950">
                    Pickup date & time
                  </h3>
                </div>
                <Clock size={20} className="text-neutral-500" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-500">
                  Date
                </label>

                <input
                  type="date"
                  min={minDate}
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="
                    w-full h-12
                    rounded-xl
                    border border-neutral-200
                    bg-neutral-50
                    px-3
                    text-sm text-neutral-900

                    focus:outline-none
                    focus:bg-white
                    focus:ring-2 focus:ring-black/5
                  "
                  style={{ colorScheme: "light" }}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-neutral-500">
                  Time
                </label>
                <input
                  type="time"
                  step={900}
                  value={time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="
                    w-full h-12
                    rounded-xl
                    border border-neutral-200
                    bg-neutral-50
                    px-3
                    text-sm text-neutral-900

                    focus:outline-none
                    focus:bg-white
                    focus:ring-2 focus:ring-black/5
                  "
                  style={{ colorScheme: "light" }}
                />
                <p className="text-xs text-neutral-500">
                  Use your device picker for the easiest selection.
                </p>
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                onClick={handleDone}
                disabled={!isValid}
                className="
                  w-full h-11
                  rounded-lg
                  bg-black text-white
                  text-sm font-medium

                  disabled:opacity-40
                "
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Check size={16} /> Done
                </span>
              </button>
            </div>
          </>,
          document.body,
        )
      : null;

  /* ---------------------------------------------
     RENDER
  --------------------------------------------- */

  return (
    <div className="relative w-full">
      {/* ================= TRIGGER INPUT ================= */}
      <button
        type="button"
        onClick={openPicker}
        className="
          lux-field w-full
          pl-12 pr-4
          text-left
          flex items-center
          text-sm

          transition-all duration-200
          hover:bg-white
        "
      >
        <Calendar
          size={18}
          className="absolute left-4 text-neutral-400"
        />

        <span
          className={
            readable ? "text-neutral-900" : "text-neutral-400"
          }
        >
          {readable || placeholder}
        </span>
      </button>

      {popup}
    </div>
  );
}
