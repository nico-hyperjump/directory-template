'use client'

import { useState, useRef, useCallback } from 'react'
import { Item } from '@/lib/types'
import { CardItem } from '@/components/ui/card-item'
import { ItemModal } from '@/components/item-modal'
import { useRouter } from 'next/navigation'

interface GridViewProps {
  items: Item[]
  userId?: string | null
  userLikes?: string[]
  userBookmarks?: string[]
  title?: string
  initialSelectedId?: string | null
}

export function GridView({
  items,
  userId,
  userLikes = [],
  userBookmarks = [],
  title,
  initialSelectedId = null,
}: GridViewProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(
    initialSelectedId ? items.find((item) => item.id === initialSelectedId) || null : null
  )
  const [showModal, setShowModal] = useState(!!initialSelectedId)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [visibleItems, setVisibleItems] = useState(items.slice(0, 12))
  const router = useRouter()

  // Setup intersection observer for infinite scroll
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && visibleItems.length < items.length) {
          // Load more items when last item is visible
          setVisibleItems((prevItems) => [
            ...prevItems,
            ...items.slice(prevItems.length, prevItems.length + 8),
          ])
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [visibleItems.length, items]
  )

  const handleOpenDetails = (id: string) => {
    const item = items.find((item) => item.id === id)
    if (item) {
      setSelectedItem(item)
      setShowModal(true)
      // Update URL with item ID
      router.push(`?item=${id}`, { scroll: false })
    }
  }

  const handleCloseDetails = () => {
    setSelectedItem(null)
    setShowModal(false)
    // Remove item ID from URL
    router.push('/', { scroll: false })
  }

  return (
    <div className="w-full space-y-6">
      {title && <h2 className="text-2xl font-semibold">{title}</h2>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1
          return (
            <div key={item.id} ref={isLast ? lastElementRef : null}>
              <CardItem
                item={item}
                userId={userId}
                isLiked={userLikes.includes(item.id)}
                isBookmarked={userBookmarks.includes(item.id)}
                onOpenDetails={handleOpenDetails}
              />
            </div>
          )
        })}
      </div>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          isOpen={showModal}
          onClose={handleCloseDetails}
          userId={userId}
          isLiked={userLikes.includes(selectedItem.id)}
          isBookmarked={userBookmarks.includes(selectedItem.id)}
        />
      )}
    </div>
  )
}
