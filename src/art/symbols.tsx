import { useId } from 'react';
import type { ReactElement } from 'react';

/**
 * KYMMIE CASH — slot machine symbol art.
 *
 * All symbols are pure inline SVG (no external assets, no network requests),
 * safe for offline / static hosting. Every gradient, clip & filter id is
 * prefixed with a per-instance unique id (React `useId()`) so that any number
 * of duplicated instances can render at once without id collisions — which
 * would otherwise be invalid HTML and cause `url(#id)` references to resolve
 * to the wrong (first-matching) definition document-wide.
 */

export type SymbolId =
  | 'seven'
  | 'wild'
  | 'scatter'
  | 'coin'
  | 'orb'
  | 'cash'
  | 'diamond'
  | 'bell'
  | 'bar'
  | 'cherry'
  | 'mystery';

export const SYMBOL_IDS: SymbolId[] = [
  'seven',
  'wild',
  'scatter',
  'coin',
  'orb',
  'cash',
  'diamond',
  'bell',
  'bar',
  'cherry',
  'mystery',
];

interface SymbolIconProps {
  id: SymbolId;
  size?: number;
}

/* ------------------------------------------------------------------ */
/* Individual symbol renderers                                         */
/* ------------------------------------------------------------------ */

function Seven(uid: string): ReactElement {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-grad-seven-bg`} cx="50%" cy="34%" r="76%">
          <stop offset="0%" stopColor="#4a3690" />
          <stop offset="60%" stopColor="#2a1a5c" />
          <stop offset="100%" stopColor="#120826" />
        </radialGradient>
        <linearGradient id={`${uid}-grad-seven-gold`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#fff8db" />
          <stop offset="38%" stopColor="#ffdc5e" />
          <stop offset="70%" stopColor="#e0a11c" />
          <stop offset="100%" stopColor="#7a4d05" />
        </linearGradient>
        <linearGradient id={`${uid}-grad-seven-red`} x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#ff9a9a" />
          <stop offset="40%" stopColor="#ec2346" />
          <stop offset="78%" stopColor="#b00c2a" />
          <stop offset="100%" stopColor="#6e0418" />
        </linearGradient>
        <radialGradient id={`${uid}-grad-seven-spec`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${uid}-grad-seven-bg)`} stroke="#f5c542" strokeWidth="3" />
      <circle cx="50" cy="50" r="43" fill="none" stroke="#ffe98a" strokeWidth="0.8" opacity="0.4" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#7a5cc4" strokeWidth="1" opacity="0.5" />
      {/* soft drop shadow behind the numeral */}
      <path d="M29 27 H77 V40 L54 85 H35 L58 42 H29 Z" fill="#0a0418" opacity="0.4" />
      {/* gold outline 7 (offset behind) */}
      <path
        d="M27 24 H75 V37 L52 82 H33 L56 39 H27 Z"
        fill={`url(#${uid}-grad-seven-gold)`}
        stroke="#7a4d05"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* red inner 7 */}
      <path
        d="M32 29 H70 V38 L48 78 H37 L59 34 H32 Z"
        fill={`url(#${uid}-grad-seven-red)`}
        stroke="#5c0416"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* bevel edge sheen along the top bar */}
      <path d="M33 30 H68 L66 34 H35 Z" fill="#ffffff" opacity="0.4" />
      {/* glossy specular highlight */}
      <path d="M35 31 H64 L60 39 H44 L52 37 H36 Z" fill="#ffffff" opacity="0.3" />
      <ellipse cx="44" cy="52" rx="5" ry="12" fill={`url(#${uid}-grad-seven-spec)`} opacity="0.35" transform="rotate(24 44 52)" />
    </>
  );
}

