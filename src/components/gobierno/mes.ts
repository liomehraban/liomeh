/** «2027-03» → «mar 27» / «Mar 27». */
export function etiquetaMes(mes: string, locale: string): string {
  const [y, m] = mes.split("-").map(Number);
  const f = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", { month: "short", year: "2-digit", timeZone: "UTC" });
  return f.format(new Date(Date.UTC(y, m - 1, 15))).replace(".", "");
}
