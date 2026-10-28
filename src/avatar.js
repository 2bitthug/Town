const CREATURES = [
  ['avatar-01', 'Mosskin', '#9CFF6B', '#2D9B63', '#173D35', 'leaf'],
  ['avatar-02', 'Emberfox', '#FFB15A', '#F05A35', '#722F32', 'fox'],
  ['avatar-03', 'Tidebit', '#72F2FF', '#2786D9', '#143F73', 'fin'],
  ['avatar-04', 'Moonmoth', '#E7D5FF', '#9E83F5', '#443A83', 'wing'],
  ['avatar-05', 'Pebblit', '#E8C98D', '#8A7654', '#3E4638', 'stone'],
  ['avatar-06', 'Suncub', '#FFE16B', '#FFA936', '#9E542C', 'sun'],
  ['avatar-07', 'Glimmerwing', '#B8FBFF', '#6ABBEF', '#6755C8', 'wing'],
  ['avatar-08', 'Thornback', '#B7D96A', '#638A3A', '#364B30', 'thorn'],
  ['avatar-09', 'Cloudling', '#DDF7FF', '#83C9FF', '#527BBE', 'cloud'],
  ['avatar-10', 'Voltkit', '#E5F66B', '#A4B832', '#353B4A', 'bolt'],
  ['avatar-11', 'Bloomble', '#FFB4C8', '#EE7B9A', '#477B49', 'flower'],
  ['avatar-12', 'Deepfin', '#71C8FF', '#3D78B7', '#172C58', 'fin'],
  ['avatar-13', 'Frostpaw', '#DDF5FF', '#93C9FF', '#4A79C7', 'ice'],
  ['avatar-14', 'Cinderling', '#FF976A', '#C94C38', '#4E3038', 'flame'],
  ['avatar-15', 'Starling', '#FFE18A', '#4D9DDE', '#273D75', 'star'],
  ['avatar-16', 'Rootlet', '#B9E77C', '#8EAD5C', '#67553D', 'leaf'],
  ['avatar-17', 'Prismoo', '#D7B7FF', '#79C9FF', '#7A5FE1', 'crystal'],
  ['avatar-18', 'Bramblebun', '#C4E99B', '#5D9C62', '#5B7042', 'bunny'],
  ['avatar-19', 'Nebulynx', '#B89BFF', '#6D55D7', '#28234D', 'cat'],
  ['avatar-20', 'Coralimp', '#FFB6E4', '#53D6E4', '#7A4C9C', 'coral']
];

export const PROFILE_AVATARS = CREATURES.map(([id, name]) => [id, name]);
export const DEFAULT_AVATAR_ID = 'avatar-01';

