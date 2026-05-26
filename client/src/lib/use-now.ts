import { useEffect, useState } from "react";

/**
 * Returns a `Date.now()` timestamp that updates on a fixed interval, so any
 * component using it re-renders periodically. Useful for live "Xm ago" labels
 * or freshness windows.
 */
export function useNow(intervalMs = 15_000): number {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function formatRelativeTime(fromMs: number, now: number): string {
  const diff = Math.max(0, now - fromMs);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return "less than a minute ago";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
