import {
  normalizeTypeValue,
  parseBoolean,
} from "@/controllers/properties";

describe("properties controller helpers", () => {
  describe("normalizeTypeValue", () => {
    it('returns "sale" for "venta"', () => {
      expect(normalizeTypeValue("venta")).toBe("sale");
    });

    it('returns "sale" for "sale"', () => {
      expect(normalizeTypeValue("sale")).toBe("sale");
    });

    it('returns "rent" for "alquiler"', () => {
      expect(normalizeTypeValue("alquiler")).toBe("rent");
    });

    it('returns "rent" for "rent"', () => {
      expect(normalizeTypeValue("rent")).toBe("rent");
    });

    it("returns undefined for unknown values", () => {
      expect(normalizeTypeValue("unknown")).toBeUndefined();
    });

    it("returns undefined for null/undefined/empty", () => {
      expect(normalizeTypeValue(null)).toBeUndefined();
      expect(normalizeTypeValue(undefined)).toBeUndefined();
      expect(normalizeTypeValue("")).toBeUndefined();
    });

    it("handles case-insensitive input", () => {
      expect(normalizeTypeValue("VENTA")).toBe("sale");
      expect(normalizeTypeValue("Alquiler")).toBe("rent");
    });
  });

  describe("parseBoolean", () => {
    it('returns true for "true"', () => {
      expect(parseBoolean("true")).toBe(true);
    });

    it('returns true for "1"', () => {
      expect(parseBoolean("1")).toBe(true);
    });

    it('returns true for "si" and "sí"', () => {
      expect(parseBoolean("si")).toBe(true);
      expect(parseBoolean("sí")).toBe(true);
    });

    it('returns true for "on" and "yes"', () => {
      expect(parseBoolean("on")).toBe(true);
      expect(parseBoolean("yes")).toBe(true);
    });

    it('returns false for "false"', () => {
      expect(parseBoolean("false")).toBe(false);
    });

    it('returns false for "0"', () => {
      expect(parseBoolean("0")).toBe(false);
    });

    it('returns false for "no"', () => {
      expect(parseBoolean("no")).toBe(false);
    });

    it("returns false for booleans", () => {
      expect(parseBoolean(true)).toBe(true);
      expect(parseBoolean(false)).toBe(false);
    });

    it("returns undefined for null/undefined/empty", () => {
      expect(parseBoolean(null)).toBeUndefined();
      expect(parseBoolean(undefined)).toBeUndefined();
      expect(parseBoolean("")).toBeUndefined();
    });

    it("returns undefined for unknown strings", () => {
      expect(parseBoolean("maybe")).toBeUndefined();
    });

    it("trims whitespace before parsing", () => {
      expect(parseBoolean("  true  ")).toBe(true);
      expect(parseBoolean("  no  ")).toBe(false);
    });
  });
});
