import { BulbOutlineIcon } from "@sanity/icons/BulbOutline";
import { CaseIcon } from "@sanity/icons/Case";
import { defineArrayMember, defineField, defineType } from "sanity";
import { blocksField } from "./blocks";
import { hexField, imageField } from "./fields";

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case study",
  type: "document",
  icon: CaseIcon,
  groups: [
    { name: "skim", title: "Skim layer", default: true },
    { name: "story", title: "Story" },
    { name: "table", title: "Light table" },
    { name: "media", title: "Cover" },
    { name: "seo", title: "Sharing" },
  ],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", group: "skim", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      group: "skim",
      options: { source: "title", maxLength: 64 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "connection",
      title: "The Connection, in one sentence",
      type: "text",
      rows: 2,
      group: "skim",
      description: "The first thing a skimmer reads. It also appears on the work index.",
      validation: (r) => r.required().max(220),
    }),
    defineField({ name: "client", title: "Client", type: "string", group: "skim" }),
    defineField({ name: "year", title: "Year", type: "number", group: "skim", validation: (r) => r.integer().min(2000).max(2100) }),
    defineField({ name: "sector", title: "Sector", type: "string", group: "skim", description: "What the client does, plainly." }),
    defineField({ name: "role", title: "My role", type: "string", group: "skim" }),
    defineField({
      name: "deliverables",
      title: "Deliverables",
      type: "array",
      group: "skim",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "mood",
      title: "Mood",
      type: "string",
      group: "skim",
      description: "Optional one-line mood instead of a dry label.",
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "object",
      group: "skim",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "studio", title: "Studio", type: "string", description: "For example, Katër Creative Agency." }),
        defineField({ name: "collaborators", title: "Collaborators", type: "array", of: [defineArrayMember({ type: "string" })] }),
      ],
    }),
    hexField("accent", "Accent colour", "The project's own colour, used sparingly on its page."),
    { ...blocksField, group: "story" },
    imageField("mark", "Mark", {
      group: "table",
      description: "The finished mark. On the light table it sits under the sketch, visible through the paper.",
    }),
    imageField("sketch", "Sketch", {
      group: "table",
      description: "A scan of the rough sketch, on the top tracing sheet. Transparent PNG works best.",
    }),
    imageField("cover", "Cover image", { group: "media" }),
    defineField({ name: "coverVideo", title: "Cover video", type: "mux.video", group: "media" }),
    defineField({
      name: "seo",
      title: "Sharing",
      type: "object",
      group: "seo",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
        imageField("image", "Share image"),
      ],
    }),
  ],
  orderings: [{ title: "Year, newest", name: "yearDesc", by: [{ field: "year", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "connection", media: "mark" } },
});

export const experiment = defineType({
  name: "experiment",
  title: "Experiment",
  type: "document",
  icon: BulbOutlineIcon,
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      options: { source: "title", maxLength: 64 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      initialValue: "personal",
      options: {
        layout: "radio",
        direction: "horizontal",
        list: [
          { title: "Personal experiment", value: "personal" },
          { title: "Self-initiated", value: "self-initiated" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "question",
      title: "The question",
      type: "string",
      description: "Experiments begin with a question. What was it?",
    }),
    defineField({ name: "year", title: "Year", type: "number" }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: ["Motion", "Generative", "Code", "AI", "Typography", "Procedural", "Visual test"],
      },
    }),
    imageField("cover", "Cover image"),
    defineField({ name: "coverVideo", title: "Cover video", type: "mux.video" }),
    blocksField,
  ],
  preview: { select: { title: "title", subtitle: "question", media: "cover" } },
});
