import { redirect } from 'next/navigation'
import { getCurrentUser, getUserPreferences } from '@/lib/supabase'
import { fetchItems } from '@/lib/google-sheets'
import { SiteHeader } from '@/components/site-header'
import { GridView } from '@/components/grid-view'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Revalidate data every hour
export const revalidate = 3600

export default async function Dashboard() {
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

  // Filter items based on user likes and bookmarks
  const likedItems = items.filter((item) => userLikes.includes(item.id))
  const bookmarkedItems = items.filter((item) => userBookmarks.includes(item.id))

  return (
    <>
      <SiteHeader user={user} />

      <main className="container py-6 md:py-10">
        <div className="mb-10">
          <h1 className="mb-2 scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
            Your Dashboard
          </h1>
          <p className="max-w-3xl text-xl text-muted-foreground">
            Manage your liked and saved items.
          </p>
        </div>

        <Tabs defaultValue="bookmarks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookmarks">Bookmarks ({bookmarkedItems.length})</TabsTrigger>
            <TabsTrigger value="likes">Likes ({likedItems.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="bookmarks" className="space-y-6">
            {bookmarkedItems.length > 0 ? (
              <GridView
                items={bookmarkedItems}
                userId={user.id}
                userLikes={userLikes}
                userBookmarks={userBookmarks}
              />
            ) : (
              <div className="py-12 text-center">
                <h3 className="text-lg font-medium">No bookmarks yet</h3>
                <p className="mt-2 text-muted-foreground">
                  Browse the directory and bookmark items you want to save.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="likes" className="space-y-6">
            {likedItems.length > 0 ? (
              <GridView
                items={likedItems}
                userId={user.id}
                userLikes={userLikes}
                userBookmarks={userBookmarks}
              />
            ) : (
              <div className="py-12 text-center">
                <h3 className="text-lg font-medium">No liked items yet</h3>
                <p className="mt-2 text-muted-foreground">
                  Browse the directory and like items you enjoy.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
