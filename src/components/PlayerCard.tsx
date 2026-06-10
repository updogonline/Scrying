import { Player, ViewportPayload } from '../types';

interface PlayerCardProps {
  player: Player;
  viewport?: ViewportPayload;
  onSnap: (playerId: string) => void;
  onPush: (playerId: string) => void;
}

export function PlayerCard({ player, viewport, onSnap, onPush }: PlayerCardProps) {
  return (
    <div className="player-card">
      <div className="player-meta">
        <span className="player-dot" style={{ background: player.color }} />
        <div>
          <div className="player-name">{player.name}</div>
          <div className="player-role">{player.role === 'GM' ? 'GM' : 'Player'}</div>
        </div>
      </div>

      <div className="player-actions">
        <button onClick={() => onSnap(player.id)} disabled={!viewport}>
          Snap
        </button>
        <button onClick={() => onPush(player.id)} disabled={!viewport}>
          Push
        </button>
      </div>
    </div>
  );
}
