export const dynamic = 'force-dynamic'

const RANGE_CONFIG = {
  '24h': { hours: 24, label: 'Last 24 hours', maxPages: 8 },
  '7d': { hours: 24 * 7, label: 'Last 7 days', maxPages: 20 },
  '30d': { hours: 24 * 30, label: 'Last 30 days', maxPages: 60 },
}

function getRangeConfig(range) {
  return RANGE_CONFIG[range] || RANGE_CONFIG['24h']
}

async function spotifyFetch(accessToken, endpoint) {
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  return response
}

function summarizeRecentlyPlayed(items, windowStart) {
  const trackMap = new Map()
  const artistPlayMap = new Map()
  let totalDurationMs = 0
  let totalPlays = 0

  for (const item of items) {
    const playedAt = Date.parse(item.played_at)
    if (Number.isNaN(playedAt) || playedAt < windowStart || !item.track?.id) {
      continue
    }

    const track = item.track
    const key = track.id
    const durationMs = track.duration_ms || 0
    totalDurationMs += durationMs
    totalPlays += 1

    const existing = trackMap.get(key)
    const playCount = existing ? existing.playCount + 1 : 1

    const artists = track.artists || []
    const artistNames = artists.map((artist) => artist.name).filter(Boolean)

    for (const artist of artists) {
      if (!artist?.id || !artist?.name) continue
      const existingArtist = artistPlayMap.get(artist.id)
      artistPlayMap.set(artist.id, {
        id: artist.id,
        name: artist.name,
        plays: (existingArtist?.plays || 0) + 1,
      })
    }

    trackMap.set(key, {
      id: track.id,
      title: track.name || 'Unknown Title',
      artist: artistNames[0] || 'Unknown Artist',
      cover: track.album?.images?.[0]?.url || '',
      url: track.external_urls?.spotify || '',
      playCount,
      durationMs,
      lastPlayedAt: item.played_at,
    })
  }

  const rankedTracks = Array.from(trackMap.values()).sort((a, b) => {
    if (b.playCount !== a.playCount) {
      return b.playCount - a.playCount
    }

    return Date.parse(b.lastPlayedAt) - Date.parse(a.lastPlayedAt)
  })

  const topTrack = rankedTracks[0] || null
  const rankedArtists = Array.from(artistPlayMap.values()).sort((a, b) => b.plays - a.plays)

  return {
    topTrack,
    leaderboards: {
      topSongs: rankedTracks.slice(0, 5).map((trackEntry) => ({
        id: trackEntry.id,
        title: trackEntry.title,
        artist: trackEntry.artist,
        plays: trackEntry.playCount,
      })),
      topArtists: rankedArtists.slice(0, 5),
      topGenres: [],
    },
    artistPlayMap,
    stats: {
      totalPlays,
      uniqueTracks: rankedTracks.length,
      uniqueArtists: rankedArtists.length,
      totalMinutesListened: Number((totalDurationMs / 60000).toFixed(1)),
      topTrackPlayCount: topTrack?.playCount || 0,
    },
  }
}

async function getRecentlyPlayed(accessToken, windowStart, maxPages) {
  const allItems = []
  let beforeCursor = Date.now()

  for (let page = 0; page < maxPages; page += 1) {
    const params = new URLSearchParams({
      limit: '50',
      before: String(beforeCursor),
    })

    const response = await spotifyFetch(accessToken, `/me/player/recently-played?${params.toString()}`)
    if (!response.ok) {
      throw new Error(`Failed to load recently played tracks (status ${response.status})`)
    }

    const data = await response.json()
    const items = data.items || []

    if (items.length === 0) {
      break
    }

    allItems.push(...items)

    const oldestItem = items[items.length - 1]
    const oldestTimestamp = Date.parse(oldestItem.played_at)
    const cursorBefore = data.cursors?.before ? Number(data.cursors.before) : oldestTimestamp - 1

    if (!Number.isFinite(cursorBefore) || oldestTimestamp < windowStart) {
      break
    }

    beforeCursor = cursorBefore
  }

  return allItems
}

