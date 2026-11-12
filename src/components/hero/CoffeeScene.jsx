import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Billboard,
  ContactShadows,
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import {
  Bloom,
  EffectComposer,
  ToneMapping,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import * as THREE from "three";
import gsap from "gsap";
import {
  beamFragment,
  bokehFragment,
  bokehVertex,
  cremaFragment,
  cremaVertex,
  emberFragment,
  emberVertex,
  rimFragment,
  rimVertex,
  steamFragment,
  steamVertex,
  tableFragment,
  tableVertex,
} from "./shaders";

const PALETTE = {
  bg: "#251003",
  surface: "#251003",
  gold: "#ecb74c",
  caramel: "#c38e56",
  brown: "#713f26",
  cream: "#f3e6d1",
};

const CUP_HEIGHT = 2;
const COFFEE_LEVEL = 1.58;
const TWO_PI = Math.PI * 2;

// Radio interior del vaso a una altura dada (el vaso se abre hacia arriba).
const innerRadius = (y) => 0.8 + (y - 0.34) * (0.15 / 1.62);

/* ---------- Geometría ---------- */

function useCupGeometry() {
  return useMemo(() => {
    const profile = [
      [0, 0],
      [0.74, 0],
      [0.8, 0.04],
      [0.84, 0.22],
      [1.0, 1.94],
      [1.02, 2.0],
      [0.985, 2.02],
      [0.955, 1.96],
      [0.8, 0.36],
      [0.72, 0.32],
      [0, 0.32],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const body = new THREE.LatheGeometry(profile, 96);

    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.93, 1.72, 0),
      new THREE.Vector3(1.38, 1.66, 0),
      new THREE.Vector3(1.58, 1.28, 0),
      new THREE.Vector3(1.46, 0.82, 0),
      new THREE.Vector3(1.08, 0.58, 0),
      new THREE.Vector3(0.86, 0.56, 0),
    ]);
    const handle = new THREE.TubeGeometry(handleCurve, 64, 0.075, 20, false);

    const merged = mergeGeometries([body, handle]);
    merged.translate(0, -CUP_HEIGHT / 2, 0);
    body.dispose();
    handle.dispose();
    return merged;
  }, []);
}

function useCoffeeGeometry() {
  return useMemo(() => {
    const bottom = 0.34;
    const cremaStart = COFFEE_LEVEL - 0.2;
    const make = (from, to) => {
      const points = [
        [0, from],
        [innerRadius(from) - 0.012, from],
        [innerRadius(to) - 0.012, to],
        [0, to],
      ].map(([x, y]) => new THREE.Vector2(x, y - CUP_HEIGHT / 2));
      return new THREE.LatheGeometry(points, 96);
    };
    const surface = new THREE.CircleGeometry(
      innerRadius(COFFEE_LEVEL) - 0.012,
      96,
    );
    surface.rotateX(-Math.PI / 2);
    return {
      liquid: make(bottom, cremaStart),
      crema: make(cremaStart, COFFEE_LEVEL - 0.005),
      surface,
      radius: innerRadius(COFFEE_LEVEL) - 0.012,
    };
  }, []);
}

function useBeanGeometry() {
  return useMemo(() => {
    const geometry = new THREE.SphereGeometry(1, 28, 18);
    const position = geometry.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < position.count; i += 1) {
      v.fromBufferAttribute(position, i);
      // Surco central del grano.
      if (v.y > 0) v.y -= 0.55 * Math.exp(-(v.x * v.x) / 0.012) * v.y;
      v.set(v.x * 0.11, v.y * 0.075, v.z * 0.16);
      position.setXYZ(i, v.x, v.y, v.z);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);
}

/* ---------- Piezas de la escena ---------- */

function Beans({ geometry }) {
  const ref = useRef(null);
  const count = 100;

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    let seed = 7;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < count; i += 1) {
      const angle = random() * TWO_PI;
      const distance = 1.05 + random() * 1.7;
      e.set((random() - 0.5) * 0.6, random() * TWO_PI, (random() - 0.5) * 0.6);
      q.setFromEuler(e);
      const s = 0.85 + random() * 0.35;
      matrix.compose(
        new THREE.Vector3(
          Math.cos(angle) * distance,
          -CUP_HEIGHT / 2 + 0.06,
          Math.sin(angle) * distance * 0.8,
        ),
        q,
        new THREE.Vector3(s, s, s),
      );
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [geometry]);

  return (
    <instancedMesh ref={ref} args={[geometry, undefined, count]} castShadow>
      <meshStandardMaterial color="#3f1d0c" roughness={0.32} metalness={0.05} />
    </instancedMesh>
  );
}