function Wild(uid: string): ReactElement {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-grad-wild-bg`} cx="50%" cy="36%" r="76%">
          <stop offset="0%" stopColor="#5e2a96" />
          <stop offset="60%" stopColor="#341560" />
          <stop offset="100%" stopColor="#160630" />
        </radialGradient>
        <linearGradient id={`${uid}-grad-wild-gem`} x1="0.1" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#f0ffff" />
          <stop offset="35%" stopColor="#78dcee" />
          <stop offset="72%" stopColor="#2a8ec8" />
          <stop offset="100%" stopColor="#0f5088" />
        </linearGradient>
        <linearGradient id={`${uid}-grad-wild-ring`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#fff9e0" />
          <stop offset="40%" stopColor="#ffd45a" />
          <stop offset="72%" stopColor="#e0a11c" />
          <stop offset="100%" stopColor="#7a4d05" />
        </linearGradient>
        <radialGradient id={`${uid}-grad-wild-glow`} cx="50%" cy="46%" r="54%">
          <stop offset="0%" stopColor="#bfeeff" stopOpacity="0" />
          <stop offset="80%" stopColor="#7fd6ff" stopOpacity="0" />
          <stop offset="100%" stopColor="#7fd6ff" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${uid}-grad-wild-bg)`} stroke="#f5c542" strokeWidth="3" />
      <circle cx="50" cy="50" r="44" fill={`url(#${uid}-grad-wild-glow)`} />
      {/* sparkle rays */}
      <g opacity="0.75" fill="#ffe98a">
        <path d="M50 4 L54 26 L50 30 L46 26 Z" />
        <path d="M50 96 L54 74 L50 70 L46 74 Z" />
        <path d="M4 50 L26 54 L30 50 L26 46 Z" />
        <path d="M96 50 L74 54 L70 50 L74 46 Z" />
      </g>
      {/* gem badge */}
      <path
        d="M50 16 L74 40 L50 84 L26 40 Z"
        fill={`url(#${uid}-grad-wild-ring)`}
        stroke="#7a4d05"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M50 22 L68 40 L50 76 L32 40 Z"
        fill={`url(#${uid}-grad-wild-gem)`}
        stroke="#0c3f66"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* darker lower facets for depth */}
      <g opacity="0.4" fill="#0f5088">
        <polygon points="50,40 68,40 50,76" />
        <polygon points="32,40 41,40 50,76 50,52" />
      </g>
      {/* facet lines */}
      <g stroke="#eafcff" strokeWidth="1" opacity="0.6" fill="none">
        <path d="M32 40 H68" />
        <path d="M50 22 L50 76" />
        <path d="M41 31 L50 40 L59 31" />
      </g>
      <polygon points="41,31 50,40 32,40" fill="#ffffff" opacity="0.4" />
      <polygon points="44,28 50,28 50,38 47,38" fill="#ffffff" opacity="0.5" />
      {/* WILD text */}
      <text
        x="50"
        y="46"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif"
        fontWeight="900"
        fontSize="12"
        fill="#0a2f4d"
        stroke="#ffffff"
        strokeWidth="0.4"
      >
        WILD
      </text>
    </>
  );
}

/**
 * Scatter = the "Kymmie" free-spins symbol: a real photo cut out into a
 * circular gold disc. Landing 3+ awards the free-spins feature.
 * The photo lives at public/kymmie-scatter.png (served from the site root).
 */
function Scatter(uid: string): ReactElement {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-grad-scatter-bg`} cx="50%" cy="38%" r="72%">
          <stop offset="0%" stopColor="#3a2170" />
          <stop offset="100%" stopColor="#160a34" />
        </radialGradient>
        <linearGradient id={`${uid}-grad-scatter-ring`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff2b0" />
          <stop offset="45%" stopColor="#f3c33d" />
          <stop offset="100%" stopColor="#9a6a0a" />
        </linearGradient>
        <clipPath id={`${uid}-grad-scatter-clip`}>
          <circle cx="50" cy="44" r="34" />
        </clipPath>
      </defs>
      {/* backing disc */}
      <circle cx="50" cy="50" r="48" fill={`url(#${uid}-grad-scatter-bg)`} stroke="#f5c542" strokeWidth="2.5" />
      {/* photo cut into a circle */}
      <image
        href="/kymmie-scatter.png"
        x="16"
        y="10"
        width="68"
        height="68"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${uid}-grad-scatter-clip)`}
      />
      {/* gold ring around the photo */}
      <circle cx="50" cy="44" r="34" fill="none" stroke={`url(#${uid}-grad-scatter-ring)`} strokeWidth="4.5" />
      <circle cx="50" cy="44" r="36.5" fill="none" stroke="#7a4d05" strokeWidth="1" />
      <circle cx="50" cy="44" r="31" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.35" />
      {/* sparkles */}
      <path d="M20 20 l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6 Z" fill="#fff4c2" opacity="0.9" />
      <path d="M82 30 l1.2 2.6 2.6 1.2 -2.6 1.2 -1.2 2.6 -1.2 -2.6 -2.6 -1.2 2.6 -1.2 Z" fill="#fff4c2" opacity="0.85" />
      {/* FREE SPINS banner */}
      <rect x="12" y="80" width="76" height="16" rx="8" fill="#e0173a" stroke="#f5c542" strokeWidth="1.5" />
      <text
        x="50"
        y="91.5"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif"
        fontWeight="900"
        fontSize="9"
        fill="#fff4c2"
        letterSpacing="0.5"
      >
        FREE SPINS
      </text>
    </>
  );
}

/**
 * Coin = a Chinese gold ingot ("sycee" / yuanbao) — a shiny boat-shaped gold
 * bullion with a rounded base and raised, upturned ends, glossy gold gradients,
 * bevels and a small emblem, on a subtle dark tile. Deliberately NOT a round
 * coin: no "$", visually distinct from the circular money orbs.
 */
