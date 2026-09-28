import { describe, expect, it } from "vitest";
import { blockTypes } from "@/sanity/schemaTypes/blocks";
import { schemaTypes, singletons } from "@/sanity/schemaTypes";
import { sectionKeys } from "@/lib/site";
import { getCaseStudy, getLightTable, getNextCaseStudy, getWorkIndex, splitWorkIndex } from "./index";
import * as seed from "./seed";
import { tableObjectIds, type Block } from "./types";

describe("seed content", () => {
  it("features the five projects in the brief's order", async () => {
    const { featured, archive } = await getWorkIndex();
    expect(featured.map((s) => s.slug)).toEqual(["fado-engineering", "flytik", "tripsim", "kosovanet", "tsc-building"]);
    expect(archive.map((s) => s.slug).sort()).toEqual(
      ["aktive-real-estate", "bua", "flawless", "gashi", "matin-home", "toni-color"].sort(),
    );
  });

  it("gives every case study a unique slug and a Connection", () => {
    const slugs = seed.caseStudies.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of seed.caseStudies) {
      expect(s.connection.length, s.slug).toBeGreaterThan(10);
      expect(s.blocks.some((b) => b._type === "connectionBlock"), s.slug).toBe(true);
    }
  });

  it("doesn't invent years or roles Endrit hasn't given", () => {
    for (const s of seed.caseStudies) {
      expect(s.year, s.slug).toBeUndefined();
      expect(s.role, s.slug).toBeUndefined();
    }
  });

  it("maps every table object to a real section", async () => {
    const table = await getLightTable();
    for (const id of tableObjectIds) expect(sectionKeys).toContain(table.slots[id].section);
    const opened = new Set(tableObjectIds.map((id) => table.slots[id].section));
    for (const key of ["work", "experiments", "motion", "logos", "fun"]) expect(opened.has(key as never)).toBe(true);
  });

  it("finds case studies by slug and walks to the next one", async () => {
    expect((await getCaseStudy("tripsim"))?.title).toBe("TripSIM");
    expect(await getCaseStudy("nope")).toBeNull();
    expect((await getNextCaseStudy("fado-engineering"))?.slug).toBe("flytik");
    expect((await getNextCaseStudy("tsc-building"))?.slug).toBe(seed.caseStudies[5].slug);
    const last = seed.caseStudies[seed.caseStudies.length - 1].slug;
    expect((await getNextCaseStudy(last))?.slug).toBe("fado-engineering");
  });

  it("keeps featured order and leaves the rest for All work", () => {
    const a = { _id: "a", title: "A", slug: "a", connection: "..." };
    const b = { _id: "b", title: "B", slug: "b", connection: "..." };
    const c = { _id: "c", title: "C", slug: "c", connection: "..." };
    expect(splitWorkIndex([c, a], [a, b, c])).toEqual({ featured: [c, a], archive: [b] });
  });
});

describe("sanity schema", () => {
  it("has a schema type for every block the site renders", () => {
    const rendered: Block["_type"][] = [
      "textBlock",
      "statementBlock",
      "imageBlock",
      "imagePair",
      "gallery",
      "videoBlock",
      "lottieBlock",
      "connectionBlock",
      "beforeAfter",
      "paletteBlock",
      "typeBlock",
      "quoteBlock",
      "applicationsBlock",
      "stepsBlock",
      "spacerBlock",
    ];
    expect(blockTypes.map((b) => b.name).sort()).toEqual([...rendered].sort());
  });

  it("registers every singleton as a document type", () => {
    const names = schemaTypes.map((t) => t.name);
    for (const s of singletons) expect(names).toContain(s.type);
  });

  it("gives the light table one slot per table object", () => {
    const table = schemaTypes.find((t) => t.name === "lightTable") as unknown as {
      fields: { name: string; fields?: { name: string }[] }[];
    };
    const slots = table.fields.find((f) => f.name === "slots");
    expect(slots?.fields?.map((f) => f.name).sort()).toEqual([...tableObjectIds].sort());
  });
});
