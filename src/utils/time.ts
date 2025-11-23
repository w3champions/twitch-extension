import { intervalToDuration } from "date-fns/intervalToDuration";

export function formatMatchDuration(interval: number): string {
  const duration = intervalToDuration({ start: 0, end: interval * 1000 });
  const durations = [duration.minutes ?? 0, duration.seconds ?? 0];
  if (duration.hours && duration.hours > 0) {
    durations.unshift(duration.hours);
  }
  return durations
    .map((duration) => String(duration).padStart(2, "0"))
    .join(":");
}

export function formatMonthDay(time: string | Date): string {
  const date = new Date(time);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[date.getMonth()]} ${date.getDate()}`;
}

export function formatRelativeTime(time: string | Date): string {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}
