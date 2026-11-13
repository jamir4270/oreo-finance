type Cell = string | number | null | undefined;

/**
 * One CSV cell (RFC 4180): quoted when it contains a comma, quote or newline.
 * Text starting with = + - @ (or tab/CR) is prefixed with ' so spreadsheet apps don't run it
 * as a formula: a note like =HYPERLINK(...) would otherwise execute when the file is opened.
 * Numbers are written as-is, so negative amounts stay numeric.
 */
export function csvCell(value: Cell): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  let text = value;
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function csvRow(cells: Cell[]): string {
  return cells.map(csvCell).join(",") + "\r\n";
}
