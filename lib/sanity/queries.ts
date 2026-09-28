import { defineQuery } from "next-sanity";

const IMG = `{ "url": asset->url, "alt": coalesce(alt, ""), "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, "lqip": asset->metadata.lqip }`;
const VIDEO = `{ "playbackId": asset->playbackId, "aspectRatio": asset->data.aspect_ratio }`;
const FILE = `{ "url": asset->url }`;

const BLOCKS = `"blocks": coalesce(blocks[]{
  ...,
  _type == "imageBlock" => { "image": image${IMG} },
  _type == "imagePair" => { "left": left${IMG}, "right": right${IMG} },
  _type == "gallery" => { "images": images[]${IMG} },
  _type == "videoBlock" => { "video": video${VIDEO} },
  _type == "lottieBlock" => { "lottie": lottie${FILE} },
  _type == "connectionBlock" => { "mark": mark${IMG}, "firstRead": firstRead${IMG}, "secondRead": secondRead${IMG} },
  _type == "beforeAfter" => { "before": before${IMG}, "after": after${IMG} },
  _type == "typeBlock" => { "image": image${IMG} },
  _type == "applicationsBlock" => { "items": items[]{ _key, label, "image": image${IMG} } },
  _type == "stepsBlock" => { "steps": steps[]{ _key, label, text, color, "image": image${IMG} } }
}, [])`;

const CASE_SUMMARY = `_id, title, "slug": slug.current, client, year, sector, connection, mood, accent,
  "cover": cover${IMG}, "coverVideo": coverVideo${VIDEO}, "mark": mark${IMG}, "sketch": sketch${IMG}`;

const EXPERIMENT_SUMMARY = `_id, title, "slug": slug.current, label, question, year, tags,
  "cover": cover${IMG}, "coverVideo": coverVideo${VIDEO}`;

export const settingsQuery = defineQuery(`*[_id == "settings"][0]{
  email, availability, "socials": coalesce(socials, []), "wordmark": wordmark${IMG},
  workIntro, experimentsIntro, contactIntro
}`);

export const lightTableQuery = defineQuery(`*[_id == "lightTable"][0]{ slots, "tracks": coalesce(tracks, []) }`);

export const workIndexQuery = defineQuery(`{
  "featured": coalesce(*[_id == "settings"][0].featured[]->{ ${CASE_SUMMARY} }, []),
  "all": *[_type == "caseStudy" && defined(slug.current)] | order(year desc, title asc) { ${CASE_SUMMARY} }
}`);

export const caseStudyQuery = defineQuery(`*[_type == "caseStudy" && slug.current == $slug][0]{
  ${CASE_SUMMARY}, role, deliverables, credits, ${BLOCKS},
  seo{ title, description, "image": image${IMG} }
}`);

export const caseStudySlugsQuery = defineQuery(
  `*[_type == "caseStudy" && defined(slug.current)].slug.current`,
);

export const experimentsQuery = defineQuery(
  `*[_type == "experiment" && defined(slug.current)] | order(year desc, _createdAt desc) { ${EXPERIMENT_SUMMARY} }`,
);

export const experimentQuery = defineQuery(`*[_type == "experiment" && slug.current == $slug][0]{
  ${EXPERIMENT_SUMMARY}, ${BLOCKS}
}`);

export const experimentSlugsQuery = defineQuery(
  `*[_type == "experiment" && defined(slug.current)].slug.current`,
);

export const aboutQuery = defineQuery(`*[_id == "about"][0]{ headline, body, location }`);

export const motionPageQuery = defineQuery(`*[_id == "motionPage"][0]{
  intro,
  "pieces": coalesce(pieces[]{ _key, title, year, client, note, aspect,
    "video": video${VIDEO}, "lottie": lottie${FILE}, "poster": poster${IMG} }, [])
}`);

export const logosPageQuery = defineQuery(`*[_id == "logosPage"][0]{
  intro,
  "logos": coalesce(logos[]{ _key, name, year, note, background, "mark": mark${IMG},
    "caseStudySlug": caseStudy->slug.current }, [])
}`);

export const funPageQuery = defineQuery(`*[_id == "funPage"][0]{
  intro,
  "items": coalesce(items[]{ ..., _type == "funImage" => { "image": image${IMG} } }, [])
}`);
