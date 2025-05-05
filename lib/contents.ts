import { unstable_cache } from 'next/cache'
import { fetchContents } from './google-sheets'

export const contentsForLanguage = unstable_cache(
  async (language: string) => {
    const contents = await fetchContents()
    return contents.contents.reduce<Record<string, string>>((acc, content) => {
      if (content.language !== language) return acc
      acc[content.key] = content.text
      return acc
    }, {})
  },
  ['contentsForLanguage'],
  {
    tags: ['contentsForLanguage'],
  }
)
