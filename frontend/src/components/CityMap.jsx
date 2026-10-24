// SVG city grid with pins. Clicking places the search center; pins map
// listing lat/lng into the viewport with a mini-card on hover.
const PUNE = { minLat: 18.44, maxLat: 18.62, minLng: 73.74, maxLng: 73.96 };

function project(lat, lng, W, H) {
  const x = ((lng - PUNE.minLng) / (PUNE.maxLng - PUNE.minLng)) * W;
  const y = (1 - (lat - PUNE.minLat) / (PUNE.maxLat - PUNE.minLat)) * H;
  return { x, y };
}

export default function CityMap({ listings, center, radiusKm, onPick, hovered, setHovered }) {
  const W = 600, H = 440;
  const c = center ? project(center.lat, center.lng, W, H) : null;
  const rPx = center && radiusKm ? (radiusKm / ((PUNE.maxLng - PUNE.minLng) * 111)) * W : 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl border border-blue-soft bg-white" onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * W;
      const y = ((e.clientY - rect.top) / rect.height) * H;
      const lng = PUNE.minLng + (x / W) * (PUNE.maxLng - PUNE.minLng);
      const lat = PUNE.minLat + (1 - y / H) * (PUNE.maxLat - PUNE.minLat);
      onPick({ lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) });
    }}>
      {/* grid */}
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2={H} stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 55} x2={W} y2={i * 55} stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {/* roads vibe */}
      <path d={`M0,${H * 0.4} Q ${W * 0.3},${H * 0.3} ${W * 0.55},${H * 0.5} T ${W},${H * 0.45}`} stroke="#cbd5e1" strokeWidth="10" fill="none" opacity="0.6" />
      <path d={`M${W * 0.2},0 Q ${W * 0.3},${H * 0.5} ${W * 0.25},${H}`} stroke="#cbd5e1" strokeWidth="8" fill="none" opacity="0.6" />
      {/* area labels */}
      {[['KOTHRUD', 120, 260], ['BANER', 170, 120], ['AUNDH', 190, 190], ['VIMAN NAGAR', 470, 170], ['HADAPSAR', 470, 320], ['KARVE NAGAR', 160, 330]].map(([label, x, y]) => (
        <text key={label} x={x} y={y} fontSize="11" fill="#94a3b8" fontWeight="600" letterSpacing="2">{label}</text>
      ))}
      {/* radius circle */}
      {c && rPx > 0 && <circle cx={c.x} cy={c.y} r={rPx} fill="rgba(37,99,235,0.08)" stroke="#2563eb" strokeDasharray="6 4" strokeWidth="2" />}
      {c && <circle cx={c.x} cy={c.y} r="7" fill="#2563eb" stroke="white" strokeWidth="3" />}
      {/* listing pins */}
      {listings?.map((l) => {
        const p = project(l.lat, l.lng, W, H);
        return (
          <g key={l._id} onMouseEnter={() => setHovered(l)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); window.location.assign(`/listings/${l._id}`); }}>
            <circle cx={p.x} cy={p.y - 14} r="10" fill="#2563eb" />
            <path d={`M${p.x},${p.y - 4} l -5,-8 a10,10 0 0,1 10,0 z`} fill="#2563eb" />
            <circle cx={p.x} cy={p.y - 14} r="4" fill="white" />
          </g>
        );
      })}
      {hovered && (() => {
        const p = project(hovered.lat, hovered.lng, W, H);
        return (
          <g>
            <rect x={p.x - 90} y={p.y - 70} width="180" height="44" rx="8" fill="#0f172a" opacity="0.92" />
            <text x={p.x - 80} y={p.y - 52} fontSize="12" fill="white" fontWeight="600">{hovered.title.slice(0, 26)}</text>
            <text x={p.x - 80} y={p.y - 36} fontSize="12" fill="#7dd3fc" fontWeight="700">₹{hovered.rent.toLocaleString('en-IN')}/mo · {hovered.distanceKm?.toFixed(1)}km</text>
          </g>
        );
      })()}
    </svg>
  );
}
