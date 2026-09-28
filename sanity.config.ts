"use client";

/** The Studio, mounted at /studio. */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { muxInput } from "sanity-plugin-mux-input";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./lib/sanity/env";
import { schemaTypes, singletonTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

const singletonActions = new Set(["publish", "discardChanges", "restore"]);

export default defineConfig({
  name: "endrit",
  title: "Endrit",
  basePath: "/studio",
  projectId: projectId || "unconfigured",
  dataset,
  plugins: [
    structureTool({ structure }),
    muxInput({ mp4_support: "none", max_resolution_tier: "1080p" }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  schema: {
    types: schemaTypes,
    // Singletons can't be created from the "new document" menu.
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      singletonTypes.has(schemaType) ? actions.filter(({ action }) => action && singletonActions.has(action)) : actions,
  },
});
