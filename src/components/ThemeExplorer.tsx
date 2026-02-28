'use client';

import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { Text, Float, Line, Html, Stars, Sparkles, Trail, Ring } from '@react-three/drei';
import { useSpring, animated, config } from '@react-spring/three';
import * as THREE from 'three';
import { ThemeCategory, Topic } from '@/types';
import { ChevronLeft, Sparkles as SparklesIcon } from 'lucide-react';

// ============================================
// ADVANCED SHADER DEFINITIONS
// ============================================

// Science Planet - Quantum Nebula Shader
const ScienceShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: 0 },
    uColor1: { value: new THREE.Color('#8b5cf6') },
    uColor2: { value: new THREE.Color('#06b6d4') },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uHover;
    uniform vec3 uColor1;
    uniform vec3 uColor2;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    // Simplex noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.5);

      // Quantum nebula effect
      float noise1 = snoise(vPosition * 2.0 + uTime * 0.2);
      float noise2 = snoise(vPosition * 4.0 - uTime * 0.15);
      float noise3 = snoise(vPosition * 8.0 + uTime * 0.1);

      // Animated energy lines
      float energyLines = sin(vPosition.y * 15.0 + uTime * 3.0) * 0.5 + 0.5;
      energyLines = smoothstep(0.3, 0.7, energyLines);

      // Nebula clouds
      float nebula = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      nebula = smoothstep(-0.2, 0.8, nebula);

      // Color mixing
      vec3 baseColor = mix(uColor1, uColor2, nebula);
      baseColor += energyLines * uColor2 * 0.4;

      // Add glow
      baseColor += fresnel * uColor2 * 1.2;

      // Pulse effect
      float pulse = sin(uTime * 2.5) * 0.5 + 0.5;
      baseColor += pulse * uHover * 0.3 * uColor2;

      // Core glow
      float core = 1.0 - fresnel;
      baseColor += core * uColor1 * 0.2;

      gl_FragColor = vec4(baseColor, 0.88 + fresnel * 0.12);
    }
  `,
};

// Technology Planet - Cyber Grid Shader
const TechShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: 0 },
    uColor1: { value: new THREE.Color('#0ea5e9') },
    uColor2: { value: new THREE.Color('#22d3ee') },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uHover;
    uniform vec3 uColor1;
    uniform vec3 uColor2;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.0);

      // Cyber grid
      vec2 grid = abs(fract(vUv * 12.0 - 0.5) - 0.5);
      float gridLine = min(grid.x, grid.y);
      gridLine = 1.0 - smoothstep(0.0, 0.08, gridLine);

      // Hex pattern
      vec2 hexUV = vUv * 8.0;
      float hex = sin(hexUV.x * 6.28318) * sin(hexUV.y * 6.28318);

      // Scanline wave
      float scan = sin(vUv.y * 40.0 - uTime * 4.0) * 0.5 + 0.5;
      scan = smoothstep(0.4, 0.6, scan) * 0.4;

      // Data stream effect
      float dataStream = fract(vUv.y * 20.0 + uTime);
      dataStream = smoothstep(0.8, 1.0, dataStream) * gridLine;

      // Color
      vec3 color = mix(uColor1, uColor2, gridLine);
      color += scan * uColor1;
      color += fresnel * uColor2 * 1.0;
      color += dataStream * uColor2;

      // Glow on hover
      color += uHover * fresnel * 0.6;
      color += uHover * gridLine * 0.4;

      gl_FragColor = vec4(color, 0.92);
    }
  `,
};

