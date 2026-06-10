import { useEffect, useMemo, useState } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { useParty } from './hooks/useParty';
import { useViewportSync } from './hooks/useViewportSync';
import { useViewportOverlay } from './hooks/useViewportOverlay';
import { Player } from './types';
import { PlayerList } from './components/PlayerList';
import { fitTransform } from './lib/viewportFit';

function App() {
  const [ready, setReady] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const { players } = useParty(ready);
  const { viewports, sendPushToPlayer } = useViewportSync(ready);

  const isGM = player?.role === 'GM';
  // Only feed overlays when the GM has the popover open. When closed, the
  // empty list triggers the hook's diff-delete and the frames disappear.
  const viewportList = useMemo(
    () => (isGM && actionOpen ? Array.from(viewports.values()) : []),
    [viewports, isGM, actionOpen]
  );
  const playersById = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  useViewportOverlay(viewportList, playersById, player?.id ?? null);

  useEffect(() => {
    let mounted = true;

    OBR.onReady(async () => {
      if (!mounted) return;
      setReady(true);
      const id = await OBR.player.getId();
      const name = await OBR.player.getName();
      const role = await OBR.player.getRole();
      setPlayer({
        id,
        name: name ?? 'Unknown',
        role: role === 'GM' ? 'GM' : 'PLAYER',
        color: role === 'GM' ? '#5c6bc0' : '#2a7f62'
      });

      setActionOpen(await OBR.action.isOpen());
      await OBR.action.setHeight(540);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    return OBR.action.onOpenChange((isOpen) => {
      setActionOpen(isOpen);
    });
  }, [ready]);

  return (
    <div className="app-shell">
      <h1>Scrying</h1>

      {!ready && <div className="status-box">Waiting for OBR...</div>}

      {ready && !isGM && (
        <div className="status-box">GM-only panel.</div>
      )}

      {ready && isGM && (
        <PlayerList
          players={players}
          viewports={viewports}
          onSnap={async (playerId) => {
            const viewport = viewports.get(playerId);
            if (!viewport) return;
            const [destWidth, destHeight] = await Promise.all([
              OBR.viewport.getWidth(),
              OBR.viewport.getHeight()
            ]);
            OBR.viewport.animateTo(fitTransform(viewport, destWidth, destHeight));
          }}
          onPush={sendPushToPlayer}
        />
      )}
    </div>
  );
}

export default App;
