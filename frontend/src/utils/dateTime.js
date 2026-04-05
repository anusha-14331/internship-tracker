/** Used when the user picks a date but leaves time empty */
const DEFAULT_TIME = "17:00";

/**
 * Combine HTML date (YYYY-MM-DD) and time (HH:mm).
 * If time is empty, uses DEFAULT_TIME (5:00 PM local) so date-only picks work.
 */
export function dateAndTimeToIso(dateStr, timeStr) {
  if (!dateStr || typeof dateStr !== "string") return "";
  const dPart = dateStr.trim();
  const tPart =
    timeStr && String(timeStr).trim() ? String(timeStr).trim() : DEFAULT_TIME;
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dPart);
  const tm = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(tPart);
  if (!dm || !tm) return "";
  const [, y, mo, d] = dm;
  const [, h, min] = tm;
  const local = new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(min),
    0,
    0
  );
  if (Number.isNaN(local.getTime())) return "";
  return local.toISOString();
}

export function isoToDateAndTime(iso) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return { date: `${y}-${mo}-${day}`, time: `${h}:${min}` };
}

/** Show deadline in the user's locale (date + time) */
export function formatDeadline(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
