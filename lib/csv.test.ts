import { describe, expect, it } from "vitest";
import { csvCell, csvRow } from "./csv";

describe("csvCell", () => {
  it("leaves plain text and numbers alone", () => {
    expect(csvCell("Groceries")).toBe("Groceries");
    expect(csvCell(-12.5)).toBe("-12.5");
    expect(csvCell(null)).toBe("");
  });
  it("quotes commas, quotes and newlines", () => {
    expect(csvCell('Lunch, "big" one')).toBe('"Lunch, ""big"" one"');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
  });
  it("neutralises formula injection in text", () => {
    expect(csvCell('=HYPERLINK("http://x","click")')).toBe(`"'=HYPERLINK(""http://x"",""click"")"`);
    expect(csvCell("+1 coffee")).toBe("'+1 coffee");
    expect(csvCell("@sum")).toBe("'@sum");
    expect(csvCell("-refund")).toBe("'-refund");
  });
});

describe("csvRow", () => {
  it("joins cells with CRLF line endings", () => {
    expect(csvRow(["a", 1, null])).toBe("a,1,\r\n");
  });
});
