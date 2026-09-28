import { describe, expect, it } from "vitest";
import { validateContact } from "./contact";
import { gjilanTime, isDaylightInGjilan } from "./time";

describe("Gjilan time", () => {
  it("is UTC+1 in winter and UTC+2 in summer", () => {
    expect(gjilanTime(new Date("2026-01-15T22:14:00Z")).label).toBe("23:14");
    expect(gjilanTime(new Date("2026-07-15T21:14:00Z")).label).toBe("23:14");
  });

  it("wraps past midnight", () => {
    expect(gjilanTime(new Date("2026-01-15T23:30:00Z")).label).toBe("00:30");
  });

  it("knows when the room has daylight", () => {
    expect(isDaylightInGjilan(new Date("2026-07-15T10:00:00Z"))).toBe(true); // 12:00 local
    expect(isDaylightInGjilan(new Date("2026-07-15T21:00:00Z"))).toBe(false); // 23:00 local
    expect(isDaylightInGjilan(new Date("2026-12-15T16:00:00Z"))).toBe(false); // 17:00 local, after sunset
    expect(isDaylightInGjilan(new Date("2026-06-15T18:00:00Z"))).toBe(true); // 20:00 local, still light
  });
});

describe("contact form", () => {
  const good = { name: "Ana", email: "ana@studio.com", message: "We make bridges and need a brand." };

  it("accepts a real message", () => {
    const r = validateContact(good);
    expect(r.ok && r.value.name).toBe("Ana");
    expect(r.ok && r.spam).toBe(false);
  });

  it("points at the field that needs fixing", () => {
    expect(validateContact({ ...good, name: " " })).toMatchObject({ ok: false, field: "name" });
    expect(validateContact({ ...good, email: "ana@" })).toMatchObject({ ok: false, field: "email" });
    expect(validateContact({ ...good, message: "hi" })).toMatchObject({ ok: false, field: "message" });
    expect(validateContact(null)).toMatchObject({ ok: false, field: "form" });
  });

  it("flags the honeypot", () => {
    const r = validateContact({ ...good, website: "http://spam" });
    expect(r.ok && r.spam).toBe(true);
  });
});