// Engineering Planet - Industrial Shader
const EngineeringShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: 0 },
    uColor1: { value: new THREE.Color('#f97316') },
    uColor2: { value: new THREE.Color('#fbbf24') },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uHover;
    uniform vec3 uColor1;
    uniform vec3 uColor2;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.0);

      // Voronoi blocks
      vec2 uv = vUv * 6.0;
      vec2 i = floor(uv);
      vec2 f = fract(uv);

      float block = 1.0;
      for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
          vec2 neighbor = vec2(float(x), float(y));
          vec2 point = vec2(
            fract(sin(dot(i + neighbor, vec2(12.9898, 78.233))) * 43758.5453),
            fract(sin(dot(i + neighbor, vec2(39.346, 11.135))) * 43758.5453)
          );
          point = 0.5 + 0.5 * sin(uTime * 0.5 + 6.2831 * point);
          float d = length(neighbor + point - f);
          block = min(block, d);
        }
      }

      // Block edges
      float edges = smoothstep(0.0, 0.12, block);

      // Heat gradient
      float heat = vUv.y + sin(uTime * 0.5) * 0.1;

      // Sparks
      float spark = fract(sin(dot(vUv * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
      spark = step(0.98, spark) * (sin(uTime * 10.0 + vUv.x * 20.0) * 0.5 + 0.5);

      vec3 color = mix(uColor1, uColor2, heat);
      color = mix(color * 0.4, color, edges);
      color += fresnel * uColor1 * 0.6;
      color += spark * uColor2;

      // Glow on hover
      color += uHover * 0.2;

      gl_FragColor = vec4(color, 0.95);
    }
  `,
};

// Earth Planet - Living World Shader
const EarthShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: 0 },
    uColor1: { value: new THREE.Color('#10b981') },
    uColor2: { value: new THREE.Color('#0ea5e9') },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    uniform float uTime;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);

      // Organic breathing displacement
      float displacement = sin(position.x * 4.0 + uTime * 0.8) *
                         sin(position.y * 4.0 + uTime * 0.6) *
                         sin(position.z * 4.0 + uTime * 0.7) * 0.025;
      vec3 newPosition = position + normal * displacement;

      vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
      vWorldPosition = worldPos.xyz;
      vPosition = newPosition;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uHover;
    uniform vec3 uColor1;
    uniform vec3 uColor2;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    // Simplex noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);

      // Multi-layer terrain
      float terrain1 = snoise(vUv * 3.0 + uTime * 0.05);
      float terrain2 = snoise(vUv * 6.0 - uTime * 0.08);
      float terrain = terrain1 * 0.6 + terrain2 * 0.4;

      // Ocean/land/forest/mountain
      float ocean = smoothstep(-0.3, 0.0, terrain);
      float land = smoothstep(0.0, 0.3, terrain);
      float mountain = smoothstep(0.4, 0.7, terrain);

      // Cloud layer
      float clouds = snoise(vUv * 5.0 + uTime * 0.1);
      clouds = smoothstep(0.2, 0.8, clouds);

      vec3 oceanColor = uColor2;
      vec3 landColor = uColor1;
      vec3 forestColor = uColor1 * 0.8;
      vec3 mountainColor = vec3(0.6, 0.55, 0.5);
      vec3 cloudColor = vec3(1.0, 1.0, 1.0);

      vec3 color = oceanColor;
      color = mix(color, landColor, land);
      color = mix(color, forestColor, land * 0.5);
      color = mix(color, mountainColor, mountain);
      color = mix(color, cloudColor, clouds * 0.4);

      // Atmosphere
      color += fresnel * vec3(0.3, 0.6, 1.0) * 0.5;

      // Breathing glow
      float breath = sin(uTime * 1.5) * 0.5 + 0.5;
      color += breath * uHover * 0.15 * uColor1;

      gl_FragColor = vec4(color, 0.92);
    }
  `,
};

// Mathematics Planet - Sacred Geometry Shader
const MathShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: 0 },
    uColor1: { value: new THREE.Color('#ec4899') },
    uColor2: { value: new THREE.Color('#a855f7') },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uHover;
    uniform vec3 uColor1;
    uniform vec3 uColor2;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.5);

      // Sacred geometry - Flower of Life inspired
      vec2 center = vUv - 0.5;
      float dist = length(center);
      float angle = atan(center.y, center.x);

      // Multiple rotating circles
      float circles = 0.0;
      for(int i = 0; i < 6; i++) {
        float a = float(i) * 3.14159 / 3.0 + uTime * 0.3;
        vec2 offset = vec2(cos(a), sin(a)) * 0.25;
        float d = length(center - offset);
        circles += smoothstep(0.15, 0.1, d) * 0.3;
      }

      // Geometric grid
      vec2 grid = abs(fract(vUv * 16.0) - 0.5);
      float gridLine = min(grid.x, grid.y);
      gridLine = 1.0 - smoothstep(0.0, 0.05, gridLine);

      // Spiral
      float spiral = sin(dist * 30.0 - angle * 3.0 + uTime * 2.0);
      spiral = smoothstep(0.3, 0.7, spiral) * 0.3;

      // Fibonacci spiral
      float fib = sin(angle * 5.0 + dist * 10.0 - uTime);

      // Color
      vec3 color = mix(uColor1, uColor2, dist * 1.5);
      color += circles * uColor2;
      color += gridLine * 0.3;
      color += spiral * uColor1;
      color += fresnel * uColor2 * 1.2;
      color += fib * 0.1;

      // Pulse
      float pulse = sin(uTime * 2.0 + dist * 20.0) * 0.5 + 0.5;
      color += pulse * 0.15;

      // Hover
      color += uHover * fresnel * 0.6;

      gl_FragColor = vec4(color, 0.95);
    }
  `,
};

// ============================================
// DATA CONFIGURATION
// ============================================

interface CategoryData {
  id: ThemeCategory;
  name: string;
  icon: string;
  color: string;
  hexColor: string;
  shaderMaterial: any;
  topics: TopicData[];
  particleColor: string;
  particleShape: 'atom' | 'pixel' | 'block' | 'drop' | 'crystal';
  hasRing: boolean;
}

interface TopicData {
  id: Topic;
  name: string;
}

const CATEGORIES: CategoryData[] = [
  {
    id: 'science',
    name: '科学探索',
    icon: '🔬',
    color: 'science',
    hexColor: '#8b5cf6',
    shaderMaterial: ScienceShaderMaterial,
    topics: [
      { id: 'dinosaur', name: '恐龙王国' },
      { id: 'solar_system', name: '宇宙奥秘' },
      { id: 'animals', name: '动物世界' },
      { id: 'insects', name: '昆虫世界' },
      { id: 'ocean', name: '海洋深处' },
      { id: 'human_body', name: '人体秘密' },
      { id: 'plants', name: '植物王国' },
    ],
    particleColor: '#a78bfa',
    particleShape: 'atom',
    hasRing: false,
  },
  {
    id: 'technology',
    name: '技术发明',
    icon: '🚀',
    color: 'technology',
    hexColor: '#0ea5e9',
    shaderMaterial: TechShaderMaterial,
    topics: [
      { id: 'robot', name: '机器人世界' },
      { id: 'airplane', name: '飞机与飞行' },
      { id: 'cars_trains', name: '火车与汽车' },
      { id: 'programming', name: '编程初体验' },
      { id: 'internet', name: '互联网探索' },
    ],
    particleColor: '#22d3ee',
    particleShape: 'pixel',
    hasRing: true,
  },
  {
    id: 'engineering',
    name: '工程世界',
    icon: '🏗️',
    color: 'engineering',
    hexColor: '#f97316',
    shaderMaterial: EngineeringShaderMaterial,
    topics: [
      { id: 'architecture', name: '建筑工程' },
      { id: 'machines', name: '机械装置' },
      { id: 'energy', name: '能源工程' },
    ],
    particleColor: '#fb923c',
    particleShape: 'block',
    hasRing: false,
  },
  {
    id: 'earth',
    name: '地球奥秘',
    icon: '🌍',
    color: 'earth',
    hexColor: '#10b981',
    shaderMaterial: EarthShaderMaterial,
    topics: [
      { id: 'forest', name: '森林秘境' },
      { id: 'mountains', name: '山川河流' },
      { id: 'weather', name: '天气变化' },
    ],
    particleColor: '#34d399',
    particleShape: 'drop',
    hasRing: false,
  },
  {
    id: 'mathematics',
    name: '数学思维',
    icon: '🔢',
    color: 'mathematics',
    hexColor: '#ec4899',
    shaderMaterial: MathShaderMaterial,
    topics: [
      { id: 'shapes', name: '形状与空间' },
      { id: 'logic', name: '逻辑与谜题' },
    ],
    particleColor: '#f472b6',
    particleShape: 'crystal',
    hasRing: true,
  },
];

const PLANET_POSITIONS: Record<ThemeCategory, [number, number, number]> = {
  science: [-3, 1.5, 0],
  technology: [3, 1.5, 0],
  engineering: [-2.5, -1.5, 0],
  earth: [2.5, -1.5, 0],
  mathematics: [0, -2.5, -1],
};

// ============================================
// 3D COMPONENTS
// ============================================

// Enhanced Planet with atmosphere and rings
function EnhancedPlanet({
  position,
  category,
  isSelected,
  isHovered,
  onClick,
  onHover,
}: {
  position: [number, number, number];
  category: CategoryData;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const [spring, api] = useSpring(() => ({
    scale: 1,
    config: config.gentle,
  }));

  useEffect(() => {
    if (isSelected) {
      api.start({ scale: 1.5 });
    } else if (isHovered) {
      api.start({ scale: 1.25 });
    } else {
      api.start({ scale: 1 });
    }
  }, [isSelected, isHovered, api]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uHover.value,
        isHovered || isSelected ? 1 : 0,
        0.08
      );
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.004;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.002;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += isHovered ? 0.025 : 0.008;
    }
  });

  // Create shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uHover: { value: 0 },
        uColor1: { value: new THREE.Color(category.hexColor) },
        uColor2: { value: new THREE.Color(category.particleColor) },
      },
      vertexShader: category.shaderMaterial.vertexShader,
      fragmentShader: category.shaderMaterial.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [category]);

  // Get geometry based on category
  const geometry = useMemo(() => {
    switch (category.id) {
      case 'technology':
        return new THREE.IcosahedronGeometry(0.5, 1);
      case 'mathematics':
        return new THREE.OctahedronGeometry(0.5, 0);
      default:
        return new THREE.SphereGeometry(0.5, 64, 64);
    }
  }, [category.id]);

  // Orbiting particles
  const orbitParticles = useMemo(() => {
    const count = 25;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.65 + Math.random() * 0.2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <animated.group position={position} scale={spring.scale as any}>
      {/* Main planet */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={shaderMaterial}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { onHover(false); document.body.style.cursor = 'auto'; }}
      >
        <primitive object={shaderMaterial} ref={materialRef} />
      </mesh>

      {/* Bright core */}
      <mesh scale={0.4}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color={category.hexColor} transparent opacity={0.7} />
      </mesh>

      {/* Subtle glow - no harsh layers */}
      <mesh scale={isSelected ? 1.4 : isHovered ? 1.2 : 1.0}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color={category.hexColor}
          transparent
          opacity={isSelected ? 0.15 : isHovered ? 0.08 : 0.03}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Ambient light for glow effect */}
      <pointLight
        color={category.hexColor}
        intensity={isSelected ? 1.2 : isHovered ? 0.6 : 0.2}
        distance={4}
        decay={2}
      />

      {/* Subtle glow ring for tech and math */}
      {category.hasRing && (
        <mesh ref={ringRef} rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[0.55, 0.85, 48]} />
          <meshBasicMaterial
            color={category.particleColor}
            transparent
            opacity={isSelected || isHovered ? 0.08 : 0.025}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Soft orbiting particles */}
      <points ref={particlesRef} geometry={orbitParticles}>
        <pointsMaterial
          size={0.025}
          color={category.particleColor}
          transparent
          opacity={isSelected || isHovered ? 0.7 : 0.4}
          sizeAttenuation
        />
      </points>

      {/* Selection sparkle burst */}
      {(isSelected || isHovered) && (
        <Sparkles
          count={25}
          scale={1.2}
          size={3}
          speed={0.6}
          color={category.hexColor}
        />
      )}

      {/* Label */}
      <Html position={[0, -1.0, 0]} center distanceFactor={6} style={{ transition: 'all 0.3s' }}>
        <div
          className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
            isSelected ? 'bg-white/30 text-white shadow-xl' : 'bg-black/60 text-white/95'
          }`}
          style={{
            backdropFilter: 'blur(16px)',
            border: isSelected ? `2px solid ${category.hexColor}` : '1px solid rgba(255,255,255,0.15)',
            boxShadow: isSelected ? `0 0 35px ${category.hexColor}60, 0 8px 32px rgba(0,0,0,0.4)` : '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          <span className="mr-2 text-lg">{category.icon}</span>
          {category.name}
        </div>
      </Html>
    </animated.group>
  );
}

