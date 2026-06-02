export async function GET() {
  try {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

    if (!refreshToken) {
      return Response.json(
        { error: 'Spotify refresh token not configured' },
        { status: 500 }
      )
    }

    // Get new access token using refresh token
    const authResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`
    })

    if (!authResponse.ok) {
      throw new Error('Failed to refresh Spotify token')
    }

    const authData = await authResponse.json()
    const accessToken = authData.access_token

    // Get top tracks (most listened recently)
    const tracksResponse = await fetch(
      'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=1',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    let trackData = null

    if (tracksResponse.ok) {
      const tracksData = await tracksResponse.json()
      if (tracksData.items && tracksData.items.length > 0) {
        trackData = tracksData.items[0]
      }
    }

    // Fallback: Get recently played
    if (!trackData) {
      const recentResponse = await fetch(
        'https://api.spotify.com/v1/me/player/recently_played?limit=1',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (recentResponse.ok) {
        const recentData = await recentResponse.json()
        if (recentData.items && recentData.items.length > 0) {
          trackData = recentData.items[0].track
        }
      }
    }

    if (!trackData) {
      return Response.json(
        { error: 'No track data available' },
        { status: 404 }
      )
    }

    return Response.json({
      accessToken,
      title: trackData.name,
      artist: trackData.artists[0]?.name || 'Unknown Artist',
      cover: trackData.album?.images?.[0]?.url || '',
      url: trackData.external_urls?.spotify || '',
      id: trackData.id
    })

  } catch (error) {
    console.error('Spotify API error:', error)
    return Response.json(
      { error: 'Failed to fetch track data', details: error.message },
      { status: 500 }
    )
  }
}
