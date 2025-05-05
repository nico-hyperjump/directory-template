'use client'

import { User } from '@supabase/supabase-js'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon, Bookmark, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { signOut } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface UserDropdownProps {
  user: User
}

export function UserDropdown({ user }: UserDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      const { error } = await signOut()

      if (error) {
        toast({
          title: 'Error signing out',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
      })

      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: 'An error occurred',
        description: 'Could not sign out',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get initials for avatar
  const getInitials = () => {
    if (!user.email) return 'U'
    return user.email.charAt(0).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="block text-sm font-medium">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex cursor-pointer items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/likes" className="flex cursor-pointer items-center">
            <Heart className="mr-2 h-4 w-4" />
            <span>Liked Items</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/bookmarks" className="flex cursor-pointer items-center">
            <Bookmark className="mr-2 h-4 w-4" />
            <span>Bookmarks</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleSignOut}
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