// Neural connection lines with animation
function AnimatedConnections({ selectedCategory }: { selectedCategory: ThemeCategory | null }) {
  const selectedPos = selectedCategory ? PLANET_POSITIONS[selectedCategory] : null;

  if (!selectedPos || !selectedCategory) return null;

  return (
    <>
      {CATEGORIES.map((cat) => {
        if (cat.id === selectedCategory) return null;
        const start = selectedPos;
        const end = PLANET_POSITIONS[cat.id];

        return (
          <Line
            key={cat.id}
            points={[start, end]}
            color={cat.hexColor}
            lineWidth={2}
            transparent
            opacity={0.35}
          />
        );
      })}
    </>
  );
}

// ============================================
// ARTISTIC TOPIC PARTICLE SHADERS
// ============================================

// Science - Quantum Nebula Atom with iridescence
const AtomParticleShader = {
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: 0 },
    uColor: { value: new THREE.Color('#a78bfa') },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uHover;
    uniform vec3 uColor;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    vec3 palette(float t) {
      vec3 a = vec3(0.5, 0.5, 0.5);
      vec3 b = vec3(0.5, 0.5, 0.5);
      vec3 c = vec3(1.0, 1.0, 1.0);
      vec3 d = vec3(0.263, 0.416, 0.557);
      return a + b * cos(6.28318 * (c * t + d));
    }

    void main() {
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.5);

      // Quantum nebula noise
      float noise = sin(vPosition.x * 8.0 + uTime) * sin(vPosition.y * 8.0 + uTime * 0.7) * sin(vPosition.z * 8.0 + uTime * 0.5);
      noise = noise * 0.5 + 0.5;

      // Iridescent color shift
      float shift = length(vPosition) * 3.0 + uTime * 0.5;
      vec3 iridescent = palette(shift);

      // Animated energy rings
      float rings = sin(length(vPosition) * 25.0 - uTime * 3.0) * 0.5 + 0.5;
      rings = smoothstep(0.3, 0.7, rings);

      // Core glow
      float core = 1.0 - length(vUv - 0.5) * 2.0;
      core = max(core, 0.0);

      vec3 color = mix(uColor, iridescent, noise * 0.4);
      color += fresnel * vec3(0.6, 0.8, 1.0) * 0.8;
      color += rings * uColor * 0.5;
      color += core * uColor * 0.3;
      color += uHover * 0.5;

      gl_FragColor = vec4(color, 0.92);
    }
  `,
};

// Technology - Cyber Hologram Pixel
const PixelParticleShader = {
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: 0 },
    uColor: { value: new THREE.Color('#22d3ee') },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uHover;
    uniform vec3 uColor;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.0);

      // Holographic grid
      vec2 grid = abs(fract(vUv * 6.0 - 0.5) - 0.5);
      float gridLine = 1.0 - smoothstep(0.0, 0.08, min(grid.x, grid.y));

      // Glitch effect
      float glitch = step(0.98, fract(sin(uTime * 10.0) * 43758.5));
      float scanline = sin(vUv.y * 30.0 - uTime * 4.0) * 0.5 + 0.5;
      scanline = smoothstep(0.3, 0.7, scanline);

      // Data rain
      float dataRain = fract(vUv.y * 15.0 + uTime * 2.0);
      dataRain = smoothstep(0.8, 1.0, dataRain) * gridLine;

      // Edge glow
      float edge = 1.0 - abs(dot(vNormal, viewDir));
      edge = pow(edge, 2.0);

      vec3 color = uColor * 0.6;
      color += gridLine * uColor * 0.8;
      color += scanline * vec3(0.3, 0.8, 1.0) * 0.4;
      color += dataRain * vec3(1.0, 1.0, 1.0) * 0.6;
      color += fresnel * vec3(0.5, 0.9, 1.0) * 0.7;
      color += glitch * vec3(1.0, 0.2, 0.5) * 0.3;
      color += edge * uColor * 0.5;
      color += uHover * 0.6;

      gl_FragColor = vec4(color, 0.95);
    }
  `,
};