function Coin(uid: string): ReactElement {
  return (
    <>
      <defs>
        {/* subtle dark tile behind the ingot */}
        <radialGradient id={`${uid}-grad-coin-tile`} cx="50%" cy="38%" r="76%">
          <stop offset="0%" stopColor="#4a3690" />
          <stop offset="60%" stopColor="#2a1a5c" />
          <stop offset="100%" stopColor="#120826" />
        </radialGradient>
        {/* warm halo bloom behind the ingot */}
        <radialGradient id={`${uid}-grad-coin-glow`} cx="50%" cy="56%" r="52%">
          <stop offset="0%" stopColor="#ffe27a" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#ffb300" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffb300" stopOpacity="0" />
        </radialGradient>
        {/* main glossy gold body — light from upper-left */}
        <linearGradient id={`${uid}-grad-coin-body`} x1="0.15" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#fff8db" />
          <stop offset="34%" stopColor="#ffd857" />
          <stop offset="70%" stopColor="#e0a11c" />
          <stop offset="100%" stopColor="#8a5406" />
        </linearGradient>
        {/* bright top rim / lip of the ingot */}
        <linearGradient id={`${uid}-grad-coin-lip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff9e6" />
          <stop offset="52%" stopColor="#ffdc66" />
          <stop offset="100%" stopColor="#d8991a" />
        </linearGradient>
        {/* recessed inner well of the ingot (shadowed) */}
        <linearGradient id={`${uid}-grad-coin-well`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9a6a0c" />
          <stop offset="100%" stopColor="#c98f13" />
        </linearGradient>
        {/* small round emblem */}
        <radialGradient id={`${uid}-grad-coin-seal`} cx="40%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="55%" stopColor="#f0b52c" />
          <stop offset="100%" stopColor="#8a5406" />
        </radialGradient>
        {/* soft specular sheen */}
        <radialGradient id={`${uid}-grad-coin-spec`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* dark tile + warm halo */}
      <circle cx="50" cy="50" r="46" fill={`url(#${uid}-grad-coin-tile)`} stroke="#f5c542" strokeWidth="3" />
      <circle cx="50" cy="50" r="43" fill="none" stroke="#ffe98a" strokeWidth="0.8" opacity="0.35" />
      <ellipse cx="50" cy="62" rx="40" ry="30" fill={`url(#${uid}-grad-coin-glow)`} />

      {/* ground shadow beneath the ingot */}
      <ellipse cx="50" cy="76" rx="33" ry="7" fill="#0a0212" opacity="0.4" />

      {/* INGOT BODY — boat / yuanbao silhouette: rounded base, upturned raised ends */}
      <path
        d="M18 74
           C18 66 24 60 34 58
           C30 50 33 42 40 40
           C43 45 45 50 50 50
           C55 50 57 45 60 40
           C67 42 70 50 66 58
           C76 60 82 66 82 74
           C82 79 68 82 50 82
           C32 82 18 79 18 74 Z"
        fill={`url(#${uid}-grad-coin-body)`}
        stroke="#5c3403"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* raised upturned end knobs (left + right) with bright lips */}
      <path d="M34 58 C30 50 33 42 40 40 C41 47 40 53 42 58 C39 58 36 58 34 58 Z" fill={`url(#${uid}-grad-coin-lip)`} stroke="#7a4d05" strokeWidth="1" strokeLinejoin="round" />
      <path d="M66 58 C70 50 67 42 60 40 C59 47 60 53 58 58 C61 58 64 58 66 58 Z" fill={`url(#${uid}-grad-coin-lip)`} stroke="#7a4d05" strokeWidth="1" strokeLinejoin="round" />

      {/* central saddle / dip between the raised ends */}
      <path d="M42 58 C45 50 48 49 50 49 C52 49 55 50 58 58 C55 60 45 60 42 58 Z" fill={`url(#${uid}-grad-coin-well)`} opacity="0.9" />

      {/* bright top edge highlight running along the front lip */}
      <path
        d="M20 71 C30 66 70 66 80 71"
        fill="none"
        stroke="#fff3c4"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* darker crease under the front lip for a bevel */}
      <path
        d="M22 74 C32 79 68 79 78 74"
        fill="none"
        stroke="#5c3403"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* small round emblem stamped on the belly */}
      <circle cx="50" cy="71" r="7.5" fill={`url(#${uid}-grad-coin-seal)`} stroke="#7a4d05" strokeWidth="1.5" />
      <circle cx="50" cy="71" r="5" fill="none" stroke="#7a4d05" strokeWidth="1" opacity="0.55" />
      {/* square hole motif (Chinese cash) inside the emblem */}
      <rect x="47.5" y="68.5" width="5" height="5" rx="0.6" fill="#7a4d05" opacity="0.7" />

      {/* glossy specular highlights */}
      <ellipse cx="40" cy="65" rx="13" ry="4.5" fill={`url(#${uid}-grad-coin-spec)`} transform="rotate(-8 40 65)" opacity="0.8" />
      <ellipse cx="44" cy="45" rx="4" ry="2.4" fill="#ffffff" opacity="0.6" transform="rotate(-30 44 45)" />
      <circle cx="70" cy="74" r="2.6" fill="#ffffff" opacity="0.45" />

      {/* sparkle */}
      <path d="M76 42 l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2 -2.8 -2.8 -1.2 2.8 -1.2 Z" fill="#fff4c2" opacity="0.85" />
    </>
  );
}

