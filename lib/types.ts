export interface Item {
  id: string
  title: string
  description: string
  imageUrl: string
  tags: string[]
  url: string
  createdAt: string
  likeCount: number
  bookmarkCount: number
}

export interface User {
  id: string
  email: string
  likes: string[]
  bookmarks: string[]
}

export type ItemsSheetsData = {
  items: Item[]
  lastUpdated: string
}

export interface Content {
  id: string
  key: string
  language: string
  text: string
}

export type ContentsSheetsData = {
  contents: Content[]
  lastUpdated: string
}