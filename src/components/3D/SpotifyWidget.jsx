'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useColorScheme } from '../../useColorScheme'

function getSpotifyTheme(isDark) {
  return isDark
    ? {
        shell: 'rgba(28, 23, 60, 0.96)',
        shellBorder: 'rgba(188, 157, 255, 0.64)',
        card: 'rgba(56, 42, 111, 0.92)',
        cardAlt: 'rgba(78, 64, 138, 0.88)',
        cardBorder: 'rgba(176, 145, 255, 0.44)',
        text: '#efe8ff',
        textMuted: '#d7c7ff',
        accent: '#8d73dc',
        accentSoft: 'rgba(141, 115, 220, 0.3)',
        panelGlass: 'rgba(37, 29, 76, 0.84)',
      }
    : {
        shell: 'rgba(38, 52, 39, 0.96)',
        shellBorder: 'rgba(27, 44, 28, 0.64)',
        card: 'rgba(69, 89, 69, 0.92)',
        cardAlt: 'rgba(131, 160, 126, 0.86)',
        cardBorder: 'rgba(30, 53, 31, 0.48)',
        text: '#e6f2db',
        textMuted: '#c5dfbc',
        accent: '#6a9563',
        accentSoft: 'rgba(106, 149, 99, 0.3)',
        panelGlass: 'rgba(50, 67, 50, 0.82)',
      }
}