/**
 * Orb = the "cash on reel" money token (Dragon-Link / Hold-&-Spin style),
 * styled for KYMMIE CASH as a FIRE-RINGED CASH COIN in the spirit of
 * "Ultimate Golden Dragon Inferno": a molten-gold coin wreathed in a ring of
 * orange/red/yellow flame tongues, with a clean, fairly flat, high-contrast
 * darker-gold inner disc (r≈30) in the centre so a big value number overlaid
 * by other code stays easily readable.
 * NOTE: intentionally draws NO number/text — the centre is left readable.
 */
function Orb(uid: string): ReactElement {
  // Twelve flame tongues arranged around the rim. Each tongue is a teardrop
  // flame pointing outward; drawn in two layers (outer red base + inner
  // yellow core) and rotated into place around the centre (50,50).
  const flameAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  return (
    <>
      <defs>
        {/* hot outer glow bloom — radiant orange/gold halo */}
        <radialGradient id={`${uid}-grad-orb-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffcf40" stopOpacity="0" />
          <stop offset="58%" stopColor="#ff8a1e" stopOpacity="0" />
          <stop offset="74%" stopColor="#ff7a15" stopOpacity="0.55" />
          <stop offset="86%" stopColor="#e0431a" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#7a1408" stopOpacity="0" />
        </radialGradient>
        {/* flame body gradient — molten yellow → orange → deep red (root→tip) */}
        <linearGradient id={`${uid}-grad-orb-flame`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#fff2b0" />
          <stop offset="35%" stopColor="#ff9a1e" />
          <stop offset="72%" stopColor="#e0431a" />
          <stop offset="100%" stopColor="#7a1408" />
        </linearGradient>
        {/* bright inner flame core */}
        <linearGradient id={`${uid}-grad-orb-flame-core`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#fffbe6" />
          <stop offset="55%" stopColor="#ffd24a" />
          <stop offset="100%" stopColor="#ff8a1e" stopOpacity="0.2" />
        </linearGradient>
        {/* metallic molten-gold rim — spherical bevel, light from upper-left */}
        <linearGradient id={`${uid}-grad-orb-rim`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#fff6cf" />
          <stop offset="28%" stopColor="#ffd24a" />
          <stop offset="60%" stopColor="#e0a01c" />
          <stop offset="100%" stopColor="#7a4405" />
        </linearGradient>
        {/* bright molten-gold coin body */}
        <radialGradient id={`${uid}-grad-orb-body`} cx="40%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#fff6d6" />
          <stop offset="48%" stopColor="#ffcb3d" />
          <stop offset="100%" stopColor="#c07e0d" />
        </radialGradient>
        {/* clean, fairly flat darker-gold inner value disc (dark numerals read here) */}
        <radialGradient id={`${uid}-grad-orb-core`} cx="46%" cy="40%" r="66%">
          <stop offset="0%" stopColor="#f0b84a" />
          <stop offset="70%" stopColor="#d99a1e" />
          <stop offset="100%" stopColor="#b97e12" />
        </radialGradient>
        {/* soft specular sheen (white → transparent) */}
        <radialGradient id={`${uid}-grad-orb-sheen`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* hot outer glow */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-grad-orb-glow)`} />

      {/* RING OF FLAMES — teardrop tongues licking around the rim */}
      <g>
        {flameAngles.map((a) => (
          <g key={a} transform={`rotate(${a} 50 50)`}>
            {/* outer flame tongue (root at rim ~r34, tip out near r49) */}
            <path
              d="M50 66 C41 60 42 51 46 44 C47 40 46 35 50 31 C54 35 53 40 54 44 C58 51 59 60 50 66 Z"
              fill={`url(#${uid}-grad-orb-flame)`}
              opacity="0.96"
            />
            {/* bright inner core of the flame */}
            <path
              d="M50 63 C45 59 45 52 48 47 C49 43 49 40 50 37 C51 40 51 43 52 47 C55 52 55 59 50 63 Z"
              fill={`url(#${uid}-grad-orb-flame-core)`}
              opacity="0.9"
            />
          </g>
        ))}
      </g>

      {/* dark outer bevel edge for crisp separation from the flames */}
      <circle cx="50" cy="50" r="37" fill="#5c3403" />
      {/* metallic molten-gold rim */}
      <circle cx="50" cy="50" r="36" fill={`url(#${uid}-grad-orb-rim)`} />
      {/* upper-left bevel highlight arc on the rim */}
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke={`url(#${uid}-grad-orb-sheen)`}
        strokeWidth="3"
        opacity="0.9"
        strokeLinecap="round"
        strokeDasharray="75 140"
        strokeDashoffset="40"
      />
      {/* bright molten-gold coin body */}
      <circle cx="50" cy="50" r="33" fill={`url(#${uid}-grad-orb-body)`} stroke="#8a5406" strokeWidth="1.5" />
      {/* thin dark shadow line where the body meets the flat inner disc */}
      <circle cx="50" cy="50" r="30.6" fill="none" stroke="#8a5406" strokeWidth="2" opacity="0.55" />

      {/* clean, flat darker-gold inner value disc — NO text (value overlaid elsewhere) */}
      <circle cx="50" cy="50" r="30" fill={`url(#${uid}-grad-orb-core)`} />
      {/* crisp golden keyline framing the number area */}
      <circle cx="50" cy="50" r="29.2" fill="none" stroke="#fff0b8" strokeWidth="0.8" opacity="0.5" />

      {/* small rim glints — kept off dead-center so numerals stay clear */}
      <ellipse cx="34" cy="30" rx="9" ry="4.5" fill={`url(#${uid}-grad-orb-sheen)`} transform="rotate(-32 34 30)" opacity="0.8" />
      <circle cx="66" cy="68" r="2.4" fill="#ffffff" opacity="0.4" />
    </>
  );
}

