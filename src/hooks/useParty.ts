import { useEffect, useState } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { Player } from '../types';

export function useParty(isReady: boolean) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!isReady) return;

    let active = true;

    async function loadPlayers() {
      const rawPlayers = await OBR.party.getPlayers();
      if (!active) return;
      setPlayers(
        rawPlayers.map((entry) => ({
          id: entry.id,
          name: entry.name ?? 'Unknown',
          role: entry.role === 'GM' ? 'GM' : 'PLAYER',
          color: entry.color ?? (entry.role === 'GM' ? '#5c6bc0' : '#2a7f62')
        }))
      );
    }

    const removeListener = OBR.party.onChange((updated) => {
      if (!active) return;
      setPlayers(
        updated.map((entry) => ({
          id: entry.id,
          name: entry.name ?? 'Unknown',
          role: entry.role === 'GM' ? 'GM' : 'PLAYER',
          color: entry.color ?? (entry.role === 'GM' ? '#5c6bc0' : '#2a7f62')
        }))
      );
    });

    loadPlayers();

    return () => {
      active = false;
      removeListener?.();
    };
  }, [isReady]);

  return { players };
}
