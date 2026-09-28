import { faceToSvg, type Face } from "@/lib/table/draw";

/** A table face as inline SVG. Inline, so it can use the page's fonts. */
export function FaceSvg({ face, id, className }: { face: Face; id: string; className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${face.w} ${face.h}`}
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: faceToSvg(face, id) }}
    />
  );
}