export default function SpotifyWidget({ isVisible }) {
  const { isDark } = useColorScheme()
  const ui = getSpotifyTheme(isDark)
  const tapTargetStyle = {
    minHeight: '44px',
    minWidth: '44px',
  }
  const [featuredTrack, setFeaturedTrack] = useState(null)
  const [statsTrack, setStatsTrack] = useState(null)
  const [featuredError, setFeaturedError] = useState(null)
  const [statsError, setStatsError] = useState(null)
  const [featuredRange, setFeaturedRange] = useState('24h')
  const [statsRange, setStatsRange] = useState('24h')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState(null)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [statsView, setStatsView] = useState('songs')

  const previewAudioRef = useRef(null)
  const isHidden = !isVisible

  const fetchTrack = useCallback(async (selectedRange) => {
    const response = await fetch(`/api/spotify?range=${selectedRange}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch track')
    }

    return response.json()
  }, [])

  const stopPreview = () => {
    const audio = previewAudioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setIsPreviewPlaying(false)
  }

  useEffect(() => {
    stopPreview()
    setPreviewUrl(null)
    setPreviewLoading(false)
    setPreviewError(null)
  }, [featuredTrack?.id, featuredRange])

  useEffect(() => {
    setStatsView('songs')
  }, [statsRange])

  useEffect(() => {
    return () => {
      stopPreview()
    }
  }, [])

  useEffect(() => {
    if (!isVisible) {
      return undefined
    }

    let cancelled = false

    const loadFeaturedTrack = async (silent = false) => {
      if (cancelled) return
      try {
        const data = await fetchTrack(featuredRange)
        if (cancelled) return
        setFeaturedTrack(data)
        if (!silent) {
          setFeaturedError(null)
        }
      } catch (err) {
        console.error('Error fetching featured Spotify track:', err)
        if (!silent) {
          setFeaturedError('Unable to load featured track')
        }
      }
    }

    const loadStatsTrack = async (silent = false) => {
      if (cancelled) return
      try {
        const data = await fetchTrack(statsRange)
        if (cancelled) return
        setStatsTrack(data)
        if (!silent) {
          setStatsError(null)
        }
      } catch (err) {
        console.error('Error fetching Spotify stats:', err)
        if (!silent) {
          setStatsError('Unable to load stats')
        }
      }
    }

    const refreshNow = async () => {
      await Promise.all([loadFeaturedTrack(false), loadStatsTrack(false)])
    }

    refreshNow()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        Promise.all([loadFeaturedTrack(true), loadStatsTrack(true)])
      }
    }

    const refreshInterval = window.setInterval(() => {
      Promise.all([loadFeaturedTrack(true), loadStatsTrack(true)])
    }, 5 * 60 * 1000)

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.clearInterval(refreshInterval)
    }
  }, [isVisible, fetchTrack, featuredRange, statsRange])

  const playPreview = async () => {
    if (!featuredTrack?.title || !featuredTrack?.artist) {
      setPreviewError('No track available for preview.')
      return
    }

    setPreviewError(null)

    try {
      let resolvedPreviewUrl = previewUrl

      if (!resolvedPreviewUrl) {
        setPreviewLoading(true)
        const response = await fetch(
          `/api/preview?title=${encodeURIComponent(featuredTrack.title)}&artist=${encodeURIComponent(featuredTrack.artist)}`,
          { cache: 'no-store' }
        )

        if (!response.ok) {
          throw new Error('Preview lookup failed')
        }

        const data = await response.json()
        resolvedPreviewUrl = data.previewUrl || null
        setPreviewUrl(resolvedPreviewUrl)
      }

      if (!resolvedPreviewUrl) {
        setPreviewError('No preview found for this track.')
        return
      }

      const audio = previewAudioRef.current
      if (!audio) return

      if (audio.src !== resolvedPreviewUrl) {
        audio.src = resolvedPreviewUrl
      }

      await audio.play()
      setIsPreviewPlaying(true)
    } catch (previewLookupError) {
      console.error('Preview playback failed:', previewLookupError)
      setPreviewError('Unable to play preview right now.')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handlePreviewToggle = async () => {
    if (isPreviewPlaying) {
      const audio = previewAudioRef.current
      if (!audio) return
      audio.pause()
      setIsPreviewPlaying(false)
      return
    }

    await playPreview()
  }

  const listItems = (() => {
    if (statsView === 'artists') {
      return (statsTrack?.leaderboards?.topArtists || []).map((entry) => ({
        id: entry.id,
        label: entry.name,
        value: `${entry.plays} plays`,
      }))
    }
    if (statsView === 'genres') {
      return (statsTrack?.leaderboards?.topGenres || []).map((entry) => ({
        id: entry.name,
        label: entry.name,
        value: `${entry.score} weighted plays`,
      }))
    }
    return (statsTrack?.leaderboards?.topSongs || []).map((entry) => ({
      id: entry.id,
      label: `${entry.title} — ${entry.artist}`,
      value: `${entry.plays} plays`,
    }))
  })()

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '24px',
        transform: 'translateX(-50%)',
        width: 'min(1080px, calc(100vw - 32px))',
        background: ui.shell,
        borderRadius: '16px',
        padding: '16px',
        zIndex: 1000,
        backdropFilter: 'blur(20px)',
        border: `2px solid ${ui.shellBorder}`,
        boxShadow: '0 15px 50px rgba(0, 0, 0, 0.8)',
        overflow: 'auto',
        maxHeight: 'min(78vh, 760px)',
        opacity: isHidden ? 0 : 1,
        pointerEvents: isHidden ? 'none' : 'auto',
        visibility: isHidden ? 'hidden' : 'visible',
        transition: 'opacity 0.25s ease',
      }}
    >
      {(featuredTrack || statsTrack) && (
        <>
          <audio
            ref={previewAudioRef}
            preload="none"
            onEnded={() => setIsPreviewPlaying(false)}
            onPause={() => setIsPreviewPlaying(false)}
            onPlay={() => setIsPreviewPlaying(true)}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px',
              alignItems: 'stretch'
            }}
          >
            <section
              style={{
                background: `linear-gradient(160deg, ${ui.cardAlt}, ${ui.panelGlass})`,
                border: `1px solid ${ui.cardBorder}`,
                borderRadius: '14px',
                padding: '14px'
              }}
            >
              <div style={{ color: ui.textMuted, fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.6px' }}>
                BACKGROUND INFO
              </div>
              <h3 style={{ margin: '8px 0 10px 0', color: ui.text }}>Music Dashboard</h3>
              <p style={{ margin: '0 0 10px 0', color: ui.textMuted, lineHeight: 1.45, fontSize: '13px' }}>
                This panel highlights what Ant has been listening to recently. Growing up, I always loved music and
                dancing; it&apos;s one of my biggest passions. In high school, I learned to play tenor saxophone, and I
                have recently learned guitar. I also performed for the Filipino Student Association, opening for
                Grammy-nominated Zara Larsson.
              </p>
              <a
                href="https://open.spotify.com/user/awesometony1234?si=297edd3fe99944e4"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: ui.text, fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
              >
                View Ant&apos;s Spotify profile
              </a>
            </section>

            <section
              style={{
                background: `linear-gradient(165deg, ${ui.card}, ${ui.panelGlass})`,
                border: `1px solid ${ui.cardBorder}`,
                borderRadius: '14px',
                padding: '14px'
              }}
            >
              {featuredTrack?.cover && (
                <Image
                  src={featuredTrack.cover}
                  alt={featuredTrack.title}
                  width={640}
                  height={640}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '10px',
                    marginBottom: '10px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                  }}
                />
              )}

              <div style={{ color: ui.textMuted, fontSize: '11px', marginBottom: '4px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                CURRENT FEATURED TRACK
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                {[
                  { key: '24h', label: '24h' },
                  { key: '7d', label: '7d' },
                  { key: '30d', label: '30d' },
                ].map((option) => (
                  <button
                    key={`featured-${option.key}`}
                    onClick={() => setFeaturedRange(option.key)}
                    style={{
                      flex: 1,
                      border: `1px solid ${ui.cardBorder}`,
                      borderRadius: '10px',
                      padding: '10px 12px',
                      ...tapTargetStyle,
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: ui.text,
                      background: featuredRange === option.key
                        ? `linear-gradient(135deg, ${ui.accent} 0%, ${ui.textMuted} 100%)`
                        : ui.panelGlass,
                      cursor: 'pointer'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <h3 style={{ margin: '0 0 2px 0', color: ui.text, fontSize: '20px', fontWeight: 'bold' }}>
                {featuredTrack?.title || '--'}
              </h3>
              <p style={{ margin: '0 0 12px 0', color: ui.textMuted, fontSize: '14px' }}>
                {featuredTrack?.artist || '--'}
              </p>

              <a
                href={featuredTrack?.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  border: `1px solid ${ui.cardBorder}`,
                  borderRadius: '18px',
                  padding: '9px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: ui.text,
                  background: `linear-gradient(135deg, ${ui.accent} 0%, ${ui.textMuted} 100%)`,
                  marginBottom: '8px'
                }}
              >
                Open in Spotify
              </a>

              <button
                onClick={handlePreviewToggle}
                disabled={previewLoading}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  ...tapTargetStyle,
                  background: isPreviewPlaying
                    ? `linear-gradient(135deg, ${ui.textMuted} 0%, ${ui.accent} 100%)`
                    : `linear-gradient(135deg, ${ui.accent} 0%, ${ui.cardAlt} 100%)`,
                  borderRadius: '18px',
                  color: ui.text,
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: `1px solid ${ui.cardBorder}`,
                  cursor: previewLoading ? 'not-allowed' : 'pointer',
                  opacity: previewLoading ? 0.75 : 1
                }}
              >
                {previewLoading ? 'Loading preview...' : isPreviewPlaying ? 'Stop Preview' : 'Play Preview (30s)'}
              </button>

              {previewError && (
                <div
                  style={{
                    marginTop: '8px',
                    color: ui.textMuted,
                    fontSize: '11px',
                    textAlign: 'center'
                  }}
                >
                  {previewError}
                </div>
              )}
              {featuredError && (
                <div style={{ marginTop: '8px', color: '#fca5a5', fontSize: '11px', textAlign: 'center' }}>
                  {featuredError}
                </div>
              )}
            </section>

            <section
              style={{
                background: `linear-gradient(165deg, ${ui.card}, ${ui.panelGlass})`,
                border: `1px solid ${ui.cardBorder}`,
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ color: ui.textMuted, fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.6px' }}>
                LISTENING STATS
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { key: '24h', label: '24h' },
                  { key: '7d', label: '7d' },
                  { key: '30d', label: '30d' },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setStatsRange(option.key)}
                    style={{
                      flex: 1,
                      border: `1px solid ${ui.cardBorder}`,
                      borderRadius: '12px',
                      padding: '10px 12px',
                      ...tapTargetStyle,
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: ui.text,
                      background: statsRange === option.key
                        ? `linear-gradient(135deg, ${ui.accent} 0%, ${ui.textMuted} 100%)`
                        : ui.panelGlass,
                      cursor: 'pointer'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: '8px'
                }}
              >
                <div style={{ background: ui.panelGlass, borderRadius: '10px', padding: '8px', border: `1px solid ${ui.cardBorder}` }}>
                  <div style={{ color: ui.textMuted, fontSize: '10px' }}>Total Plays</div>
                  <div style={{ color: ui.text, fontWeight: 'bold' }}>{statsTrack?.stats?.totalPlays ?? '--'}</div>
                </div>
                <div style={{ background: ui.panelGlass, borderRadius: '10px', padding: '8px', border: `1px solid ${ui.cardBorder}` }}>
                  <div style={{ color: ui.textMuted, fontSize: '10px' }}>Minutes</div>
                  <div style={{ color: ui.text, fontWeight: 'bold' }}>{statsTrack?.stats?.totalMinutesListened ?? '--'}</div>
                </div>
                <div style={{ background: ui.panelGlass, borderRadius: '10px', padding: '8px', border: `1px solid ${ui.cardBorder}` }}>
                  <div style={{ color: ui.textMuted, fontSize: '10px' }}>Unique Artists</div>
                  <div style={{ color: ui.text, fontWeight: 'bold' }}>{statsTrack?.stats?.uniqueArtists ?? '--'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { key: 'songs', label: 'Top Songs' },
                  { key: 'artists', label: 'Top 5 Artists' },
                  { key: 'genres', label: 'Top 5 Genres' },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setStatsView(option.key)}
                    style={{
                      flex: 1,
                      border: `1px solid ${ui.cardBorder}`,
                      borderRadius: '10px',
                      padding: '10px 12px',
                      ...tapTargetStyle,
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: ui.text,
                      background: statsView === option.key
                        ? ui.accentSoft
                        : ui.panelGlass,
                      cursor: 'pointer'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div
                style={{
                  background: ui.panelGlass,
                  border: `1px solid ${ui.cardBorder}`,
                  borderRadius: '10px',
                  padding: '10px',
                  minHeight: '160px'
                }}
              >
                {listItems.length === 0 ? (
                  <div style={{ color: ui.textMuted, fontSize: '12px' }}>No data available yet for this view.</div>
                ) : (
                  listItems.map((entry, index) => (
                    <div
                      key={entry.id || `${entry.label}-${index}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 0',
                        borderBottom: index === listItems.length - 1 ? 'none' : `1px solid ${ui.cardBorder}`
                      }}
                    >
                      <div style={{ color: ui.text, fontSize: '12px', lineHeight: 1.3 }}>{entry.label}</div>
                      <div style={{ color: ui.textMuted, fontSize: '11px', whiteSpace: 'nowrap' }}>{entry.value}</div>
                    </div>
                  ))
                )}
              </div>
              {statsError && (
                <div style={{ marginTop: '2px', color: '#fca5a5', fontSize: '11px' }}>
                  {statsError}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}