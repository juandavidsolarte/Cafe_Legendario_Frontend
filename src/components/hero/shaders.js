// Shaders GLSL de la escena del hero. Todo el movimiento ambiental vive aquí:
// la crema que gira, el humo que sube, las chispas y el bokeh del fondo.

const noise = /* glsl */ `
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }
`;

/* ---------- Superficie del café: crema en espiral ---------- */

export const cremaVertex = /* glsl */ `
  uniform vec2 uSlosh;
  uniform float uStir;
  uniform float uRadius;
  varying vec2 vQ;

  void main() {
    vec3 p = position;
    vQ = p.xz / uRadius;
    float r = length(vQ);
    // El líquido se inclina con el movimiento de la taza.
    p.y += dot(p.xz, uSlosh);
    // Onda al revolver (clic sobre la taza).
    p.y += sin(r * 22.0 - uStir * 9.0) * 0.018 * exp(-uStir * 1.4) * (1.0 - r);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const cremaFragment = /* glsl */ `
  uniform float uTime;
  uniform float uStir;
  uniform float uGlow;
  uniform vec3 uDeep;
  uniform vec3 uCrema;
  uniform vec3 uFoam;
  varying vec2 vQ;
  ${noise}

  void main() {
    float r = length(vQ);
    float a = atan(vQ.y, vQ.x);
    float stir = exp(-uStir * 0.8) * 3.0;
    a += uTime * 0.12 + r * (2.6 + stir);
    vec2 s = vec2(cos(a), sin(a)) * r;
    float n = fbm(s * 3.2 + uTime * 0.04);
    vec3 color = mix(uDeep, uCrema, smoothstep(0.2, 0.75, n) * 0.85 + 0.15);
    color = mix(color, uFoam, smoothstep(0.62, 0.9, n) * 0.35);
    color = mix(color, uDeep * 0.8, smoothstep(0.78, 1.0, r) * 0.6);
    float spec = smoothstep(0.42, 0.0, length(vQ - vec2(-0.32, -0.38)));
    color += vec3(1.0, 0.85, 0.6) * spec * (0.12 + uGlow * 0.12);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/* ---------- Borde dorado (fresnel) que se enciende al acercarse ---------- */

export const rimVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const rimFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uGlow;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.0);
    gl_FragColor = vec4(uColor * fresnel * uGlow, fresnel * uGlow);
  }
`;

/* ---------- Humo ---------- */

export const steamVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const steamFragment = /* glsl */ `
  uniform float uTime;
  uniform float uBend;
  uniform float uSeed;
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vUv;
  ${noise}

  void main() {
    float y = vUv.y;
    float x = vUv.x - 0.5;
    // Voluta: el hilo de humo ondula, se curva con el movimiento y se deshace al subir.
    x += sin(y * 6.5 - uTime * 1.1 + uSeed) * 0.12 * y;
    x += uBend * y * y * 0.45;
    x += (fbm(vec2(y * 2.2 - uTime * 0.3, uSeed)) - 0.5) * 0.45 * y;
    float width = mix(0.03, 0.16, y);
    float column = smoothstep(width, 0.0, abs(x));
    float n = fbm(vec2(x * 9.0 + uSeed, y * 4.0 - uTime * 0.6));
    float wisps = smoothstep(0.35, 0.75, n);
    float alpha = column * smoothstep(0.0, 0.15, y) * smoothstep(1.0, 0.35, y) * wisps;
    gl_FragColor = vec4(uColor, alpha * uIntensity);
  }
`;

/* ---------- Chispas doradas que suben ---------- */

export const emberVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uHeight;
  attribute float aOffset;
  attribute float aSpeed;
  attribute float aSize;
  varying float vLife;

  void main() {
    vec3 p = position;
    float travel = mod(aOffset + uTime * aSpeed, uHeight);
    vLife = travel / uHeight;
    p.y += travel;
    p.x += sin(uTime * aSpeed * 2.0 + aOffset * 6.0) * 0.18;
    p.z += cos(uTime * aSpeed * 1.6 + aOffset * 4.0) * 0.12;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPixelRatio * (24.0 / -mv.z) * (1.0 - vLife * 0.6);
    gl_Position = projectionMatrix * mv;
  }
`;

export const emberFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uGlow;
  uniform float uIntensity;
  varying float vLife;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    float life = smoothstep(0.0, 0.12, vLife) * smoothstep(1.0, 0.55, vLife);
    gl_FragColor = vec4(uColor * (1.2 + uGlow), core * life * uIntensity);
  }
`;

/* ---------- Bokeh del fondo ---------- */

export const bokehVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aPhase;
  varying float vPulse;

  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.15 + aPhase) * 0.25;
    p.x += cos(uTime * 0.1 + aPhase) * 0.2;
    vPulse = 0.7 + 0.3 * sin(uTime * 0.4 + aPhase * 3.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPixelRatio * (40.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

export const bokehFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uGlow;
  uniform float uIntensity;
  varying float vPulse;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.44, d);
    float ring = smoothstep(0.5, 0.46, d) - smoothstep(0.46, 0.4, d);
    float alpha = (disc * 0.55 + ring * 0.35) * vPulse * (0.22 + uGlow * 0.18);
    gl_FragColor = vec4(uColor, alpha * uIntensity);
  }
`;

/* ---------- Haz de luz diagonal ---------- */

export const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  ${noise}

  void main() {
    float across = abs(vUv.x - 0.5) * 2.0;
    float body = exp(-across * across * 6.0);
    float along = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
    float dust = 0.75 + 0.25 * fbm(vec2(vUv.x * 4.0, vUv.y * 2.0 - uTime * 0.05));
    gl_FragColor = vec4(uColor, body * along * dust * 0.16 * uIntensity);
  }
`;

/* ---------- Mesa: tono cálido bajo la taza que se funde con el fondo ---------- */

export const tableVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const tableFragment = /* glsl */ `
  uniform vec3 uTable;
  uniform vec3 uBg;
  uniform vec3 uCenter;
  uniform float uGlow;
  varying vec3 vWorld;

  void main() {
    float d = length(vWorld.xz - uCenter.xz);
    vec3 color = mix(uTable * (1.0 + uGlow * 0.35), uBg, smoothstep(0.6, 5.5, d));
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
