/**
 * The case study toolbox. Every block can be added, removed and reordered in Studio,
 * so each project gets its own pacing without new code.
 */
import { defineArrayMember, defineField, defineType } from "sanity";
import { hexField, imageField, layoutField, richText, storyStepField } from "./fields";

const caption = defineField({ name: "caption", title: "Caption", type: "string" });

const textBlock = defineType({
  name: "textBlock",
  title: "Text",
  type: "object",
  fields: [storyStepField, defineField({ name: "heading", title: "Heading", type: "string" }), richText("body", "Body")],
  preview: {
    select: { heading: "heading", step: "step", body: "body" },
    prepare: ({ heading, step, body }) => ({
      title: heading || body?.[0]?.children?.[0]?.text || "Text",
      subtitle: step ? `Text · ${step}` : "Text",
    }),
  },
});

const statementBlock = defineType({
  name: "statementBlock",
  title: "Statement",
  type: "object",
  description: "One large sentence. For the moments the reader should stop.",
  fields: [
    storyStepField,
    defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (r) => r.required() }),
  ],
  preview: { select: { title: "text" }, prepare: ({ title }) => ({ title, subtitle: "Statement" }) },
});

const imageBlock = defineType({
  name: "imageBlock",
  title: "Image",
  type: "object",
  fields: [
    imageField("image", "Image"),
    caption,
    layoutField,
    hexField("background", "Background", "Optional backdrop behind inset images"),
  ],
  preview: {
    select: { media: "image", title: "caption", layout: "layout" },
    prepare: ({ media, title, layout }) => ({ media, title: title || "Image", subtitle: `Image · ${layout ?? "wide"}` }),
  },
});

const imagePair = defineType({
  name: "imagePair",
  title: "Image pair",
  type: "object",
  fields: [imageField("left", "Left"), imageField("right", "Right"), caption],
  preview: {
    select: { media: "left", title: "caption" },
    prepare: ({ media, title }) => ({ media, title: title || "Image pair", subtitle: "Image pair" }),
  },
});

const gallery = defineType({
  name: "gallery",
  title: "Gallery",
  type: "object",
  fields: [
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
        }),
      ],
      options: { layout: "grid" },
    }),
    defineField({
      name: "columns",
      title: "Columns",
      type: "number",
      initialValue: 3,
      options: { list: [2, 3, 4], layout: "radio", direction: "horizontal" },
    }),
    caption,
  ],
  preview: {
    select: { media: "images.0", count: "images.length", title: "caption" },
    prepare: ({ media, title }) => ({ media, title: title || "Gallery", subtitle: "Gallery" }),
  },
});

const videoBlock = defineType({
  name: "videoBlock",
  title: "Video",
  type: "object",
  description: "Hosted on Mux. Plays muted and looping, like a living image.",
  fields: [defineField({ name: "video", title: "Video", type: "mux.video" }), caption, layoutField],
  preview: { select: { title: "caption" }, prepare: ({ title }) => ({ title: title || "Video", subtitle: "Video" }) },
});

const lottieBlock = defineType({
  name: "lottieBlock",
  title: "Lottie",
  type: "object",
  fields: [
    defineField({
      name: "lottie",
      title: "Lottie file",
      type: "file",
      description: ".lottie or .json",
      options: { accept: ".lottie,.json,application/json" },
    }),
    caption,
    layoutField,
    hexField("background", "Background"),
  ],
  preview: { select: { title: "caption" }, prepare: ({ title }) => ({ title: title || "Lottie", subtitle: "Lottie" }) },
});

const pct = (name: string, title: string) =>
  defineField({ name, title, type: "number", validation: (r) => r.min(0).max(100) });

const connectionBlock = defineType({
  name: "connectionBlock",
  title: "The Connection",
  type: "object",
  description: "The moment the hidden idea clicks. Every case study has one.",
  fields: [
    defineField({
      name: "statement",
      title: "Statement",
      type: "text",
      rows: 2,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "variant",
      title: "Reveal",
      type: "string",
      initialValue: "statement",
      options: {
        layout: "radio",
        list: [
          { title: "Statement: the sentence and the mark", value: "statement" },
          { title: "Line: draw a line through the mark", value: "line" },
          { title: "Overlay: first read, then second read", value: "overlay" },
        ],
      },
    }),
    imageField("mark", "Mark", { description: "Upload the SVG. The reveal is drawn over it." }),
    defineField({
      name: "line",
      title: "Line",
      type: "object",
      description: "Where the line runs, in percent of the mark's width and height. 0,0 is top left.",
      hidden: ({ parent }) => parent?.variant !== "line",
      fields: [pct("x1", "Start x"), pct("y1", "Start y"), pct("x2", "End x"), pct("y2", "End y")],
      options: { columns: 4 },
    }),
    defineField({
      ...imageField("firstRead", "First read"),
      hidden: ({ parent }) => parent?.variant !== "overlay",
    }),
    defineField({
      ...imageField("secondRead", "Second read"),
      hidden: ({ parent }) => parent?.variant !== "overlay",
    }),
    defineField({ name: "note", title: "Note", type: "string", description: "Optional margin note." }),
  ],
  preview: {
    select: { title: "statement", media: "mark", variant: "variant" },
    prepare: ({ title, media, variant }) => ({ title, media, subtitle: `The Connection · ${variant ?? "statement"}` }),
  },
});

