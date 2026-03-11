'use client'

import { ShaderMaterial, type Texture, Vector2 } from 'three'

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform sampler2D uDisplacement;
uniform float uProgress;
uniform float uStrength;
uniform float uZoom;
uniform float uSameImage;
uniform vec2 uImageResolution1;
uniform vec2 uImageResolution2;
uniform vec2 uPlaneResolution;

vec2 coverUv(vec2 uv, vec2 imageResolution, vec2 planeResolution) {
  float imageAspect = imageResolution.x / max(imageResolution.y, 1.0);
  float planeAspect = planeResolution.x / max(planeResolution.y, 1.0);

  vec2 ratio = vec2(
    min(planeAspect / imageAspect, 1.0),
    min(imageAspect / planeAspect, 1.0)
  );

  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

void main() {
  vec2 baseUv1 = coverUv(vUv, uImageResolution1, uPlaneResolution);
  vec2 baseUv2 = coverUv(vUv, uImageResolution2, uPlaneResolution);

  vec2 centered = vUv - 0.5;
  vec2 zoomUv = centered / (1.0 + (uZoom * uProgress)) + 0.5;
  vec2 zoomedBaseUv2 = coverUv(zoomUv, uImageResolution2, uPlaneResolution);

  vec4 displacementSample = texture2D(uDisplacement, vUv);
  vec2 displacement = (displacementSample.rg * 2.0 - 1.0) * uStrength;

  vec2 uvA = baseUv1 + (uProgress * displacement);
  vec2 uvB = mix(baseUv2, zoomedBaseUv2, uSameImage) - ((1.0 - uProgress) * displacement);

  vec4 colorA = texture2D(uTexture1, uvA);
  vec4 colorB = texture2D(uTexture2, uvB);

  gl_FragColor = mix(colorA, colorB, uProgress);
}
`

type Uniforms = {
  uTexture1: { value: Texture | null }
  uTexture2: { value: Texture | null }
  uDisplacement: { value: Texture | null }
  uProgress: { value: number }
  uStrength: { value: number }
  uZoom: { value: number }
  uSameImage: { value: number }
  uImageResolution1: { value: Vector2 }
  uImageResolution2: { value: Vector2 }
  uPlaneResolution: { value: Vector2 }
}

export class ImageTransitionMaterial extends ShaderMaterial {
  private uniformsRef: Uniforms

  imageResolution1: Vector2
  imageResolution2: Vector2
  planeResolution: Vector2

  constructor({
    strength = 0.22,
    zoom = 0.08,
  }: { strength?: number; zoom?: number } = {}) {
    const uniforms: Uniforms = {
      uTexture1: { value: null },
      uTexture2: { value: null },
      uDisplacement: { value: null },
      uProgress: { value: 0 },
      uStrength: { value: strength },
      uZoom: { value: zoom },
      uSameImage: { value: 0 },
      uImageResolution1: { value: new Vector2(1, 1) },
      uImageResolution2: { value: new Vector2(1, 1) },
      uPlaneResolution: { value: new Vector2(1, 1) },
    }

    super({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: false,
    })

    this.uniformsRef = uniforms
    this.imageResolution1 = uniforms.uImageResolution1.value
    this.imageResolution2 = uniforms.uImageResolution2.value
    this.planeResolution = uniforms.uPlaneResolution.value
  }

  set texture1(value: Texture | null) {
    this.uniformsRef.uTexture1.value = value
  }

  set texture2(value: Texture | null) {
    this.uniformsRef.uTexture2.value = value
  }

  set displacementTexture(value: Texture | null) {
    this.uniformsRef.uDisplacement.value = value
  }

  set progress(value: number) {
    this.uniformsRef.uProgress.value = value
  }

  set sameImage(value: boolean) {
    this.uniformsRef.uSameImage.value = value ? 1 : 0
  }
}
