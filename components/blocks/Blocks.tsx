import { PortableText, type PortableTextComponents } from "next-sanity";
import type { CSSProperties } from "react";
import {
  storyStepLabels,
  type Block,
  type ConnectionBlock,
  type ImageRef,
  type MediaLayout,
  type PortableTextBlock,
  type StoryStep,
} from "@/lib/content";
import { Img } from "@/components/media/Img";
import { Lottie } from "@/components/media/Lottie";
import { MuxVideo } from "@/components/media/MuxVideo";
import { ConnectionLine, OverlayReveal } from "./ConnectionReveal";
import s from "./blocks.module.css";

const layoutClass: Record<MediaLayout, string> = {
  full: s.full,
  wide: s.wide,
  inset: s.inset,
  left: s.left,
  right: s.right,
};

const textComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    lead: ({ children }) => <p className={s.lead}>{children}</p>,
    blockquote: ({ children }) => <blockquote className={s.inlineQuote}>{children}</blockquote>,
  },
  marks: {
    link: ({ value, children }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const external = /^https?:/.test(href);
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
          {children}
        </a>
      );
    },
  },
};

export function RichText({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className={s.prose}>
      <PortableText value={value} components={textComponents} />
    </div>
  );
}

function Step({ step }: { step?: StoryStep }) {
  if (!step) return null;
  return <p className={`eyebrow ${step === "connection" ? s.blueLabel : ""}`}>{storyStepLabels[step]}</p>;
}

function Caption({ text }: { text?: string }) {
  return text ? <figcaption className={s.caption}>{text}</figcaption> : null;
}

function Picture({ image, sizes }: { image?: ImageRef | null; sizes?: string }) {
  return image ? <Img image={image} sizes={sizes} className={s.media} /> : null;
}