function Cash(uid: string): ReactElement {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-grad-cash-bg`} cx="50%" cy="36%" r="76%">
          <stop offset="0%" stopColor="#4a3690" />
          <stop offset="60%" stopColor="#2a1a5c" />
          <stop offset="100%" stopColor="#120826" />
        </radialGradient>
        <linearGradient id={`${uid}-grad-cash-note`} x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#a8f5bd" />
          <stop offset="45%" stopColor="#43c06a" />
          <stop offset="100%" stopColor="#177a37" />
        </linearGradient>
        <linearGradient id={`${uid}-grad-cash-note2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#54c274" />
          <stop offset="100%" stopColor="#2a8f4c" />
        </linearGradient>
        <linearGradient id={`${uid}-grad-cash-note3`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3fa862" />
          <stop offset="100%" stopColor="#227a40" />
        </linearGradient>
        <linearGradient id={`${uid}-grad-cash-band`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff4c2" />
          <stop offset="50%" stopColor="#f5c542" />
          <stop offset="100%" stopColor="#e0173a" />
        </linearGradient>
        <radialGradient id={`${uid}-grad-cash-seal`} cx="40%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c8ecd4" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${uid}-grad-cash-bg)`} stroke="#f5c542" strokeWidth="3" />
      <circle cx="50" cy="50" r="43" fill="none" stroke="#ffe98a" strokeWidth="0.8" opacity="0.35" />
      {/* stacked notes with soft shadows */}
      <g stroke="#0e4a23" strokeWidth="1.5">
        <rect x="18" y="60" width="64" height="18" rx="3" fill={`url(#${uid}-grad-cash-note3)`} />
        <rect x="20" y="52" width="60" height="18" rx="3" fill={`url(#${uid}-grad-cash-note2)`} />
        <rect x="19" y="44" width="62" height="18" rx="3" fill={`url(#${uid}-grad-cash-note)`} />
      </g>
      {/* top note detail */}
      <circle cx="50" cy="53" r="7" fill={`url(#${uid}-grad-cash-seal)`} stroke="#12572a" strokeWidth="1" />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif"
        fontWeight="900"
        fontSize="10"
        fill="#1f7a3c"
      >
        $
      </text>
      <rect x="24" y="47" width="8" height="12" rx="1.5" fill="none" stroke="#d9f5e2" strokeWidth="1" opacity="0.8" />
      <rect x="68" y="47" width="8" height="12" rx="1.5" fill="none" stroke="#d9f5e2" strokeWidth="1" opacity="0.8" />
      {/* cash band */}
      <rect x="40" y="40" width="20" height="42" rx="2" fill={`url(#${uid}-grad-cash-band)`} opacity="0.92" stroke="#7a4d05" strokeWidth="1" />
      <rect x="41" y="40" width="3" height="42" rx="1.5" fill="#ffffff" opacity="0.4" />
      {/* glossy top highlight */}
      <rect x="19" y="44" width="62" height="5" rx="2.5" fill="#ffffff" opacity="0.28" />
    </>
  );
}

function Diamond(uid: string): ReactElement {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-grad-diamond-bg`} cx="50%" cy="36%" r="76%">
          <stop offset="0%" stopColor="#2e4c9a" />
          <stop offset="60%" stopColor="#152a63" />
          <stop offset="100%" stopColor="#070c26" />
        </radialGradient>
        <linearGradient id={`${uid}-grad-diamond-top`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#d6f4ff" />
          <stop offset="100%" stopColor="#8fd4ec" />
        </linearGradient>
        <linearGradient id={`${uid}-grad-diamond-body`} x1="0.1" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#e2f8ff" />
          <stop offset="42%" stopColor="#5cc0f0" />
          <stop offset="75%" stopColor="#2a86c4" />
          <stop offset="100%" stopColor="#0d3f6e" />
        </linearGradient>
        <radialGradient id={`${uid}-grad-diamond-glow`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#bfeeff" stopOpacity="0" />
          <stop offset="78%" stopColor="#7fd6ff" stopOpacity="0" />
          <stop offset="100%" stopColor="#7fd6ff" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${uid}-grad-diamond-bg)`} stroke="#7fd6ff" strokeWidth="3" />
      <circle cx="50" cy="50" r="44" fill={`url(#${uid}-grad-diamond-glow)`} />
      {/* crown (table) */}
      <path
        d="M26 40 L38 26 H62 L74 40 Z"
        fill={`url(#${uid}-grad-diamond-top)`}
        stroke="#0c3f66"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* pavilion (body) */}
      <path
        d="M26 40 H74 L50 84 Z"
        fill={`url(#${uid}-grad-diamond-body)`}
        stroke="#0c3f66"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* darker facets for depth */}
      <g opacity="0.5">
        <polygon points="26,40 44,40 38,55" fill="#0d3f6e" />
        <polygon points="56,40 74,40 62,55" fill="#0d3f6e" />
        <polygon points="44,40 56,40 50,84" fill="#1a5a94" opacity="0.6" />
      </g>
      {/* facet lines */}
      <g stroke="#eafcff" strokeWidth="1" opacity="0.65" fill="none">
        <path d="M38 26 L44 40 L50 84" />
        <path d="M62 26 L56 40 L50 84" />
        <path d="M26 40 L44 40 L38 55" />
        <path d="M74 40 L56 40 L62 55" />
        <path d="M44 40 H56" />
      </g>
      {/* table highlight */}
      <polygon points="38,26 62,26 56,40 44,40" fill="#ffffff" opacity="0.45" />
      <polygon points="40,28 50,28 47,38 43,38" fill="#ffffff" opacity="0.6" />
      {/* sparkles */}
      <path d="M68 24 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" fill="#ffffff" opacity="0.9" />
      <path d="M28 58 l1.2 3.6 3.6 1.2 -3.6 1.2 -1.2 3.6 -1.2 -3.6 -3.6 -1.2 3.6 -1.2 z" fill="#ffffff" opacity="0.7" />
    </>
  );
}

