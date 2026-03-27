import React, { useMemo } from 'react';
import { ScannerEffectOptions, randomizeScannerEffects, BackgroundStyle } from '../types';

interface Props {
  effects: ScannerEffectOptions;
  children: React.ReactNode;
  instanceSeed?: number;
}

const backgroundClassMap: Record<BackgroundStyle, string> = {
  'none': 'scan-bg-none',
  'dark-floor': 'scan-bg-dark-floor',
  'wood': 'scan-bg-wood',
  'marble': 'scan-bg-marble',
  'concrete': 'scan-bg-concrete'
};

export const ScannerEffects: React.FC<Props> = ({ effects, children, instanceSeed }) => {
  const computedEffects = useMemo(() => {
    if (!effects.enabled) return null;

    if (effects.randomize && instanceSeed !== undefined) {
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };

      const random = (min: number, max: number, offset: number = 0) => {
        const r = seededRandom(instanceSeed + offset);
        return r * (max - min) + min;
      };

      const randomSign = (offset: number = 0) => seededRandom(instanceSeed + offset) > 0.5 ? 1 : -1;

      if (effects.extremeMode) {
        return {
          rotation: random(8, 15, 1) * randomSign(2),
          perspectiveX: random(10, 15, 3) * randomSign(4),
          perspectiveY: random(8, 12, 5) * randomSign(6),
          noiseIntensity: random(60, 85, 7),
          vignetteIntensity: random(65, 85, 8),
          warmth: random(-10, 20, 9),
          brightness: random(70, 85, 10),
          contrast: random(140, 160, 11),
          blur: random(0.8, 1.5, 12),
          zoom: random(0.7, 0.9, 15),
          shadowIntensity: random(40, 60, 13),
          paperTexture: random(30, 45, 14)
        };
      }

      return {
        rotation: random(0.5, 4.0, 1) * randomSign(2),
        perspectiveX: random(0, 5, 3) * randomSign(4),
        perspectiveY: random(0, 4, 5) * randomSign(6),
        noiseIntensity: random(12, 35, 7),
        vignetteIntensity: random(30, 65, 8),
        warmth: random(-5, 15, 9),
        brightness: random(92, 100, 10),
        contrast: random(105, 125, 11),
        blur: random(0.2, 0.8, 12),
        zoom: random(0.95, 1.12, 15),
        shadowIntensity: random(15, 45, 13),
        paperTexture: random(10, 25, 14)
      };
    }

    if (effects.randomize) {
      return randomizeScannerEffects(effects.extremeMode);
    }

    return effects;
  }, [effects, instanceSeed]);

  if (!effects.enabled || !computedEffects) {
    return <>{children}</>;
  }

  const cssVars = {
    '--scan-rotation': `${computedEffects.rotation}deg`,
    '--scan-perspective-x': `${computedEffects.perspectiveX}deg`,
    '--scan-perspective-y': `${computedEffects.perspectiveY}deg`,
    '--scan-noise': computedEffects.noiseIntensity / 100,
    '--scan-vignette': computedEffects.vignetteIntensity / 100,
    '--scan-warmth': computedEffects.warmth / 100,
    '--scan-brightness': computedEffects.brightness / 100,
    '--scan-contrast': computedEffects.contrast / 100,
    '--scan-blur': `${computedEffects.blur}px`,
    '--scan-zoom': computedEffects.zoom ?? 1,
    '--scan-shadow': computedEffects.shadowIntensity / 100,
    '--scan-texture': computedEffects.paperTexture / 100,
  } as React.CSSProperties;

  const bgClass = backgroundClassMap[effects.background] || 'scan-bg-none';
  const hasBg = effects.background !== 'none';

  return (
    <div className={`scan-background relative ${bgClass}`}>
      <div className={`scanner-wrapper ${hasBg ? 'scan-drop-shadow' : ''}`} style={cssVars}>
        <div className="scanner-inner">
          <div className="scanned-effect relative">
            {children}
            <div className="scan-noise-layer" />
            <div className="scan-texture-layer" />
            <div className="scan-vignette-layer" />
            <div className="scan-light-layer" />
            <div className="scan-edge-shadow" />
            <div className="scan-crease-layer" />
            <div className="scan-dust-layer" />
            <div className="scan-scan-lines" />
          </div>
        </div>
      </div>
    </div>
  );
};