// Engineering - Industrial Hologram Block
const BlockParticleShader = {
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: 0 },
    uColor: { value: new THREE.Color('#fb923c') },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uHover;
    uniform vec3 uColor;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.0);

      // Voronoi industrial cells
      vec2 uv = vUv * 4.0;
      vec2 i = floor(uv);
      vec2 f = fract(uv);
      float cell = 1.0;
      for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
          vec2 neighbor = vec2(float(x), float(y));
          vec2 point = vec2(
            fract(sin(dot(i + neighbor, vec2(12.9898, 78.233))) * 43758.5453),
            fract(sin(dot(i + neighbor, vec2(39.346, 11.135))) * 43758.5453)
          );
          point = 0.5 + 0.5 * sin(uTime + 6.2831 * point);
          float d = length(neighbor + point - f);
          cell = min(cell, d);
        }
      }

      // Heat gradient with animation
      float heat = vUv.y + sin(uTime * 1.5) * 0.15;
      heat = smoothstep(0.0, 1.0, heat);

      // Welding sparks
      float spark = fract(sin(dot(vUv * 50.0, vec2(12.9898, 78.233))) * 43758.5453);
      spark = step(0.97, spark) * (sin(uTime * 15.0 + vUv.x * 30.0) * 0.5 + 0.5);

      // Edge highlight
      float edge = 1.0 - smoothstep(0.0, 0.2, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));

      vec3 coldColor = uColor * 0.4;
      vec3 hotColor = uColor * 1.2 + vec3(0.3, 0.1, 0.0);
      vec3 color = mix(coldColor, hotColor, heat);
      color = mix(color * 0.5, color, cell);
      color += spark * vec3(1.0, 0.8, 0.4) * 1.5;
      color += fresnel * uColor * 0.6;
      color += edge * uColor * 0.4;
      color += uHover * 0.5;

      gl_FragColor = vec4(color, 0.95);
    }
  `,
};

// Earth - Living Aurora Drop
const DropParticleShader = {
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: 0 },
    uColor: { value: new THREE.Color('#34d399') },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uHover;
    uniform vec3 uColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    vec3 aurora(vec2 uv, float time) {
      vec3 col = vec3(0.0);
      float y = uv.y;

      // Multiple aurora waves
      for(float i = 0.0; i < 3.0; i++) {
        float offset = i * 0.3;
        float wave = sin(uv.x * 3.0 + time * (0.5 + i * 0.2) + offset) * 0.5 + 0.5;
        wave *= sin(uv.x * 7.0 - time * 0.3 + offset * 2.0) * 0.5 + 0.5;
        float band = smoothstep(0.3, 0.7, y) * smoothstep(1.0, 0.6, y);
        band *= wave;
        col += band * vec3(0.2, 0.8, 0.6) * (1.0 - i * 0.25);
      }
      return col;
    }

    void main() {
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.5);

      // Animated water caustics
      float caustic = sin(vUv.x * 20.0 + uTime * 2.0) * sin(vUv.y * 20.0 + uTime * 1.5);
      caustic = caustic * 0.5 + 0.5;

      // Aurora effect
      vec3 auroraColor = aurora(vUv, uTime);

      // Shimmer
      float shimmer = sin(vUv.y * 25.0 - uTime * 3.0) * 0.2 + 0.8;

      vec3 color = uColor * shimmer;
      color += fresnel * vec3(0.3, 0.7, 1.0) * 0.8;
      color += caustic * uColor * 0.3;
      color += auroraColor * 0.5;
      color += uHover * 0.45;

      gl_FragColor = vec4(color, 0.93);
    }
  `,
};

