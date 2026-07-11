'use client'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Model from './Model'
import DayEnvironment from './DayEnvironment'
import NightEnvironment from './NightEnvironment'
import SpotifyWidget from './SpotifyWidget'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import gsap from 'gsap'
import * as THREE from 'three'
import { useMediaQuery } from 'react-responsive'

const WALL_PANELS = {
  'About Me': {
    title: 'About Me',
    intro: 'I am Ant, a builder focused on blending design, software, and interactive storytelling.',
    bullets: [
      'First-generation student creating memorable digital experiences.',
      'Portfolio focus: clean UX, performance, and technical depth.',
      'Open to software engineering and product-facing roles.',
    ],
  },
  Vending: {
    title: 'Vending',
    intro: 'A look into my vending projects, operations, and business experiments.',
    bullets: [
      'Machine sourcing, inventory planning, and route optimization.',
      'Real-world KPI tracking: revenue, restock cadence, product mix.',
      'Lessons learned from owning and operating physical systems.',
    ],
  },
  'Experience & Skills': {
    title: 'Experience & Skills',
    intro: 'Projects and tools that show both technical and practical execution.',
    bullets: [
      'Frontend: React, Next.js, animation, and interactive 3D workflows.',
      'Backend/API: auth flows, data shaping, and integrations like Spotify.',
      'Mindset: iterate quickly, validate with users, ship improvements.',
    ],
  },
  
}

const ABOUT_ME_POPUPS = {
  about: {
    title: 'About Me',
    paragraphs: [
      'I am Ant, a first-generation builder who loves combining software, design, and storytelling, and this portfolio is my interactive playground for shipping ideas that feel personal and memorable.',
    ],
  },
  whyMatcha: {
    title: 'Why Matcha?',
    paragraphs: [
      'Matcha is always associated with me and who I am as a person. I think matcha is an experience, not just a drink. That was my goal with this matcha shop concept. I wanted users to click and explore it as an interactive experience. Matcha is also such a delicious drink that I wanted to showcase it for those who don\'t know much about it.',
    ],
  },
  favoriteShops: {
    title: 'Favorite Matcha Shops',
    paragraphs: [],
  },
}

const FAVORITE_MATCHA_SHOP_QUERIES = [
  { place: 'Matcha Cafe Maiko', location: 'Boston, MA', area: 'Boston' },
  { place: 'Phin Coffee House', location: 'Boston, MA', area: 'Boston' },
  { place: 'Faro', location: 'Boston, MA', area: 'Boston' },
  { place: 'Verveine Cafe', location: 'Boston, MA', area: 'Boston' },
  { place: 'Phinista', location: 'Boston, MA', area: 'Boston' },
  { place: 'Cheongsu NJ', location: 'New Jersey', area: 'NJ' },
  { place: 'Silence Please', location: 'New York, NY', area: 'NYC' },
  { place: 'Zen Cha Matcha', location: 'Connecticut', area: 'Connecticut' },
]

const PHOTO_COLLECTIONS = [
  { key: 'film', label: 'Film' },
  { key: 'favorite_memories', label: 'Favorite Memories' },
]

const EXPERIENCE_LINKS = [
  {
    key: 'email',
    position: [-0.98, 1.24, -1.1],
  },
  {
    key: 'linkedin',
    url: 'https://www.linkedin.com/in/anthony-sevilla-meza/',
    position: [-0.1, 1.24, -1.1],
  },
  {
    key: 'github',
    url: 'https://github.com/ant5m',
    position: [0.78, 1.24, -1.1],
  },
]

const DEFAULT_EXPERIENCE_ICON_URLS = {
  email: '/experience_icons/email.jpg',
  linkedin: '/experience_icons/linkedin.png',
  github: '/experience_icons/github.jpg',
}

const EXPERIENCE_SKILLS = [
  'Java',
  'JavaScript',
  'Go',
  'HTML',
  'CSS',
  'SQL',
  'TypeScript',
  'Python',
  'React',
  'Next.js',
  'Flask',
  'FastAPI',
  'Tailwind',
  'GSAP',
  'Three.js',
  'Docker',
  'Linux',
  'Git',
  'GitHub',
  'pandas',
  'NumPy',
  'Matplotlib',
  'scikit-learn',
  'Spotipy',
  'PostgreSQL',
  'APIs',
  'Machine Learning',
  'Data Analysis',
  'System Design',
  'UI/UX',
  'Product Thinking',
]

const EXPERIENCE_PROJECTS = [
  {
    title: 'NBA Prediction Model',
    summary: 'Built a FastAPI + Next.js prediction platform with PostgreSQL and daily automated NBA predictions.',
    projectUrl: 'https://github.com/ant5m/NBA_pred_model',
  },
  {
    title: 'P-Block (Privacy Blocker)',
    summary: 'Developed a real-time privacy masking system using Python, FastAPI, OCR, and a custom ML classifier.',
    imageSrc: '/projects/p-block-boston-hacks.png',
    imageAlt: 'P-Block app screenshot from Boston Hacks',
    projectUrl: 'https://github.com/ant5m/Boston-Hacks-F25',
    devpostUrl: 'https://devpost.com/software/p-block',
  },
  {
    title: 'Boston Bus Inequity Analysis',
    summary: 'Analyzed MBTA data (2017-2024) and surfaced delay inequities across routes and service windows.',
    imageSrc: '/projects/boston-bus-equity.png',
    imageAlt: 'Boston bus equity ridership comparison chart',
    projectUrl: 'https://github.com/ant5m/506-data-analysis',
  },
]

const EXPERIENCE_ITEMS = [
  {
    title: 'Data Analyst — Boston University Orientation',
    detail: 'Built analytics workflows and notebooks that reduced processing time by 80% while supporting 4,000+ students.',
    imageSrc: '/projects/bu-orientation.png',
    imageAlt: 'Boston University Orientation logo',
  },
  {
    title: 'President — Kappa Theta Pi (Lambda Chapter)',
    detail: 'Lead a 100+ member professional technology fraternity, driving strategic initiatives and operational planning.',
    imageSrc: '/projects/ktp-lambda-chapter-v2.png',
    imageAlt: 'Kappa Theta Pi Lambda Chapter logo',
  },
  {
    title: 'Treasurer — Filipino Student Association',
    detail: 'Managed a $20K+ budget with transparent reporting and strategic financial planning.',
    imageSrc: '/projects/fsa-bu.png',
    imageAlt: 'Filipino Student Association Boston University logo',
  },
]

const RESUME_FILE_PATH = '/experience_icons/Anthony%20Sevilla%20Meza%20Resume%20(6)%20copy.pdf'
const TAP_TARGET_STYLE = {
  minWidth: '44px',
  minHeight: '44px',
}
const CANVAS_GL_SETTINGS = {
  antialias: false,
  powerPreference: 'high-performance',
}

