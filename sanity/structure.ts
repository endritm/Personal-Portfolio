import type { StructureResolver } from "sanity/structure";
import { singletons } from "./schemaTypes";

export const structure: StructureResolver = (S) => {
  const singleton = (type: string, title: string) =>
    S.listItem().title(title).id(type).schemaType(type).child(S.document().schemaType(type).documentId(type).title(title));

  const [table, ...pages] = singletons.filter((s) => s.type !== "settings");

  return S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("caseStudy").title("Case studies"),
      S.documentTypeListItem("experiment").title("Experiments"),
      S.divider(),
      singleton(table.type, table.title),
      ...pages.map((p) => singleton(p.type, p.title)),
      S.divider(),
      singleton("settings", "Settings"),
    ]);
};
