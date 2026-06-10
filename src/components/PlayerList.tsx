import { Player, ViewportPayload } from '../types';
import { PlayerCard } from './PlayerCard';

interface PlayerListProps {
  players: Player[];
  viewports: Map<string, ViewportPayload>;
  onSnap: (playerId: string) => void;
  onPush: (playerId: string) => void;
}

export function PlayerList({ players, viewports, onSnap, onPush }: PlayerListProps) {
  return (
    <section className="player-list">
      <div className="list-header">
        <h2>Players</h2>
        <span>{players.length} connected</span>
      </div>
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          viewport={viewports.get(player.id)}
          onSnap={onSnap}
          onPush={onPush}
        />
      ))}
    </section>
  );
}