function Bell(uid: string): ReactElement {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-grad-bell-bg`} cx="50%" cy="36%" r="76%">
          <stop offset="0%" stopColor="#4a3690" />
          <stop offset="60%" stopColor="#2a1a5c" />
          <stop offset="100%" stopColor="#120826" />
        </radialGradient>
        <linearGradient id={`${uid}-grad-bell-body`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#fff9e0" />
          <stop offset="38%" stopColor="#ffd45a" />
          <stop offset="72%" stopColor="#e0a11c" />
          <stop offset="100%" stopColor="#7a4d05" />
        </linearGradient>
        <radialGradient id={`${uid}-grad-bell-knob`} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#fff9e0" />
          <stop offset="55%" stopColor="#f2b12a" />
          <stop offset="100%" stopColor="#8a5406" />
        </radialGradient>
        <radialGradient id={`${uid}-grad-bell-glow`} cx="50%" cy="48%" r="52%">
          <stop offset="0%" stopColor="#ffe27a" stopOpacity="0" />
          <stop offset="80%" stopColor="#ffc326" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffb300" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${uid}-grad-bell-bg)`} stroke="#f5c542" strokeWidth="3" />
      <circle cx="50" cy="50" r="44" fill={`url(#${uid}-grad-bell-glow)`} />
      {/* top loop */}
      <rect x="46" y="18" width="8" height="8" rx="3" fill={`url(#${uid}-grad-bell-knob)`} stroke="#7a4d05" strokeWidth="1.5" />
      {/* bell body */}
      <path
        d="M50 24 C34 24 34 44 30 60 C28 68 24 70 24 74 H76 C76 70 72 68 70 60 C66 44 66 24 50 24 Z"
        fill={`url(#${uid}-grad-bell-body)`}
        stroke="#7a4d05"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* inner contour shading for volume */}
      <path d="M50 30 C40 30 39 46 36 60 C35 66 32 68 32 72 H68 C68 68 65 66 64 60 C61 46 60 30 50 30 Z" fill="#7a4d05" opacity="0.18" />
      {/* base rim */}
      <rect x="22" y="73" width="56" height="6" rx="3" fill={`url(#${uid}-grad-bell-body)`} stroke="#7a4d05" strokeWidth="1.5" />
      {/* clapper */}
      <circle cx="50" cy="82" r="5" fill={`url(#${uid}-grad-bell-knob)`} stroke="#7a4d05" strokeWidth="1.5" />
      {/* specular highlight */}
      <path d="M42 32 C36 38 34 50 33 60 C39 58 40 44 45 34 Z" fill="#ffffff" opacity="0.4" />
      <ellipse cx="40" cy="42" rx="3" ry="8" fill="#ffffff" opacity="0.45" transform="rotate(12 40 42)" />
    </>
  );
}

