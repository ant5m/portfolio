export const dynamic = 'force-dynamic'

function normalizePlace(rawPlace) {
  return (rawPlace || '').trim()
}

function mapBusiness(business, area = null) {
  return {
    name: business?.name || null,
    rating: business?.rating ?? null,
    reviewCount: business?.review_count ?? null,
    price: business?.price || null,
    url: business?.url || null,
    imageUrl: business?.image_url || null,
    address: business?.location?.display_address?.join(', ') || null,
    location: [business?.location?.city, business?.location?.state]
      .filter(Boolean)
      .join(', ') || null,
    area,
  }
}

function fallbackPlaceResult({ place, location, area = null }) {
  return {
    name: place,
    rating: null,
    reviewCount: null,
    price: null,
    url: null,
    imageUrl: null,
    address: null,
    location,
    area,
  }
}

async function searchYelpPlace({ apiKey, place, location, area = null }) {
  const params = new URLSearchParams({
    term: place,
    location,
    limit: '1',
    sort_by: 'best_match',
  })

  const response = await fetch(`https://api.yelp.com/v3/businesses/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Yelp lookup failed for "${place}".`)
  }

  const payload = await response.json()
  const business = payload?.businesses?.[0]
  if (!business) {
    return fallbackPlaceResult({ place, location, area })
  }
  return mapBusiness(business, area)
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const apiKey = process.env.YELP_API_KEY

    const queryEntries = searchParams.getAll('q')
    const parsedQueries = queryEntries
      .map((entry) => {
        try {
          const parsed = JSON.parse(entry)
          return {
            place: normalizePlace(parsed?.place),
            location: normalizePlace(parsed?.location || 'Boston, MA'),
            area: normalizePlace(parsed?.area || ''),
          }
        } catch {
          return null
        }
      })
      .filter((query) => query && query.place)

    const location = (searchParams.get('location') || 'Boston, MA').trim()
    const places = searchParams.getAll('place').map(normalizePlace).filter(Boolean)

    const queries =
      parsedQueries.length > 0
        ? parsedQueries
        : places.map((place) => ({
            place,
            location,
            area: '',
          }))

    if (queries.length === 0) {
      return Response.json(
        { error: 'Provide at least one query via ?q=... or ?place=...' },
        { status: 400 }
      )
    }

    if (!apiKey) {
      return Response.json(
        {
          places: queries.map((query) =>
            fallbackPlaceResult({
              place: query.place,
              location: query.location || 'Boston, MA',
              area: query.area || null,
            })
          ),
          warning: 'Missing YELP_API_KEY. Showing place list without Yelp metadata.',
        },
        {
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    const results = []
    for (const query of queries) {
      try {
        const result = await searchYelpPlace({
          apiKey,
          place: query.place,
          location: query.location || 'Boston, MA',
          area: query.area || null,
        })
        results.push(result)
      } catch {
        results.push(
          fallbackPlaceResult({
            place: query.place,
            location: query.location || 'Boston, MA',
            area: query.area || null,
          })
        )
      }
    }

    return Response.json(
      { places: results },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Yelp places API error:', error)
    return Response.json(
      { error: 'Failed to fetch places from Yelp.' },
      { status: 500 }
    )
  }
}
