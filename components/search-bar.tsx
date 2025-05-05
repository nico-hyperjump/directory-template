'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  initialQuery?: string
}

export function SearchBar({ initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/?q=${encodeURIComponent(query)}`)
  }

  return (
    <form onSubmit={handleSearch} className="relative mx-auto mb-8 w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by title, description or tags..."
          className="h-12 rounded-full pl-10 pr-20"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          type="submit"
          className="absolute right-1 top-1/2 h-10 -translate-y-1/2 transform rounded-full"
        >
          Search
        </Button>
      </div>
    </form>
  )
}
