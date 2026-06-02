'use client'
import { useEffect, useState, useRef } from 'react'
import SpotifyPlayer from './SpotifyPlayer'

export default function SpotifyWidget({ isVisible }) {
  const [track, setTrack] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Dragging and resizing state
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [width, setWidth] = useState(280)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, width: 0 })
  const widgetRef = useRef(null)
  const hasFetchedRef = useRef(false)
  const isHidden = !isVisible

  // Initialize position to center on mount
  useEffect(() => {
    if (isVisible) {
      setPosition({
        x: window.innerWidth / 2 - 140,
        y: 420
      })
    }
  }, [isVisible])

  // Fetch track data - only fetch once, don't reload if already on Music wall
  useEffect(() => {
    if (!isVisible || hasFetchedRef.current) return

    const fetchTrack = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/spotify')
        if (!response.ok) throw new Error('Failed to fetch track')
        const data = await response.json()
        setTrack(data)
        setAccessToken(data.accessToken)
        hasFetchedRef.current = true
      } catch (err) {
        console.error('Error fetching Spotify track:', err)
        setError('Unable to load song')
      } finally {
        setLoading(false)
      }
    }

    fetchTrack()
  }, [isVisible])

  // Handle dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('[data-no-drag]')) return
    
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  // Handle resizing - allows both expanding and shrinking
  const handleResizeMouseDown = (e) => {
    e.preventDefault()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      width: width
    })
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e) => {
      const delta = e.clientX - resizeStart.x
      const newWidth = Math.max(200, resizeStart.width + delta)
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeStart])

  return (
    <div
      ref={widgetRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        background: 'rgba(0, 0, 0, 0.95)',
        borderRadius: '14px',
        padding: '16px',
        zIndex: 1000,
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 105, 180, 0.4)',
        boxShadow: '0 15px 50px rgba(0, 0, 0, 0.8)',
        animation: 'slideDown 0.4s ease-out',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: isDragging ? 'none' : 'auto',
        overflow: 'hidden',
        opacity: isHidden ? 0 : 1,
        pointerEvents: isHidden ? 'none' : 'auto',
        visibility: isHidden ? 'hidden' : 'visible'
      }}
    >
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Resize handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          width: '20px',
          height: '20px',
          cursor: 'nwse-resize',
          background: 'linear-gradient(135deg, transparent 50%, rgba(255, 105, 180, 0.5) 50%)',
          borderBottomRightRadius: '12px',
          zIndex: 10
        }}
        data-no-drag="true"
      />

      {loading && (
        <div style={{ color: 'white', textAlign: 'center', padding: '20px 10px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Loading song...</div>
        </div>
      )}

      {error && (
        <div style={{ color: '#ff69b4', textAlign: 'center', padding: '20px 10px' }}>
          {error}
        </div>
      )}

      {track && (
        <>
          <a
            href={track.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
              pointerEvents: 'auto'
            }}
            data-no-drag="true"
          >
            {track.cover && (
              <img
                src={track.cover}
                alt={track.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '10px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  boxShadow: '0 6px 20px rgba(255, 105, 180, 0.2)',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)'
                  e.target.style.boxShadow = '0 10px 30px rgba(255, 105, 180, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.boxShadow = '0 6px 20px rgba(255, 105, 180, 0.2)'
                }}
              />
            )}
            <div style={{ color: '#ff69b4', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              SONG OF THE DAY
            </div>
            <h3
              style={{
                margin: '0 0 2px 0',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {track.title}
            </h3>
            <p
              style={{
                margin: '0 0 12px 0',
                color: '#b0b0b0',
                fontSize: '12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {track.artist}
            </p>
            <div
              style={{
                padding: '8px 12px',
                background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
                borderRadius: '18px',
                textAlign: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                border: 'none'
              }}
              onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
            >
              Open in Spotify
            </div>
          </a>

          {/* Player controls */}
          <SpotifyPlayer accessToken={accessToken} trackId={track.id} isVisible={true} />
        </>
      )}
    </div>
  )
}