function creatureSvg(creature) {
  const [, name, light, mid, dark, type] = creature;
  const extras = {
    leaf: '<path d="M48 54 Q20 24 43 18 Q62 31 56 53Z M112 54 Q140 24 117 18 Q98 31 104 53Z" fill="' + light + '"/><path d="M50 38 Q62 28 67 43 M110 38 Q98 28 93 43" fill="none" stroke="#F0FFD4" stroke-width="3"/>',
    fox: '<path d="M43 60 L31 17 L64 45Z M117 60 L129 17 L96 45Z" fill="' + mid + '" stroke="' + light + '" stroke-width="3"/><path d="M112 106 Q148 95 132 70 Q128 91 108 91" fill="none" stroke="' + light + '" stroke-width="12" stroke-linecap="round"/>',
    fin: '<path d="M45 77 Q11 54 28 32 Q49 44 58 68Z M115 77 Q149 54 132 32 Q111 44 102 68Z" fill="' + light + '"/><path d="M49 112 Q27 126 42 138 M111 112 Q133 126 118 138" fill="none" stroke="' + mid + '" stroke-width="8" stroke-linecap="round"/>',
    wing: '<path d="M48 70 Q5 25 28 20 Q54 26 65 58Z M112 70 Q155 25 132 20 Q106 26 95 58Z" fill="' + mid + '" stroke="' + light + '" stroke-width="2"/><path d="M35 43 L57 59 M125 43 L103 59" stroke="#FFFFFF" stroke-opacity=".65" stroke-width="3"/>',
    stone: '<path d="M43 65 L26 39 L50 46 L61 29 L73 53 M117 65 L134 39 L110 46 L99 29 L87 53" fill="' + mid + '" stroke="' + light + '" stroke-width="3" stroke-linejoin="round"/>',
    sun: '<path d="M80 15 L87 31 L104 33 L91 45 L95 62 L80 53 L65 62 L69 45 L56 33 L73 31Z" fill="' + light + '"/><path d="M114 104 Q145 97 132 121 Q125 133 110 119" fill="none" stroke="' + light + '" stroke-width="11" stroke-linecap="round"/>',
    thorn: '<path d="M41 65 L28 35 L54 48 L63 25 L74 50 M119 65 L132 35 L106 48 L97 25 L86 50" fill="' + mid + '" stroke="' + light + '" stroke-width="3" stroke-linejoin="round"/>',
    cloud: '<circle cx="52" cy="48" r="17" fill="' + light + '"/><circle cx="80" cy="35" r="23" fill="' + light + '"/><circle cx="108" cy="48" r="17" fill="' + light + '"/>',
    bolt: '<path d="M43 62 L31 21 L62 47Z M117 62 L129 21 L98 47Z" fill="' + mid + '" stroke="' + light + '" stroke-width="3"/><path d="M124 69 L103 98 L120 98 L108 121 L140 85 L122 85Z" fill="' + light + '"/>',
    flower: '<path d="M80 38 C63 18 48 34 61 48 C40 47 43 67 63 65 C53 84 74 91 80 70 C88 91 108 82 97 65 C118 67 120 47 99 48 C112 31 94 18 80 38Z" fill="' + light + '"/><circle cx="80" cy="52" r="10" fill="#FFE58A"/>',
    ice: '<path d="M43 63 L32 24 L59 46Z M117 63 L128 24 L101 46Z" fill="' + light + '" stroke="#FFFFFF" stroke-opacity=".65" stroke-width="2"/><path d="M80 17 L86 33 L102 39 L86 45 L80 62 L74 45 L58 39 L74 33Z" fill="#FFFFFF" opacity=".8"/>',
    flame: '<path d="M43 63 Q21 38 43 21 Q42 42 60 43 Q74 23 73 13 Q100 42 91 58Z M117 63 Q139 38 117 21 Q118 42 100 43 Q86 23 87 13 Q60 42 69 58Z" fill="' + light + '"/>',
    star: '<path d="M80 16 L88 35 L108 37 L93 51 L97 72 L80 61 L63 72 L67 51 L52 37 L72 35Z" fill="' + light + '"/><circle cx="127" cy="40" r="4" fill="#FFFFFF"/><circle cx="31" cy="69" r="3" fill="' + light + '"/>',
    crystal: '<path d="M48 57 L61 29 L77 47 L80 22 L96 47 L112 29 L120 58 L100 72 L80 65 L60 72Z" fill="' + mid + '" stroke="' + light + '" stroke-width="2" stroke-linejoin="round"/>',
    bunny: '<path d="M54 56 Q31 4 48 13 Q67 22 68 55Z M106 56 Q129 4 112 13 Q93 22 92 55Z" fill="' + light + '" stroke="' + mid + '" stroke-width="3"/>',
    cat: '<path d="M42 62 L29 19 L63 45Z M118 62 L131 19 L97 45Z" fill="' + mid + '" stroke="' + light + '" stroke-width="3"/><path d="M47 105 Q20 113 36 133 Q48 141 56 126 M113 105 Q140 113 124 133 Q112 141 104 126" fill="none" stroke="' + light + '" stroke-width="8" stroke-linecap="round"/>',
    coral: '<path d="M53 63 L42 35 L58 47 L63 23 L76 48 M107 63 L118 35 L102 47 L97 23 L84 48" fill="none" stroke="' + light + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="42" cy="34" r="6" fill="' + light + '"/><circle cx="118" cy="34" r="6" fill="' + light + '"/>'
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="${name} creature avatar">
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="75%"><stop stop-color="${dark}"/><stop offset="1" stop-color="#05070B"/></radialGradient>
    <linearGradient id="body" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="${light}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
    <linearGradient id="belly" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FFFFFF" stop-opacity=".9"/><stop offset="1" stop-color="${light}" stop-opacity=".45"/></linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  <rect width="160" height="160" rx="24" fill="url(#bg)"/>
  <circle cx="80" cy="78" r="61" fill="none" stroke="${light}" stroke-opacity=".2" stroke-width="1.5"/>
  <circle cx="80" cy="84" r="42" fill="${light}" opacity=".16" filter="url(#glow)"/>
  <g opacity=".8" fill="${light}"><circle cx="25" cy="72" r="2"/><circle cx="135" cy="60" r="2.5"/><circle cx="35" cy="108" r="1.8"/><path d="M124 88 l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1Z"/></g>
  ${extras[type]}
  <ellipse cx="80" cy="128" rx="35" ry="8" fill="#000000" opacity=".4"/>
  <path d="M48 88 Q47 66 65 62 Q80 56 95 62 Q113 66 112 88 L116 108 Q112 132 80 135 Q48 132 44 108Z" fill="url(#body)" stroke="${light}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M60 108 Q57 96 69 93 Q80 89 91 93 Q103 96 100 108 Q96 124 80 124 Q64 124 60 108Z" fill="url(#belly)" opacity=".72"/>
  <ellipse cx="63" cy="88" rx="9" ry="12" fill="#081018"/><ellipse cx="97" cy="88" rx="9" ry="12" fill="#081018"/>
  <ellipse cx="65.5" cy="84" rx="3.2" ry="4.2" fill="#FFFFFF"/><ellipse cx="99.5" cy="84" rx="3.2" ry="4.2" fill="#FFFFFF"/>
  <circle cx="49" cy="101" r="5" fill="#FF8DA8" opacity=".72"/><circle cx="111" cy="101" r="5" fill="#FF8DA8" opacity=".72"/>
  <path d="M73 103 Q80 111 87 103" fill="none" stroke="${dark}" stroke-width="3" stroke-linecap="round"/>
  <path d="M54 76 Q63 69 72 75 M88 75 Q97 69 106 76" fill="none" stroke="${light}" stroke-width="3" stroke-linecap="round"/>
  <path d="M57 70 Q80 58 103 70" fill="none" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>
  <path d="M54 125 Q47 131 51 137 M106 125 Q113 131 109 137" fill="none" stroke="${light}" stroke-width="7" stroke-linecap="round"/>
  <text x="80" y="151" fill="${light}" font-family="monospace" font-size="7.2" font-weight="700" text-anchor="middle" letter-spacing=".45">${name.toUpperCase()}</text>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function avatarUrl(avatarId) {
  const creature = CREATURES.find(([id]) => id === avatarId) || CREATURES[0];
  return creatureSvg(creature);
}
