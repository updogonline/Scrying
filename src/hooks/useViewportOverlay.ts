import { useEffect, useRef } from 'react';
import OBR, { buildShape, buildLabel, Shape, Label } from '@owlbear-rodeo/sdk';
import { Player, ViewportPayload } from '../types';

const FRAME_META_KEY = 'com.scrying.viewportFrame';

type FrameIds = { frameId: string; labelId: string };

export function useViewportOverlay(
  playerViewports: ViewportPayload[],
  players: Map<string, Player>,
  selfId: string | null
) {
  const itemIdsRef = useRef<Map<string, FrameIds>>(new Map());

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const targets = playerViewports.filter((v) => v.playerId !== selfId);
      const targetIds = new Set(targets.map((v) => v.playerId));

      const toDelete: string[] = [];
      for (const [pid, ids] of itemIdsRef.current) {
        if (!targetIds.has(pid)) {
          toDelete.push(ids.frameId, ids.labelId);
          itemIdsRef.current.delete(pid);
        }
      }

      const toAdd: (Shape | Label)[] = [];
      const toUpdate: ViewportPayload[] = [];

      for (const v of targets) {
        const existing = itemIdsRef.current.get(v.playerId);
        if (existing) {
          toUpdate.push(v);
        } else {
          const player = players.get(v.playerId);
          const color = player?.color ?? '#7c4dff';
          const name = player?.name ?? 'Player';
          const { x, y, w, h } = frameRect(v);

          const frame = buildShape()
            .shapeType('RECTANGLE')
            .width(w)
            .height(h)
            .position({ x, y })
            .strokeColor(color)
            .strokeWidth(8)
            .strokeOpacity(0.95)
            .fillColor(color)
            .fillOpacity(0.08)
            .layer('DRAWING')
            .locked(true)
            .disableHit(true)
            .name(`Viewport: ${name}`)
            .metadata({ [FRAME_META_KEY]: { playerId: v.playerId } })
            .build();

          const label = buildLabel()
            .plainText(name)
            .position({ x: x + w / 2, y })
            .backgroundColor(color)
            .backgroundOpacity(0.9)
            .fillColor('#ffffff')
            .pointerHeight(0)
            .pointerWidth(0)
            .layer('TEXT')
            .locked(true)
            .disableHit(true)
            .name(`Viewport label: ${name}`)
            .metadata({ [FRAME_META_KEY]: { playerId: v.playerId } })
            .build();

          toAdd.push(frame, label);
          itemIdsRef.current.set(v.playerId, { frameId: frame.id, labelId: label.id });
        }
      }

      try {
        if (toDelete.length > 0) {
          await OBR.scene.local.deleteItems(toDelete);
        }
        if (toAdd.length > 0 && !cancelled) {
          await OBR.scene.local.addItems(toAdd);
        }
        if (toUpdate.length > 0 && !cancelled) {
          const ids = toUpdate.flatMap((v) => {
            const ex = itemIdsRef.current.get(v.playerId)!;
            return [ex.frameId, ex.labelId];
          });
          await OBR.scene.local.updateItems(
            ids,
            (items) => {
              for (const v of toUpdate) {
                const ex = itemIdsRef.current.get(v.playerId);
                if (!ex) continue;
                const player = players.get(v.playerId);
                const color = player?.color ?? '#7c4dff';
                const name = player?.name ?? 'Player';
                const { x, y, w, h } = frameRect(v);

                const frame = items.find((i: any) => i.id === ex.frameId) as any;
                if (frame) {
                  frame.position = { x, y };
                  frame.width = w;
                  frame.height = h;
                  frame.style.strokeColor = color;
                  frame.style.fillColor = color;
                }

                const label = items.find((i: any) => i.id === ex.labelId) as any;
                if (label) {
                  label.position = { x: x + w / 2, y };
                  label.text.plainText = name;
                  label.style.backgroundColor = color;
                }
              }
            },
            true
          );
        }
      } catch (err) {
        console.error('viewport overlay sync failed', err);
      }
    };

    sync();

    return () => {
      cancelled = true;
    };
  }, [playerViewports, players, selfId]);

  useEffect(() => {
    return () => {
      const ids: string[] = [];
      for (const v of itemIdsRef.current.values()) {
        ids.push(v.frameId, v.labelId);
      }
      itemIdsRef.current.clear();
      if (ids.length > 0) {
        OBR.scene.local.deleteItems(ids).catch(() => {});
      }
    };
  }, []);
}

function frameRect(v: ViewportPayload) {
  const w = v.width / v.scale;
  const h = v.height / v.scale;
  const x = -v.position.x / v.scale;
  const y = -v.position.y / v.scale;
  return { x, y, w, h };
}
