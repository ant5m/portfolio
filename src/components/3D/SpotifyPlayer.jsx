'use client'
import { useEffect, useState, useRef } from 'react'

export default function SpotifyPlayer({ accessToken, trackId, isVisible }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [deviceId, setDeviceId] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)
  const playerRef = useRef(null)

  // Load Spotify Web Playback SDK
  useEffect(() => {
    if (!accessToken) return

    setDeviceId(null)
    setIsReady(false)
    setIsPlaying(false)
    setError(null)

    let isCancelled = false

    const initPlayer = () => {
      if (isCancelled || !window.Spotify?.Player) return

      const player = new window.Spotify.Player({
        name: 'Portfolio Player',
        getOAuthToken: (callback) => {
          callback(accessToken)
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
        setError('Spotify player failed to initialize.')
      })
      player.addListener('authentication_error', (e) => {
        console.error(e)
        setError('Spotify authentication failed.')
      })
      player.addListener('account_error', (e) => {
        console.error(e)
        setError('Spotify account error. Make sure you have Premium.')
      })

      player.connect()
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
  }, [accessToken])

  const transferPlayback = async () => {
    if (!deviceId) return false
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false,
        }),
      })
      return response.ok
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
      const playRequest = () =>
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: [`spotify:track:${trackId}`],
          }),
        })

      let response = await playRequest()

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
      } else {
        setError('Playback failed. Try opening Spotify and retry.')
      }
    } catch (error) {
      console.error('Error playing track:', error)
      setError('Playback failed due to a network error.')
    }

    return
  }

  const togglePlayback = async () => {
    if (!deviceId || !isReady) {
      setError('Spotify device not ready yet. Open Spotify and try again.')
      return
    }

    if (isPlaying) {
      const response = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      if (response.ok) {
        setIsPlaying(false)
        setError(null)
      } else {
        setError('Pause failed. Try again in a moment.')
      }
    } else {
      playTrack()
    }
  }

  if (!isVisible || !accessToken) return null

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
