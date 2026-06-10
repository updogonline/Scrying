import { useEffect, useMemo, useRef, useState } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { ViewportPayload } from '../types';
import { fitTransform } from '../lib/viewportFit';

const POLL_INTERVAL = 500;

export function useViewportSync(isReady: boolean) {
  const [viewports, setViewports] = useState<Map<string, ViewportPayload>>(new Map());
  const [selfViewport, setSelfViewport] = useState<ViewportPayload | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const lastPushIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isReady) return;

    let intervalId: number | undefined;
    let active = true;
    let removeMetadataListener: (() => void) | undefined;

    async function writeViewport(payload: ViewportPayload) {
      const metadata = await OBR.room.getMetadata();
      const current = (metadata as any).playerPov ?? { viewports: {}, pushes: {} };
      const next = {
        ...current,
        viewports: {
          ...(current.viewports ?? {}),
          [payload.playerId]: payload
        }
      };
      await OBR.room.setMetadata({ playerPov: next });
    }

    async function publishViewport() {
      if (!playerId) return;
      const [position, scale, width, height] = await Promise.all([
        OBR.viewport.getPosition(),
        OBR.viewport.getScale(),
        OBR.viewport.getWidth(),
        OBR.viewport.getHeight()
      ]);
      const payload: ViewportPayload = { playerId, position, scale, width, height };
      setSelfViewport(payload);
      await writeViewport(payload);
    }

    async function start() {
      const id = await OBR.player.getId();
      setPlayerId(id);

      const metadata = await OBR.room.getMetadata();
      const current = (metadata as any).playerPov ?? { viewports: {}, pushes: {} };
      const currentViewports = current.viewports ?? {};
      setViewports(new Map(Object.entries(currentViewports)));

      removeMetadataListener = OBR.room.onMetadataChange((updatedMetadata) => {
        if (!active) return;
        const updated = (updatedMetadata as any).playerPov ?? { viewports: {}, pushes: {} };
        setViewports(new Map(Object.entries(updated.viewports ?? {})));

        const pushes = updated.pushes ?? {};
        const pushEntry = pushes[id];
        if (pushEntry && pushEntry.id !== lastPushIdRef.current) {
          lastPushIdRef.current = pushEntry.id;
          (async () => {
            const [destWidth, destHeight] = await Promise.all([
              OBR.viewport.getWidth(),
              OBR.viewport.getHeight()
            ]);
            OBR.viewport.animateTo(
              fitTransform(pushEntry.payload, destWidth, destHeight)
            );
          })();
        }
      });

      intervalId = window.setInterval(publishViewport, POLL_INTERVAL);
      await publishViewport();
    }

    start();

    return () => {
      active = false;
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
      removeMetadataListener?.();
    };
  }, [isReady, playerId]);

  const sendPushToPlayer = useMemo(() => {
    return async (targetPlayerId: string) => {
      if (!playerId) return;
      const [position, scale, width, height] = await Promise.all([
        OBR.viewport.getPosition(),
        OBR.viewport.getScale(),
        OBR.viewport.getWidth(),
        OBR.viewport.getHeight()
      ]);
      const payload: ViewportPayload = { playerId, position, scale, width, height };
      const metadata = await OBR.room.getMetadata();
      const current = (metadata as any).playerPov ?? { viewports: {}, pushes: {} };
      const next = {
        ...current,
        pushes: {
          ...(current.pushes ?? {}),
          [targetPlayerId]: {
            id: `${playerId}-${Date.now()}`,
            payload
          }
        }
      };
      await OBR.room.setMetadata({ playerPov: next });
    };
  }, [playerId]);

  return { viewports, selfViewport, sendPushToPlayer };
}