function Steam({ motion, intro }) {
  const materials = useRef([]);
  const plumes = useMemo(
    () => [
      { x: -0.2, seed: 1.3, scale: [1.8, 2.8, 1], color: "#e9d6b8" },
      { x: 0.18, seed: 4.1, scale: [1.6, 2.4, 1], color: "#e8c48c" },
    ],
    [],
  );

  useFrame((state) => {
    materials.current.forEach((material) => {
      if (!material) return;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uBend.value = motion.current.steamBend;
      material.uniforms.uIntensity.value =
        intro.current.value * (0.22 + motion.current.glow * 0.14);
    });
  });

  return plumes.map((plume, index) => (
    <Billboard
      key={plume.seed}
      position={[plume.x, CUP_HEIGHT / 2 - 0.25 + plume.scale[1] / 2, 0]}
      lockX
      lockZ
    >
      <mesh scale={plume.scale}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={(material) => {
            materials.current[index] = material;
          }}
          vertexShader={steamVertex}
          fragmentShader={steamFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{
            uTime: { value: 0 },
            uBend: { value: 0 },
            uSeed: { value: plume.seed },
            uIntensity: { value: 0 },
            uColor: { value: new THREE.Color(plume.color) },
          }}
        />
      </mesh>
    </Billboard>
  ));
}

function Embers({ motion, intro }) {
  const material = useRef(null);
  const { gl } = useThree();
  const geometry = useMemo(() => {
    const count = 70;
    const positions = new Float32Array(count * 3);
    const offset = new Float32Array(count);
    const speed = new Float32Array(count);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * TWO_PI;
      const radius = 1.5 + Math.random() * 1.8;
      // Las chispas suben a los lados y detrás de la taza, nunca delante del café.
      positions.set(
        [
          Math.cos(angle) * radius,
          -CUP_HEIGHT / 2 + Math.random() * 0.5,
          -Math.abs(Math.sin(angle)) * radius * 0.7,
        ],
        i * 3,
      );
      offset[i] = Math.random() * 4;
      speed[i] = 0.12 + Math.random() * 0.3;
      size[i] = 1.2 + Math.random() * 2.6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aOffset", new THREE.BufferAttribute(offset, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    return g;
  }, []);

  useFrame((state) => {
    const m = material.current;
    if (!m) return;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    m.uniforms.uGlow.value = motion.current.glow;
    m.uniforms.uIntensity.value = intro.current.value;
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={material}
        vertexShader={emberVertex}
        fragmentShader={emberFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uPixelRatio: { value: gl.getPixelRatio() },
          uHeight: { value: 4.2 },
          uColor: { value: new THREE.Color(PALETTE.gold) },
          uGlow: { value: 0 },
          uIntensity: { value: 0 },
        }}
      />
    </points>
  );
}

