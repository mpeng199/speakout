/**
 * Amber light through plastic: a caustic network made from ridged simplex noise,
 * gathered into a pool of light. Simplex noise by Ian McEwan / Ashima Arts (MIT).
 */
export const AMBER_VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";

export const AMBER_FRAG = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform float uIntro;   // 0 → 1, light turning on
uniform vec2 uMouse;    // 0..1, smoothed
uniform vec3 uPool;     // centre x, centre y (0..1), radius
uniform float uGain;    // overall brightness
uniform float uSpread;  // 0 = one pool, 1 = light across the whole room
uniform float uScale;   // caustic scale
uniform float uLens;    // 0 → 1, the pointer's lens (fine pointers only)

float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x){ return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float caust(vec2 p, float t){
  vec2 q = p + 0.42 * vec2(snoise(p * 0.85 + vec2(0.0, t * 0.06)), snoise(p * 0.85 + vec2(5.2, -t * 0.05)));
  float n1 = snoise(q * 1.6 + vec2(t * 0.04, 0.0));
  float n2 = snoise(q * 2.9 + vec2(9.0, -t * 0.035));
  float r1 = pow(1.0 - abs(n1), 8.0);
  float r2 = pow(1.0 - abs(n2), 10.0);
  return r1 * 0.8 + r2 * 0.5 + r1 * r2 * 1.4;
}

void main(){
  float mn = min(uRes.x, uRes.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / mn;
  vec2 m = (uMouse - 0.5) * 0.12;
  float t = uTime;

  // The pointer is a soft lens: the caustics under it are magnified a little and lifted.
  vec2 lq = (gl_FragCoord.xy - uMouse * uRes) / mn;
  float lens = uLens * smoothstep(0.34, 0.0, length(lq));

  vec2 pp = p * uScale + m - lq * uScale * 0.22 * lens;
  float cr = caust(pp + vec2(0.007, 0.0), t);
  float cg = caust(pp, t);
  float cb = caust(pp - vec2(0.007, 0.0), t);

  vec2 c = uPool.xy + m * 0.6;
  vec2 q = (gl_FragCoord.xy - c * uRes) / mn * vec2(0.78, 1.18);
  float pool = smoothstep(uPool.z, 0.0, length(q));
  pool *= pool;
  pool = mix(pool, 0.42 + 0.58 * pool, uSpread);
  pool += lens * lens * 0.6 * (1.0 - 0.5 * pool);

  vec3 night = vec3(0.055, 0.059, 0.075);
  vec3 amber = vec3(0.941, 0.588, 0.165);
  vec3 hot = vec3(1.0, 0.85, 0.58);

  float k = uIntro * uGain;
  vec3 col = night + amber * 0.15 * pool * k;
  vec3 light = vec3(cr, cg * 0.9, cb * 0.72);
  col += mix(amber, hot, clamp(cg * 0.55, 0.0, 1.0)) * light * pool * 0.9 * k;

  float g = h1(gl_FragCoord.xy + fract(t * 7.0) * 91.0) - 0.5;
  col += g * 0.022;
  gl_FragColor = vec4(col, 1.0);
}
`;
