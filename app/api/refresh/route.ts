import { NextRequest, NextResponse } from 'next/server'
import { fetchItems } from '@/lib/google-sheets'
import { revalidatePath } from 'next/cache'

// Environment variables would normally be used for API keys
const API_KEY = process.env.API_REFRESH_KEY || 'your-secret-api-key'

export async function POST(request: NextRequest) {
  // Validate API key
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== API_KEY) {
    return NextResponse.json({ error: 'Unauthorized - Invalid API key' }, { status: 401 })
  }

  try {
    // Fetch new data from Google Sheets
    await fetchItems()

    // Revalidate the paths
    revalidatePath('/')

    return NextResponse.json(
      { success: true, message: 'Data refreshed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error refreshing data:', error)

    return NextResponse.json({ error: 'Failed to refresh data' }, { status: 500 })
  }
}