function Backdrop({ motion, intro, cupX }) {
  const group = useRef(null);
  const bokeh = useRef(null);
  const beam = useRef(null);
  const { gl } = useThree();

  const geometry = useMemo(() => {
    const count = 16;
    const positions = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions.set(
        [
          cupX - 3 + Math.random() * 9,
          -0.5 + Math.random() * 4.5,
          -4 - Math.random() * 4,
        ],
        i * 3,
      );
      size[i] = 10 + Math.random() * 26;
      phase[i] = Math.random() * TWO_PI;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    return g;
  }, [cupX]);

  useFrame((state, delta) => {
    const m = motion.current;
    if (group.current) {
      // Contra-movimiento: el fondo se desplaza al revés que el cursor (parallax).
      group.current.position.x = THREE.MathUtils.damp(
        group.current.position.x,
        -m.pointer.x * 0.35,
        3,
        delta,
      );
      group.current.position.y = THREE.MathUtils.damp(
        group.current.position.y,
        -m.pointer.y * 0.2,
        3,
        delta,
      );
    }
    if (bokeh.current) {
      bokeh.current.uniforms.uTime.value = state.clock.elapsedTime;
      bokeh.current.uniforms.uGlow.value = m.glow;
      bokeh.current.uniforms.uIntensity.value = intro.current.value;
    }
    if (beam.current) {
      beam.current.uniforms.uTime.value = state.clock.elapsedTime;
      beam.current.uniforms.uIntensity.value =
        intro.current.value * (1 + m.glow * 0.6);
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry}>
        <shaderMaterial
          ref={bokeh}
          vertexShader={bokehVertex}
          fragmentShader={bokehFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{
            uTime: { value: 0 },
            uPixelRatio: { value: gl.getPixelRatio() },
            uColor: { value: new THREE.Color(PALETTE.caramel) },
            uGlow: { value: 0 },
            uIntensity: { value: 0 },
          }}
        />
      </points>
      <mesh
        position={[cupX - 1.6, 2.2, -3]}
        rotation={[0, 0, 0.62]}
        scale={[2.4, 9, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={beam}
          vertexShader={steamVertex}
          fragmentShader={beamFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{
            uTime: { value: 0 },
            uIntensity: { value: 0 },
            uColor: { value: new THREE.Color("#e9b45f") },
          }}
        />
      </mesh>
    </group>
  );
}

function Table({ motion, cupX }) {
  const material = useRef(null);
  useFrame(() => {
    if (material.current)
      material.current.uniforms.uGlow.value = motion.current.glow;
  });
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -CUP_HEIGHT / 2 - 0.001, 0]}
    >
      <planeGeometry args={[40, 40]} />
      <shaderMaterial
        ref={material}
        vertexShader={tableVertex}
        fragmentShader={tableFragment}
        uniforms={{
          uTable: { value: new THREE.Color("#2a1206") },
          uBg: { value: new THREE.Color(PALETTE.bg) },
          uCenter: { value: new THREE.Vector3(cupX, 0, 0) },
          uGlow: { value: 0 },
        }}
      />
    </mesh>
  );
}

/* ---------- La taza: interacción, física y luz ---------- */

