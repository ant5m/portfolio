import path from 'path'
import { readdir } from 'fs/promises'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const COLLECTIONS = {
  film: {
    folder: 'film_photos',
    label: 'Film',
  },
  favorite_memories: {
    folder: 'favorite_memories',
    label: 'Favorite Memories',
  },
}

function isImageFile(fileName) {
  return /\.(png|jpe?g|gif|webp|avif)$/i.test(fileName)
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const collectionKey = (searchParams.get('collection') || 'film').trim()
    const collection = COLLECTIONS[collectionKey]

    if (!collection) {
      return Response.json(
        { error: 'Invalid photo collection.' },
        { status: 400 }
      )
    }

    const directoryPath = path.join(process.cwd(), 'public', collection.folder)
    let fileNames = []

    try {
      const entries = await readdir(directoryPath, { withFileTypes: true })
      fileNames = entries
        .filter((entry) => entry.isFile() && isImageFile(entry.name))
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }

    const images = fileNames.map((fileName) => ({
      fileName,
      src: `/${collection.folder}/${encodeURIComponent(fileName)}`,
      alt: fileName.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || collection.label,
    }))

    return Response.json(
      {
        title: 'Photography',
        collection: collectionKey,
        label: collection.label,
        images,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Photography API error:', error)
    return Response.json(
      { error: 'Failed to load photography images.' },
      { status: 500 }
    )
  }
}
