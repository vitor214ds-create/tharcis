export const TZ = "America/Sao_Paulo";

export const fmtDate = (d: string | Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" }).format(typeof d === "string" && d.length === 10 ? new Date(d + "T12:00:00") : new Date(d)) : "—";
export const fmtDateTime = (d: string | Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d)) : "—";
export const fmtTime = (d: string | Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(d));
export const fmtLongDate = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }).format(d);

/** YYYY-MM-DD for "today" in São Paulo */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}
/** Convert a datetime-local value (SP local) to ISO with offset -03:00 (Brazil has no DST since 2019). */
export const localToISO = (local: string) => new Date(local + ":00-03:00").toISOString();
/** ISO → datetime-local string in SP */
export function isoToLocal(iso: string) {
  const d = new Date(new Date(iso).getTime() - 3 * 3600 * 1000);
  return d.toISOString().slice(0, 16);
}
export function daysUntil(dateISO: string) {
  const t = new Date(todayISO() + "T00:00:00Z").getTime();
  const d = new Date(dateISO + "T00:00:00Z").getTime();
  return Math.round((d - t) / 86400000);
}
export const initials = (name?: string | null) =>
  (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