function Bar(uid: string): ReactElement {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-grad-bar-bg`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="55%" stopColor="#161616" />
          <stop offset="100%" stopColor="#030303" />
        </linearGradient>
        <linearGradient id={`${uid}-grad-bar-plate`} x1="0.2" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#fff9e0" />
          <stop offset="40%" stopColor="#ffd45a" />
          <stop offset="74%" stopColor="#e0a11c" />
          <stop offset="100%" stopColor="#7a4d05" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="14" fill={`url(#${uid}-grad-bar-bg)`} stroke="#f5c542" strokeWidth="3" />
      <rect x="8" y="8" width="84" height="84" rx="11" fill="none" stroke="#f5c542" strokeWidth="0.8" opacity="0.3" />
      {/* gold plate with drop shadow */}
      <rect x="17" y="36" width="68" height="32" rx="6" fill="#000000" opacity="0.35" />
      <rect x="16" y="34" width="68" height="32" rx="6" fill={`url(#${uid}-grad-bar-plate)`} stroke="#7a4d05" strokeWidth="2.5" />
      <rect x="20" y="38" width="60" height="24" rx="4" fill="none" stroke="#7a4d05" strokeWidth="1" opacity="0.6" />
      {/* BAR text — embossed */}
      <text
        x="50"
        y="59.5"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif"
        fontWeight="900"
        fontSize="24"
        fill="#fff0b8"
        opacity="0.5"
        letterSpacing="2"
      >
        BAR
      </text>
      <text
        x="50"
        y="59"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif"
        fontWeight="900"
        fontSize="24"
        fill="#7a4d05"
        letterSpacing="2"
      >
        BAR
      </text>
      {/* glossy sheen */}
      <rect x="16" y="34" width="68" height="11" rx="6" fill="#ffffff" opacity="0.3" />
    </>
  );
}

function Cherry(uid: string): ReactElement {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-grad-cherry-bg`} cx="50%" cy="36%" r="76%">
          <stop offset="0%" stopColor="#4a3690" />
          <stop offset="60%" stopColor="#2a1a5c" />
          <stop offset="100%" stopColor="#120826" />
        </radialGradient>
        <radialGradient id={`${uid}-grad-cherry-left`} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#ffb0b0" />
          <stop offset="30%" stopColor="#ff5a6e" />
          <stop offset="70%" stopColor="#d4102f" />
          <stop offset="100%" stopColor="#7c0418" />
        </radialGradient>
        <radialGradient id={`${uid}-grad-cherry-right`} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#ffa0a0" />
          <stop offset="30%" stopColor="#f0475c" />
          <stop offset="70%" stopColor="#c40e2b" />
          <stop offset="100%" stopColor="#6e0416" />
        </radialGradient>
        <linearGradient id={`${uid}-grad-cherry-stem`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#7ee39a" />
          <stop offset="55%" stopColor="#37a659" />
          <stop offset="100%" stopColor="#166030" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${uid}-grad-cherry-bg)`} stroke="#f5c542" strokeWidth="3" />
      <circle cx="50" cy="50" r="43" fill="none" stroke="#ffe98a" strokeWidth="0.8" opacity="0.35" />
      {/* stems */}
      <path
        d="M62 24 C66 34 52 46 36 66 M62 24 C58 38 66 52 70 66"
        fill="none"
        stroke={`url(#${uid}-grad-cherry-stem)`}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* leaf */}
      <path
        d="M62 22 C72 16 84 20 84 20 C84 20 78 32 66 30 C62 28 60 24 62 22 Z"
        fill={`url(#${uid}-grad-cherry-stem)`}
        stroke="#12572a"
        strokeWidth="1.2"
      />
      <path d="M64 24 C70 22 78 22 82 21" fill="none" stroke="#d9f5e2" strokeWidth="0.8" opacity="0.6" />
      {/* soft ground shadows under cherries */}
      <ellipse cx="34" cy="70" rx="15" ry="15" fill="#0a0212" opacity="0.25" transform="translate(2 3)" />
      {/* cherries */}
      <circle cx="34" cy="70" r="15" fill={`url(#${uid}-grad-cherry-left)`} stroke="#5c0416" strokeWidth="1.5" />
      <circle cx="70" cy="72" r="14" fill={`url(#${uid}-grad-cherry-right)`} stroke="#5c0416" strokeWidth="1.5" />
      {/* rim shading for roundness */}
      <path d="M34 85 A15 15 0 0 1 34 55" fill="none" stroke="#5c0416" strokeWidth="2" opacity="0.35" />
      {/* specular highlights */}
      <ellipse cx="28" cy="64" rx="5" ry="6.5" fill="#ffffff" opacity="0.6" transform="rotate(-25 28 64)" />
      <ellipse cx="64" cy="67" rx="4.5" ry="6" fill="#ffffff" opacity="0.55" transform="rotate(-25 64 67)" />
      <circle cx="40" cy="76" r="1.6" fill="#ffffff" opacity="0.5" />
      <circle cx="75" cy="77" r="1.4" fill="#ffffff" opacity="0.45" />
    </>
  );
}

