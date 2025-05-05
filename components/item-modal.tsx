'use client'

import { useState } from 'react'
import { Item } from '@/lib/types'
import { Heart, Bookmark, X, ExternalLink, Calendar } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toggleLike, toggleBookmark } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface ItemModalProps {
  item: Item
  isOpen: boolean
  onClose: () => void
  userId?: string | null
  isLiked?: boolean
  isBookmarked?: boolean
}

export function ItemModal({
  item,
  isOpen,
  onClose,
  userId,
  isLiked = false,
  isBookmarked = false,
}: ItemModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [liked, setLiked] = useState(isLiked)
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [isLoading, setIsLoading] = useState(false)

  const createdDate = new Date(item.createdAt)
  const formattedDate = isNaN(createdDate.getTime())
    ? 'Unknown date'
    : format(createdDate, 'MMMM d, yyyy')

  const handleLike = async () => {
    if (!userId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like items',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const { isLiked } = await toggleLike(userId, item.id)
      setLiked(isLiked)
      toast({
        title: isLiked ? 'Added to likes' : 'Removed from likes',
        description: `${item.title} has been ${isLiked ? 'added to' : 'removed from'} your likes`,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Could not update like status',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      router.refresh()
    }
  }

  const handleBookmark = async () => {
    if (!userId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to bookmark items',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const { isBookmarked } = await toggleBookmark(userId, item.id)
      setBookmarked(isBookmarked)
      toast({
        title: isBookmarked ? 'Added to bookmarks' : 'Removed from bookmarks',
        description: `${item.title} has been ${
          isBookmarked ? 'added to' : 'removed from'
        } your bookmarks`,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Could not update bookmark status',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-3xl">
        <div className="sticky top-0 z-10 bg-background p-6 pb-0">
          <DialogHeader className="flex justify-between">
            <DialogTitle className="pr-10 text-xl font-bold sm:text-2xl">{item.title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="mb-5 mt-3 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="relative aspect-video w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              item.imageUrl || 'https://images.pexels.com/photos/4386429/pexels-photo-4386429.jpeg'
            }
            alt={item.title}
            className="object-cover"
          />
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formattedDate}</span>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p>{item.description}</p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'gap-2',
                  liked &&
                    'border-red-200 bg-red-50 text-red-500 dark:border-red-800 dark:bg-red-950'
                )}
                onClick={handleLike}
                disabled={isLoading}
              >
                <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
                <span>{liked ? 'Liked' : 'Like'}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'gap-2',
                  bookmarked &&
                    'border-blue-200 bg-blue-50 text-blue-500 dark:border-blue-800 dark:bg-blue-950'
                )}
                onClick={handleBookmark}
                disabled={isLoading}
              >
                <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
                <span>{bookmarked ? 'Saved' : 'Save'}</span>
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open(item.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              <span>Visit</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
