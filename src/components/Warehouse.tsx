import { useEffect, useId, useRef, useState } from 'react';
import './Warehouse.css';

export interface WarehouseLabels {
  racks: string;
  flow: string;
  zones: string;
  play: string;
  pause: string;
  reset: string;
  title: string;
  concept: string;
  select: string;
  selected: string;
  capacity: string;
  utilization: string;
  receiving: string;
  storage: string;
  dispatch: string;
  flowHelp: string;
  rackHelp: string;
  zoneHelp: string;
  rack: string;
  pallets: string;
  simulation: string;
}

interface WarehouseProps {
  compact?: boolean;
  labels: WarehouseLabels;
}

const project = (x: number, y: number, z = 0): [number, number] => [400 + (x - y) * 1.2, 99 + (x + y) * 0.53 - z];
const point = (x: number, y: number, z = 0) => project(x, y, z).join(',');
const polygon = (points: [number, number, number?][]) => points.map(([x, y, z]) => point(x, y, z)).join(' ');
const rackPositions = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, x: 32 + (i % 4) * 53, y: 45 + Math.floor(i / 4) * 60, load: 3 + [0, 1, 2].filter((level) => (i + 1 + level) % 4 !== 0).length }));

function Box({ x, y, z, width = 12, depth = 14, height = 13, muted = false }: { x: number; y: number; z: number; width?: number; depth?: number; height?: number; muted?: boolean }) {
  return <g className={muted ? 'warehouse-box warehouse-box-muted' : 'warehouse-box'}>
    <polygon className="warehouse-box-top" points={polygon([[x, y, z + height], [x + width, y, z + height], [x + width, y + depth, z + height], [x, y + depth, z + height]])} />
    <polygon className="warehouse-box-left" points={polygon([[x, y, z], [x, y + depth, z], [x, y + depth, z + height], [x, y, z + height]])} />
    <polygon className="warehouse-box-right" points={polygon([[x, y + depth, z], [x + width, y + depth, z], [x + width, y + depth, z + height], [x, y + depth, z + height]])} />
  </g>;
}

function Rack({ id, x, y, active, interactive, labels, onSelect }: { id: number; x: number; y: number; active: boolean; interactive: boolean; labels: WarehouseLabels; onSelect: () => void }) {
  return <g className={`warehouse-rack ${active ? 'is-selected' : ''}`} role={interactive ? 'button' : undefined} tabIndex={interactive ? 0 : undefined} aria-label={interactive ? `${labels.rack} ${String(id).padStart(2, '0')}` : undefined} aria-pressed={interactive ? active : undefined} onClick={interactive ? onSelect : undefined} onKeyDown={interactive ? (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(); } } : undefined}>
    <polygon className="warehouse-rack-hit" points={polygon([[x - 4, y - 3, 0], [x + 43, y - 3, 0], [x + 43, y + 25, 0], [x - 4, y + 25, 0]])} />
    <polygon className="warehouse-rack-back" points={polygon([[x, y, 0], [x + 39, y, 0], [x + 39, y, 67], [x, y, 67]])} />
    {[5, 28, 51].map((z, level) => <g key={z}>
      <polygon className="warehouse-shelf" points={polygon([[x, y, z], [x + 39, y, z], [x + 39, y + 21, z], [x, y + 21, z]])} />
      <Box x={x + 3} y={y + 3} z={z + 1} muted={(id + level) % 3 === 0} />
      {(id + level) % 4 !== 0 && <Box x={x + 22} y={y + 3} z={z + 1} muted={(id + level) % 2 === 0} />}
      <polyline className="warehouse-beam" points={polygon([[x, y + 21, z], [x + 39, y + 21, z], [x + 39, y, z]])} />
    </g>)}
    {[0, 39].flatMap((dx) => [0, 21].map((dy) => <line key={`${dx}-${dy}`} className="warehouse-post" x1={project(x + dx, y + dy)[0]} y1={project(x + dx, y + dy)[1]} x2={project(x + dx, y + dy, 69)[0]} y2={project(x + dx, y + dy, 69)[1]} />))}
    {[0, 39].map((dx) => <polyline key={dx} className="warehouse-brace" points={polygon([[x + dx, y, 5], [x + dx, y + 21, 28], [x + dx, y, 51], [x + dx, y + 21, 68]])} />)}
    <polyline className="warehouse-top-rail" points={polygon([[x, y + 21, 69], [x + 39, y + 21, 69], [x + 39, y, 69], [x, y, 69], [x, y + 21, 69]])} />
    <text className="warehouse-rack-number" x={project(x + 19, y + 22, 32)[0]} y={project(x + 19, y + 22, 32)[1]} textAnchor="middle">{String(id).padStart(2, '0')}</text>
  </g>;
}

