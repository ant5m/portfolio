export const dynamic = 'force-dynamic'

function normalize(value) {
  return (value || '').toLowerCase().trim()
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || ''
    const artist = searchParams.get('artist') || ''

    if (!title || !artist) {
      return Response.json({ error: 'Missing title or artist.' }, { status: 400 })
    }

    const term = `${title} ${artist}`.trim()
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=10`

    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) {
      return Response.json({ error: 'Preview lookup failed.' }, { status: 502 })
    }

    const data = await response.json()
    const results = data.results || []

    const normalizedArtist = normalize(artist)
    const bestMatch =
      results.find((item) => normalize(item.artistName).includes(normalizedArtist)) ||
      results[0]

    if (!bestMatch?.previewUrl) {
      return Response.json({ previewUrl: null })
    }

    return Response.json({
      previewUrl: bestMatch.previewUrl,
      trackName: bestMatch.trackName || null,
      artistName: bestMatch.artistName || null,
    })
  } catch (error) {
    console.error('Preview lookup error:', error)
    return Response.json({ error: 'Failed to fetch preview.' }, { status: 500 })
  }
}
