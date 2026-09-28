import { CogIcon } from "@sanity/icons/Cog";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { ImagesIcon } from "@sanity/icons/Images";
import { PlayIcon } from "@sanity/icons/Play";
import { SparklesIcon } from "@sanity/icons/Sparkles";
import { SunIcon } from "@sanity/icons/Sun";
import { defineArrayMember, defineField, defineType } from "sanity";
import { hexField, imageField, richText, sectionField } from "./fields";

export const settings = defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: "availability",
      title: "Availability",
      type: "object",
      description: "Shown in the header, the footer and on the contact page.",
      fields: [
        defineField({ name: "open", title: "Open for projects", type: "boolean", initialValue: true }),
        defineField({ name: "line", title: "Line", type: "string", initialValue: "Open for projects" }),
      ],
    }),
    defineField({
      name: "featured",
      title: "Selected work",
      type: "array",
      description: "Drag to reorder. Everything else appears under All work.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "caseStudy" }] })],
      validation: (r) => r.unique(),
    }),
    defineField({ name: "workIntro", title: "Work intro", type: "string" }),
    defineField({ name: "experimentsIntro", title: "Experiments intro", type: "string" }),
    defineField({ name: "contactIntro", title: "Contact intro", type: "text", rows: 2 }),
    imageField("wordmark", "Wordmark", { description: "Your personal wordmark, when it's ready. SVG." }),
    defineField({
      name: "socials",
      title: "Links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialLink",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "url", title: "URL", type: "url", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "label", subtitle: "url" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Settings" }) },
});

const slot = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    type: "object",
    description,
    options: { columns: 2 },
    fields: [
      sectionField,
      defineField({ name: "label", title: "Tape label", type: "string", validation: (r) => r.required().max(18) }),
      defineField({ name: "note", title: "Note", type: "string", description: "One line, shown on phones." }),
    ],
  });

export const lightTable = defineType({
  name: "lightTable",
  title: "Light table",
  type: "document",
  icon: SunIcon,
  fields: [
    defineField({
      name: "slots",
      title: "Objects",
      type: "object",
      description: "The objects are fixed. Choose what each one opens and what its tape label says.",
      fields: [
        slot("sheets", "Tracing sheets", "The stack of sketches over finished marks."),
        slot("contact", "Contact sheet", "A sheet of test frames."),
        slot("film", "Film strip", "Frames from motion pieces."),
        slot("slides", "Slide page", "Twenty pockets, one mark in each."),
        slot("tape", "Mixtape", "Cassette with a handwritten J-card."),
        slot("loupe", "Loupe", "For looking closer."),
      ],
    }),
    defineField({
      name: "tracks",
      title: "J-card tracks",
      type: "array",
      description: "Written on the mixtape's J-card.",
      of: [defineArrayMember({ type: "string" })],
      validation: (r) => r.max(10),
    }),
  ],
  preview: { prepare: () => ({ title: "Light table" }) },
});

export const about = defineType({
  name: "about",
  title: "About",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: "headline", title: "Headline", type: "string" }),
    richText("body", "Body"),
    defineField({ name: "location", title: "Location line", type: "string" }),
  ],
  preview: { prepare: () => ({ title: "About" }) },
});

export const motionPage = defineType({
  name: "motionPage",
  title: "Motion",
  type: "document",
  icon: PlayIcon,
  fields: [
    defineField({ name: "intro", title: "Intro", type: "string" }),
    defineField({
      name: "pieces",
      title: "Pieces",
      type: "array",
      description: "Drag to reorder.",
      of: [
        defineArrayMember({
          type: "object",
          name: "motionPiece",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "client", title: "Client", type: "string" }),
            defineField({ name: "year", title: "Year", type: "number" }),
            defineField({ name: "note", title: "Note", type: "string" }),
            defineField({
              name: "aspect",
              title: "Shape",
              type: "string",
              initialValue: "1:1",
              options: { list: ["1:1", "4:5", "16:9", "9:16"], layout: "radio", direction: "horizontal" },
            }),
            defineField({ name: "video", title: "Video (Mux)", type: "mux.video" }),
            defineField({
              name: "lottie",
              title: "Or a Lottie file",
              type: "file",
              options: { accept: ".lottie,.json,application/json" },
            }),
            imageField("poster", "Poster frame"),
          ],
          preview: { select: { title: "title", subtitle: "client", media: "poster" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Motion" }) },
});

export const logosPage = defineType({
  name: "logosPage",
  title: "Logos",
  type: "document",
  icon: ImagesIcon,
  fields: [
    defineField({ name: "intro", title: "Intro", type: "string" }),
    defineField({
      name: "logos",
      title: "Marks",
      type: "array",
      description: "Drag to reorder. The slide page on the table holds twenty.",
      of: [
        defineArrayMember({
          type: "object",
          name: "logo",
          fields: [
            defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
            imageField("mark", "Mark"),
            defineField({ name: "year", title: "Year", type: "number" }),
            defineField({ name: "note", title: "Note", type: "string" }),
            hexField("background", "Slide colour"),
            defineField({
              name: "caseStudy",
              title: "Case study",
              type: "reference",
              to: [{ type: "caseStudy" }],
            }),
          ],
          preview: { select: { title: "name", subtitle: "note", media: "mark" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Logos" }) },
});

export const funPage = defineType({
  name: "funPage",
  title: "Fun",
  type: "document",
  icon: SparklesIcon,
  fields: [
    defineField({ name: "intro", title: "Intro", type: "string" }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "funImage",
          title: "Image",
          fields: [imageField("image", "Image"), defineField({ name: "caption", title: "Caption", type: "string" })],
          preview: { select: { title: "caption", media: "image" } },
        }),
        defineArrayMember({
          type: "object",
          name: "funTrack",
          title: "Track",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "artist", title: "Artist", type: "string" }),
            defineField({ name: "url", title: "Link", type: "url" }),
            defineField({ name: "note", title: "Note", type: "string" }),
          ],
          preview: { select: { title: "title", subtitle: "artist" } },
        }),
        defineArrayMember({
          type: "object",
          name: "funNote",
          title: "Note",
          fields: [defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (r) => r.required() })],
          preview: { select: { title: "text" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Fun" }) },
});
