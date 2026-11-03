"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useLatest, useReducedMotion } from "@/lib/hooks";

/* A1 · Velaris — gradiente vivo em WebGL (simplex noise + grain + vinheta).
   Adaptado: hexToRgb fora do componente, cores memoizadas por valor, checagem de
   compilação/link com fallback CSS, cleanup completo do GL, pausa fora da sala
   ativa ou com a aba oculta, 30fps no mobile e frame estático em reduced-motion. */

const vertexShaderGLSL = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderGLSL = `
precision highp float;
varying vec2 vUv;

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_grain;
uniform vec3  u_colors[4];
uniform vec3  u_bg;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  float ratio = u_resolution.x / u_resolution.y;
  vec2 p = uv - 0.5;
  p.x *= ratio;

  float t = u_time * 0.1;

  float n1 = snoise(p * 0.4 + vec2(t * 0.2, -t * 0.3));
  float n2 = snoise(p * 0.55 + vec2(-t * 0.15, t * 0.25) + n1 * 0.25);
  float n3 = snoise(p * 0.75 + vec2(t * 0.1, -t * 0.2) + n2 * 0.2);

  vec3 col = u_bg;

  float dist = length(p) * 1.5;
  float vignette = 1.0 - smoothstep(0.3, 1.2, dist);

  col = mix(col, u_colors[0], smoothstep(-0.2, 0.5, n1) * 0.85);
  col = mix(col, u_colors[1], smoothstep(-0.1, 0.6, n2) * 0.7);
  col = mix(col, u_colors[2], smoothstep(-0.3, 0.4, n3) * 0.6);
  col = mix(col, u_colors[3], smoothstep(0.0, 0.7, n1 * n2) * 0.5);

  float glow = smoothstep(0.8, 0.0, dist) * 0.3;
  col += u_colors[1] * glow;

  col = mix(col * 0.2, col, vignette);

  float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453 + u_time);
  col += (grain - 0.5) * u_grain * 0.1;

  gl_FragColor = vec4(col, 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

export interface VelarisProps {
  bg?: string;
  colors?: string[];
  speed?: number;
  grain?: number;
  /** false pausa o loop (sala inativa). */
  active?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const DEFAULT_COLORS = ["#C8B78B", "#4A4030", "#1C1C1C", "#8F999F"];

export default function Velaris({
  bg = "#080808",
  colors = DEFAULT_COLORS,
  speed = 0.6,
  grain = 0.3,
  active = true,
  className,
  children,
}: VelarisProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();

  const colorsKey = colors.slice(0, 4).join(",");
  const flatColors = useMemo(
    () => new Float32Array(colorsKey.split(",").flatMap((c) => hexToRgb(c))),
    [colorsKey],
  );
  const bgRgb = useMemo(() => hexToRgb(bg), [bg]);

  const params = useLatest({ speed, grain, active, reduced, flatColors, bgRgb });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "low-power" });
    if (!gl) {
      setFailed(true);
      return;
    }

    const shaders: WebGLShader[] = [];
    const createShader = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      shaders.push(s);
      return s;
    };

    const vs = createShader(gl.VERTEX_SHADER, vertexShaderGLSL);
    const fs = createShader(gl.FRAGMENT_SHADER, fragmentShaderGLSL);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      shaders.forEach((s) => gl.deleteShader(s));
      setFailed(true);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      shaders.forEach((s) => gl.deleteShader(s));
      setFailed(true);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const locs = {
      res: gl.getUniformLocation(program, "u_resolution"),
      time: gl.getUniformLocation(program, "u_time"),
      grain: gl.getUniformLocation(program, "u_grain"),
      colors: gl.getUniformLocation(program, "u_colors"),
      bg: gl.getUniformLocation(program, "u_bg"),
    };

    const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    const minFrameMs = coarse ? 1000 / 30 : 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, coarse ? 1 : 1.5);
      canvas.width = Math.max(1, Math.floor(container.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(container.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let raf = 0;
    let last = 0;
    let elapsed = 7000; // começa num ponto "maduro" do ruído
    let prevT = 0;

    const draw = () => {
      const p = params.current;
      gl.uniform2f(locs.res, canvas.width, canvas.height);
      gl.uniform1f(locs.time, elapsed * 0.001 * p.speed);
      gl.uniform1f(locs.grain, p.grain);
      gl.uniform3f(locs.bg, p.bgRgb[0], p.bgRgb[1], p.bgRgb[2]);
      gl.uniform3fv(locs.colors, p.flatColors);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const p = params.current;
      const dt = prevT ? Math.min(t - prevT, 100) : 16;
      prevT = t;
      if (!p.active || document.hidden || p.reduced) return;
      if (minFrameMs && t - last < minFrameMs) return;
      last = t;
      elapsed += dt;
      draw();
    };

    draw(); // frame estático (também serve para reduced-motion)
    raf = requestAnimationFrame(loop);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      shaders.forEach((s) => gl.deleteShader(s));
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // O contexto só é recriado se a cor mudar (memo por valor); o resto é lido por ref.
  }, [flatColors, params]);

  // Redesenha o frame estático quando as cores mudam em reduced-motion: o efeito acima já cobre.

  return (
    <div ref={containerRef} className={cn("relative h-full w-full overflow-hidden", className)}>
      {failed ? (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 70% 30%, ${colors[0]}33, transparent 60%), radial-gradient(ellipse at 20% 80%, ${colors[3] ?? colors[0]}26, transparent 55%), ${bg}`,
          }}
        />
      ) : (
        <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
      )}
      {children ? <div className="relative z-10 h-full w-full">{children}</div> : null}
    </div>
  );
}