// Mathematics - Sacred Geometry Crystal
const CrystalParticleShader = {
  uniforms: {
    uTime: { value: 0 },
    uHover: { value: 0 },
    uColor: { value: new THREE.Color('#f472b6') },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uHover;
    uniform vec3 uColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    #define PI 3.14159265359

    // Flower of Life pattern
    float flowerOfLife(vec2 uv, float time) {
      float scale = 4.0;
      vec2 centered = uv - 0.5;
      float d = length(centered);

      float pattern = 0.0;
      for(int i = 0; i < 6; i++) {
        float angle = float(i) * PI / 3.0 + time * 0.2;
        vec2 offset = vec2(cos(angle), sin(angle)) * 0.25;
        float circle = length(centered - offset);
        pattern += smoothstep(0.12, 0.08, circle) * 0.3;
      }
      pattern += smoothstep(0.15, 0.1, d) * 0.4;
      return pattern;
    }

    void main() {
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);

      // Sacred geometry
      float sacred = flowerOfLife(vUv, uTime);

      // Fibonacci spiral
      float spiral = 0.0;
      vec2 centered = vUv - 0.5;
      float angle = atan(centered.y, centered.x);
      float dist = length(centered);
      spiral = sin(dist * 30.0 - angle * 4.0 + uTime * 1.5);
      spiral = smoothstep(0.3, 0.8, spiral) * 0.4;

      // Pulsing energy
      float pulse = sin(uTime * 2.0 + dist * 15.0) * 0.3 + 0.7;

      // Rainbow refraction
      float refract = sin(angle * 3.0 + uTime) * 0.5 + 0.5;
      vec3 rainbow = vec3(
        sin(refract * PI * 2.0) * 0.5 + 0.5,
        sin(refract * PI * 2.0 + PI * 0.666) * 0.5 + 0.5,
        sin(refract * PI * 2.0 + PI * 1.333) * 0.5 + 0.5
      );

      vec3 color = mix(uColor * 0.6, uColor, pulse);
      color += sacred * vec3(0.8, 0.6, 1.0) * 0.6;
      color += spiral * uColor * 0.5;
      color += fresnel * rainbow * 0.7;
      color += fresnel * uColor * 0.8;
      color += uHover * 0.6;

      gl_FragColor = vec4(color, 0.94);
    }
  `,
};

// ============================================
// EPIC TOPIC PARTICLE COMPONENT
// ============================================

// Individual Epic Topic Particle
function EpicTopicParticle({
  topic,
  position,
  category,
  isSelected,
  isHovered,
  onSelect,
}: {
  topic: TopicData;
  position: [number, number, number];
  category: CategoryData;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);

  // Get shader based on category
  const getShader = () => {
    switch (category.particleShape) {
      case 'atom': return AtomParticleShader;
      case 'pixel': return PixelParticleShader;
      case 'block': return BlockParticleShader;
      case 'drop': return DropParticleShader;
      case 'crystal': return CrystalParticleShader;
      default: return AtomParticleShader;
    }
  };

  const shader = getShader();

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uHover: { value: 0 },
        uColor: { value: new THREE.Color(category.hexColor) },
      },
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      transparent: true,
    });
  }, [shader, category.hexColor]);

  // Orbiting satellites
  const satellites = useMemo(() => {
    const count = category.particleShape === 'crystal' ? 3 : 4;
    const items = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.35 + Math.random() * 0.1;
      items.push({ angle, radius, speed: 0.5 + Math.random() * 0.5, scale: 0.02 + Math.random() * 0.015 });
    }
    return items;
  }, [category.particleShape]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uHover.value,
        isHovered || isSelected ? 1 : 0,
        0.1
      );
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.015;
    }
    if (orbitRef.current) {
      orbitRef.current.children.forEach((child, i) => {
        const sat = satellites[i];
        if (sat) {
          child.position.x = Math.cos(state.clock.elapsedTime * sat.speed + sat.angle) * sat.radius;
          child.position.z = Math.sin(state.clock.elapsedTime * sat.speed + sat.angle) * sat.radius;
        }
      });
    }
  });

  // Get geometry based on shape
  const getGeometry = () => {
    switch (category.particleShape) {
      case 'atom': return new THREE.SphereGeometry(0.28, 32, 32);
      case 'pixel': return new THREE.BoxGeometry(0.24, 0.24, 0.24);
      case 'block': return new THREE.BoxGeometry(0.3, 0.18, 0.18);
      case 'drop': return new THREE.ConeGeometry(0.16, 0.32, 16);
      case 'crystal': return new THREE.OctahedronGeometry(0.2, 0);
      default: return new THREE.SphereGeometry(0.28, 32, 32);
    }
  };

  const scale = isSelected ? 1.4 : isHovered ? 1.2 : 1;

  return (
    <group position={position}>
      {/* Main particle with custom shader */}
      <animated.group scale={scale}>
        <mesh
          ref={meshRef}
          geometry={getGeometry()}
          material={shaderMaterial}
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <primitive object={shaderMaterial} ref={materialRef} />
        </mesh>

        {/* Simplified artistic glow - clean and refined */}
        {/* Bright core */}
        <mesh scale={0.45}>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshBasicMaterial color={category.hexColor} transparent opacity={0.75} />
        </mesh>
        {/* Subtle outer glow */}
        <mesh scale={isSelected ? 1.35 : isHovered ? 1.15 : 0.95}>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshBasicMaterial
            color={category.hexColor}
            transparent
            opacity={isSelected ? 0.12 : isHovered ? 0.05 : 0.015}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Point light for glow */}
        <pointLight
          color={category.hexColor}
          intensity={isSelected ? 1.0 : isHovered ? 0.5 : 0.15}
          distance={3}
          decay={2}
        />

        {/* Subtle orbiting ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]} scale={isSelected ? 1.2 : 1.0}>
          <ringGeometry args={[0.28, 0.4, 32]} />
          <meshBasicMaterial color={category.particleColor} transparent opacity={isSelected || isHovered ? 0.15 : 0.05} side={THREE.DoubleSide} />
        </mesh>

        {/* Simple satellites with glow */}
        <group ref={orbitRef}>
          {satellites.map((sat, i) => (
            <mesh key={i} scale={sat.scale}>
              {category.particleShape === 'atom' && <sphereGeometry args={[1, 6, 6]} />}
              {category.particleShape === 'pixel' && <boxGeometry args={[1, 1, 1]} />}
              {category.particleShape === 'block' && <boxGeometry args={[1, 0.6, 0.6]} />}
              {category.particleShape === 'drop' && <coneGeometry args={[0.5, 1, 4]} />}
              {category.particleShape === 'crystal' && <octahedronGeometry args={[1, 0]} />}
              <meshStandardMaterial color={category.hexColor} emissive={category.hexColor} emissiveIntensity={0.6} roughness={0.3} metalness={0.5} />
            </mesh>
          ))}
        </group>

        {/* Subtle selection/hover effects */}
        {(isSelected || isHovered) && (
          <>
            {/* Sparkle burst */}
            <Sparkles count={25} scale={1.5} size={4} speed={0.6} color={category.hexColor} />
            {/* Additional glow light */}
            <pointLight color={category.hexColor} intensity={isSelected ? 1.5 : 0.7} distance={2.5} decay={2} />
          </>
        )}
      </animated.group>

      {/* Label */}
      <Html position={[0, 0.55, 0]} center distanceFactor={6}>
        <div
          className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
            isSelected ? 'bg-cyan-500/70 text-white' : isHovered ? 'bg-black/80 text-white' : 'bg-black/60 text-white/80'
          }`}
          style={{
            backdropFilter: 'blur(16px)',
            border: isSelected ? '2px solid cyan' : isHovered ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: isSelected ? '0 0 35px rgba(6,182,212,0.8)' : isHovered ? '0 0 25px rgba(0,0,0,0.6)' : 'none',
          }}
        >
          {isSelected && <SparklesIcon className="w-4 h-4 inline mr-1.5" />}
          {topic.name}
        </div>
      </Html>
    </group>
  );
}

