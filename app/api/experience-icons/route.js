import path from 'path'
import { readdir } from 'fs/promises'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SUPPORTED_EXTENSIONS = /\.(png|jpe?g|webp|gif|avif)$/i

function getIconKey(fileName) {
  const normalized = fileName.toLowerCase()
  if (normalized.includes('github')) return 'github'
  if (normalized.includes('linkedin') || normalized.includes('linkedin')) return 'linkedin'
  if (normalized.includes('mail') || normalized.includes('email')) return 'email'
  return null
}

export async function GET() {
  try {
    const iconDir = path.join(process.cwd(), 'public', 'experience_icons')
    const entries = await readdir(iconDir, { withFileTypes: true })
    const files = entries
      .filter((entry) => entry.isFile() && SUPPORTED_EXTENSIONS.test(entry.name))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

    const iconMap = {}
    const remaining = []

    for (const fileName of files) {
      const key = getIconKey(fileName)
      if (key && !iconMap[key]) {
        iconMap[key] = `/experience_icons/${encodeURIComponent(fileName)}`
      } else {
        remaining.push(`/experience_icons/${encodeURIComponent(fileName)}`)
      }
    }

    for (const key of ['email', 'linkedin', 'github']) {
      if (!iconMap[key] && remaining.length > 0) {
        iconMap[key] = remaining.shift()
      }
    }

    return Response.json(
      {
        icons: iconMap,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    if (error.code === 'ENOENT') {
      return Response.json({ icons: {} })
    }

    console.error('Experience icons API error:', error)
    return Response.json(
      { error: 'Failed to load experience icons.' },
      { status: 500 }
    )
  }
}
