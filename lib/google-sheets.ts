import { Content, ContentsSheetsData, Item, ItemsSheetsData } from './types'
import { google } from 'googleapis'
import defaultContents from './default-contents.json'
import { unstable_cache } from 'next/cache'

// These would normally come from environment variables
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || 'your-spreadsheet-id'
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY || 'your-api-key'
const ITEMS_RANGE = 'Items!A2:I' // Skip header row
const CONTENTS_RANGE = 'Contents!A2:I' // Skip header row

// Setup Google Sheets API
const sheets = google.sheets({ version: 'v4', auth: API_KEY })

export async function fetchContents(): Promise<ContentsSheetsData> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: CONTENTS_RANGE,
    })

    const rows = response.data.values || []

    // Transform sheet data into Content objects
    const contents: Content[] = rows.map((row) => ({
      id: row[0],
      key: row[1],
      language: row[2],
      text: row[3],
    }))

    return {
      contents,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error)
    return {
      contents: defaultContents,
      lastUpdated: new Date().toISOString(),
    }
  }
}

async function _fetchItems(): Promise<ItemsSheetsData> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: ITEMS_RANGE,
    })

    const rows = response.data.values || []

    // Transform sheet data into Item objects
    const items: Item[] = rows.map((row) => ({
      id: row[0],
      title: row[1],
      description: row[2],
      imageUrl: row[3],
      tags: (row[4] || '').split(',').map((tag: string) => tag.trim()),
      url: row[5],
      createdAt: row[6],
      likeCount: parseInt(row[7] || '0', 10),
      bookmarkCount: parseInt(row[8] || '0', 10),
    }))

    return {
      items,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error)
    return {
      items: [],
      lastUpdated: new Date().toISOString(),
    }
  }
}

export const fetchItems = unstable_cache(_fetchItems, ['fetchItems'], {
  tags: ['fetchItems'],
  revalidate: 60 * 60, // Revalidate every hour
})

// Function to check if an item was created in the last 7 days
export function isNewItem(item: Item): boolean {
  const createdDate = new Date(item.createdAt)
  const now = new Date()
  const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7))

  return createdDate >= sevenDaysAgo
}

// Function to get trending items based on like/bookmark counts
export function getTrendingItems(items: Item[]): Item[] {
  return [...items]
    .sort((a, b) => {
      const aScore = a.likeCount + a.bookmarkCount
      const bScore = b.likeCount + b.bookmarkCount
      return bScore - aScore
    })
    .slice(0, 8) // Get top 8 trending items
}

// Function to get new items (last 7 days)
export function getNewItems(items: Item[]): Item[] {
  return items.filter(isNewItem).slice(0, 8)
}
