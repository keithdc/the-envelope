import { useEffect, useState } from "react";
import { CalendarHeart } from "lucide-react";
import NumberTicker from "./NumberTicker.jsx";
import MorphingText from "./MorphingText.jsx";
import "./Countdown.css";

/**
 * Remaining time until the target date. Clamps to zero once the date has
 * passed (never negative) — a past/absent date reads as "the day itself".
 */
function getRemaining(targetISO) {
  const diff = new Date(targetISO).getTime() - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
  }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    passed: false,
  };
}

// Phrases the "it's today" state morphs between (Magic UI MorphingText).
const TODAY_PHRASES = ["Today", "The big day", "We do", "At last"];

/**
 * Day-focused live countdown:
 *  - with days left: a springing NumberTicker for the days, plus smaller
 *    hours/minutes/seconds units.
 *  - on the day itself (0 days / passed): a morphing-text celebration.
 */
export default function Countdown({ targetISO }) {
  const [t, setT] = useState(() => getRemaining(targetISO));

  useEffect(() => {
    const id = setInterval(() => setT(getRemaining(targetISO)), 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  const isToday = t.passed || t.days === 0;

  if (isToday) {
    return (
      <div className="countdown" role="timer" aria-live="polite">
        <p className="cd-headline cd-headline--today">
          <CalendarHeart className="cd-headline-icon" aria-hidden="true" />
          <MorphingText className="cd-morph" texts={TODAY_PHRASES} />
        </p>
      </div>
    );
  }

  const units = [
    { label: "Hours", value: t.hours },
    { label: "Minutes", value: t.minutes },
    { label: "Seconds", value: t.seconds },
  ];

  return (
    <div className="countdown" role="timer" aria-live="off">
      <p className="cd-headline">
        <CalendarHeart className="cd-headline-icon" aria-hidden="true" />
        {/* the days number springs into place when it scrolls into view */}
        <NumberTicker className="cd-days" value={t.days} />
        <span className="cd-days-label">
          {t.days === 1 ? "day" : "days"} to go
        </span>
      </p>

      <div className="cd-units">
        {units.map((u) => (
          <div className="cd-unit" key={u.label}>
            <span className="cd-value">{String(u.value).padStart(2, "0")}</span>
            <span className="cd-label">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
