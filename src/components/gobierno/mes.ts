/** «2027-03» → «mar ’27» / «Mar ’27» (el apóstrofo evita leerlo como «27 de marzo»). */
export function etiquetaMes(mes: string, locale: string): string {
  const [y, m] = mes.split("-").map(Number);
  const f = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", { month: "short", timeZone: "UTC" });
  return `${f.format(new Date(Date.UTC(y, m - 1, 15))).replace(".", "")} ’${String(y).slice(-2)}`;
}
