import { defineArrayMember, defineField } from "sanity";
import { sections } from "../../lib/site";

export const hexPattern = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

type FieldExtras = { group?: string; description?: string };

/** An image with alt text. SVG uploads keep their vector quality on the Sanity CDN. */
export function imageField(name: string, title: string, extra: FieldExtras = {}) {
  return defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Alt text",
        type: "string",
        description: "What someone who can't see the image needs to know.",
      }),
    ],
    ...extra,
  });
}

export function hexField(name: string, title: string, description?: string) {
  return defineField({
    name,
    title,
    type: "string",
    description: description ?? "Hex, like #1E2A38",
    validation: (rule) => rule.regex(hexPattern, { name: "hex colour" }),
  });
}

export const layoutField = defineField({
  name: "layout",
  title: "Layout",
  type: "string",
  initialValue: "wide",
  options: {
    layout: "radio",
    direction: "horizontal",
    list: [
      { title: "Full bleed", value: "full" },
      { title: "Wide", value: "wide" },
      { title: "Inset", value: "inset" },
      { title: "Left", value: "left" },
      { title: "Right", value: "right" },
    ],
  },
});

export const storyStepField = defineField({
  name: "step",
  title: "Story step",
  type: "string",
  description: "Optional. Labels this moment in the story. Skip any step the project doesn't need.",
  options: {
    list: [
      { title: "Context", value: "context" },
      { title: "Problem", value: "problem" },
      { title: "The obvious answer", value: "obvious" },
      { title: "What I noticed", value: "noticed" },
      { title: "The Connection", value: "connection" },
      { title: "Identity development", value: "development" },
      { title: "System", value: "system" },
      { title: "Applications", value: "applications" },
      { title: "Final result", value: "result" },
    ],
  },
});

export const sectionField = defineField({
  name: "section",
  title: "Opens",
  type: "string",
  options: {
    list: Object.entries(sections).map(([value, { title }]) => ({ title, value })),
  },
  validation: (rule) => rule.required(),
});

export const richText = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "array",
    of: [
      defineArrayMember({
        type: "block",
        styles: [
          { title: "Normal", value: "normal" },
          { title: "Large", value: "lead" },
          { title: "Quote", value: "blockquote" },
        ],
        lists: [{ title: "Bullet", value: "bullet" }],
        marks: {
          decorators: [
            { title: "Emphasis", value: "em" },
            { title: "Strong", value: "strong" },
          ],
          annotations: [
            defineArrayMember({
              name: "link",
              type: "object",
              title: "Link",
              fields: [defineField({ name: "href", type: "url", title: "URL", validation: (r) => r.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }) })],
            }),
          ],
        },
      }),
    ],
  });