/**
 * Mystery = a premium "stacked mystery" symbol: a dark ornate tile/orb with a
 * mysterious purple/gold radial glow, a large glowing golden "?" in the centre,
 * sparkles and a shimmering gold border — reads as a hidden symbol about to be
 * revealed.
 */
function Mystery(uid: string): ReactElement {
  return (
    <>
      <defs>
        {/* deep dark orb backdrop */}
        <radialGradient id={`${uid}-grad-mystery-bg`} cx="50%" cy="40%" r="76%">
          <stop offset="0%" stopColor="#3a1f7a" />
          <stop offset="52%" stopColor="#241152" />
          <stop offset="100%" stopColor="#0c0422" />
        </radialGradient>
        {/* mysterious purple → gold inner glow bloom */}
        <radialGradient id={`${uid}-grad-mystery-glow`} cx="50%" cy="46%" r="52%">
          <stop offset="0%" stopColor="#ffe27a" stopOpacity="0.85" />
          <stop offset="34%" stopColor="#c88bff" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#7a3cff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#7a3cff" stopOpacity="0" />
        </radialGradient>
        {/* shimmering gold border ring */}
        <linearGradient id={`${uid}-grad-mystery-ring`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#fff8db" />
          <stop offset="38%" stopColor="#ffd857" />
          <stop offset="70%" stopColor="#e0a11c" />
          <stop offset="100%" stopColor="#7a4d05" />
        </linearGradient>
        {/* glowing golden question mark fill */}
        <linearGradient id={`${uid}-grad-mystery-q`} x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#fffbe6" />
          <stop offset="40%" stopColor="#ffdc5e" />
          <stop offset="74%" stopColor="#f0b52c" />
          <stop offset="100%" stopColor="#b5820f" />
        </linearGradient>
        {/* soft specular sheen */}
        <radialGradient id={`${uid}-grad-mystery-spec`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* dark ornate orb + shimmering border */}
      <circle cx="50" cy="50" r="46" fill={`url(#${uid}-grad-mystery-bg)`} stroke={`url(#${uid}-grad-mystery-ring)`} strokeWidth="4" />
      <circle cx="50" cy="50" r="43.5" fill="none" stroke="#7a4d05" strokeWidth="1" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="#ffe98a" strokeWidth="0.8" opacity="0.4" />
      {/* ornate inner keyline ring */}
      <circle cx="50" cy="50" r="37" fill="none" stroke="#8a5cc4" strokeWidth="1" opacity="0.5" strokeDasharray="2 3.5" />

      {/* mysterious radial glow */}
      <circle cx="50" cy="50" r="40" fill={`url(#${uid}-grad-mystery-glow)`} />

      {/* sparkle rays around the rim */}
      <g opacity="0.7" fill="#ffe98a">
        <path d="M50 8 L53 24 L50 27 L47 24 Z" />
        <path d="M50 92 L53 76 L50 73 L47 76 Z" />
        <path d="M8 50 L24 53 L27 50 L24 47 Z" />
        <path d="M92 50 L76 53 L73 50 L76 47 Z" />
      </g>

      {/* soft drop shadow behind the "?" */}
      <text
        x="51"
        y="70"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="58"
        fill="#0a0418"
        opacity="0.5"
      >
        ?
      </text>
      {/* glowing golden "?" */}
      <text
        x="50"
        y="69"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="58"
        fill={`url(#${uid}-grad-mystery-q)`}
        stroke="#7a4d05"
        strokeWidth="1"
      >
        ?
      </text>

      {/* twinkling sparkles */}
      <path d="M30 30 l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6 Z" fill="#fff4c2" opacity="0.9" />
      <path d="M72 34 l1.2 2.6 2.6 1.2 -2.6 1.2 -1.2 2.6 -1.2 -2.6 -2.6 -1.2 2.6 -1.2 Z" fill="#fff4c2" opacity="0.85" />
      <path d="M68 72 l1 2.2 2.2 1 -2.2 1 -1 2.2 -1 -2.2 -2.2 -1 2.2 -1 Z" fill="#fff4c2" opacity="0.8" />

      {/* glossy top sheen */}
      <ellipse cx="40" cy="30" rx="16" ry="8" fill={`url(#${uid}-grad-mystery-spec)`} transform="rotate(-24 40 30)" opacity="0.5" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Dispatcher                                                          */
/* ------------------------------------------------------------------ */

const RENDERERS: Record<SymbolId, (uid: string) => ReactElement> = {
  seven: Seven,
  wild: Wild,
  scatter: Scatter,
  coin: Coin,
  orb: Orb,
  cash: Cash,
  diamond: Diamond,
  bell: Bell,
  bar: Bar,
  cherry: Cherry,
  mystery: Mystery,
};

export function SymbolIcon({ id, size = 100 }: SymbolIconProps): ReactElement {
  const uid = useId();
  const render = RENDERERS[id];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={id}
    >
      {render(uid)}
    </svg>
  );
}

export default SymbolIcon;
