"use client";

/**
 * The light table in 3D. Loaded only on capable desktops, after first paint.
 *
 * At rest the camera looks straight down, so the scene lines up with the flat table it
 * fades in over. Moving the pointer tilts the camera a couple of degrees and the objects
 * show their height. Everything is a textured plane; frames render only while something moves.
 */
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { MathUtils, type Group, type Mesh, type MeshBasicMaterial, type Texture } from "three";
import { fontFamilies } from "@/app/fonts";
import { tableObjectIds, type TableObjectId } from "@/lib/content/types";
import type { Face } from "@/lib/table/draw";
import {
  buildFaces,
  GLASS_H,
  GLASS_W,
  hoverGlowFace,
  REEL,
  reelCentres,
  sheetStack,
  type TableContent,
} from "@/lib/table/faces";
import { pencil, placements, TABLE_H, TABLE_W, tapeSize, toWorld } from "@/lib/table/layout";
import { facesToTextures } from "./textures";

const FOV = 22;
/** The canvas is 10% larger than the table on each axis (see .canvas in the CSS). */
const OVERSCAN = 1.1;
const DISTANCE = (TABLE_H * OVERSCAN) / 2 / Math.tan(MathUtils.degToRad(FOV / 2));
const TILT = 0.035;
const rad = (deg: number) => MathUtils.degToRad(deg);

export type SceneProps = {
  content: TableContent;
  /** The object whose link has keyboard focus. Treated like a hover. */
  focused: TableObjectId | null;
  onReady: () => void;
  onLost: () => void;
  onHoverChange: (id: TableObjectId | null) => void;
  onOpen: (id: TableObjectId, newTab: boolean) => void;
};

type TextureKey =
  | "frame"
  | "glass"
  | "pencil"
  | "glow"
  | "spareA"
  | "spareB"
  | "mark"
  | "sketch"
  | "contact"
  | "loupe"
  | "slides"
  | "film"
  | "tape"
  | "reel"
  | `label-${TableObjectId}`;

