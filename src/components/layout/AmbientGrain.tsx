import { useEffect, useRef } from "react";

const TILE_SIZE = 128;
const GRAIN_HEIGHT = 1180;
const PAINT_MEASURE = "studio:ambient-grain-paint";

/** A tiny deterministic noise source, generated once and repeated at one pixel per CSS pixel. */
function createNoiseTile() {
  const tile = document.createElement("canvas");
  tile.width = TILE_SIZE;
  tile.height = TILE_SIZE;
  const context = tile.getContext("2d");
  if (!context) return null;
  const pixels = context.createImageData(TILE_SIZE, TILE_SIZE);
  let seed = 0x6d2b79f5;
  for (let index = 0; index < pixels.data.length; index += 4) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    const gray = seed >>> 24;
    pixels.data[index] = gray;
    pixels.data[index + 1] = gray;
    pixels.data[index + 2] = gray;
    // Soft-light treats middle gray as neutral, preserving the pastel saturation.
    pixels.data[index + 3] = 160;
  }
  context.putImageData(pixels, 0, 0);
  return tile;
}

/** Static grain: one paint on mount, then only after a debounced width change. No animation loop. */
export function AmbientGrain() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const tile = useRef<HTMLCanvasElement | null>(null);
  const paintedWidth = useRef(0);

  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    if (!tile.current) tile.current = createNoiseTile();
    const source = tile.current;
    if (!source) return;
    let resizeTimer: number | undefined;

    const paint = () => {
      const width = Math.ceil(document.documentElement.clientWidth);
      if (width < 1 || paintedWidth.current === width) return;
      const started = performance.now();
      // Deliberately cap DPR at 1: high-density displays do not multiply this decorative surface.
      surface.width = width;
      surface.height = GRAIN_HEIGHT;
      const context = surface.getContext("2d");
      const pattern = context?.createPattern(source, "repeat");
      if (!context || !pattern) return;
      context.fillStyle = pattern;
      context.fillRect(0, 0, width, GRAIN_HEIGHT);
      paintedWidth.current = width;
      performance.clearMeasures(PAINT_MEASURE);
      performance.measure(PAINT_MEASURE, { start: started, end: performance.now() });
    };
    const resize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(paint, 120);
    };
    paint();
    window.addEventListener("resize", resize, { passive: true });
    return () => { window.clearTimeout(resizeTimer); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvas} className="ambient-grain" aria-hidden="true" />;
}
