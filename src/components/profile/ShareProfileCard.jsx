import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const safeText = (value, fallback = '') =>
  String(value || fallback).replace(/\s+/g, ' ').trim()

export function ShareProfileCard({ userId, profile = {}, daysJoined }) {
  const [reputation, setReputation] = useState(0)
  const [status, setStatus] = useState('')
  const [community, setCommunity] = useState(
    profile.most_active_community || profile.primary_community || ''
  )
  const [bio, setBio] = useState(profile.bio || '')
  const [showPet, setShowPet] = useState(true)
  const [showAvatar, setShowAvatar] = useState(true)

  useEffect(() => {
    let active = true

    if (userId && supabase) {
      supabase
        .from('profiles')
        .select('reputation_score')
        .eq('id', userId)
        .maybeSingle()
        .then(({ data }) => {
          if (active) setReputation(data?.reputation_score || 0)
        })
        .catch(() => {})
    }

    return () => {
      active = false
    }
  }, [userId])

  const petName = (() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(`town-pet-companion:${userId}`) || '{}'
      )
      return safeText(saved.name || profile.pet_name, 'Pixel')
    } catch {
      return safeText(profile.pet_name, 'Pixel')
    }
  })()

  const username = safeText(profile.username, 'username')
  const displayName = safeText(
    profile.display_name || profile.username,
    'Town member'
  )
  const avatar =
    profile.avatar_url ||
    profile.avatarUrl ||
    profile.avatar ||
    profile.profile_picture_url ||
    ''

  const memberDays = Number(daysJoined) || 0
  const tier = memberDays >= 31 ? 'gold' : memberDays >= 8 ? 'red' : 'standard'
  const tierLabel = tier === 'gold' ? 'GOLD MEMBER' : tier === 'red' ? 'RARE MEMBER' : 'NEW MEMBER'
  const colors = tier === 'gold'
    ? { bg: '#090a0d', ink: '#fff4c6', accent: '#f5c451', line: '#8b6725', soft: '#17140d' }
    : tier === 'red'
      ? { bg: '#0a090d', ink: '#fff0f1', accent: '#ff5268', line: '#8e263a', soft: '#1c1015' }
      : { bg: '#080b0d', ink: '#e8fff3', accent: '#39ff9c', line: '#28684f', soft: '#101a17' }
  const isGold = tier === 'gold'

  const roundedRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  const download = async () => {
    setStatus('Preparing your card…')

    const canvas = document.createElement('canvas')
    canvas.width = 900
    canvas.height = 1200

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      setStatus('Could not create the card in this browser.')
      return
    }

    const c = colors

    ctx.fillStyle = c.bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Collectible-card frame and subtle rarity foil.
    ctx.fillStyle = c.bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = c.accent
    ctx.lineWidth = 8
    ctx.strokeRect(18, 18, 864, 1164)
    ctx.strokeStyle = c.line
    ctx.lineWidth = 2
    ctx.strokeRect(32, 32, 836, 1136)
    ctx.globalAlpha = 0.12
    ctx.strokeStyle = c.accent
    ctx.lineWidth = 1
    for (let y = 80; y < 1120; y += 22) {
      ctx.beginPath()
      ctx.moveTo(45, y)
      ctx.lineTo(855, y - 100)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    ctx.fillStyle = c.accent
    ctx.font = 'bold 22px monospace'
    ctx.fillText('TOWN  /  COLLECTOR SERIES', 70, 82)
    ctx.textAlign = 'right'
    ctx.fillText(tierLabel, 830, 82)
    ctx.textAlign = 'left'

    // Profile photo.
    ctx.fillStyle = c.soft
    ctx.strokeStyle = c.line
    ctx.lineWidth = 3

    ctx.beginPath()
    ctx.arc(190, 225, 112, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    if (showAvatar && avatar) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = avatar
        })

        ctx.save()
        ctx.beginPath()
        ctx.arc(190, 225, 105, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, 85, 120, 210, 210)
        ctx.restore()
      } catch {
        drawInitials(ctx, displayName, c)
      }
    } else {
      drawInitials(ctx, displayName, c)
    }

    // Bio panel.
    ctx.fillStyle = c.soft
    ctx.strokeStyle = c.line
    ctx.lineWidth = 3

    roundedRect(ctx, 335, 125, 495, 190, 12)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = c.ink
    ctx.font = 'bold 25px monospace'
    ctx.fillText('PLAYER PROFILE', 360, 165)

    ctx.font = '23px sans-serif'

    wrapText(
      ctx,
      safeText(bio, 'A little about me…'),
      360,
      210,
      445,
      32,
      4
    )

    // Member name and username.
    ctx.fillStyle = c.ink
    ctx.font = 'bold 42px monospace'
    ctx.fillText(displayName.slice(0, 28), 70, 405)

    ctx.fillStyle = c.accent
    ctx.font = '25px monospace'
    ctx.fillText(`@${username}`.slice(0, 35), 70, 448)

    ctx.fillStyle = c.ink
    ctx.font = 'bold 20px monospace'
    ctx.fillText(`${tierLabel}  ·  MEMBER #${String(userId || 'TOWN').slice(0, 8).toUpperCase()}`, 70, 490)

    // Member statistics.
    const labelY = 540
    const valueY = 615
    const colX = [60, 340, 620]
    const colW = 220

    const labels = ['DAYS IN TOWN', 'REPUTATION', 'COMPANION']
    const values = [
      String(daysJoined ?? '—'),
      String(reputation),
      petName,
    ]

    // Use a regular loop so await is valid inside the async download function.
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i]

      ctx.fillStyle = c.soft
      ctx.strokeStyle = c.line
      ctx.lineWidth = 3

      roundedRect(ctx, colX[i], labelY, colW, 52, 8)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = c.ink
      ctx.font = 'bold 20px monospace'

      centerText(
        ctx,
        label,
        colX[i] + colW / 2,
        labelY + 32
      )

      roundedRect(ctx, colX[i], valueY, colW, 95, 8)
      ctx.fill()
      ctx.stroke()

      ctx.font = 'bold 32px monospace'

      centerText(
        ctx,
        values[i].slice(0, 18),
        colX[i] + colW / 2,
        valueY + 55
      )

      // Draw the selected pet sprite in the current-pet column.
      if (
        i === 2 &&
        showPet &&
        profile.pet_id &&
        profile.pet_id !== 'none'
      ) {
        try {
          const sprite = new Image()

          await new Promise((resolve) => {
            sprite.onload = resolve
            sprite.onerror = resolve
            sprite.src = `/pets/${profile.pet_id}.svg`
          })

          if (sprite.complete && sprite.naturalWidth) {
            ctx.imageSmoothingEnabled = false

            ctx.drawImage(
              sprite,
              colX[i] + 67,
              valueY + 52,
              86,
              86
            )
          }
        } catch {}
      }
    }

    // Most-active community section.
    ctx.strokeStyle = c.line
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(60, 770)
    ctx.lineTo(840, 770)
    ctx.stroke()

    ctx.fillStyle = c.ink
    ctx.font = 'bold 22px monospace'
    ctx.fillText('YOUR DOWNTOWN', 65, 825)

    ctx.fillStyle = c.soft
    ctx.strokeStyle = c.line

    roundedRect(ctx, 300, 790, 535, 64, 8)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = c.ink
    ctx.font = '24px sans-serif'

    centerText(
      ctx,
      safeText(community, 'Choose your downtown'),
      568,
      830
    )

    // Footer.
    ctx.fillStyle = c.ink
    ctx.font = 'bold 24px monospace'
    ctx.fillText('COLLECT YOUR CORNER OF TOWN', 65, 1070)

    ctx.font = '18px monospace'
    ctx.fillText('A snapshot of your place in the community.', 65, 1105)
    ctx.fillStyle = c.accent
    ctx.font = 'bold 18px monospace'
    ctx.fillText('TOWN.EXE  //  MEMBER EDITION', 65, 1145)

    function drawInitials(context, name, palette) {
  context.fillStyle = palette.accent
  context.font = 'bold 84px monospace'
  centerText(
    context,
    safeText(name, 'T').slice(0, 1).toUpperCase(),
    205,
    235
  )
}
    function wrapText(context, text, x, y, maxWidth, lineHeight, maxLines) {
      const words = text.split(' ')
      let line = ''
      let count = 0

      for (const word of words) {
        const test = line ? `${line} ${word}` : word

        if (context.measureText(test).width > maxWidth && line) {
          context.fillText(line, x, y)
          y += lineHeight
          count++
          line = word

          if (count >= maxLines - 1) break
        } else {
          line = test
        }
      }

      if (line) context.fillText(line.slice(0, 55), x, y)
    }

    function centerText(context, text, x, y) {
      context.textAlign = 'center'
      context.fillText(text, x, y)
      context.textAlign = 'left'
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        setStatus('Card export failed.')
        return
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `town-profile-card-${username}.png`
      a.click()

      setTimeout(() => URL.revokeObjectURL(url), 1500)
      setStatus('Profile card downloaded as PNG. You can share it anywhere.')
    }, 'image/png')
  }

  return (
    <fieldset className="profile-editor-section share-card-builder">
      <legend>Collectible member card</legend>

      <p className="widget-help">
        Your card rarity upgrades automatically with membership age: Standard (0–7 days), Rare (8–30 days), and Gold (31+ days). Preview and PNG use the same tier.
      </p>

      <div className={`town-share-card town-share-card-${tier}`}>
        <div className="town-share-card-inner">
          <div className="town-share-card-top">
            <div className="town-share-avatar">
              {showAvatar && avatar ? (
                <img src={avatar} alt="" />
              ) : (
                <span>{displayName.slice(0, 1).toUpperCase()}</span>
              )}
            </div>

            <div className="town-share-bio">
              <strong>PLAYER PROFILE</strong>
              <p>{bio || 'A little about me…'}</p>
            </div>
          </div>

          <div className="town-share-card-brand"><span>TOWN / COLLECTOR SERIES</span><strong>{tierLabel}</strong></div>
          <strong className="town-share-display-name">{displayName}</strong>
          <span className="town-share-username">@{username}</span>
          <span className="town-share-card-edition">MEMBER EDITION · {memberDays} DAYS IN TOWN</span>

          <div className="town-share-labels">
            <span>Days joined</span>
            <span>Reputation</span>
            <span>Current pet name</span>
          </div>

          <div className="town-share-values">
            <strong>{daysJoined ?? '—'}</strong>
            <strong>{reputation}</strong>
            <strong>{petName}</strong>
          </div>

          <div className="town-share-active">
            <span>Your downtown:</span>
            <strong>{community || 'Your downtown'}</strong>
          </div>

          {showPet && (
            <div className="town-share-pet">
              {profile.pet_id && profile.pet_id !== 'none' ? (
                <img src={`/pets/${profile.pet_id}.svg`} alt="" />
              ) : (
                <span>No pet selected</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="share-card-actions">
        <label>
          Most active in
          <input
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
            placeholder="Downtown name"
          />
        </label>

        <label>
          Bio on card
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            maxLength={180}
          />
        </label>

        <label className="share-card-check">
          <input
            type="checkbox"
            checked={showAvatar}
            onChange={(e) => setShowAvatar(e.target.checked)}
          />
          Include profile photo
        </label>

        <label className="share-card-check">
          <input
            type="checkbox"
            checked={showPet}
            onChange={(e) => setShowPet(e.target.checked)}
          />
          Include pet
        </label>

        <button type="button" className="button primary" onClick={download}>
          Download PNG card
        </button>
      </div>

      {status && (
        <p role="status" className="widget-help">
          {status}
        </p>
      )}
    </fieldset>
  )
}