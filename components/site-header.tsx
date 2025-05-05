'use client'

import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { Grid, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserDropdown } from '@/components/user-dropdown'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AuthForm } from '@/components/auth/auth-form'
import { useTheme } from 'next-themes'

interface SiteHeaderProps {
  user: User | null
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Grid className="h-6 w-6" />
          <span className="text-xl font-bold">Curated</span>
        </Link>

        <nav className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? (
            <UserDropdown user={user} />
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Sign In</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Authentication</DialogTitle>
                  <DialogDescription>
                    Sign in to your account or create a new one to like and bookmark items.
                  </DialogDescription>
                </DialogHeader>
                <AuthForm />
              </DialogContent>
            </Dialog>
          )}
        </nav>
      </div>
    </header>
  )
}
