import { ViewportPayload } from '../types';

export type ViewportTransform = {
  position: { x: number; y: number };
  scale: number;
};

/**
 * Compute the viewport transform that makes a destination screen of size
 * (destWidth, destHeight) pixels show the same scene area that `source` shows,
 * centered on the source's center.
 *
 * When aspect ratios differ, fit-inside is used: the destination scale is
 * chosen so the entire source area is visible, with extra scene visible on
 * the longer axis. Both viewers always see everything the source intended.
 *
 * Coordinate model (OBR):
 *  - `position` is the screen-pixel offset of the scene origin.
 *  - `scale` is screen pixels per scene unit.
 *  - Visible scene area: top-left = (-position.x/scale, -position.y/scale),
 *    size = (width/scale, height/scale).
 */
export function fitTransform(
  source: ViewportPayload,
  destWidth: number,
  destHeight: number
): ViewportTransform {
  const sourceSceneWidth = source.width / source.scale;
  const sourceSceneHeight = source.height / source.scale;

  // Scene-space coordinate of the source viewport's center.
  const centerScene = {
    x: (source.width / 2 - source.position.x) / source.scale,
    y: (source.height / 2 - source.position.y) / source.scale
  };

  // Fit the source area entirely inside the destination viewport.
  const scale = Math.min(
    destWidth / sourceSceneWidth,
    destHeight / sourceSceneHeight
  );

  // Place the destination so its screen center lands on the scene center.
  // screen_center = scene_point * scale + position  =>  position = screen_center - scene_point * scale
  const position = {
    x: destWidth / 2 - centerScene.x * scale,
    y: destHeight / 2 - centerScene.y * scale
  };

  return { position, scale };
}
