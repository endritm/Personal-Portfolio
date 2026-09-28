/** Gjilan keeps Central European time. */
export const GJILAN_TZ = "Europe/Belgrade";

export function gjilanTime(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: GJILAN_TZ,
    hour: "2-digit",
    minute: "2-digit",
    month: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const hours = get("hour");
  const minutes = get("minute");
  return {
    hours,
    minutes,
    month: get("month"),
    label: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
  };
}

/**
 * Rough sunrise and sunset in Gjilan, in local clock hours, by month.
 * Close enough to decide whether the room has daylight.
 */
const sun: [rise: number, set: number][] = [
  [7.0, 16.5],
  [6.6, 17.2],
  [6.2, 18.2],
  [6.3, 19.4],
  [5.6, 20.0],
  [5.2, 20.4],
  [5.4, 20.3],
  [5.9, 19.8],
  [6.5, 18.9],
  [6.8, 17.7],
  [6.6, 16.3],
  [7.0, 16.1],
];

export function isDaylightInGjilan(date: Date = new Date()) {
  const { hours, minutes, month } = gjilanTime(date);
  const [rise, set] = sun[month - 1];
  const t = hours + minutes / 60;
  return t >= rise && t < set;
}