function getRetroUiTheme(isDark) {
  return isDark
    ? {
        surfaceStrong: 'rgba(78, 64, 138, 0.94)',
        surface: 'rgba(56, 42, 111, 0.92)',
        surfaceSoft: 'rgba(37, 29, 76, 0.86)',
        panel: 'rgba(28, 23, 60, 0.95)',
        border: 'rgba(176, 145, 255, 0.42)',
        borderStrong: 'rgba(188, 157, 255, 0.72)',
        text: '#efe8ff',
        textMuted: '#d7c7ff',
        accent: '#8d73dc',
        accentSoft: 'rgba(141, 115, 220, 0.24)',
        overlay: 'rgba(9, 6, 28, 0.58)',
        shadow: '0 16px 38px rgba(8, 4, 22, 0.52)',
      }
    : {
        surfaceStrong: 'rgba(131, 160, 126, 0.94)',
        surface: 'rgba(69, 89, 69, 0.92)',
        surfaceSoft: 'rgba(50, 67, 50, 0.86)',
        panel: 'rgba(38, 52, 39, 0.94)',
        border: 'rgba(30, 53, 31, 0.45)',
        borderStrong: 'rgba(27, 44, 28, 0.72)',
        text: '#e6f2db',
        textMuted: '#c5dfbc',
        accent: '#6a9563',
        accentSoft: 'rgba(106, 149, 99, 0.26)',
        overlay: 'rgba(8, 16, 9, 0.52)',
        shadow: '0 16px 36px rgba(9, 16, 10, 0.42)',
      }
}

function normalizeAngle(angle) {
  let value = angle
  while (value > Math.PI) value -= Math.PI * 2
  while (value < -Math.PI) value += Math.PI * 2
  return value
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value))
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2
}