function Connection({ block }: { block: ConnectionBlock }) {
  const variant = block.variant ?? "statement";
  return (
    <section className={`${s.wide} ${s.connection}`} aria-label="The Connection">
      <p className={`eyebrow ${s.blueLabel}`}>The Connection</p>
      {variant === "line" && block.mark && <ConnectionLine mark={block.mark} line={block.line} />}
      {variant === "overlay" && block.firstRead && block.secondRead && (
        <OverlayReveal first={block.firstRead} second={block.secondRead} />
      )}
      {variant === "statement" && block.mark && (
        <div className={s.connectionMark}>
          <Img image={block.mark} sizes="(min-width: 900px) 640px, 90vw" />
        </div>
      )}
      <p className={s.connectionStatement}>{block.statement}</p>
      {block.note && <p className={s.connectionNote}>{block.note}</p>}
    </section>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block._type) {
    case "textBlock":
      return (
        <section className={`${s.inset} ${s.text}`}>
          <Step step={block.step} />
          {block.heading && <h2 className={s.heading}>{block.heading}</h2>}
          {block.body?.length > 0 && <RichText value={block.body} />}
        </section>
      );
    case "statementBlock":
      return (
        <section className={`${s.wide} ${s.statementWrap}`}>
          <Step step={block.step} />
          <p className={s.statement}>{block.text}</p>
        </section>
      );
    case "imageBlock": {
      if (!block.image) return null;
      const layout = block.layout ?? "wide";
      const style = block.background ? ({ background: block.background } as CSSProperties) : undefined;
      return (
        <figure className={`${layoutClass[layout]} ${block.background ? s.onColour : ""}`} style={style}>
          <Picture image={block.image} sizes={layout === "full" ? "100vw" : "(min-width: 1200px) 1200px, 100vw"} />
          <Caption text={block.caption} />
        </figure>
      );
    }
    case "imagePair":
      return (
        <figure className={s.wide}>
          <div className={s.pair}>
            <Picture image={block.left} sizes="(min-width: 900px) 50vw, 100vw" />
            <Picture image={block.right} sizes="(min-width: 900px) 50vw, 100vw" />
          </div>
          <Caption text={block.caption} />
        </figure>
      );
    case "gallery":
      return (
        <figure className={s.wide}>
          <div className={s.gallery} style={{ ["--cols" as string]: block.columns ?? 3 }}>
            {(block.images ?? []).map((image, i) => (
              <Picture key={i} image={image} sizes="(min-width: 900px) 33vw, 50vw" />
            ))}
          </div>
          <Caption text={block.caption} />
        </figure>
      );
    case "videoBlock":
      if (!block.video?.playbackId) return null;
      return (
        <figure className={layoutClass[block.layout ?? "wide"]}>
          <MuxVideo video={block.video} title={block.caption} className={s.media} />
          <Caption text={block.caption} />
        </figure>
      );
    case "lottieBlock":
      if (!block.lottie?.url) return null;
      return (
        <figure
          className={`${layoutClass[block.layout ?? "wide"]} ${block.background ? s.onColour : ""}`}
          style={block.background ? { background: block.background } : undefined}
        >
          <Lottie src={block.lottie.url} className={s.media} />
          <Caption text={block.caption} />
        </figure>
      );
    case "connectionBlock":
      return <Connection block={block} />;
    case "beforeAfter":
      return (
        <figure className={s.wide}>
          <div className={s.pair}>
            <div className={s.labelled}>
              <p className="eyebrow">{block.beforeLabel || "Before"}</p>
              <Picture image={block.before} sizes="(min-width: 900px) 50vw, 100vw" />
            </div>
            <div className={s.labelled}>
              <p className="eyebrow">{block.afterLabel || "After"}</p>
              <Picture image={block.after} sizes="(min-width: 900px) 50vw, 100vw" />
            </div>
          </div>
          <Caption text={block.caption} />
        </figure>
      );
    case "paletteBlock":
      return (
        <section className={s.wide}>
          {block.heading && <h2 className={s.heading}>{block.heading}</h2>}
          <ul className={s.palette}>
            {(block.colors ?? []).map((c, i) => (
              <li key={i} className={s.swatch}>
                <span className={s.chip} style={c.hex ? { background: c.hex } : undefined} data-empty={!c.hex} />
                <span className={s.swatchName}>{c.name}</span>
                {c.hex && <span className={s.swatchHex}>{c.hex.toUpperCase()}</span>}
                {c.note && <span className={s.swatchNote}>{c.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      );
    case "typeBlock":
      return (
        <section className={`${s.wide} ${s.type}`}>
          <p className="eyebrow">Typeface</p>
          <p className={s.typeName}>{block.typeface}</p>
          {block.image ? (
            <Picture image={block.image} />
          ) : (
            block.sample && <p className={s.typeSample}>{block.sample}</p>
          )}
          {block.note && <p className={s.typeNote}>{block.note}</p>}
        </section>
      );
    case "quoteBlock":
      return (
        <figure className={`${s.inset} ${s.quote}`}>
          <blockquote>{block.quote}</blockquote>
          {block.attribution && <figcaption className={s.caption}>{block.attribution}</figcaption>}
        </figure>
      );
    case "applicationsBlock":
      return (
        <section className={s.wide}>
          {block.heading && <h2 className={s.heading}>{block.heading}</h2>}
          <ul className={s.applications}>
            {(block.items ?? []).map((item) => (
              <li key={item._key}>
                <Picture image={item.image} sizes="(min-width: 900px) 33vw, 100vw" />
                {item.label && <p className={s.caption}>{item.label}</p>}
              </li>
            ))}
          </ul>
        </section>
      );
    case "stepsBlock":
      return (
        <section className={s.wide}>
          {block.heading && <h2 className={s.heading}>{block.heading}</h2>}
          <ol className={s.steps} style={{ ["--n" as string]: block.steps?.length ?? 1 }}>
            {(block.steps ?? []).map((step, i) => (
              <li key={step._key} className={s.stepItem}>
                <span className={s.stepNumber}>{String(i + 1).padStart(2, "0")}</span>
                {step.color && <span className={s.stepColour} style={{ background: step.color }} />}
                <span className={s.stepLabel}>{step.label}</span>
                {step.text && <span className={s.stepText}>{step.text}</span>}
                {step.image && <Picture image={step.image} sizes="(min-width: 900px) 25vw, 100vw" />}
              </li>
            ))}
          </ol>
        </section>
      );
    case "spacerBlock":
      return <div className={s.spacer} data-size={block.size ?? "m"} aria-hidden="true" />;
    default:
      return null;
  }
}

/** Renders a case study or experiment story, in whatever order Studio says. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className={s.blocks}>
      {blocks.map((block) => (
        <BlockView key={block._key} block={block} />
      ))}
    </div>
  );
}