async function getTopGenres(accessToken, artistPlayMap) {
  const artistIds = Array.from(artistPlayMap.keys())
  if (artistIds.length === 0) {
    return []
  }

  const genreScores = new Map()

  for (let index = 0; index < artistIds.length; index += 50) {
    const batchIds = artistIds.slice(index, index + 50)
    const response = await spotifyFetch(accessToken, `/artists?ids=${batchIds.join(',')}`)
    if (!response.ok) {
      continue
    }

    const data = await response.json()
    const artists = data.artists || []

    for (const artist of artists) {
      if (!artist?.id) continue
      const playData = artistPlayMap.get(artist.id)
      if (!playData) continue
      const weight = playData.plays || 1

      for (const genre of artist.genres || []) {
        const current = genreScores.get(genre) || 0
        genreScores.set(genre, current + weight)
      }
    }
  }

  return Array.from(genreScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, score]) => ({ name, score }))
}

async function getTopTrackFallback(accessToken) {
  const response = await spotifyFetch(accessToken, '/me/top/tracks?time_range=short_term&limit=1')
  if (!response.ok) {
    return null
  }

  const data = await response.json()
  const topTrack = data.items?.[0]
  if (!topTrack) {
    return null
  }

  return {
    topTrack: {
      id: topTrack.id,
      title: topTrack.name || 'Unknown Title',
      artist: topTrack.artists?.[0]?.name || 'Unknown Artist',
      cover: topTrack.album?.images?.[0]?.url || '',
      url: topTrack.external_urls?.spotify || '',
      playCount: null,
      durationMs: topTrack.duration_ms || 0,
      lastPlayedAt: null,
    },
    stats: {
      totalPlays: null,
      uniqueTracks: null,
      uniqueArtists: null,
      totalMinutesListened: null,
      topTrackPlayCount: null,
    },
    leaderboards: {
      topSongs: [],
      topArtists: [],
      topGenres: [],
    },
  }
}

export async function GET(request) {
  try {
    const range = new URL(request.url).searchParams.get('range') || '24h'
    const rangeConfig = getRangeConfig(range)

    const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

    if (!clientId || !clientSecret || !refreshToken) {
      return Response.json(
        {
          error: 'Spotify environment variables are incomplete',
          expected: [
            'SPOTIFY_CLIENT_ID',
            'SPOTIFY_CLIENT_SECRET',
            'SPOTIFY_REFRESH_TOKEN',
          ],
        },
        { status: 500 }
      )
    }

    const authResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
      cache: 'no-store',
    })

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      throw new Error(`Failed to refresh Spotify token (${authResponse.status}): ${errorText}`)
    }

    const authData = await authResponse.json()
    const accessToken = authData.access_token
    const expiresIn = authData.expires_in || 3600

    const now = Date.now()
    const windowStart = now - rangeConfig.hours * 60 * 60 * 1000

    let topTrack = null
    let stats = null
    let leaderboards = { topSongs: [], topArtists: [], topGenres: [] }
    let source = 'recently-played'

    try {
      const recentItems = await getRecentlyPlayed(accessToken, windowStart, rangeConfig.maxPages)
      const summary = summarizeRecentlyPlayed(recentItems, windowStart)
      topTrack = summary.topTrack
      stats = summary.stats
      const topGenres = await getTopGenres(accessToken, summary.artistPlayMap)
      leaderboards = {
        ...summary.leaderboards,
        topGenres,
      }
    } catch (historyError) {
      console.warn('Failed to load recently played history:', historyError)
    }

    if (!topTrack) {
      const fallback = await getTopTrackFallback(accessToken)
      topTrack = fallback?.topTrack || null
      stats = fallback?.stats || null
      leaderboards = fallback?.leaderboards || leaderboards
      source = 'top-tracks-short-term'
    }

    if (!topTrack) {
      return Response.json(
        { error: 'No track data available for this account yet.' },
        { status: 404 }
      )
    }

    return Response.json(
      {
        accessToken,
        expiresIn,
        range,
        rangeLabel: rangeConfig.label,
        source,
        fetchedAt: now,
        windowStart,
        ...topTrack,
        stats,
        leaderboards,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Spotify API error:', error)
    return Response.json(
      { error: 'Failed to fetch Spotify data', details: error.message },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}