export default function Warehouse({ compact = false, labels }: WarehouseProps) {
  const [showRacks, setShowRacks] = useState(true);
  const [showFlow, setShowFlow] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [selected, setSelected] = useState(6);
  const [reducedMotion, setReducedMotion] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const unique = useId().replace(/:/g, '');
  const rack = rackPositions.find((item) => item.id === selected)!;
  const routePoints: [number, number][] = [[5, 83], [247, 83], [247, 143], [5, 143], [5, 210], [275, 210]];
  const route = routePoints.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${point(x, y, 3)}`).join(' ');

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (!playing || reducedMotion) svg.pauseAnimations();
    else svg.unpauseAnimations();
  }, [playing, reducedMotion, showFlow]);

  function reset() {
    setShowRacks(true);
    setShowFlow(true);
    setShowZones(true);
    setSelected(6);
    setPlaying(true);
    svgRef.current?.setCurrentTime(0);
  }

  return <div className={`warehouse ${compact ? 'warehouse-compact' : ''}`}>
    {!compact && <div className="warehouse-toolbar" role="group" aria-label={labels.title}>
      <div className="warehouse-layers">
        <button type="button" aria-pressed={showRacks} onClick={() => setShowRacks(!showRacks)}><span className="warehouse-icon">▤</span>{labels.racks}</button>
        <button type="button" aria-pressed={showFlow} onClick={() => setShowFlow(!showFlow)}><span className="warehouse-icon">↗</span>{labels.flow}</button>
        <button type="button" aria-pressed={showZones} onClick={() => setShowZones(!showZones)}><span className="warehouse-icon">◇</span>{labels.zones}</button>
      </div>
      <div className="warehouse-playback">
        <button type="button" aria-label={playing ? labels.pause : labels.play} title={playing ? labels.pause : labels.play} aria-pressed={playing} onClick={() => setPlaying(!playing)}>{playing ? 'Ⅱ' : '▶'}</button>
        <button type="button" aria-label={labels.reset} title={labels.reset} onClick={reset}>↺</button>
      </div>
    </div>}
    <div className="warehouse-stage">
      <svg ref={svgRef} viewBox="50 5 740 440" className="warehouse-svg" role={compact ? 'img' : 'group'} aria-label={labels.title}>
        <title>{labels.title}</title>
        <desc>{labels.concept}</desc>
        <defs>
          <linearGradient id={`${unique}-floor`} x1="0" y1="0" x2="0.8" y2="1"><stop stopColor="#152b3b" /><stop offset="1" stopColor="#0d1c29" /></linearGradient>
          <linearGradient id={`${unique}-edge`}><stop stopColor="#00c8ff" stopOpacity="0.1" /><stop offset=".5" stopColor="#00c8ff" stopOpacity=".8" /><stop offset="1" stopColor="#00c8ff" stopOpacity=".1" /></linearGradient>
        </defs>
        <g className="warehouse-floor">
          <polygon points={polygon([[-18, -12], [287, -12], [287, 234], [-18, 234]])} fill={`url(#${unique}-floor)`} />
          <polyline points={polygon([[-18, -12], [-18, 234], [287, 234], [287, -12], [-18, -12]])} stroke={`url(#${unique}-edge)`} fill="none" strokeWidth="1.3" />
          {Array.from({ length: 16 }, (_, i) => <line key={`x-${i}`} x1={project(i * 20 - 18, -12)[0]} y1={project(i * 20 - 18, -12)[1]} x2={project(i * 20 - 18, 234)[0]} y2={project(i * 20 - 18, 234)[1]} />)}
          {Array.from({ length: 13 }, (_, i) => <line key={`y-${i}`} x1={project(-18, i * 20 - 12)[0]} y1={project(-18, i * 20 - 12)[1]} x2={project(287, i * 20 - 12)[0]} y2={project(287, i * 20 - 12)[1]} />)}
        </g>
        {showZones && <g className="warehouse-zones">
          <polygon className="warehouse-zone-receiving" points={polygon([[-12, 9], [14, 9], [14, 190], [-12, 190]])} />
          <polygon className="warehouse-zone-storage" points={polygon([[23, 34], [237, 34], [237, 194], [23, 194]])} />
          <polygon className="warehouse-zone-dispatch" points={polygon([[254, 15], [279, 15], [279, 190], [254, 190]])} />
        </g>}
        <g className="warehouse-building-lines" aria-hidden="true">
          <polyline points={polygon([[-18, -12, 88], [287, -12, 88], [287, -12], [287, 234]])} />
          <polyline points={polygon([[-18, -12], [-18, -12, 88], [-18, 234, 88], [-18, 234]])} />
          {[0, 80, 160, 240].map((x) => <line key={x} x1={project(x, -12)[0]} y1={project(x, -12)[1]} x2={project(x, -12, 88)[0]} y2={project(x, -12, 88)[1]} />)}
        </g>
        {showRacks && [...rackPositions].sort((a, b) => a.x + a.y - b.x - b.y).map((item) => <Rack key={item.id} {...item} active={!compact && selected === item.id} interactive={!compact} labels={labels} onSelect={() => setSelected(item.id)} />)}
        {showFlow && <g className="warehouse-flow">
          <path className="warehouse-route-under" d={route} />
          <path className="warehouse-route" d={route} />
          {[0, 1, 2].map((index) => <g className="warehouse-tugger" key={index}>
            <animateMotion dur="16s" begin={`${index * -5.33}s`} repeatCount="indefinite" path={route} />
            <path d="M-9 0 0-4 9 0 0 4Z" fill="#00c8ff" />
            <path d="M-9 0 0 4 0-2-9-6Z" fill="#187a9a" />
            <path d="M0 4 9 0 9-6 0-2Z" fill="#00a6d5" />
            <path d="M-9-6 0-10 9-6 0-2Z" fill="#80e7ff" />
            <path d="M-4-6 0-8 4-6 0-4Z" fill="#152737" />
          </g>)}
        </g>}
        <g className="warehouse-dimension" aria-hidden="true">
          <line x1={project(-18, 252)[0]} y1={project(-18, 252)[1]} x2={project(287, 252)[0]} y2={project(287, 252)[1]} />
          {[-18, 287].map((x) => <line key={x} x1={project(x, 246)[0]} y1={project(x, 246)[1]} x2={project(x, 258)[0]} y2={project(x, 258)[1]} />)}
          <text x={project(137, 263)[0]} y={project(137, 263)[1]} transform={`rotate(23.8 ${project(137, 263)[0]} ${project(137, 263)[1]})`} textAnchor="middle">30.5 m</text>
        </g>
      </svg>
      {compact && <div className="warehouse-hero-tag"><span className="warehouse-status-dot" />{labels.simulation}<span>01—12</span></div>}
    </div>
    {!compact && <>
      <div className="warehouse-bottom">
        <div className="warehouse-legend" aria-label={labels.zones}>
          <span><i className="warehouse-swatch receiving" />{labels.receiving}</span>
          <span><i className="warehouse-swatch storage" />{labels.storage}</span>
          <span><i className="warehouse-swatch dispatch" />{labels.dispatch}</span>
        </div>
        <span className="warehouse-select-hint">↖ {labels.select}</span>
      </div>
      <div className="warehouse-inspector" aria-live="polite" aria-atomic="true">
        <div className="warehouse-inspector-title"><span>{labels.selected}</span><strong>{labels.rack} {String(selected).padStart(2, '0')}</strong></div>
        <div><span>{labels.capacity}</span><strong>6 <small>{labels.pallets}</small></strong></div>
        <div><span>{labels.utilization}</span><strong>{Math.round(rack.load / 6 * 100)}<small>%</small></strong></div>
        <p>{!showRacks ? labels.rackHelp : !showZones ? labels.zoneHelp : labels.flowHelp}</p>
      </div>
      <p className="warehouse-disclaimer">{labels.concept}</p>
    </>}
  </div>;
}

