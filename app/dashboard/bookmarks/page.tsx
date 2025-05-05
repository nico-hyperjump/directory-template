import { redirect } from 'next/navigation'
import { getCurrentUser, getUserPreferences } from '@/lib/supabase'
import { fetchItems } from '@/lib/google-sheets'
import { SiteHeader } from '@/components/site-header'
import { GridView } from '@/components/grid-view'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

// Revalidate data every hour
export const revalidate = 3600

export default async function BookmarkedItems() {
  // Get current user
  const user = await getCurrentUser()

  // Redirect if not authenticated
  if (!user) {
    redirect('/')
  }

  // Get user preferences
  const { data: userPreferences } = await getUserPreferences(user.id)
  const userLikes = userPreferences?.likes || []
  const userBookmarks = userPreferences?.bookmarks || []

  // Fetch items
  const { items } = await fetchItems()

  // Filter items based on user bookmarks
  const bookmarkedItems = items.filter((item) => userBookmarks.includes(item.id))

  return (
    <>
      <SiteHeader user={user} />

      <main className="container py-6 md:py-10">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-2 pl-0">
            <Link href="/dashboard" className="flex items-center">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <h1 className="mb-2 scroll-m-20 text-3xl font-bold tracking-tight lg:text-4xl">
            Bookmarked Items
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            Browse through all the items you&apos;ve bookmarked.
          </p>
        </div>

        {bookmarkedItems.length > 0 ? (
          <GridView
            items={bookmarkedItems}
            userId={user.id}
            userLikes={userLikes}
            userBookmarks={userBookmarks}
          />
        ) : (
          <div className="rounded-lg border py-12 text-center">
            <h3 className="text-lg font-medium">No bookmarked items yet</h3>
            <p className="mx-auto mb-6 mt-2 max-w-md text-muted-foreground">
              Browse the directory and bookmark items you want to save for later.
            </p>
            <Button asChild>
              <Link href="/">Explore Directory</Link>
            </Button>
          </div>
        )}
      </main>
    </>
  )
}