function AboutMeHotspots({ enabled, onSelect }) {
  const [hoveredKey, setHoveredKey] = useState(null)

  useEffect(() => {
    if (!enabled) {
      setHoveredKey(null)
      return
    }

    document.body.style.cursor = hoveredKey ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [enabled, hoveredKey])

  if (!enabled) {
    return null
  }

  const hotspots = [
    {
      key: 'about',
      position: [0.065, 1.34,  1.3],
      size: [0.5, 0.20],
    },
    {
      key: 'whyMatcha',
      position: [0.12, 1.10, 1.3],
      size: [.62, 0.20],
    },
    {
      key: 'favoriteShops',
      position: [0.35, 0.87, 1.3],
      size: [1.10, 0.22],
    },
  ]

  return (
    <group>
      {hotspots.map((hotspot) => {
        const isHovered = hoveredKey === hotspot.key
        return (
          <mesh
            key={hotspot.key}
            position={hotspot.position}
            onPointerOver={(event) => {
              event.stopPropagation()
              setHoveredKey(hotspot.key)
            }}
            onPointerOut={(event) => {
              event.stopPropagation()
              setHoveredKey((current) => (current === hotspot.key ? null : current))
            }}
            onPointerDown={(event) => {
              event.stopPropagation()
            }}
            onClick={(event) => {
              event.stopPropagation()
              onSelect(hotspot.key)
            }}
          >
            <planeGeometry args={hotspot.size} />
            <meshBasicMaterial
              color={isHovered ? '#34d399' : '#b0e0e6'}
              transparent
              opacity={isHovered ? 0.28 : 0.08}
              depthWrite={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function AboutMeHeadshot() {
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    let mounted = true
    const loader = new THREE.TextureLoader()

    loader.load(
      '/headshot.jpg',
      (loadedTexture) => {
        if (!mounted) return
        loadedTexture.colorSpace = THREE.SRGBColorSpace
        loadedTexture.needsUpdate = true
        setTexture(loadedTexture)
      },
      undefined,
      () => {
        // Keep rendering a neutral placeholder frame if the image is missing.
        if (mounted) setTexture(null)
      }
    )

    return () => {
      mounted = false
    }
  }, [])

  return (
    <group position={[-1.05, 1, 1.3]} rotation={[0, 0, 0]}>
      <mesh position={[0, 0, -0.012]}>
        <boxGeometry args={[1.02, 1.36, 0.04]} />
        <meshStandardMaterial color="#3a2f24" metalness={0.15} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0, 0.013]}>
        <planeGeometry args={[0.86, 1.2]} />
        {texture ? (
          <meshBasicMaterial
            map={texture}
            toneMapped={false}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        ) : (
          <meshStandardMaterial color="#d1d5db" roughness={0.9} metalness={0} />
        )}
      </mesh>
    </group>
  )
}

function SkyBackground({ isDark }) {
  const { scene } = useThree()

  useEffect(() => {
    const previousBackground = scene.background
    let mounted = true
    let loadedTexture = null
    const texturePath = isDark ? '/night_sky.jpg' : '/sky_texture.jpg'
    const fallbackColor = isDark ? '#0a0e27' : '#87CEEB'

    const loader = new THREE.TextureLoader()
    loader.load(
      texturePath,
      (texture) => {
        if (!mounted) return
        texture.colorSpace = THREE.SRGBColorSpace
        loadedTexture = texture
        scene.background = texture
      },
      undefined,
      () => {
        if (mounted) {
          scene.background = new THREE.Color(fallbackColor)
        }
      }
    )

    return () => {
      mounted = false
      scene.background = previousBackground
      if (loadedTexture) {
        loadedTexture.dispose()
      }
    }
  }, [isDark, scene])

  return null
}

function CustomFloor({ isDark }) {
  const { gl } = useThree()
  const [dayTexture, nightTexture] = useLoader(THREE.TextureLoader, ['/flooring.jpg', '/night_floor.jpg'])

  useEffect(() => {
    const allTextures = [dayTexture, nightTexture]
    const maxAnisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy())
    allTextures.forEach((loadedTexture) => {
      if (!loadedTexture) return
      loadedTexture.colorSpace = THREE.SRGBColorSpace
      loadedTexture.wrapS = THREE.RepeatWrapping
      loadedTexture.wrapT = THREE.RepeatWrapping
      loadedTexture.minFilter = THREE.LinearMipmapLinearFilter
      loadedTexture.magFilter = THREE.LinearFilter
      loadedTexture.generateMipmaps = true
      loadedTexture.anisotropy = maxAnisotropy
      loadedTexture.repeat.set(20, 20)
      loadedTexture.center.set(0.5, 0.5)
      loadedTexture.rotation = Math.PI
      loadedTexture.needsUpdate = true
    })
  }, [dayTexture, nightTexture, gl])

  const activeTexture = isDark ? nightTexture : dayTexture

  return (
    <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[13.75, 13.75]} />
      <meshStandardMaterial
        map={activeTexture || undefined}
        color={activeTexture ? '#ffffff' : isDark ? '#5b4aa3' : '#8bc34a'}
        roughness={0.92}
        metalness={0.02}
        side={THREE.DoubleSide}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  )
}

function MusicWallVinyl({ onOpenMusicDashboard }) {
  const [texture, setTexture] = useState(null)
  const [isHovered, setIsHovered] = useState(false)
  const vinylRef = useRef(null)

  useEffect(() => {
    let mounted = true
    const loader = new THREE.TextureLoader()

    loader.load(
      '/matchavinyl.jpg',
      (loadedTexture) => {
        if (!mounted) return
        loadedTexture.colorSpace = THREE.SRGBColorSpace
        loadedTexture.needsUpdate = true
        setTexture(loadedTexture)
      },
      undefined,
      () => {
        if (mounted) setTexture(null)
      }
    )

    return () => {
      mounted = false
    }
  }, [])

  useFrame(() => {
    if (vinylRef.current) {
      // Slow clockwise rotation for a vinyl feel.
      vinylRef.current.rotation.z -= 0.005
    }
  })

  useEffect(() => {
    document.body.style.cursor = isHovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [isHovered])

  const handleVinylClick = (event) => {
    event.stopPropagation()
    onOpenMusicDashboard?.()
  }

  return (
    <group
      ref={vinylRef}
      position={[-1.98, 1.2, 0.1]}
      rotation={[0, -Math.PI / 2, 0]}
      scale={isHovered ? 1.03 : 1}
      onPointerOver={(event) => {
        event.stopPropagation()
        setIsHovered(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setIsHovered(false)
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={handleVinylClick}
    >
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[0.56, 40]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.7}
          metalness={0.25}
          emissive={isHovered ? '#34d399' : '#000000'}
          emissiveIntensity={isHovered ? 0.25 : 0}
          side={THREE.FrontSide}
        />
      </mesh>

      <mesh position={[0, 0, 0.004]}>
        <circleGeometry args={[0.495, 40]} />
        {texture ? (
          <meshBasicMaterial
            map={texture}
            toneMapped={false}
            side={THREE.FrontSide}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        ) : (
          <meshStandardMaterial
            color="#1f2937"
            roughness={0.9}
            metalness={0}
            side={THREE.FrontSide}
          />
        )}
      </mesh>

      <mesh position={[0, 0, 0.008]}>
        <ringGeometry args={[0.07, 0.15, 32]} />
        <meshBasicMaterial color="#111827" toneMapped={false} side={THREE.FrontSide} />
      </mesh>

      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.055, 24]} />
        <meshBasicMaterial color="#cbd5e1" toneMapped={false} side={THREE.FrontSide} />
      </mesh>
    </group>
  )
}

function VendingMachineHotspot({ enabled, onSelect }) {
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setIsHovered(false)
      return
    }

    document.body.style.cursor = isHovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [enabled, isHovered])

  if (!enabled) {
    return null
  }

  return (
    <mesh
      position={[2.35, 1.15, 0.2]}
      rotation={[0, Math.PI / 2, 0]}
      onPointerOver={(event) => {
        event.stopPropagation()
        setIsHovered(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setIsHovered(false)
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        onSelect?.()
      }}
    >
      <planeGeometry args={[0.75, 1.2]} />
      <meshBasicMaterial
        color={isHovered ? '#34d399' : '#6ee7b7'}
        transparent
        opacity={isHovered ? 0.52 : 0}
        side={THREE.FrontSide}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

function ExperienceWallHotspot({ enabled, onSelect }) {
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setIsHovered(false)
      return
    }

    document.body.style.cursor = isHovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [enabled, isHovered])

  if (!enabled) {
    return null
  }

  return (
    <mesh
      position={[-0.15, 1.8, -1.1]}
      rotation={[0, Math.PI, 0]}
      onPointerOver={(event) => {
        event.stopPropagation()
        setIsHovered(true)
      }}
      onPointerOut={(event) => {
        event.stopPropagation()
        setIsHovered(false)
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        onSelect?.()
      }}
    >
      <planeGeometry args={[1.6, .3]} />
      <meshBasicMaterial
        color={isHovered ? '#34d399' : '#6ee7b7'}
        transparent
        opacity={isHovered ? 0.2 : 0}
        side={THREE.FrontSide}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

function ExperienceWallIcons({ enabled, onOpenEmailPopup }) {
  const [hoveredKey, setHoveredKey] = useState(null)
  const iconUrls = DEFAULT_EXPERIENCE_ICON_URLS
  const [textures, setTextures] = useState({})

  useEffect(() => {
    let cancelled = false
    const loader = new THREE.TextureLoader()
    const entries = Object.entries(iconUrls).filter(([, url]) => Boolean(url))

    if (entries.length === 0) {
      return () => {
        cancelled = true
      }
    }

    for (const [key, iconUrl] of entries) {
      loader.load(
        iconUrl,
        (texture) => {
          if (cancelled) return
          texture.colorSpace = THREE.SRGBColorSpace
          texture.needsUpdate = true
          setTextures((current) => ({ ...current, [key]: texture }))
        },
        undefined,
        () => undefined
      )
    }

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setHoveredKey(null)
      return
    }

    document.body.style.cursor = hoveredKey ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [enabled, hoveredKey])

  if (!enabled) {
    return null
  }

  return (
    <group>
      {EXPERIENCE_LINKS.map((link) => {
        const isHovered = hoveredKey === link.key
        const texture = textures[link.key]

        return (
          <group
            key={link.key}
            position={link.position}
            rotation={[0, Math.PI, 0]}
            scale={isHovered ? 1.12 : 1.04}
          >
            <mesh position={[0, 0, -0.012]}>
              <planeGeometry args={[0.62, 0.62]} />
              <meshStandardMaterial
                color={isHovered ? '#111827' : '#1f2937'}
                roughness={0.58}
                metalness={0.2}
                emissive={isHovered ? '#34d399' : '#000000'}
                emissiveIntensity={isHovered ? 0.45 : 0}
                side={THREE.FrontSide}
              />
            </mesh>

            <mesh
              onPointerOver={(event) => {
                event.stopPropagation()
                setHoveredKey(link.key)
              }}
              onPointerOut={(event) => {
                event.stopPropagation()
                setHoveredKey((current) => (current === link.key ? null : current))
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation()
                if (typeof window === 'undefined') return
                if (link.key === 'email') {
                  onOpenEmailPopup?.()
                  return
                }
                window.open(link.url, '_blank', 'noopener,noreferrer')
              }}
            >
              <planeGeometry args={[0.55, 0.55]} />
              {texture ? (
                <meshBasicMaterial map={texture} toneMapped={false} transparent side={THREE.FrontSide} />
              ) : (
                <meshStandardMaterial
                  color={isHovered ? '#34d399' : '#cbd5e1'}
                  roughness={0.8}
                  metalness={0}
                  side={THREE.FrontSide}
                />
              )}
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function PhotographyPanel({ isDark }) {
  const ui = getRetroUiTheme(isDark)
  const [activeCollection, setActiveCollection] = useState('film')
  const [photosByCollection, setPhotosByCollection] = useState({})
  const [loadingCollection, setLoadingCollection] = useState('film')
  const [loadError, setLoadError] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    if (!selectedImage) return undefined

    const scrollY = window.scrollY
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedImage(null)
      }
    }
    const preventScroll = (event) => {
      event.preventDefault()
    }

    const lockTarget = document.documentElement
    const previousHtmlOverflow = lockTarget.style.overflow
    const previousHtmlOverscroll = lockTarget.style.overscrollBehavior
    const previousBodyOverflow = document.body.style.overflow
    const previousBodyOverscroll = document.body.style.overscrollBehavior
    const previousBodyPosition = document.body.style.position
    const previousBodyTop = document.body.style.top
    const previousBodyWidth = document.body.style.width

    lockTarget.style.overflow = 'hidden'
    lockTarget.style.overscrollBehavior = 'none'
    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll
      document.body.style.overflow = previousBodyOverflow
      document.body.style.overscrollBehavior = previousBodyOverscroll
      document.body.style.position = previousBodyPosition
      document.body.style.top = previousBodyTop
      document.body.style.width = previousBodyWidth
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('wheel', preventScroll)
      window.removeEventListener('touchmove', preventScroll)
      window.scrollTo(0, scrollY)
    }
  }, [selectedImage])

  useEffect(() => {
    let active = true

    if (photosByCollection[activeCollection]) {
      setLoadingCollection('')
      setLoadError('')
      return () => {
        active = false
      }
    }

    const loadPhotos = async () => {
      try {
        setLoadingCollection(activeCollection)
        setLoadError('')
        const response = await fetch(`/api/photography?collection=${activeCollection}`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Could not load this photo collection.')
        }

        const payload = await response.json()
        if (!active) return

        setPhotosByCollection((current) => ({
          ...current,
          [activeCollection]: payload.images || [],
        }))
      } catch (error) {
        if (!active) return
        setLoadError(error.message || 'Could not load this photo collection.')
      } finally {
        if (active) {
          setLoadingCollection('')
        }
      }
    }

    loadPhotos()

    return () => {
      active = false
    }
  }, [activeCollection, photosByCollection])

  const images = photosByCollection[activeCollection] || []
  const isLoading = loadingCollection === activeCollection
  const isFavoriteMemories = activeCollection === 'favorite_memories'
  const canRenderLightbox = typeof window !== 'undefined' && selectedImage

  return (
    <>
      <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Photography</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
        {PHOTO_COLLECTIONS.map((collection) => {
          const isActive = collection.key === activeCollection
          return (
            <button
              key={collection.key}
              onClick={() => setActiveCollection(collection.key)}
              style={{
                padding: '8px 14px',
                ...TAP_TARGET_STYLE,
                borderRadius: '10px',
                border: isActive
                  ? `2px solid ${ui.borderStrong}`
                  : `2px solid ${ui.border}`,
                background: isActive
                  ? ui.accentSoft
                  : ui.surfaceSoft,
                color: ui.text,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {collection.label}
            </button>
          )
        })}
      </div>

      {isLoading && (
        <p style={{ margin: '6px 0 0 0', lineHeight: 1.4 }}>
          Loading photos...
        </p>
      )}

      {!isLoading && loadError && (
        <p style={{ margin: '6px 0 0 0', color: '#fca5a5', lineHeight: 1.4 }}>
          {loadError}
        </p>
      )}

      {!isLoading && !loadError && images.length === 0 && (
        <p style={{ margin: '6px 0 0 0', lineHeight: 1.45 }}>
          {isFavoriteMemories
            ? 'No Favorite Memories photos yet. Add images to `public/favorite_memories` and they will appear automatically.'
            : 'No Film photos found. Add images to `public/film_photos` and they will appear automatically.'}
        </p>
      )}

      {!isLoading && !loadError && images.length > 0 && (
        <div
          style={{
            marginTop: '8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '12px',
            maxHeight: 'min(54vh, 500px)',
            overflowY: 'auto',
            paddingRight: '6px',
          }}
        >
          {images.map((image) => (
            <button
              key={image.src}
              onClick={() => setSelectedImage(image)}
              style={{
                borderRadius: '10px',
                overflow: 'hidden',
                padding: 0,
                cursor: 'pointer',
                border: isDark
                  ? `1px solid ${ui.border}`
                  : `1px solid ${ui.border}`,
                background: ui.surfaceSoft,
              }}
            >
              <img
                src={image.src}
                alt={image.alt || 'Photography image'}
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '190px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </button>
          ))}
        </div>
      )}

      {canRenderLightbox &&
        createPortal(
          <div
            onClick={() => setSelectedImage(null)}
            onWheel={(event) => event.preventDefault()}
            onTouchMove={(event) => event.preventDefault()}
            onWheelCapture={(event) => event.preventDefault()}
            onTouchMoveCapture={(event) => event.preventDefault()}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: ui.overlay,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              touchAction: 'none',
            }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                border: 'none',
                borderRadius: '999px',
                width: '48px',
                height: '48px',
                fontSize: '24px',
                lineHeight: 1,
                cursor: 'pointer',
                background: ui.surface,
                color: ui.text,
                border: `1px solid ${ui.borderStrong}`,
                boxShadow: '0 10px 24px rgba(0, 0, 0, 0.38)',
              }}
              aria-label="Close enlarged photo"
            >
              ×
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt || 'Photography image'}
              onClick={(event) => event.stopPropagation()}
              style={{
                display: 'block',
                width: 'auto',
                height: 'auto',
                maxWidth: 'calc(100vw - 48px)',
                maxHeight: 'calc(100vh - 48px)',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 20px 46px rgba(0, 0, 0, 0.52)',
                border: `1px solid ${ui.border}`,
                background: ui.surfaceSoft,
              }}
            />
          </div>,
          document.body
        )}
    </>
  )
}

function ExperienceShowcasePanel({ isDark }) {
  const ui = getRetroUiTheme(isDark)
  const scrollContainerRef = useRef(null)
  const [hoveredSkill, setHoveredSkill] = useState(null)
  const [isResumeOpen, setIsResumeOpen] = useState(false)
  const skillsSectionRef = useRef(null)
  const projectsSectionRef = useRef(null)
  const experiencesSectionRef = useRef(null)
  const resumeSectionRef = useRef(null)
  const projectCardsRef = useRef([])
  const experienceCardsRef = useRef([])

  useEffect(() => {
    const skillsSection = skillsSectionRef.current
    const projectsSection = projectsSectionRef.current
    const experiencesSection = experiencesSectionRef.current
    const resumeSection = resumeSectionRef.current

    if (!skillsSection || !projectsSection || !experiencesSection || !resumeSection) {
      return undefined
    }

    // Show all sections and cards immediately (no scroll reveal).
    gsap.set([skillsSection, projectsSection, experiencesSection, resumeSection], {
      opacity: 1,
      y: 0,
    })
    gsap.set(projectCardsRef.current.filter(Boolean), { opacity: 1, y: 0, scale: 1 })
    gsap.set(experienceCardsRef.current.filter(Boolean), { opacity: 1, y: 0, scale: 1 })
    return undefined
  }, [])

  return (
    <>
      <h2 style={{ margin: '0 0 8px 0', fontSize: '30px' }}>Experience & Skills</h2>
      <div
        ref={scrollContainerRef}
        style={{
          maxHeight: 'none',
          overflowY: 'visible',
          paddingRight: '8px',
          display: 'grid',
          gap: '20px',
        }}
      >
        <section
          ref={skillsSectionRef}
          style={{
            paddingTop: '4px',
          }}
        >
          <h3 style={{ margin: '0 0 14px 0', fontSize: '24px' }}>Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            {EXPERIENCE_SKILLS.map((skill) => {
              const isHovered = hoveredSkill === skill
              return (
                <span
                  key={skill}
                  onMouseEnter={() => setHoveredSkill(skill)}
                  onMouseLeave={() => setHoveredSkill((current) => (current === skill ? null : current))}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '999px',
                    border: `1px solid ${ui.border}`,
                    background: ui.surfaceSoft,
                    color: ui.text,
                    fontSize: '19px',
                    fontWeight: 600,
                    cursor: 'default',
                    transform: `scale(${isHovered ? 1.18 : 1})`,
                    transition: 'transform 200ms ease',
                  }}
                >
                  {skill}
                </span>
              )
            })}
          </div>
        </section>

        <section ref={projectsSectionRef}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '24px' }}>Projects</h3>
          <div style={{ overflow: 'hidden', borderRadius: '12px', display: 'grid', gap: '14px' }}>
            {EXPERIENCE_PROJECTS.map((project, index) => (
              <div
                key={project.title}
                ref={(node) => {
                  projectCardsRef.current[index] = node
                }}
                style={{
                  borderRadius: '10px',
                  border: `1px solid ${ui.border}`,
                  background: ui.surfaceSoft,
                  color: ui.text,
                  padding: '18px',
                }}
              >
                {project.imageSrc ? (
                  <Image
                    src={project.imageSrc}
                    alt={project.imageAlt || `${project.title} preview`}
                    width={1200}
                    height={630}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '10px',
                      marginBottom: '10px',
                      border: `1px solid ${ui.border}`,
                    }}
                  />
                ) : null}
                <strong style={{ display: 'block', marginBottom: '6px', fontSize: '21px' }}>{project.title}</strong>
                <span style={{ opacity: 0.88, fontSize: '17px', lineHeight: 1.5 }}>{project.summary}</span>
                {project.projectUrl || project.devpostUrl ? (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {project.projectUrl ? (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: ui.textMuted,
                        }}
                      >
                        View Project on GitHub
                      </a>
                    ) : null}
                    {project.devpostUrl ? (
                      <a
                        href={project.devpostUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: ui.text,
                        }}
                      >
                        View on Devpost
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section ref={experiencesSectionRef}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '24px' }}>Experiences</h3>
          <div style={{ overflow: 'hidden', borderRadius: '12px', display: 'grid', gap: '14px' }}>
            {EXPERIENCE_ITEMS.map((entry, index) => (
              <div
                key={entry.title}
                ref={(node) => {
                  experienceCardsRef.current[index] = node
                }}
                style={{
                  borderRadius: '10px',
                  border: `1px solid ${ui.border}`,
                  background: ui.surfaceSoft,
                  color: ui.text,
                  padding: '18px',
                }}
              >
                <div
                  style={{
                    display: entry.imageSrc ? 'grid' : 'block',
                    gridTemplateColumns: entry.imageSrc ? '1fr minmax(120px, 220px)' : '1fr',
                    alignItems: 'start',
                    gap: '14px',
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', marginBottom: '6px', fontSize: '21px' }}>{entry.title}</strong>
                    <span style={{ opacity: 0.88, fontSize: '17px', lineHeight: 1.5 }}>{entry.detail}</span>
                    {entry.projectUrl || entry.devpostUrl ? (
                      <div style={{ marginTop: '10px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {entry.projectUrl ? (
                          <a
                            href={entry.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-block',
                              textDecoration: 'none',
                              fontWeight: 700,
                              fontSize: '14px',
                              color: ui.textMuted,
                            }}
                          >
                            View Project on GitHub
                          </a>
                        ) : null}
                        {entry.devpostUrl ? (
                          <a
                            href={entry.devpostUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-block',
                              textDecoration: 'none',
                              fontWeight: 700,
                              fontSize: '14px',
                              color: ui.text,
                            }}
                          >
                            View on Devpost
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  {entry.imageSrc ? (
                    <Image
                      src={entry.imageSrc}
                      alt={entry.imageAlt || `${entry.title} preview`}
                      width={420}
                      height={420}
                      style={{
                        width: '100%',
                        maxWidth: '220px',
                        height: 'auto',
                        borderRadius: '10px',
                        justifySelf: 'end',
                        border: `1px solid ${ui.border}`,
                      }}
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section ref={resumeSectionRef}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '24px' }}>Resume</h3>
          <button
            onClick={() => setIsResumeOpen(true)}
            style={{
              border: `1px solid ${ui.borderStrong}`,
              borderRadius: '10px',
              padding: '12px 18px',
              ...TAP_TARGET_STYLE,
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              background: ui.accentSoft,
              color: ui.text,
            }}
          >
            View Resume
          </button>
        </section>
      </div>

      {isResumeOpen &&
        createPortal(
          <div
            onClick={() => setIsResumeOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: ui.overlay,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                width: 'min(980px, 96vw)',
                height: 'min(86vh, 860px)',
                borderRadius: '14px',
                overflow: 'hidden',
                background: ui.panel,
                color: ui.text,
                border: `2px solid ${ui.borderStrong}`,
                boxShadow: '0 22px 48px rgba(0, 0, 0, 0.45)',
                display: 'grid',
                gridTemplateRows: 'auto 1fr',
              }}
            >
              <div
                style={{
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <strong style={{ fontSize: '18px' }}>Resume</strong>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={RESUME_FILE_PATH}
                    download
                    style={{
                      textDecoration: 'none',
                      borderRadius: '10px',
                      border: `1px solid ${ui.border}`,
                      padding: '10px 14px',
                      ...TAP_TARGET_STYLE,
                      fontWeight: 'bold',
                      background: ui.surfaceSoft,
                      color: ui.textMuted,
                    }}
                  >
                    Download
                  </a>
                  <button
                    onClick={() => setIsResumeOpen(false)}
                    style={{
                      border: `1px solid ${ui.border}`,
                      borderRadius: '10px',
                      padding: '10px 14px',
                      ...TAP_TARGET_STYLE,
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      background: ui.accentSoft,
                      color: ui.text,
                    }}
                  >
                    Exit
                  </button>
                </div>
              </div>
              <iframe
                src={RESUME_FILE_PATH}
                title="Ant Resume"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: ui.surfaceSoft,
                }}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

function FavoriteMatchaShopsPanel({ isDark }) {
  const ui = getRetroUiTheme(isDark)
  const shops = FAVORITE_MATCHA_SHOP_QUERIES.map((query) => ({
    name: query.place,
    location: query.location,
    area: query.area || 'Other',
  }))

  if (FAVORITE_MATCHA_SHOP_QUERIES.length === 0) {
    return (
      <p style={{ margin: '12px 0 0 0', lineHeight: 1.55 }}>
        Add your favorite places to <code>FAVORITE_MATCHA_SHOP_QUERIES</code> and they will show here.
      </p>
    )
  }

  if (shops.length === 0) {
    return <p style={{ margin: '12px 0 0 0', lineHeight: 1.55 }}>No shops found from Google Maps for this list.</p>
  }

  const areaOrder = ['Boston', 'NJ', 'NYC', 'Connecticut']
  const groupedShops = shops.reduce((acc, shop) => {
    const area = shop.area || 'Other'
    if (!acc[area]) acc[area] = []
    acc[area].push(shop)
    return acc
  }, {})

  return (
    <div style={{ marginTop: '12px', display: 'grid', gap: '10px', maxHeight: 'min(55vh, 440px)', overflowY: 'auto', paddingRight: '4px' }}>
      {areaOrder.map((area) => {
        const areaShops = groupedShops[area] || []
        if (areaShops.length === 0) return null
        return (
          <section key={area} style={{ display: 'grid', gap: '8px' }}>
            <h4 style={{ margin: '0 0 2px 0', fontSize: '16px', opacity: 0.9 }}>{area}</h4>
            {areaShops.map((shop) => (
              <div
                key={`${area}-${shop.name}-${shop.location || ''}`}
                style={{
                  color: ui.text,
                  border: `1px solid ${ui.border}`,
                  background: ui.surfaceSoft,
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'grid',
                  gap: '4px',
                }}
              >
                <strong style={{ fontSize: '17px' }}>{shop.name}</strong>
                <span style={{ fontSize: '14px', opacity: 0.85 }}>
                  {shop.location || 'Address unavailable'}
                </span>
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}

function SceneContent({ isDark, onSelectAboutTopic, onOpenMusicDashboard, onOpenVendingPopup, onOpenExperiencePopup, onOpenEmailPopup }) {
  const modelRef = useRef(null)
  const controlsRef = useRef(null)
  const ambientIntensity = isDark ? 0.35 : 1.2
  const directionalIntensity = isDark ? 0.45 : 1
  const directionalColor = isDark ? '#9fb4ff' : '#ffffff'

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotateSpeed = 0.5
    }
  })

  return (
    <>
      <SkyBackground isDark={isDark} />
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[5, 10, 5]} intensity={directionalIntensity} color={directionalColor} />
      <Model ref={modelRef} modelPath="/assets/3D-Models/MatchaShop.glb" />
      <CustomFloor isDark={isDark} />
      <AboutMeHeadshot />
      <MusicWallVinyl onOpenMusicDashboard={onOpenMusicDashboard} />
      <ExperienceWallHotspot enabled onSelect={onOpenExperiencePopup} />
      <ExperienceWallIcons enabled onOpenEmailPopup={onOpenEmailPopup} />
      <VendingMachineHotspot enabled onSelect={onOpenVendingPopup} />
      <AboutMeHotspots enabled onSelect={onSelectAboutTopic} />
      {isDark ? <NightEnvironment /> : <DayEnvironment />}
      <OrbitControls
        ref={controlsRef}
        autoRotate
        enableZoom
        minDistance={5.8}
        maxDistance={11}
        minPolarAngle={Math.PI * 0.33}
        maxPolarAngle={Math.PI * 0.49}
      />
    </>
  )
}

function ZoomView({ wall, isDark, setIsAnimating, onSelectAboutTopic, onOpenMusicDashboard, onOpenVendingPopup, onOpenExperiencePopup, onOpenEmailPopup }) {
  const modelRef = useRef(null)
  const controlsRef = useRef(null)
  const ambientIntensity = isDark ? 0.35 : 1.2
  const directionalIntensity = isDark ? 0.45 : 1
  const directionalColor = isDark ? '#9fb4ff' : '#ffffff'
  const [isAnimating, setIsAnimatingLocal] = useState(true)
  const fallbackTimerRef = useRef(null)
  const isUserInteractingRef = useRef(false)
  const lastInteractionAtRef = useRef(0)
  const recenterTargetRef = useRef(new THREE.Vector3(0, 1.8, 0))
  const currentPositionRef = useRef(new THREE.Vector3(0, 2, 5))
  const currentTargetRef = useRef(new THREE.Vector3(0, 1.8, 0))
  const transitionRef = useRef({
    startPosition: new THREE.Vector3(0, 2, 5),
    endPosition: new THREE.Vector3(0, 1.72, 3.8),
    startTarget: new THREE.Vector3(0, 1.8, 0),
    endTarget: new THREE.Vector3(0, 1.8, 0),
    startedAtMs: 0,
    durationMs: 3000,
  })

  const wallConfig = {
    'About Me': {
      angle: Math.PI / 2,
      distance: 3.9,
      target: new THREE.Vector3(-0.32, 1.52, 1.2),
      cameraHeight: 1.82,
      preferredPolar: 1.56,
      azimuthWindow: 0.52,
    },
    'Vending': {
      angle: 0,
      distance: 3.9,
      target: new THREE.Vector3(2.22, 1.78, 0.18),
      cameraHeight: 1.72,
      preferredPolar: 1.5,
      azimuthWindow: 0.35,
    },
    'Experience & Skills': {
      angle: -Math.PI / 2,
      distance: 3.9,
      target: new THREE.Vector3(-0.12, 1.78, -1.06),
      cameraHeight: 1.72,
      preferredPolar: 1.5,
      azimuthWindow: 0.35,
    },
    Music: {
      angle: Math.PI,
      distance: 3.9,
      target: new THREE.Vector3(-1.94, 1.78, 0.08),
      cameraHeight: 1.72,
      preferredPolar: 1.5,
      azimuthWindow: 0.35,
    }
  }

  const config = wallConfig[wall] || wallConfig['About Me']
  const { camera } = useThree()

  useEffect(() => {
    if (!controlsRef.current) return undefined

    const controls = controlsRef.current
    const handleStart = () => {
      isUserInteractingRef.current = true
    }
    const handleEnd = () => {
      isUserInteractingRef.current = false
      lastInteractionAtRef.current = performance.now()
    }

    controls.addEventListener('start', handleStart)
    controls.addEventListener('end', handleEnd)

    return () => {
      controls.removeEventListener('start', handleStart)
      controls.removeEventListener('end', handleEnd)
    }
  }, [])

  useEffect(() => {
    const controls = controlsRef.current
    const startPosition = camera.position.clone()
    const startTarget = controls?.target?.clone() || new THREE.Vector3(0, 1.8, 0)
    const endTarget = config.target.clone()
    const endPosition = new THREE.Vector3(
      endTarget.x + Math.cos(config.angle) * config.distance,
      config.cameraHeight,
      endTarget.z + Math.sin(config.angle) * config.distance
    )

    transitionRef.current = {
      startPosition,
      endPosition,
      startTarget,
      endTarget,
      startedAtMs: performance.now(),
      durationMs: 2800,
    }
    recenterTargetRef.current.copy(endTarget)

    setIsAnimatingLocal(true)
    setIsAnimating(true)
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
    }
    fallbackTimerRef.current = setTimeout(() => {
      setIsAnimatingLocal(false)
      setIsAnimating(false)
    }, 5000)
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
      }
    }
  }, [
    camera,
    config.angle,
    config.distance,
    config.cameraHeight,
    config.target.x,
    config.target.y,
    config.target.z,
    setIsAnimating,
    wall,
  ])

  useFrame(() => {
    if (!camera) return
    if (controlsRef.current) {
      controlsRef.current.enabled = !isAnimating
    }
    if (!isAnimating) {
      const controls = controlsRef.current
      if (!controls) return

      const idleForMs = performance.now() - lastInteractionAtRef.current
      if (isUserInteractingRef.current || idleForMs < 500) return

      const desiredAzimuth = normalizeAngle(Math.PI / 2 - config.angle)
      const currentAzimuth = normalizeAngle(controls.getAzimuthalAngle())
      const azimuthDelta = normalizeAngle(desiredAzimuth - currentAzimuth)
      const desiredPolar = config.preferredPolar ?? 1.5
      const currentPolar = controls.getPolarAngle()

      controls.setAzimuthalAngle(currentAzimuth + azimuthDelta * 0.06)
      controls.setPolarAngle(currentPolar + (desiredPolar - currentPolar) * 0.06)
      controls.target.lerp(recenterTargetRef.current, 0.08)
      controls.update()
      return
    }

    const controls = controlsRef.current
    if (!controls) return

    const transition = transitionRef.current
    const elapsedMs = performance.now() - transition.startedAtMs
    const rawT = Math.min(Math.max(elapsedMs / transition.durationMs, 0), 1)
    const easedT = easeInOutCubic(rawT)

    currentPositionRef.current.copy(transition.startPosition).lerp(transition.endPosition, easedT)
    currentTargetRef.current.copy(transition.startTarget).lerp(transition.endTarget, easedT)

    camera.position.copy(currentPositionRef.current)
    controls.target.copy(currentTargetRef.current)
    controls.update()

    if (rawT >= 1) {
      setIsAnimatingLocal(false)
      setIsAnimating(false)
    }
  })

  return (
    <>
      <SkyBackground isDark={isDark} />
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[5, 10, 5]} intensity={directionalIntensity} color={directionalColor} />
      <Model ref={modelRef} modelPath="/assets/3D-Models/MatchaShop.glb" />
      <CustomFloor isDark={isDark} />
      <AboutMeHeadshot />
      <MusicWallVinyl onOpenMusicDashboard={onOpenMusicDashboard} />
      <ExperienceWallHotspot enabled={wall === 'Experience & Skills'} onSelect={onOpenExperiencePopup} />
      <ExperienceWallIcons enabled onOpenEmailPopup={onOpenEmailPopup} />
      <VendingMachineHotspot enabled={wall === 'Vending'} onSelect={onOpenVendingPopup} />
      <AboutMeHotspots enabled={wall === 'About Me'} onSelect={onSelectAboutTopic} />
      {isDark ? <NightEnvironment /> : <DayEnvironment />}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        enableDamping
        dampingFactor={0.07}
        minDistance={3.8}
        maxDistance={8.5}
        minPolarAngle={Math.PI * 0.42}
        maxPolarAngle={Math.PI * 0.49}
        minAzimuthAngle={Math.PI / 2 - config.angle - (config.azimuthWindow ?? 0.35)}
        maxAzimuthAngle={Math.PI / 2 - config.angle + (config.azimuthWindow ?? 0.35)}
      />
    </>
  )
}

export default function CanvasComponent({ isDark = false }) {
  const [zoomedWall, setZoomedWall] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeAboutTopic, setActiveAboutTopic] = useState(null)
  const [isMusicDashboardOpen, setIsMusicDashboardOpen] = useState(false)
  const [isVendingPopupOpen, setIsVendingPopupOpen] = useState(false)
  const [isExperiencePopupOpen, setIsExperiencePopupOpen] = useState(false)
  const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false)
  const [openDropdownKey, setOpenDropdownKey] = useState(null)
  const topNavRef = useRef(null)

  const handleWallClick = (wallName) => {
    setZoomedWall(wallName)
    setIsAnimating(true)
    setIsMusicDashboardOpen(false)
    setIsVendingPopupOpen(false)
    setIsExperiencePopupOpen(false)
    setIsEmailPopupOpen(false)
  }

  const handleExitZoom = () => {
    setZoomedWall(null)
    setIsAnimating(false)
    setIsMusicDashboardOpen(false)
    setIsVendingPopupOpen(false)
    setIsExperiencePopupOpen(false)
    setIsEmailPopupOpen(false)
  }

  const handleOpenMusicDashboard = () => {
    setZoomedWall('Music')
    if (zoomedWall !== 'Music') {
      setIsAnimating(true)
    }
    setIsMusicDashboardOpen(true)
  }

  const handleOpenVendingPopup = () => {
    setZoomedWall('Vending')
    if (zoomedWall !== 'Vending') {
      setIsAnimating(true)
    }
    setIsVendingPopupOpen(true)
  }

  const handleOpenExperiencePopup = () => {
    setZoomedWall('Experience & Skills')
    if (zoomedWall !== 'Experience & Skills') {
      setIsAnimating(true)
    }
    setIsExperiencePopupOpen(true)
  }

  const closeAboutPopup = () => {
    setActiveAboutTopic(null)
  }

  const openEmailPopup = () => {
    setIsEmailPopupOpen(true)
  }

  const closeEmailPopup = () => {
    setIsEmailPopupOpen(false)
  }

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!topNavRef.current) return
      if (!topNavRef.current.contains(event.target)) {
        setOpenDropdownKey(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  const openAboutTopicFromNav = (topicKey) => {
    handleWallClick('About Me')
    setActiveAboutTopic(topicKey)
    setOpenDropdownKey(null)
  }

  const openGalleryFromNav = () => {
    handleOpenVendingPopup()
    setOpenDropdownKey(null)
  }

  const openExperienceFromNav = () => {
    handleOpenExperiencePopup()
    setOpenDropdownKey(null)
  }

  const openMusicFromNav = () => {
    handleOpenMusicDashboard()
    setOpenDropdownKey(null)
  }

  const openLinkedInFromNav = () => {
    if (typeof window !== 'undefined') {
      window.open('https://www.linkedin.com/in/anthony-sevilla-meza/', '_blank', 'noopener,noreferrer')
    }
    setOpenDropdownKey(null)
  }

  const openGitHubFromNav = () => {
    if (typeof window !== 'undefined') {
      window.open('https://github.com/ant5m', '_blank', 'noopener,noreferrer')
    }
    setOpenDropdownKey(null)
  }

  const openEmailFromNav = () => {
    setIsEmailPopupOpen(true)
    setOpenDropdownKey(null)
  }

  const topNavItems = [
    {
      key: 'About Me',
      label: "Ant's Matcha",
      options: [
        { key: 'about', label: 'About Me', onSelect: () => openAboutTopicFromNav('about') },
        { key: 'whyMatcha', label: 'Why Matcha', onSelect: () => openAboutTopicFromNav('whyMatcha') },
        { key: 'favoriteShops', label: 'Favorite Matcha Shops', onSelect: () => openAboutTopicFromNav('favoriteShops') },
      ],
    },
    {
      key: 'Vending',
      label: 'Gallery',
      onClick: openGalleryFromNav,
    },
    {
      key: 'Experience & Skills',
      label: 'Experience & Skills',
      options: [
        { key: 'openExperience', label: 'Experience & Skills', onSelect: openExperienceFromNav },
        { key: 'openLinkedIn', label: 'LinkedIn', onSelect: openLinkedInFromNav },
        { key: 'openGitHub', label: 'GitHub', onSelect: openGitHubFromNav },
        { key: 'openEmail', label: 'Email', onSelect: openEmailFromNav },
      ],
    },
    {
      key: 'Music',
      label: 'Music',
      onClick: openMusicFromNav,
    },
  ]

  const showZoom = Boolean(zoomedWall)
  const showSpotify = zoomedWall === 'Music' && !isAnimating && isMusicDashboardOpen
  const activePanel = zoomedWall ? WALL_PANELS[zoomedWall] : null
  const shouldShowPanel =
    showZoom &&
    !isAnimating &&
    activePanel &&
    zoomedWall !== 'About Me' &&
    (zoomedWall !== 'Vending' || isVendingPopupOpen) &&
    (zoomedWall !== 'Experience & Skills' || isExperiencePopupOpen)
  const isPhotographyPanel = shouldShowPanel && zoomedWall === 'Vending'
  const isExperiencePanel = shouldShowPanel && zoomedWall === 'Experience & Skills'
  const isCenteredPanel = isPhotographyPanel || isExperiencePanel
  const ui = getRetroUiTheme(isDark)
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const isSmallPhone = useMediaQuery({ maxWidth: 430 })

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {showZoom ? (
        <Canvas 
          camera={{ position: [0, 2, 5], fov: 75 }} 
          style={{ background: isDark ? '#0a0e27' : '#87CEEB' }}
          dpr={[1, 1.5]}
          gl={CANVAS_GL_SETTINGS}
        >
          <ZoomView
            wall={zoomedWall}
            isDark={isDark}
            setIsAnimating={setIsAnimating}
            onSelectAboutTopic={setActiveAboutTopic}
            onOpenMusicDashboard={handleOpenMusicDashboard}
            onOpenVendingPopup={handleOpenVendingPopup}
            onOpenExperiencePopup={handleOpenExperiencePopup}
            onOpenEmailPopup={openEmailPopup}
          />
        </Canvas>
      ) : (
        <Canvas 
          camera={{ position: [0, 2, 8], fov: 75 }} 
          style={{ background: isDark ? '#0a0e27' : '#87CEEB' }}
          dpr={[1, 1.5]}
          gl={CANVAS_GL_SETTINGS}
        >
          <SceneContent
            isDark={isDark}
            onSelectAboutTopic={setActiveAboutTopic}
            onOpenMusicDashboard={handleOpenMusicDashboard}
            onOpenVendingPopup={handleOpenVendingPopup}
            onOpenExperiencePopup={handleOpenExperiencePopup}
            onOpenEmailPopup={openEmailPopup}
          />
        </Canvas>
      )}

      <div
        ref={topNavRef}
        style={{
          position: 'absolute',
          top: isMobile ? '12px' : '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: isMobile ? '8px' : '15px',
          width: isMobile ? 'min(96vw, 560px)' : 'auto',
          zIndex: 50,
          background: ui.surfaceStrong,
          border: `1px solid ${ui.borderStrong}`,
          borderRadius: '12px',
          boxShadow: ui.shadow,
          padding: isMobile ? '8px' : '10px',
          backdropFilter: 'blur(12px)',
        }}
      >
        {topNavItems.map((wall) => {
          const hasDropdown = Array.isArray(wall.options) && wall.options.length > 0
          const isOpen = hasDropdown && openDropdownKey === wall.key
          return (
            <div
              key={wall.key}
              style={{ position: 'relative' }}
              onMouseEnter={() => {
                if (hasDropdown) {
                  setOpenDropdownKey(wall.key)
                }
              }}
              onMouseLeave={() => {
                if (hasDropdown) {
                  setOpenDropdownKey((current) => (current === wall.key ? null : current))
                }
              }}
            >
              <button
                onClick={() => {
                  if (hasDropdown) {
                    setOpenDropdownKey((current) => (current === wall.key ? null : wall.key))
                  } else {
                    wall.onClick?.()
                    setOpenDropdownKey(null)
                  }
                }}
                style={{
                  padding: isMobile ? '9px 12px' : '10px 20px',
                  background: isOpen ? ui.accentSoft : ui.surfaceSoft,
                  color: ui.text,
                  border: `1px solid ${isOpen ? ui.borderStrong : ui.border}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '13px' : '14px',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s'
                }}
              >
                {wall.label}
              </button>
              {isOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: isMobile ? 'min(90vw, 260px)' : '100%',
                    display: 'grid',
                    gap: '6px',
                    background: ui.panel,
                    border: `1px solid ${ui.borderStrong}`,
                    borderRadius: '10px',
                    padding: '8px',
                    boxShadow: ui.shadow,
                    zIndex: 80,
                  }}
                >
                  {wall.options.map((option) => (
                    <button
                      key={option.key}
                      onClick={option.onSelect}
                      style={{
                        textAlign: 'left',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '9px 10px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '13px' : '14px',
                        fontWeight: 600,
                        border: `1px solid ${ui.border}`,
                        background: ui.surfaceSoft,
                        color: ui.text,
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showZoom && (
        <button
          onClick={handleExitZoom}
          style={{
            position: 'absolute',
            top: isMobile ? '12px' : '30px',
            right: isMobile ? '12px' : '30px',
            padding: isMobile ? '10px 12px' : '12px 20px',
            ...TAP_TARGET_STYLE,
            background: ui.surface,
            color: ui.text,
            border: `1px solid ${ui.borderStrong}`,
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            zIndex: 100,
            fontSize: isMobile ? '13px' : '14px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = ui.accentSoft
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = ui.surface
          }}
        >
          Exit
        </button>
      )}

      {shouldShowPanel && (
        <div
          style={{
            position: 'absolute',
            left: isCenteredPanel || isMobile ? '50%' : '30px',
            top: isCenteredPanel ? '50%' : 'auto',
            right: 'auto',
            bottom: isCenteredPanel ? 'auto' : isMobile ? '12px' : '30px',
            transform: isCenteredPanel ? 'translate(-50%, -50%)' : isMobile ? 'translateX(-50%)' : 'none',
            width: isPhotographyPanel
              ? isMobile ? 'min(96vw, 860px)' : 'min(860px, calc(100vw - 48px))'
              : isExperiencePanel
                ? isMobile ? 'min(96vw, 920px)' : 'min(920px, calc(100vw - 48px))'
              : isMobile ? 'min(96vw, 460px)' : 'min(460px, calc(100vw - 60px))',
            maxHeight: isCenteredPanel ? 'min(82vh, 860px)' : 'none',
            overflowY: isCenteredPanel ? 'auto' : 'visible',
            background: ui.panel,
            color: ui.text,
            border: `2px solid ${ui.borderStrong}`,
            borderRadius: '14px',
            boxShadow: ui.shadow,
            backdropFilter: 'blur(12px)',
            padding: isMobile ? '12px' : '16px',
            zIndex: 120
          }}
        >
          {isPhotographyPanel ? (
            <PhotographyPanel isDark={isDark} />
          ) : isExperiencePanel ? (
            <ExperienceShowcasePanel isDark={isDark} />
          ) : (
            <>
              <h2 style={{ margin: '0 0 8px 0', fontSize: isMobile ? '19px' : '22px' }}>{activePanel.title}</h2>
              <p style={{ margin: '0 0 10px 0', lineHeight: 1.45 }}>{activePanel.intro}</p>
              <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.45 }}>
                {activePanel.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {activeAboutTopic && ABOUT_ME_POPUPS[activeAboutTopic] && (
        <div
          onClick={closeAboutPopup}
          style={{
            position: 'absolute',
            inset: 0,
            background: ui.overlay,
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '12px' : '20px'
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: isMobile ? '94vw' : 'min(620px, 92vw)',
              background: ui.panel,
              color: ui.text,
              border: `2px solid ${ui.borderStrong}`,
              borderRadius: '14px',
              padding: isMobile ? '14px' : '20px',
              boxShadow: ui.shadow
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px' }}>
                {ABOUT_ME_POPUPS[activeAboutTopic].title}
              </h3>
              <button
                onClick={closeAboutPopup}
                style={{
                  border: `1px solid ${ui.borderStrong}`,
                  borderRadius: '10px',
                  padding: isMobile ? '9px 10px' : '10px 14px',
                  ...TAP_TARGET_STYLE,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: ui.accentSoft,
                  color: ui.text
                }}
              >
                Close
              </button>
            </div>
            <div style={{ marginTop: '12px', lineHeight: 1.55 }}>
              {activeAboutTopic === 'favoriteShops' ? (
                <FavoriteMatchaShopsPanel isDark={isDark} />
              ) : (
                ABOUT_ME_POPUPS[activeAboutTopic].paragraphs.map((paragraph) => (
                  <p key={paragraph} style={{ margin: '0 0 10px 0' }}>
                    {paragraph}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isEmailPopupOpen && (
        <div
          onClick={closeEmailPopup}
          style={{
            position: 'absolute',
            inset: 0,
            background: ui.overlay,
            zIndex: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '12px' : '20px',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: isSmallPhone ? '94vw' : 'min(520px, 92vw)',
              background: ui.panel,
              color: ui.text,
              border: `2px solid ${ui.borderStrong}`,
              borderRadius: '14px',
              padding: isMobile ? '14px' : '20px',
              boxShadow: ui.shadow,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px' }}>Contact Emails</h3>
              <button
                onClick={closeEmailPopup}
                style={{
                  border: `1px solid ${ui.borderStrong}`,
                  borderRadius: '10px',
                  padding: isMobile ? '9px 10px' : '10px 14px',
                  ...TAP_TARGET_STYLE,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: ui.accentSoft,
                  color: ui.text,
                }}
              >
                Close
              </button>
            </div>

            <div style={{ marginTop: '14px', display: 'grid', gap: '10px', lineHeight: 1.5 }}>
              <p style={{ margin: 0 }}>
                <strong>School:</strong>{' '}
                <span
                  style={{
                    color: ui.textMuted,
                  }}
                >
                  antsev@bu.edu
                </span>
              </p>

              <p style={{ margin: 0 }}>
                <strong>Personal:</strong>{' '}
                <span
                  style={{
                    color: ui.textMuted,
                  }}
                >
                  anthonysevillameza@gmail.com
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      <SpotifyWidget isVisible={showSpotify} />
    </div>
  )
}
