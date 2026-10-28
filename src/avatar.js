const CREATURES = [
  ['avatar-01', 'Mosskin'],
  ['avatar-02', 'Emberfox'],
  ['avatar-03', 'Tidebit'],
  ['avatar-04', 'Moonmoth'],
  ['avatar-05', 'Pebblit'],
  ['avatar-06', 'Suncub'],
  ['avatar-07', 'Glimmerwing'],
  ['avatar-08', 'Thornback'],
  ['avatar-09', 'Cloudling'],
  ['avatar-10', 'Voltkit'],
  ['avatar-11', 'Bloomble'],
  ['avatar-12', 'Deepfin'],
  ['avatar-13', 'Frostpaw'],
  ['avatar-14', 'Cinderling'],
  ['avatar-15', 'Starling'],
  ['avatar-16', 'Rootlet'],
  ['avatar-17', 'Prismoo'],
  ['avatar-18', 'Bramblebun'],
  ['avatar-19', 'Nebulynx'],
  ['avatar-20', 'Coralimp']
]

export const PROFILE_AVATARS = CREATURES
export const DEFAULT_AVATAR_ID = 'avatar-01'

export function avatarUrl(avatarId) {
  const valid = PROFILE_AVATARS.some(([id]) => id === avatarId)
  const number = valid ? Number(avatarId.slice(-2)) : 1
  return `/creatures/creature-${String(number).padStart(2, '0')}.svg`
}
