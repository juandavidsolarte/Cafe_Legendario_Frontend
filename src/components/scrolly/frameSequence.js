// Secuencia de fotogramas WebP dibujada en un <canvas>.
// La usan el hero del grano (avanza con el scroll) y los bucles del chorro y el latte.

const pad = (i) => String(i).padStart(3, '0');

export const frameUrl = (name, index) => `/scrolly/${name}/f${pad(index)}.webp`;
export const posterUrl = (name) => `/scrolly/${name}/poster.webp`;

/**
 * @param {object} options
 * @param {HTMLCanvasElement} options.canvas
 * @param {string} options.name      carpeta dentro de /scrolly
 * @param {number} options.count     número de fotogramas
 * @param {'cover'|'contain'|'focus'} [options.fit]  'focus' recorta los lados para que el
 *        sujeto central (una fracción `focus` del ancho) no se salga en pantallas estrechas
 * @param {number} [options.focus]   fracción del ancho que ocupa el sujeto
 * @param {number} [options.centerY] posición vertical del cuadro cuando no llena el alto
 * @param {number} [options.zoom]    menor que 1 aleja el cuadro (el sujeto se ve más pequeño)
 * @param {number} [options.feather] fracción del cuadro que se desvanece en cada borde, para
 *        que no se note dónde termina la imagen cuando no llena el canvas
 * @param {boolean} [options.interpolate] mezcla fotogramas vecinos en instantes fraccionarios
 * @param {() => void} [options.onFirstFrame]
 */
export function createFrameSequence({
  canvas,
  name,
  count,
  fit = 'cover',
  focus = 0.42,
  centerY = 0.5,
  interpolate = false,
  zoom: initialZoom = 1,
  feather = 0,
  onFirstFrame,
}) {
  const ctx = canvas.getContext('2d');
  const images = new Array(count);
  let last = { frame: 0, overlay: null };
  let zoom = initialZoom;
  let painted = false;
  let destroyed = false;

  const isReady = (img) => Boolean(img && img.complete && img.naturalWidth);

  // Si el fotograma pedido aún no llegó, usa el más cercano ya descargado.
  const nearest = (index) => {
    for (let d = 0; d < count; d += 1) {
      if (isReady(images[index - d])) return images[index - d];
      if (isReady(images[index + d])) return images[index + d];
    }
    return null;
  };

  const place = (img) => {
    const { width: cw, height: ch } = canvas;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    let scale;
    if (fit === 'contain') scale = Math.min(cw / iw, ch / ih);
    else if (fit === 'focus') scale = Math.max(cw / iw, Math.min(ch / ih, cw / (iw * focus)));
    else scale = Math.max(cw / iw, ch / ih);
    scale *= zoom;
    const w = iw * scale;
    const h = ih * scale;
    const y = h >= ch ? (ch - h) / 2 : ch * centerY - h / 2;
    lastRect = [(cw - w) / 2, y, w, h];
    return lastRect;
  };

  // Dibuja un instante de la secuencia. Con `interpolate`, un instante fraccionario mezcla
  // los dos fotogramas vecinos: el movimiento sigue fluido aunque se reproduzca más lento.
  const paint = (target, time, alpha) => {
    const clamped = Math.max(0, Math.min(count - 1, time));
    const base = interpolate ? Math.floor(clamped) : Math.round(clamped);
    const img = nearest(base);
    if (!img) return false;
    target.globalAlpha = alpha;
    target.drawImage(img, ...place(img));
    const mix = interpolate ? clamped - base : 0;
    if (mix > 0.01 && base + 1 < count) {
      const next = nearest(base + 1);
      if (next && next !== img) {
        target.globalAlpha = alpha * mix;
        target.drawImage(next, ...place(next));
      }
    }
    target.globalAlpha = 1;
    return true;
  };

  // Borra en degradado los bordes del cuadro dibujado.
  let lastRect = null;
  const fadeEdges = () => {
    if (!lastRect) return;
    const [x, y, w, h] = lastRect;
    const fx = w * feather;
    const fy = h * feather;
    const strips = [
      [x, y, fx, h, x, 0, x + fx, 0],
      [x + w - fx, y, fx, h, x + w, 0, x + w - fx, 0],
      [x, y, w, fy, 0, y, 0, y + fy],
      [x, y + h - fy, w, fy, 0, y + h, 0, y + h - fy],
    ];
    ctx.globalCompositeOperation = 'destination-out';
    strips.forEach(([sx, sy, sw, sh, x0, y0, x1, y1]) => {
      const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      // Un píxel de margen evita que quede una línea sin borrar en el borde.
      ctx.fillRect(sx - 1, sy - 1, sw + 2, sh + 2);
    });
    ctx.globalCompositeOperation = 'source-over';
  };

  let buffer = null;
  const bufferContext = () => {
    buffer ??= document.createElement('canvas');
    if (buffer.width !== canvas.width || buffer.height !== canvas.height) {
      buffer.width = canvas.width;
      buffer.height = canvas.height;
    }
    return buffer.getContext('2d');
  };

  const render = (frame = last.frame, overlay = null) => {
    last = { frame, overlay };
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!paint(ctx, frame, 1)) return;
    // Fundido cruzado: disimula el salto entre el final y el inicio de un bucle.
    // La capa entrante se compone aparte para que su propia mezcla no altere la opacidad.
    if (overlay && overlay.alpha > 0) {
      const bctx = bufferContext();
      bctx.clearRect(0, 0, buffer.width, buffer.height);
      if (paint(bctx, overlay.frame, 1)) {
        ctx.globalAlpha = Math.min(1, overlay.alpha);
        ctx.drawImage(buffer, 0, 0);
        ctx.globalAlpha = 1;
      }
    }
    if (feather > 0) fadeEdges();
    if (!painted) {
      painted = true;
      onFirstFrame?.();
    }
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(canvas.clientWidth * dpr);
    const height = Math.round(canvas.clientHeight * dpr);
    if (!width || !height || (canvas.width === width && canvas.height === height)) return;
    canvas.width = width;
    canvas.height = height;
    render(last.frame, last.overlay);
  };

  const loadOne = (index) => {
    if (images[index]) return;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (!destroyed) render(last.frame, last.overlay);
    };
    img.src = frameUrl(name, index);
    images[index] = img;
  };

  return {
    render,
    resize,
    /** Cambia el alejamiento; el siguiente render lo aplica. */
    setZoom: (value) => {
      zoom = value;
    },
    /** Descarga el primer fotograma de inmediato. */
    loadFirst: () => loadOne(0),
    /** Descarga el resto en segundo plano. */
    loadAll: () => {
      for (let i = 0; i < count; i += 1) loadOne(i);
    },
    destroy: () => {
      destroyed = true;
      images.forEach((img) => {
        if (img) img.onload = null;
      });
    },
  };
}