const beforeAfter = defineType({
  name: "beforeAfter",
  title: "Before / after",
  type: "object",
  fields: [
    imageField("before", "Before"),
    imageField("after", "After"),
    defineField({ name: "beforeLabel", title: "Before label", type: "string", initialValue: "Before" }),
    defineField({ name: "afterLabel", title: "After label", type: "string", initialValue: "After" }),
    caption,
  ],
  preview: {
    select: { media: "after", title: "caption" },
    prepare: ({ media, title }) => ({ media, title: title || "Before / after", subtitle: "Before / after" }),
  },
});

const paletteBlock = defineType({
  name: "paletteBlock",
  title: "Palette",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      name: "colors",
      title: "Colours",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "swatch",
          fields: [
            defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
            hexField("hex", "Hex"),
            defineField({ name: "note", title: "Note", type: "string" }),
          ],
          preview: { select: { title: "name", subtitle: "hex" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Palette", subtitle: "Palette" }) },
});

const typeBlock = defineType({
  name: "typeBlock",
  title: "Typeface",
  type: "object",
  fields: [
    defineField({ name: "typeface", title: "Typeface", type: "string", validation: (r) => r.required() }),
    defineField({ name: "sample", title: "Sample", type: "string" }),
    defineField({ name: "note", title: "Note", type: "text", rows: 2 }),
    imageField("image", "Specimen image", { description: "Optional. Use it when the face isn't a web font." }),
  ],
  preview: { select: { title: "typeface" }, prepare: ({ title }) => ({ title, subtitle: "Typeface" }) },
});

const quoteBlock = defineType({
  name: "quoteBlock",
  title: "Quote",
  type: "object",
  fields: [
    defineField({ name: "quote", title: "Quote", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "attribution", title: "Attribution", type: "string" }),
  ],
  preview: { select: { title: "quote", subtitle: "attribution" } },
});

const applicationsBlock = defineType({
  name: "applicationsBlock",
  title: "Applications",
  type: "object",
  description: "The system across many uses. Signage, vehicles, print, screens.",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "application",
          fields: [imageField("image", "Image"), defineField({ name: "label", title: "Label", type: "string" })],
          preview: { select: { title: "label", media: "image" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "heading", media: "items.0.image" },
    prepare: ({ title, media }) => ({ title: title || "Applications", media, subtitle: "Applications" }),
  },
});

const stepsBlock = defineType({
  name: "stepsBlock",
  title: "Steps",
  type: "object",
  description: "A short sequence, like Choose, Scan, Online.",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      name: "steps",
      title: "Steps",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "step",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", title: "Text", type: "string" }),
            hexField("color", "Colour"),
            imageField("image", "Image"),
          ],
          preview: { select: { title: "label", subtitle: "text", media: "image" } },
        }),
      ],
      validation: (r) => r.min(1),
    }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Steps", subtitle: "Steps" }) },
});

const spacerBlock = defineType({
  name: "spacerBlock",
  title: "Pause",
  type: "object",
  description: "Empty space, for pacing.",
  fields: [
    defineField({
      name: "size",
      title: "Size",
      type: "string",
      initialValue: "m",
      options: {
        layout: "radio",
        direction: "horizontal",
        list: [
          { title: "Small", value: "s" },
          { title: "Medium", value: "m" },
          { title: "Large", value: "l" },
        ],
      },
    }),
  ],
  preview: { select: { size: "size" }, prepare: ({ size }) => ({ title: `Pause · ${size ?? "m"}` }) },
});

export const blockTypes = [
  textBlock,
  statementBlock,
  imageBlock,
  imagePair,
  gallery,
  videoBlock,
  lottieBlock,
  connectionBlock,
  beforeAfter,
  paletteBlock,
  typeBlock,
  quoteBlock,
  applicationsBlock,
  stepsBlock,
  spacerBlock,
];

export const blocksField = defineField({
  name: "blocks",
  title: "Story",
  type: "array",
  of: blockTypes.map((b) => defineArrayMember({ type: b.name })),
});
