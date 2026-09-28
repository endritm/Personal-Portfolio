import type { Metadata } from "next";
import { Img } from "@/components/media/Img";
import { Lottie } from "@/components/media/Lottie";
import { MuxVideo } from "@/components/media/MuxVideo";
import { Empty, PageHeader } from "@/components/site/PageHeader";
import { getMotionPage, type MotionPiece } from "@/lib/content";
import s from "./motion.module.css";

export const metadata: Metadata = {
  title: "Motion",
  description: "Short motion pieces. Identities that move.",
};

function Media({ piece }: { piece: MotionPiece }) {
  if (piece.video?.playbackId) return <MuxVideo video={{ ...piece.video, aspectRatio: piece.aspect ?? piece.video.aspectRatio }} title={piece.title} />;
  if (piece.lottie?.url) return <Lottie src={piece.lottie.url} className={s.lottie} />;
  if (piece.poster) return <Img image={piece.poster} sizes="(min-width: 900px) 33vw, 100vw" className={s.poster} />;
  return null;
}

export default async function MotionPage() {
  const page = await getMotionPage();
  return (
    <div className="from-light">
      <PageHeader eyebrow="Motion design" title="Motion" intro={page.intro} />
      {page.pieces.length === 0 ? (
        <Empty>Motion pieces are on their way.</Empty>
      ) : (
        <ul className={`wrap ${s.grid}`}>
          {page.pieces.map((piece) => (
            <li key={piece._key} className={s.piece} data-aspect={piece.aspect ?? "1:1"}>
              <div className={s.frame}>
                <Media piece={piece} />
              </div>
              <p className={s.title}>{piece.title}</p>
              <p className={s.meta}>{[piece.client, piece.year].filter(Boolean).join(" · ")}</p>
              {piece.note && <p className={s.note}>{piece.note}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
