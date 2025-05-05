import { Suspense } from 'react'
import { fetchItems, getNewItems, getTrendingItems } from '@/lib/google-sheets'
import { SearchBar } from '@/components/search-bar'
import { GridView } from '@/components/grid-view'
import { SiteHeader } from '@/components/site-header'
import { getCurrentUser, getUserPreferences } from '@/lib/supabase'
import { contentsForLanguage } from '@/lib/contents'

interface HomePageProps {
  searchParams: Promise<{
    q?: string
    item?: string
  }>
}

export default async function Home(props: HomePageProps) {
  const contents = await contentsForLanguage('en')

  // Get search query from URL
  const sParams = await props.searchParams
  const searchQuery = sParams.q?.toLowerCase() || ''
  const selectedItemId = sParams.item || null

  // Fetch data from Google Sheets with ISR
  const { items } = await fetchItems()

  // Get new and trending items
  const newItems = getNewItems(items)
  const trendingItems = getTrendingItems(items)

  // Filter items based on search query
  const filteredItems = searchQuery
    ? items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery) ||
          item.description.toLowerCase().includes(searchQuery) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchQuery))
      )
    : items

  // Get current user
  const user = await getCurrentUser()

  // Get user preferences
  let userLikes: string[] = []
  let userBookmarks: string[] = []

  if (user) {
    const { data } = await getUserPreferences(user.id)
    userLikes = data?.likes || []
    userBookmarks = data?.bookmarks || []
  }

  return (
    <>
      <SiteHeader user={user} />

      <main className="container w-full px-4 py-6 md:py-10">
        <div className="mb-10">
          <h1 className="lg:text-12xl mb-2 scroll-m-20 text-9xl font-bold tracking-tight">
            {contents['landingTitle']}
          </h1>
          <p className="max-w-3xl text-xl text-muted-foreground">
            {contents['landingHeroDescription']}
          </p>
        </div>

        <Suspense fallback={<div>Loading search...</div>}>
          <SearchBar initialQuery={searchQuery} />
        </Suspense>

        {searchQuery ? (
          <div className="mb-16">
            <h2 className="mb-6 text-2xl font-semibold">
              Search Results for &rdquo;{searchQuery}&quot;
            </h2>
            <GridView
              items={filteredItems}
              userId={user?.id}
              userLikes={userLikes}
              userBookmarks={userBookmarks}
              initialSelectedId={selectedItemId}
            />
          </div>
        ) : (
          <>
            {newItems.length > 0 && (
              <div className="mb-16 w-full">
                <h2 className="mb-6 text-2xl font-semibold">New Additions</h2>
                <GridView
                  items={newItems}
                  userId={user?.id}
                  userLikes={userLikes}
                  userBookmarks={userBookmarks}
                  initialSelectedId={selectedItemId}
                />
              </div>
            )}

            {trendingItems.length > 0 && (
              <div className="mb-16">
                <h2 className="mb-6 text-2xl font-semibold">Trending</h2>
                <GridView
                  items={trendingItems}
                  userId={user?.id}
                  userLikes={userLikes}
                  userBookmarks={userBookmarks}
                  initialSelectedId={selectedItemId}
                />
              </div>
            )}

            <div>
              <h2 className="mb-6 text-2xl font-semibold">Explore All</h2>
              <GridView
                items={items}
                userId={user?.id}
                userLikes={userLikes}
                userBookmarks={userBookmarks}
                initialSelectedId={selectedItemId}
              />
            </div>
          </>
        )}
      </main>
    </>
  )
}
