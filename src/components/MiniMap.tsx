import { ViewportPayload } from '../types';

interface MiniMapProps {
  selfViewport: ViewportPayload | null;
  playerViewports: ViewportPayload[];
}

const SCENE_WIDTH = 1800;
const SCENE_HEIGHT = 1200;
const MAP_WIDTH = 280;
const MAP_HEIGHT = 180;

function toSvgX(x: number) {
  return (x / SCENE_WIDTH) * MAP_WIDTH;
}

function toSvgY(y: number) {
  return (y / SCENE_HEIGHT) * MAP_HEIGHT;
}

export function MiniMap({ selfViewport, playerViewports }: MiniMapProps) {
  return (
    <section className="mini-map">
      <div className="mini-map-header">
        <h2>Mini-Map</h2>
        <span>Viewport positions</span>
      </div>
      <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="mini-map-canvas">
        <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} rx="12" fill="#1d2330" />
        <g opacity="0.3">
          <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} fill="none" stroke="#39404f" strokeWidth="1" />
        </g>

        {playerViewports.map((viewport) => {
          const width = Math.max(20, MAP_WIDTH / Math.max(1, viewport.scale * 4));
          const height = Math.max(14, MAP_HEIGHT / Math.max(1, viewport.scale * 4));
          return (
            <rect
              key={viewport.playerId}
              x={Math.min(MAP_WIDTH - width, Math.max(0, toSvgX(viewport.position.x)))}
              y={Math.min(MAP_HEIGHT - height, Math.max(0, toSvgY(viewport.position.y)))}
              width={width}
              height={height}
              rx="4"
              fill="#7c4dff"
              fillOpacity="0.45"
              stroke="#d6bbff"
              strokeWidth="1"
            />
          );
        })}

        {selfViewport && (
          <rect
            x={Math.min(MAP_WIDTH - 24, Math.max(0, toSvgX(selfViewport.position.x)))}
            y={Math.min(MAP_HEIGHT - 16, Math.max(0, toSvgY(selfViewport.position.y)))}
            width={24}
            height={16}
            rx="3"
            fill="#ffca28"
            stroke="#fff8c4"
            strokeWidth="1"
          />
        )}
      </svg>
    </section>
  );
}