function Cup({ motion, intro, layout }) {
  const root = useRef(null);
  const spinGroup = useRef(null);
  const crema = useRef(null);
  const rim = useRef(null);
  const glowLight = useRef(null);
  const cupGeometry = useCupGeometry();
  const coffee = useCoffeeGeometry();
  const beanGeometry = useBeanGeometry();
  const { camera, gl } = useThree();
  const projected = useMemo(() => new THREE.Vector3(), []);
  const drag = useRef({
    active: false,
    moved: 0,
    lastX: 0,
    velocity: 0,
    angle: 0,
  });

  useEffect(() => {
    const d = drag.current;
    const onMove = (event) => {
      if (!d.active) return;
      const dx = event.clientX - d.lastX;
      d.lastX = event.clientX;
      d.moved += Math.abs(dx);
      d.velocity = dx * 0.012;
      d.angle += d.velocity;
    };
    const onUp = () => {
      if (!d.active) return;
      d.active = false;
      gl.domElement.style.cursor = "";
      // Un clic sin arrastre revuelve el café.
      if (d.moved < 4) motion.current.stir = 0;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [gl, motion]);

  useFrame((state, delta) => {
    const m = motion.current;
    const d = drag.current;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 1 / 30);
    if (!root.current || !spinGroup.current) return;

    // Posición de la taza en pantalla para medir la cercanía del cursor.
    projected.set(layout.x, 0, 0).project(camera);
    const aspect = state.size.width / state.size.height;
    const rel = { x: m.pointer.x - projected.x, y: m.pointer.y - projected.y };
    const distance = Math.hypot(rel.x * aspect, rel.y);
    const idle = !m.hasPointer || t - m.lastMove > 3;
    const proximity =
      idle || !m.inside
        ? 0
        : 1 - THREE.MathUtils.smoothstep(distance, 0.35, 1.5);
    m.glow = THREE.MathUtils.damp(
      m.glow,
      proximity,
      proximity > m.glow ? 5 : 2,
      dt,
    );

    // Giro horizontal: la taza sigue al cursor; sin cursor se balancea sola.
    const targetY = idle
      ? Math.sin(t * 0.45) * 0.38
      : THREE.MathUtils.clamp(rel.x * 0.6, -0.55, 0.55);
    const targetX = idle
      ? 0.05
      : THREE.MathUtils.clamp(-rel.y * 0.12, -0.14, 0.14);
    const before = root.current.rotation.y;
    root.current.rotation.y = THREE.MathUtils.damp(
      root.current.rotation.y,
      targetY,
      3.2,
      dt,
    );
    root.current.rotation.x = THREE.MathUtils.damp(
      root.current.rotation.x,
      targetX,
      3.2,
      dt,
    );
    const followX = idle ? 0 : THREE.MathUtils.clamp(rel.x * 0.18, -0.25, 0.25);
    const introValue = intro.current.value;
    root.current.position.x = THREE.MathUtils.damp(
      root.current.position.x,
      layout.x + followX,
      3,
      dt,
    );
    root.current.position.y =
      -(1 - introValue) * 0.7 + Math.sin(t * 0.8) * 0.025;
    root.current.scale.setScalar(layout.scale * (0.92 + introValue * 0.08));

    // Arrastre con inercia; al soltar vuelve a dejar el asa a la derecha.
    if (!d.active) {
      d.velocity *= 0.94;
      d.angle += d.velocity;
      if (Math.abs(d.velocity) < 0.002) {
        d.angle = THREE.MathUtils.damp(
          d.angle,
          Math.round(d.angle / TWO_PI) * TWO_PI,
          2.2,
          dt,
        );
      }
    }
    spinGroup.current.rotation.y = d.angle;

    // Oleaje del líquido: un muelle alimentado por la velocidad de giro.
    const angular = (root.current.rotation.y - before) / dt + d.velocity * 20;
    m.sloshVelocity +=
      (-m.slosh * 38 - m.sloshVelocity * 4.5 + angular * 2.2) * dt;
    m.slosh += m.sloshVelocity * dt;
    m.steamBend = THREE.MathUtils.damp(
      m.steamBend,
      THREE.MathUtils.clamp(-angular * 0.35 - rel.x * 0.15, -0.8, 0.8),
      2,
      dt,
    );
    m.stir += dt;

    if (crema.current) {
      const u = crema.current.uniforms;
      u.uTime.value = t;
      u.uStir.value = m.stir;
      u.uGlow.value = m.glow;
      u.uSlosh.value.set(THREE.MathUtils.clamp(m.slosh * 0.08, -0.08, 0.08), 0);
    }
    if (rim.current) rim.current.uniforms.uGlow.value = 0.18 + m.glow * 1.25;
    if (glowLight.current) {
      glowLight.current.intensity = m.glow * 9;
      glowLight.current.position.set(
        layout.x + rel.x * 2.2,
        rel.y * 1.6 + 0.4,
        2.2,
      );
    }
  });

  const onPointerDown = (event) => {
    event.stopPropagation();
    const d = drag.current;
    d.active = true;
    d.moved = 0;
    d.lastX = event.clientX;
    gl.domElement.style.cursor = "grabbing";
  };

  return (
    <>
      <pointLight
        ref={glowLight}
        color={PALETTE.gold}
        intensity={0}
        distance={7}
        decay={1.6}
      />
      <group ref={root} position={[layout.x, 0, 0]}>
        <group
          ref={spinGroup}
          onPointerDown={onPointerDown}
          onPointerOver={() => {
            gl.domElement.style.cursor = "grab";
          }}
          onPointerOut={() => {
            if (!drag.current.active) gl.domElement.style.cursor = "";
          }}
        >
          <mesh geometry={coffee.liquid}>
            <meshPhysicalMaterial
              color="#5F3305"
              roughness={0.35}
              clearcoat={0.2}
            />
          </mesh>
          <mesh geometry={coffee.crema}>
            <meshPhysicalMaterial
              color={PALETTE.caramel}
              roughness={0.55}
              sheen={0.6}
              sheenColor={PALETTE.gold}
            />
          </mesh>
          <mesh
            geometry={coffee.surface}
            position={[0, COFFEE_LEVEL - CUP_HEIGHT / 2, 0]}
          >
            <shaderMaterial
              ref={crema}
              vertexShader={cremaVertex}
              fragmentShader={cremaFragment}
              uniforms={{
                uTime: { value: 0 },
                uStir: { value: 10 },
                uGlow: { value: 0 },
                uRadius: { value: coffee.radius },
                uSlosh: { value: new THREE.Vector2() },
                uDeep: { value: new THREE.Color("#8f5528") },
                uCrema: { value: new THREE.Color(PALETTE.caramel) },
                uFoam: { value: new THREE.Color("#e4b878") },
              }}
            />
          </mesh>
          <mesh geometry={cupGeometry} castShadow>
            <MeshTransmissionMaterial
              transmission={1}
              thickness={0.12}
              roughness={0.04}
              ior={1.45}
              chromaticAberration={0.02}
              anisotropicBlur={0.08}
              distortion={0}
              samples={6}
              resolution={512}
              color="#fff4e2"
              attenuationColor="#ffe3b0"
              attenuationDistance={2.5}
            />
          </mesh>
          <mesh geometry={cupGeometry} scale={1.006}>
            <shaderMaterial
              ref={rim}
              vertexShader={rimVertex}
              fragmentShader={rimFragment}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              uniforms={{
                uColor: { value: new THREE.Color(PALETTE.gold) },
                uGlow: { value: 0.18 },
              }}
            />
          </mesh>
        </group>
        <Steam motion={motion} intro={intro} />
        <Embers motion={motion} intro={intro} />
      </group>
      <group position={[layout.x, 0, 0]}>
        <Beans geometry={beanGeometry} />
        <ContactShadows
          frames={1}
          position={[0, -CUP_HEIGHT / 2 + 0.005, 0]}
          opacity={0.75}
          scale={7}
          blur={2.6}
          far={2.5}
          color="#000000"
        />
      </group>
    </>
  );
}

function Effects({ motion }) {
  const bloom = useRef(null);
  useFrame(() => {
    if (bloom.current)
      bloom.current.intensity = 0.55 + motion.current.glow * 1.1;
  });
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        ref={bloom}
        mipmapBlur
        luminanceThreshold={0.62}
        luminanceSmoothing={0.25}
        intensity={0.55}
        radius={0.72}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

function Stage({ motion, onReady }) {
  const { size, viewport } = useThree();
  const intro = useRef({ value: 0 });
  const readyRef = useRef(false);
  const wide = size.width >= 900;
  const layout = useMemo(
    () => ({
      x: wide ? viewport.width * 0.23 : 0,
      scale: wide ? 0.82 : Math.min(1.35, viewport.width / 2.9),
    }),
    [wide, viewport.width],
  );

  useEffect(() => {
    // Entrada premium: la taza sube y la escena se enciende.
    const tween = gsap.to(intro.current, {
      value: 1,
      duration: 1.8,
      delay: 0.2,
      ease: "power3.out",
    });
    return () => tween.kill();
  }, []);

  useFrame(() => {
    if (!readyRef.current) {
      readyRef.current = true;
      onReady?.();
    }
  });

  return (
    <>
      <color attach="background" args={[PALETTE.bg]} />
      <ambientLight intensity={0.25} color="#ffd9a8" />
      <directionalLight position={[-4, 5, 3]} intensity={2.4} color="#ffd59a" />
      <pointLight
        position={[layout.x + 2.5, 1.5, -2.5]}
        intensity={6}
        color={PALETTE.gold}
        distance={9}
      />
      <pointLight
        position={[layout.x - 1, 0.2, 3.5]}
        intensity={3}
        color={PALETTE.caramel}
        distance={8}
      />
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#ffcf8a"
          position={[-4, 4, 3]}
          scale={[6, 2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          color={PALETTE.caramel}
          position={[5, 1, -3]}
          scale={[3, 6, 1]}
        />
        <Lightformer
          form="ring"
          intensity={3}
          color={PALETTE.gold}
          position={[0, 3, 5]}
          scale={2}
        />
      </Environment>
      <Backdrop motion={motion} intro={intro} cupX={layout.x} />
      <Table motion={motion} cupX={layout.x} />
      <Cup motion={motion} intro={intro} layout={layout} />
      <Effects motion={motion} />
    </>
  );
}

/**
 * Escena 3D del hero: taza de vidrio con café, crema en espiral, humo, chispas y bokeh.
 * El cursor gira la taza y la enciende de dorado al acercarse; arrastrar la hace girar
 * y un clic revuelve el café. Se pausa cuando el hero sale de pantalla.
 */
export default function CoffeeScene({ eventSource, onReady, onFail }) {
  const wrapper = useRef(null);
  const [frameloop, setFrameloop] = useState("always");
  const motion = useRef({
    pointer: { x: 0, y: 0 },
    hasPointer: false,
    inside: false,
    lastMove: 0,
    movedSinceFrame: false,
    glow: 0,
    slosh: 0,
    sloshVelocity: 0,
    steamBend: 0,
    stir: 10,
  });

  useEffect(() => {
    const el = wrapper.current;
    const source = eventSource?.current ?? window;
    const onMove = (event) => {
      if (!el || event.pointerType === "touch") return;
      const rect = el.getBoundingClientRect();
      const m = motion.current;
      m.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      m.pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      m.hasPointer = true;
      m.inside = true;
      m.movedSinceFrame = true;
    };
    const onLeave = () => {
      motion.current.inside = false;
    };
    source.addEventListener("pointermove", onMove);
    source.addEventListener("pointerleave", onLeave);

    let observer;
    if (el && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) =>
        setFrameloop(entry.isIntersecting ? "always" : "never"),
      );
      observer.observe(el);
    }
    return () => {
      source.removeEventListener("pointermove", onMove);
      source.removeEventListener("pointerleave", onLeave);
      observer?.disconnect();
    };
  }, [eventSource]);

  return (
    <div ref={wrapper} style={{ position: "absolute", inset: 0 }}>
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.9, 8.2], fov: 32 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        onCreated={(state) => {
          state.camera.lookAt(0, 0.05, 0);
          state.gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            onFail?.();
          });
        }}
      >
        <ClockBridge motion={motion} />
        <Stage motion={motion} onReady={onReady} />
      </Canvas>
    </div>
  );
}

// Anota en el reloj de la escena el instante del último movimiento del cursor.
function ClockBridge({ motion }) {
  useFrame((state) => {
    const m = motion.current;
    if (m.movedSinceFrame) {
      m.movedSinceFrame = false;
      m.lastMove = state.clock.elapsedTime;
    }
  });
  return null;
}
