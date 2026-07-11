'use client'
import { useEffect, useRef, useState } from 'react'

export default function SpotifyPlayer({ accessToken, getAccessToken, trackId, isVisible }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [deviceId, setDeviceId] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

  const playerRef = useRef(null)
  const accessTokenRef = useRef(accessToken)
  const getAccessTokenRef = useRef(getAccessToken)

  useEffect(() => {
    accessTokenRef.current = accessToken
  }, [accessToken])

  useEffect(() => {
    getAccessTokenRef.current = getAccessToken
  }, [getAccessToken])

  const resolveAccessToken = async (forceRefresh = false) => {
    if (typeof getAccessTokenRef.current === 'function') {
      const token = await getAccessTokenRef.current({ forceRefresh })
      if (token) {
        return token
      }
    }

    return accessTokenRef.current || null
  }

  const spotifyFetch = async (url, options = {}, retryOnUnauthorized = true) => {
    const token = await resolveAccessToken(false)
    if (!token) {
      return null
    }

    const makeRequest = async (authToken) => {
      const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${authToken}`
      }

      return fetch(url, {
        ...options,
        headers
      })
    }

    let response = await makeRequest(token)

    if (response.status === 401 && retryOnUnauthorized) {
      const refreshedToken = await resolveAccessToken(true)
      if (refreshedToken && refreshedToken !== token) {
        response = await makeRequest(refreshedToken)
      }
    }

    return response
  }

  useEffect(() => {
    if (!isVisible) return undefined

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const isMobileBrowser = /Android|iPhone|iPad|iPod/i.test(userAgent)
    if (isMobileBrowser) {
      setDeviceId(null)
      setIsReady(false)
      setError('Spotify Web Playback is not supported on mobile browsers. Use Open in Spotify, or use desktop Chrome.')
      return undefined
    }

    let isCancelled = false

    const initPlayer = async () => {
      if (isCancelled || !window.Spotify?.Player) return

      let initialToken = accessTokenRef.current
      if (!initialToken) {
        initialToken = await resolveAccessToken(true)
      }
      if (isCancelled || !initialToken) return
      accessTokenRef.current = initialToken

      const player = new window.Spotify.Player({
        name: 'Portfolio Player',
        getOAuthToken: (callback) => {
          // Provide token immediately; refresh in background to reduce SDK init race conditions.
          const cachedToken = accessTokenRef.current
          if (cachedToken) {
            callback(cachedToken)
            resolveAccessToken(false)
              .then((token) => {
                if (token) {
                  accessTokenRef.current = token
                }
              })
              .catch(() => {
                // Keep using the cached token until Spotify asks again.
              })
            return
          }

          resolveAccessToken(true)
            .then((token) => {
              if (token) {
                accessTokenRef.current = token
                callback(token)
                return
              }
              setError('Spotify authentication failed.')
            })
            .catch(() => {
              setError('Spotify authentication failed.')
            })
        },
        volume: 0.5,
      })

      playerRef.current = player

      player.addListener('player_state_changed', (state) => {
        if (state) {
          setIsPlaying(!state.paused)
        }
      })

      player.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id)
        setIsReady(true)
        setError(null)
      })

      player.addListener('not_ready', () => {
        setDeviceId(null)
        setIsReady(false)
      })

      player.addListener('initialization_error', (e) => {
        console.error(e)
        const details = e?.message ? ` (${e.message})` : ''
        setError(`Spotify player failed to initialize${details}. Try Chrome, non-private mode.`)
      })

      player.addListener('authentication_error', (e) => {
        console.error(e)
        setError('Spotify authentication failed. Check token/scopes and reconnect.')
      })

      player.addListener('account_error', (e) => {
        console.error(e)
        setError('Spotify account error. Make sure you have Premium.')
      })

      const connected = await player.connect()
      if (!connected && !isCancelled) {
        setError('Unable to connect Spotify player. Keep Spotify open and retry.')
      }
    }

    if (window.Spotify?.Player) {
      initPlayer()
    } else {
      const existingScript = document.getElementById('spotify-player-sdk')
      if (!existingScript) {
        const script = document.createElement('script')
        script.id = 'spotify-player-sdk'
        script.src = 'https://sdk.scdn.co/spotify-player.js'
        script.async = true
        script.onload = () => initPlayer()
        document.body.appendChild(script)
      }

      window.onSpotifyWebPlaybackSDKReady = () => initPlayer()
    }

    return () => {
      isCancelled = true
      if (playerRef.current) {
        playerRef.current.disconnect()
      }
    }
  }, [isVisible])

  const transferPlayback = async () => {
    if (!deviceId) return false

    try {
      const response = await spotifyFetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false,
        }),
      })

      return Boolean(response && response.ok)
    } catch (error) {
      console.error('Error transferring playback:', error)
      return false
    }
  }

  const playTrack = async () => {
    if (!deviceId || !isReady) {
      setError('Spotify device not ready yet. Open Spotify and try again.')
      return
    }

    if (!trackId) {
      setError('No track selected to play.')
      return
    }

    try {
      const playRequest = () => spotifyFetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: [`spotify:track:${trackId}`],
        }),
      })

      let response = await playRequest()

      if (!response) {
        setError('Spotify authentication failed. Please reconnect.')
        return
      }

      if (response.status === 404) {
        const transferred = await transferPlayback()
        if (transferred) {
          response = await playRequest()
        }
      }

      if (response.ok) {
        setIsPlaying(true)
        setError(null)
      } else if (response.status === 404) {
        setError('Spotify device not found. Open Spotify and try again.')
      } else if (response.status === 401) {
        setError('Spotify session expired. Refreshing token and try again.')
      } else {
        setError('Playback failed. Try opening Spotify and retry.')
      }
    } catch (error) {
      console.error('Error playing track:', error)
      setError('Playback failed due to a network error.')
    }
  }

  const togglePlayback = async () => {
    if (!deviceId || !isReady) {
      setError('Spotify device not ready yet. Open Spotify and try again.')
      return
    }

    if (isPlaying) {
      const response = await spotifyFetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
        method: 'PUT',
      })

      if (!response) {
        setError('Spotify authentication failed. Please reconnect.')
        return
      }

      if (response.ok) {
        setIsPlaying(false)
        setError(null)
      } else if (response.status === 401) {
        setError('Spotify session expired. Refreshing token and try again.')
      } else {
        setError('Pause failed. Try again in a moment.')
      }
    } else {
      playTrack()
    }
  }

  if (!isVisible || (!accessToken && typeof getAccessToken !== 'function')) return null

  return (
    <div
      style={{
        marginTop: '12px',
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'stretch'
      }}
    >
      <button
        onClick={togglePlayback}
        disabled={!deviceId || !isReady}
        style={{
          flex: 1,
          padding: '10px 16px',
          background: isPlaying
            ? 'linear-gradient(135deg, #ff69b4 0%, #ff85c9 100%)'
            : 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
          borderRadius: '20px',
          textAlign: 'center',
          color: 'white',
          fontSize: '13px',
          fontWeight: 'bold',
          cursor: !deviceId || !isReady ? 'not-allowed' : 'pointer',
          transition: 'transform 0.2s',
          border: 'none',
          opacity: !deviceId || !isReady ? 0.6 : 1
        }}
        onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      {error && (
        <div style={{ color: '#ff69b4', fontSize: '11px', textAlign: 'center' }}>
          {error}
        </div>
      )}
    </div>
  )
}