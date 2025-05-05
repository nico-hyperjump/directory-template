'use client'

import { useState } from 'react'
import { Item } from '@/lib/types'
import { Heart, Bookmark, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toggleLike, toggleBookmark } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface CardItemProps {
  item: Item
  userId?: string | null
  isLiked?: boolean
  isBookmarked?: boolean
  onOpenDetails: (id: string) => void
}

export function CardItem({
  item,
  userId,
  isLiked = false,
  isBookmarked = false,
  onOpenDetails,
}: CardItemProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [liked, setLiked] = useState(isLiked)
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()

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

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()

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

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(item.url, '_blank')
  }

  const displayTags = item.tags.slice(0, 3)
  const hasMoreTags = item.tags.length > 3

  return (
    <Card
      className="group h-full cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-md"
      onClick={() => onOpenDetails(item.id)}
    >
      <div className="relative aspect-video overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            item.imageUrl || 'https://images.pexels.com/photos/4386429/pexels-photo-4386429.jpeg'
          }
          alt={item.title}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{item.title}</h3>

        <div className="mt-2 flex flex-wrap gap-1">
          {displayTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {hasMoreTags && (
            <Badge variant="outline" className="text-xs">
              +{item.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between p-2 pt-0">
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', liked && 'text-red-500')}
            onClick={handleLike}
            disabled={isLoading}
          >
            <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', bookmarked && 'text-blue-500')}
            onClick={handleBookmark}
            disabled={isLoading}
          >
            <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExternalLink}>
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
