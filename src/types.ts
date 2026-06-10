export type PlayerRole = 'GM' | 'PLAYER';

export type Player = {
  id: string;
  name: string;
  role: PlayerRole;
  color: string;
};

export type ViewportPayload = {
  playerId: string;
  position: { x: number; y: number };
  scale: number;
  width: number;
  height: number;
};