// Enhanced topic particles
function EnhancedTopicParticles({
  category,
  selectedTopic,
  onSelectTopic,
}: {
  category: CategoryData;
  selectedTopic: Topic | null;
  onSelectTopic: (topic: Topic) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredTopic, setHoveredTopic] = useState<Topic | null>(null);

  const topicPositions = useMemo(() => {
    const count = category.topics.length;
    const positions: { topic: TopicData; position: [number, number, number] }[] = [];

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const radius = 2.2;

      positions.push({
        topic: category.topics[i],
        position: [
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi) * 0.35,
        ],
      });
    }
    return positions;
  }, [category.topics]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      {topicPositions.map(({ topic, position }) => (
        <EpicTopicParticle
          key={topic.id}
          topic={topic}
          position={position}
          category={category}
          isSelected={selectedTopic === topic.id}
          isHovered={hoveredTopic === topic.id}
          onSelect={() => {
            setHoveredTopic(topic.id);
            onSelectTopic(topic.id);
          }}
        />
      ))}
      {topicPositions.map(({ topic, position }) => {
        const isHovered = hoveredTopic === topic.id;
        if (!isHovered) return null;
        return (
          <group key={`hover-${topic.id}`} position={position}>
            <Html position={[0, -0.6, 0]} center>
              <div className="text-xs text-white/50">点击选择</div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// Dynamic camera controller
function CameraController({ phase }: { phase: string }) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3(0, 0, 8));

  useFrame(() => {
    if (phase === 'categories') {
      targetRef.current.set(0, 0, 8);
    } else if (phase === 'topics') {
      targetRef.current.set(0, 0, 5.5);
    } else {
      targetRef.current.set(0, 0, 4);
    }
    camera.position.lerp(targetRef.current, 0.035);
  });

  return null;
}

// Main scene
function Scene({
  phase,
  selectedCategory,
  selectedTopic,
  onCategorySelect,
  onTopicSelect,
}: {
  phase: 'categories' | 'topics' | 'selected';
  selectedCategory: ThemeCategory | null;
  selectedTopic: Topic | null;
  onCategorySelect: (category: ThemeCategory) => void;
  onTopicSelect: (topic: Topic) => void;
}) {
  const [hoveredPlanet, setHoveredPlanet] = useState<ThemeCategory | null>(null);

  const selectedCategoryData = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[12, 12, 12]} intensity={1.2} />
      <pointLight position={[-12, -6, -12]} intensity={0.5} color="#6366f1" />
      <pointLight position={[0, -10, 5]} intensity={0.3} color="#ec4899" />

      {/* Rich starfield */}
      <Stars radius={120} depth={60} count={5000} factor={6} saturation={0} fade speed={0.2} />

      {/* Nebula background effect */}
      <mesh position={[0, 0, -30]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#0a0a15" transparent opacity={0.8} />
      </mesh>

      {phase === 'categories' && (
        <>
          {CATEGORIES.map((category) => (
            <EnhancedPlanet
              key={category.id}
              position={PLANET_POSITIONS[category.id]}
              category={category}
              isSelected={selectedCategory === category.id}
              isHovered={hoveredPlanet === category.id}
              onClick={() => onCategorySelect(category.id)}
              onHover={(hovered) => setHoveredPlanet(hovered ? category.id : null)}
            />
          ))}
          <AnimatedConnections selectedCategory={selectedCategory} />
        </>
      )}

      {phase === 'topics' && selectedCategoryData && (
        <>
          <EnhancedPlanet
            position={[0, 0, 0]}
            category={selectedCategoryData}
            isSelected={true}
            isHovered={false}
            onClick={() => {}}
            onHover={() => {}}
          />
          <EnhancedTopicParticles
            category={selectedCategoryData}
            selectedTopic={selectedTopic}
            onSelectTopic={onTopicSelect}
          />
        </>
      )}

      <CameraController phase={phase} />
    </>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

interface ThemeExplorerProps {
  selectedTopic: Topic;
  onTopicChange: (topic: Topic) => void;
}

export function ThemeExplorer({ selectedTopic, onTopicChange }: ThemeExplorerProps) {
  const [phase, setPhase] = useState<'categories' | 'topics' | 'selected'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | null>(null);
  const [localSelectedTopic, setLocalSelectedTopic] = useState<Topic | null>(selectedTopic);

  useEffect(() => {
    if (selectedTopic) {
      setLocalSelectedTopic(selectedTopic);
      for (const cat of CATEGORIES) {
        if (cat.topics.some((t) => t.id === selectedTopic)) {
          setSelectedCategory(cat.id);
          setPhase('topics');
          break;
        }
      }
    }
  }, []);

  const handleCategorySelect = (category: ThemeCategory) => {
    setSelectedCategory(category);
    setPhase('topics');
  };

  const handleTopicSelect = (topic: Topic) => {
    setLocalSelectedTopic(topic);
    onTopicChange(topic);
    setPhase('selected');
    setTimeout(() => setPhase('topics'), 2000);
  };

  const handleBack = () => {
    setPhase('categories');
    setSelectedCategory(null);
    setLocalSelectedTopic(null);
  };

  const currentCategory = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="relative w-full h-[550px] rounded-2xl overflow-hidden border border-slate-800/60 shadow-2xl">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 48 }}
        style={{ background: 'radial-gradient(ellipse at center, #0d0d1a 0%, #050508 100%)' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene
            phase={phase}
            selectedCategory={selectedCategory}
            selectedTopic={localSelectedTopic}
            onCategorySelect={handleCategorySelect}
            onTopicSelect={handleTopicSelect}
          />
        </Suspense>
      </Canvas>

      {/* Back button */}
      {phase !== 'categories' && (
        <button
          onClick={handleBack}
          className="absolute top-5 left-5 flex items-center gap-2 px-5 py-2.5 bg-black/60 backdrop-blur-md rounded-full text-white/90 text-sm font-medium hover:bg-black/75 transition-all border border-white/15 hover:border-white/25"
        >
          <ChevronLeft className="w-4 h-4" />
          返回
        </button>
      )}

      {/* Selection breadcrumb */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10">
        {phase === 'categories' ? (
          <span className="text-white/45 text-sm">点击星球探索 · 共 {CATEGORIES.reduce((a, c) => a + c.topics.length, 0)} 个主题</span>
        ) : currentCategory ? (
          <span className="text-white text-sm font-medium">
            <span className="mr-2.5 text-lg">{currentCategory.icon}</span>
            <span className="text-white/70">{currentCategory.name}</span>
            {localSelectedTopic && (
              <>
                <span className="mx-3 text-white/30">→</span>
                <span className="text-cyan-300">
                  {currentCategory.topics.find((t) => t.id === localSelectedTopic)?.name}
                </span>
              </>
            )}
          </span>
        ) : null}
      </div>

      {/* Phase dots */}
      <div className="absolute top-5 right-5 flex gap-2">
        {(['categories', 'topics', 'selected'] as const).map((p, i) => (
          <div
            key={p}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              (phase === p || (phase === 'selected' && p === 'topics'))
                ? 'bg-cyan-400 shadow-[0_0_12px_cyan] scale-125'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