function Plane({
  map,
  w,
  h,
  order,
  position = [0, 0, 0],
  rotation = 0,
  materialRef,
  meshRef,
}: {
  map: Texture;
  w: number;
  h: number;
  order: number;
  position?: [number, number, number];
  rotation?: number;
  materialRef?: React.Ref<MeshBasicMaterial>;
  meshRef?: React.Ref<Mesh>;
}) {
  return (
    <mesh ref={meshRef} position={position} rotation={[0, 0, rotation]} renderOrder={order}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial ref={materialRef} map={map} transparent depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function Table({ content, focused, onReady, onHoverChange, onOpen }: Omit<SceneProps, "onLost">) {
  const { gl, camera, invalidate, size, viewport } = useThree();
  // Device pixels per table unit, in quarter steps so small resizes don't rebuild textures.
  const pxPerUnit = Math.round(MathUtils.clamp((size.width / (TABLE_W * OVERSCAN)) * viewport.dpr, 0.5, 2.5) * 4) / 4;
  const [textures, setTextures] = useState<Record<TextureKey, Texture> | null>(null);
  const [hovered, setHovered] = useState<TableObjectId | null>(null);

  const faces = useMemo(() => {
    const f = buildFaces(content);
    const all: Record<string, Face> = {
      frame: f.frame,
      glass: f.glass,
      pencil: f.pencil,
      glow: hoverGlowFace(),
      ...f.sheets,
      contact: f.contact,
      loupe: f.loupe,
      slides: f.slides,
      film: f.film,
      tape: f.tape,
      reel: f.reel,
    };
    for (const id of tableObjectIds) all[`label-${id}`] = f.labels[id];
    return all as Record<TextureKey, Face>;
  }, [content]);

  useEffect(() => {
    let cancelled = false;
    let made: Record<TextureKey, Texture> | null = null;
    facesToTextures(faces, fontFamilies, pxPerUnit, gl.capabilities.maxTextureSize).then((t) => {
      if (cancelled) return Object.values<Texture>(t).forEach((x) => x.dispose());
      made = t;
      setTextures(t);
    });
    return () => {
      cancelled = true;
      if (made) Object.values<Texture>(made).forEach((x) => x.dispose());
    };
  }, [faces, gl, pxPerUnit]);

  // Tell the page once the first frame with textures is on screen.
  useEffect(() => {
    if (!textures) return;
    invalidate();
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(onReady);
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [textures, invalidate, onReady]);

  // Pointer position drives a small camera tilt.
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const el = gl.domElement;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.current = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -(((e.clientY - r.top) / r.height) * 2 - 1) };
      invalidate();
    };
    const leave = () => {
      pointer.current = { x: 0, y: 0 };
      invalidate();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [gl, invalidate]);

  const active = hovered ?? focused;
  useEffect(() => {
    onHoverChange(hovered);
  }, [hovered, onHoverChange]);
  useEffect(() => {
    invalidate();
  }, [active, invalidate]);

  // Animated state lives in refs, so frames don't re-render React.
  const amount = useRef<Record<TableObjectId, number>>({ sheets: 0, contact: 0, loupe: 0, slides: 0, film: 0, tape: 0 });
  const groups = useRef<Partial<Record<TableObjectId, Group | null>>>({});
  const labels = useRef<Partial<Record<TableObjectId, Mesh | null>>>({});
  const sketch = useRef<Mesh>(null);
  const filmLayer = useRef<Mesh>(null);
  const slidesMaterial = useRef<MeshBasicMaterial>(null);
  const reels = useRef<(Mesh | null)[]>([]);
  const glow = useRef<Mesh>(null);
  const glowMaterial = useRef<MeshBasicMaterial>(null);
  const tilt = useRef({ x: 0, y: 0 });
  const opening = useRef<{ id: TableObjectId; t: number; newTab: boolean; done: boolean } | null>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    let moving = false;
    const settle = (current: number, target: number, lambda: number) => {
      const next = MathUtils.damp(current, target, lambda, dt);
      if (Math.abs(next - target) > 0.001) moving = true;
      return Math.abs(next - target) > 0.001 ? next : target;
    };

    const open = opening.current;
    for (const id of tableObjectIds) {
      const target = id === active || open?.id === id ? 1 : 0;
      const a = (amount.current[id] = settle(amount.current[id], target, 9));
      const g = groups.current[id];
      if (!g) continue;
      const p = placements[id];
      g.position.z = p.z + a * 18;
      const s = 1 + a * (id === "loupe" ? 0.07 : id === "contact" || id === "slides" ? 0.015 : 0.008);
      g.scale.set(s, s, 1);
      const label = labels.current[id];
      if (label) label.position.z = 6 + a * 4;
    }

    // Sheets: the sketch comes into register with the mark.
    if (sketch.current) {
      const k = 1 - amount.current.sheets;
      sketch.current.position.x = sheetStack.sketch.dx * k;
      sketch.current.position.y = -sheetStack.sketch.dy * k;
      sketch.current.rotation.z = -rad(sheetStack.sketch.rot) * k;
    }
    if (filmLayer.current) filmLayer.current.position.x = amount.current.film * 18;
    if (slidesMaterial.current) slidesMaterial.current.color.setScalar(1 + amount.current.slides * 0.25);
    if (amount.current.tape > 0.01) {
      for (const r of reels.current) if (r) r.rotation.z += dt * 3.2 * amount.current.tape;
      moving = true;
    }

    // The patch of glass under the active object.
    const lit = open?.id ?? active;
    if (glow.current && glowMaterial.current) {
      if (lit) {
        const p = placements[lit];
        const [wx, wy] = toWorld(p.cx, p.cy);
        glow.current.position.x = settle(glow.current.position.x, wx, 12);
        glow.current.position.y = settle(glow.current.position.y, wy, 12);
        const size = Math.max(p.w, p.h) * (open ? 3.2 : 1.7);
        glow.current.scale.x = glow.current.scale.y = settle(glow.current.scale.x, size, open ? 4 : 12);
      }
      glowMaterial.current.opacity = settle(glowMaterial.current.opacity, lit ? 1 : 0, 8);
    }

    // Camera: a slight tilt toward the pointer, or a push toward the object being opened.
    const cam = state.camera;
    if (open) {
      open.t = Math.min(1, open.t + dt / 0.55);
      const e = MathUtils.smootherstep(open.t, 0, 1);
      const p = placements[open.id];
      const [wx, wy] = toWorld(p.cx, p.cy);
      cam.position.set(
        MathUtils.lerp(cam.position.x, wx * 0.6, e * 0.35),
        MathUtils.lerp(cam.position.y, wy * 0.6, e * 0.35),
        MathUtils.lerp(DISTANCE, DISTANCE * 0.62, e),
      );
      cam.lookAt(wx * e * 0.6, wy * e * 0.6, 0);
      moving = true;
      if (open.t >= 1 && !open.done) {
        open.done = true;
        onOpen(open.id, open.newTab);
      }
    } else {
      tilt.current.x = settle(tilt.current.x, pointer.current.x, 4);
      tilt.current.y = settle(tilt.current.y, pointer.current.y, 4);
      cam.position.set(tilt.current.x * DISTANCE * TILT, tilt.current.y * DISTANCE * TILT, DISTANCE);
      cam.lookAt(0, 0, 0);
    }

    if (moving) state.invalidate();
  });

  useEffect(() => {
    camera.position.set(0, 0, DISTANCE);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  if (!textures) return null;

  const over = (id: TableObjectId) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(id);
  };
  const out = (id: TableObjectId) => () => setHovered((h) => (h === id ? null : h));
  const click = (id: TableObjectId) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const newTab = e.nativeEvent.metaKey || e.nativeEvent.ctrlKey || e.nativeEvent.shiftKey || e.nativeEvent.button === 1;
    if (newTab) return onOpen(id, true);
    if (!opening.current) opening.current = { id, t: 0, newTab: false, done: false };
    invalidate();
  };

  const order: Record<TableObjectId, number> = { sheets: 10, contact: 20, film: 30, slides: 40, tape: 50, loupe: 60 };

  return (
    <group>
      <Plane map={textures.frame} w={TABLE_W} h={TABLE_H} order={0} position={[0, 0, -2]} />
      <Plane map={textures.glass} w={GLASS_W} h={GLASS_H} order={1} />
      <mesh ref={glow} renderOrder={3} position={[0, 0, 0.5]} scale={[1, 1, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={glowMaterial} map={textures.glow} transparent opacity={0} depthTest={false} depthWrite={false} toneMapped={false} />
      </mesh>
      <group position={[...toWorld(pencil.cx, pencil.cy), 3]} rotation={[0, 0, -rad(pencil.rot)]}>
        <Plane map={textures.pencil} w={pencil.w} h={pencil.h} order={4} />
      </group>

      {tableObjectIds.map((id) => {
        const p = placements[id];
        const base = order[id];
        const labelFace = faces[`label-${id}`];
        const labelPos: [number, number, number] = [
          p.tape.x + labelFace.w / 2 - p.w / 2,
          -(p.tape.y + tapeSize.h / 2 - p.h / 2),
          6,
        ];
        return (
          <group
            key={id}
            ref={(g) => {
              groups.current[id] = g;
            }}
            position={[...toWorld(p.cx, p.cy), p.z]}
            rotation={[0, 0, -rad(p.rot)]}
          >
            {id === "sheets" &&
              (["spareA", "spareB", "mark", "sketch"] as const).map((k, i) => (
                <Plane
                  key={k}
                  map={textures[k]}
                  w={p.w}
                  h={p.h}
                  order={base + i}
                  position={[sheetStack[k].dx, -sheetStack[k].dy, i * 0.5]}
                  rotation={-rad(sheetStack[k].rot)}
                  meshRef={k === "sketch" ? sketch : undefined}
                />
              ))}
            {id === "contact" && <Plane map={textures.contact} w={p.w} h={p.h} order={base} />}
            {id === "loupe" && <Plane map={textures.loupe} w={p.w} h={p.h} order={base} />}
            {id === "slides" && <Plane map={textures.slides} w={p.w} h={p.h} order={base} materialRef={slidesMaterial} />}
            {id === "film" && <Plane map={textures.film} w={p.w} h={p.h} order={base} meshRef={filmLayer} />}
            {id === "tape" && (
              <>
                <Plane map={textures.tape} w={p.w} h={p.h} order={base} />
                {reelCentres.map((c, i) => (
                  <Plane
                    key={i}
                    map={textures.reel}
                    w={REEL}
                    h={REEL}
                    order={base + 1}
                    position={[c.x - p.w / 2, -(c.y - p.h / 2), 1]}
                    meshRef={(m) => {
                      reels.current[i] = m;
                    }}
                  />
                ))}
              </>
            )}
            <Plane
              map={textures[`label-${id}`]}
              w={labelFace.w}
              h={labelFace.h}
              order={base + 5}
              position={labelPos}
              rotation={-rad(p.tape.rot)}
              meshRef={(m) => {
                labels.current[id] = m;
              }}
            />
            {/* What the pointer actually hits. */}
            <mesh position={[0, 0, 8]} onPointerOver={over(id)} onPointerOut={out(id)} onClick={click(id)}>
              <planeGeometry args={[p.w, p.h]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function Scene({ onLost, ...props }: SceneProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: FOV, near: DISTANCE * 0.3, far: DISTANCE * 2, position: [0, 0, DISTANCE] }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", onLost, { once: true });
      }}
      aria-hidden="true"
    >
      <Table {...props} />
    </Canvas>
  );
}
