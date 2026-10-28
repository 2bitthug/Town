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
  const [id, name, light, mid, dark, type] = creature;
  const uid = id.replace(/[^a-z0-9]/gi, '');
  const feature = {
    leaf: '<path d="M49 57C18 38 26 9 47 20Q65 31 61 57ZM111 57C142 38 134 9 113 20Q95 31 99 57Z" fill="url(#accent)" stroke="' + light + '" stroke-width="2"/><path d="M42 29L58 49M118 29L102 49" stroke="#F5FFD8" stroke-opacity=".8" stroke-width="2"/>',
    fox: '<path d="M43 65L25 10L67 46ZM117 65L135 10L93 46Z" fill="url(#accent)" stroke="' + light + '" stroke-width="3"/><path d="M111 108C145 91 146 119 126 132C115 138 105 127 113 119" fill="none" stroke="' + light + '" stroke-width="12" stroke-linecap="round"/><path d="M37 38L48 53M123 38L112 53" stroke="#FFF2D9" stroke-width="4"/>',
    fin: '<path d="M47 79C10 63 17 34 34 30L63 65ZM113 79C150 63 143 34 126 30L97 65Z" fill="url(#accent)" stroke="' + light + '" stroke-width="2"/><path d="M49 114L31 132L54 134M111 114L129 132L106 134" fill="none" stroke="' + light + '" stroke-width="8" stroke-linecap="round"/><circle cx="38" cy="45" r="4" fill="#FFFFFF"/><circle cx="122" cy="45" r="4" fill="#FFFFFF"/>',
    wing: '<path d="M49 77C4 40 19 8 41 19Q60 26 68 65ZM111 77C156 40 141 8 119 19Q100 26 92 65Z" fill="url(#accent)" stroke="' + light + '" stroke-width="2"/><path d="M31 31L59 58M129 31L101 58M42 22L51 43M118 22L109 43" stroke="#FFFFFF" stroke-opacity=".72" stroke-width="2.5"/>',
    stone: '<path d="M43 68L22 39L49 45L60 20L75 51L87 24L103 45L138 35L117 75Z" fill="url(#accent)" stroke="' + light + '" stroke-width="3" stroke-linejoin="round"/><path d="M48 45L59 55M111 44L101 55" stroke="#FFF1C5" stroke-width="3"/>',
    sun: '<path d="M80 9L90 30L113 32L96 48L101 70L80 59L59 70L64 48L47 32L70 30Z" fill="' + light + '" stroke="#FFF5B7" stroke-width="2"/><path d="M114 107C148 92 147 122 127 132" fill="none" stroke="' + light + '" stroke-width="12" stroke-linecap="round"/>',
    thorn: '<path d="M43 69L24 29L54 47L63 15L78 49L89 22L105 47L137 28L117 70Z" fill="url(#accent)" stroke="' + light + '" stroke-width="3" stroke-linejoin="round"/><path d="M42 39L58 53M118 39L102 53" stroke="#F4FFD9" stroke-width="2"/>',
    cloud: '<g fill="url(#accent)" stroke="' + light + '" stroke-width="2"><circle cx="49" cy="49" r="22"/><circle cx="80" cy="34" r="29"/><circle cx="111" cy="49" r="22"/><rect x="38" y="44" width="84" height="30" rx="15"/></g><path d="M49 43Q80 22 111 43" fill="none" stroke="#FFFFFF" stroke-opacity=".75" stroke-width="3"/>',
    bolt: '<path d="M43 66L25 13L66 47ZM117 66L135 13L94 47Z" fill="url(#accent)" stroke="' + light + '" stroke-width="3"/><path d="M125 65L101 96H120L105 128L143 82H122Z" fill="' + light + '" stroke="#FFFBC2" stroke-width="2"/>',
    flower: '<g fill="' + light + '" stroke="' + mid + '" stroke-width="2"><ellipse cx="80" cy="33" rx="13" ry="24"/><ellipse cx="80" cy="33" rx="13" ry="24" transform="rotate(60 80 53)"/><ellipse cx="80" cy="33" rx="13" ry="24" transform="rotate(120 80 53)"/></g><circle cx="80" cy="52" r="13" fill="#FFE58A" stroke="#FFF4C4" stroke-width="2"/>',
    ice: '<path d="M43 68L24 17L61 47ZM117 68L136 17L99 47Z" fill="url(#accent)" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="2"/><path d="M80 10L89 34L112 43L89 52L80 76L71 52L48 43L71 34Z" fill="#FFFFFF" fill-opacity=".85"/>',
    flame: '<path d="M42 69C18 43 35 20 48 10C47 37 66 39 68 19C91 43 84 59 76 70ZM118 69C142 43 125 20 112 10C113 37 94 39 92 19C69 43 76 59 84 70Z" fill="' + light + '" stroke="#FFE0A5" stroke-width="2"/>',
    star: '<path d="M80 9L92 32L117 36L99 54L103 79L80 67L57 79L61 54L43 36L68 32Z" fill="' + light + '" stroke="#FFF4C4" stroke-width="2"/><circle cx="128" cy="39" r="4" fill="#FFFFFF"/><circle cx="30" cy="69" r="3" fill="' + light + '"/>',
    crystal: '<path d="M42 68L54 30L72 47L80 11L92 47L110 30L120 68L99 79L80 69L61 79Z" fill="url(#accent)" stroke="' + light + '" stroke-width="3" stroke-linejoin="round"/><path d="M80 16L80 66M56 35L73 51M104 35L87 51" stroke="#FFFFFF" stroke-opacity=".75" stroke-width="2.5"/>',
    bunny: '<path d="M54 64C32 17 39 3 51 13C67 25 70 45 69 63ZM106 64C128 17 121 3 109 13C93 25 90 45 91 63Z" fill="url(#accent)" stroke="' + light + '" stroke-width="2.5"/><path d="M48 30L62 54M112 30L98 54" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="3"/>',
    cat: '<path d="M42 68L24 12L66 47ZM118 68L136 12L94 47Z" fill="url(#accent)" stroke="' + light + '" stroke-width="3"/><path d="M46 108C19 111 25 139 45 137Q56 136 56 123M114 108C141 111 135 139 115 137Q104 136 104 123" fill="none" stroke="' + light + '" stroke-width="9" stroke-linecap="round"/>',
    coral: '<path d="M52 69L37 34L57 49L63 16L79 51M108 69L123 34L103 49L97 16L81 51" fill="none" stroke="' + light + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="37" cy="34" r="6" fill="' + light + '"/><circle cx="123" cy="34" r="6" fill="' + light + '"/>'
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="${name} creature avatar">
  <defs>
    <radialGradient id="bg-${uid}" cx="48%" cy="26%" r="80%"><stop stop-color="${dark}"/><stop offset=".58" stop-color="#111321"/><stop offset="1" stop-color="#030407"/></radialGradient>
    <linearGradient id="body-${uid}" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#FFFFFF"/><stop offset=".15" stop-color="${light}"/><stop offset=".58" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
    <linearGradient id="accent-${uid}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
    <linearGradient id="belly-${uid}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FFFFFF" stop-opacity=".95"/><stop offset="1" stop-color="${light}" stop-opacity=".16"/></linearGradient>
    <filter id="glow-${uid}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <rect width="160" height="160" rx="24" fill="url(#bg-${uid})"/>
  <circle cx="80" cy="78" r="58" fill="${light}" opacity=".13" filter="url(#glow-${uid})"/>
  <circle cx="80" cy="78" r="61" fill="none" stroke="${light}" stroke-opacity=".22"/>
  <g fill="${light}" opacity=".85"><circle cx="24" cy="74" r="1.8"/><circle cx="136" cy="55" r="2.2"/><circle cx="31" cy="112" r="1.4"/><circle cx="128" cy="111" r="1.6"/></g>
  ${feature[type] || feature.leaf}
  <ellipse cx="80" cy="132" rx="36" ry="7" fill="#000000" opacity=".55"/>
  <path d="M48 84C47 66 61 57 80 57C99 57 113 66 112 84L117 105C115 127 99 137 80 138C61 137 45 127 43 105Z" fill="url(#body-${uid})" stroke="${light}" stroke-width="2.4"/>
  <path d="M58 105C58 94 68 89 80 89C92 89 102 94 102 105C100 120 91 127 80 127C69 127 60 120 58 105Z" fill="url(#belly-${uid})" opacity=".72"/>
  <path d="M52 76Q62 67 72 75M88 75Q98 67 108 76" fill="none" stroke="${dark}" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="64" cy="86" rx="8" ry="10" fill="#10131D"/><ellipse cx="96" cy="86" rx="8" ry="10" fill="#10131D"/>
  <ellipse cx="66" cy="82.5" rx="3" ry="4" fill="#FFFFFF"/><ellipse cx="98" cy="82.5" rx="3" ry="4" fill="#FFFFFF"/>
  <ellipse cx="49" cy="100" rx="5" ry="3.5" fill="#FF8AAE" opacity=".68"/><ellipse cx="111" cy="100" rx="5" ry="3.5" fill="#FF8AAE" opacity=".68"/>
  <path d="M73 102Q80 110 87 102" fill="none" stroke="${dark}" stroke-width="3" stroke-linecap="round"/>
  <path d="M56 69Q80 56 104 69" fill="none" stroke="#FFFFFF" stroke-opacity=".58" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M54 125Q46 131 51 138M106 125Q114 131 109 138" fill="none" stroke="${light}" stroke-width="7" stroke-linecap="round"/>
  <text x="80" y="151" fill="${light}" font-family="monospace" font-size="7.2" font-weight="700" text-anchor="middle" letter-spacing=".45">${name.toUpperCase()}</text>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function avatarUrl(avatarId) {
  const creature = CREATURES.find(([id]) => id === avatarId) || CREATURES[0];
  return creatureSvg(creature);
}

export const CREATURE_DETAILS = {
  'avatar-01': { name: 'Mosskin', trait: 'Calm & grounded', description: 'A quiet forest spirit for thoughtful listeners and steady contributors.', theme: 'forest' },
  'avatar-02': { name: 'Emberfox', trait: 'Bold & curious', description: 'A bright-hearted explorer for people who ask questions and try new ideas.', theme: 'fire' },
  'avatar-03': { name: 'Tidebit', trait: 'Adaptable & fluid', description: 'A water companion for flexible thinkers who connect different perspectives.', theme: 'water' },
  'avatar-04': { name: 'Moonmoth', trait: 'Dreamy & reflective', description: 'A moonlit guide for imaginative people who enjoy deeper conversations.', theme: 'moon' },
  'avatar-05': { name: 'Pebblit', trait: 'Steady & reliable', description: 'A stone-built friend for dependable members who help communities feel welcoming.', theme: 'stone' },
  'avatar-06': { name: 'Suncub', trait: 'Optimistic & warm', description: 'A little ray of sunshine for people who encourage others and share positive energy.', theme: 'sun' },
  'avatar-07': { name: 'Glimmerwing', trait: 'Creative & expressive', description: 'A luminous winged companion for makers, storytellers and original thinkers.', theme: 'wing' },
  'avatar-08': { name: 'Thornback', trait: 'Resilient & protective', description: 'A leaf-armoured guardian for people who stand up for others and nurture healthy spaces.', theme: 'leaf' },
  'avatar-09': { name: 'Cloudling', trait: 'Easygoing & curious', description: 'A drifting cloud spirit for open-minded explorers who like discovering new topics.', theme: 'cloud' },
  'avatar-10': { name: 'Voltkit', trait: 'Energetic & playful', description: 'A spark-charged companion for lively discussions, experiments and playful ideas.', theme: 'electric' },
  'avatar-11': { name: 'Bloomble', trait: 'Nurturing & friendly', description: 'A flower companion for helpful members who make newcomers feel included.', theme: 'flower' },
  'avatar-12': { name: 'Deepfin', trait: 'Thoughtful & observant', description: 'A deep-water scout for careful readers who notice details and add considered answers.', theme: 'ocean' },
  'avatar-13': { name: 'Frostpaw', trait: 'Calm & focused', description: 'An ice-born companion for patient problem-solvers who bring clarity to a discussion.', theme: 'ice' },
  'avatar-14': { name: 'Cinderling', trait: 'Ambitious & determined', description: 'A small fire drake for persistent learners who keep working through hard problems.', theme: 'fire' },
  'avatar-15': { name: 'Starling', trait: 'Inquisitive & open-minded', description: 'A star-guided flyer for curious minds who explore beyond their usual interests.', theme: 'star' },
  'avatar-16': { name: 'Rootlet', trait: 'Balanced & mindful', description: 'A woodland wanderer for people who value perspective, balance and steady growth.', theme: 'forest' },
  'avatar-17': { name: 'Prismoo', trait: 'Imaginative & unique', description: 'A crystal spirit for people who bring unexpected angles and colourful ideas.', theme: 'crystal' },
  'avatar-18': { name: 'Bramblebun', trait: 'Loyal & supportive', description: 'A bramble-backed companion for members who show up, encourage and support others.', theme: 'forest' },
  'avatar-19': { name: 'Nebulynx', trait: 'Independent & mysterious', description: 'A starlit feline for independent thinkers who enjoy exploring unusual ideas.', theme: 'cosmic' },
  'avatar-20': { name: 'Coralimp', trait: 'Explorative & adventurous', description: 'A reef-dwelling sprite for adventurous members who connect people and perspectives.', theme: 'ocean' }
};
