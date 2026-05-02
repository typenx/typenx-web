import * as React from 'react'
import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useMatch,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import {
  ChevronsUpDown,
  LogOut,
  Puzzle,
  Search,
  Settings,
  Tv,
} from 'lucide-react'

import { useAuth } from '#/components/auth-provider'
import { BrandMark } from '#/components/brand'
import { isGuestMode, setGuestMode } from '#/lib/guest'
import { ModeToggle } from '#/components/mode-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
import { Separator } from '#/components/ui/separator'
import { typenx } from '#/sdk'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '#/components/ui/sidebar'

export const Route = createFileRoute('/_authed')({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (typeof window === 'undefined') return { user: null, isGuest: false }

    try {
      const current = await typenx.me.current()
      return { user: current.user, isGuest: false }
    } catch {
      if (isGuestMode()) return { user: null, isGuest: true }
      throw redirect({
        to: '/',
        search: { redirect: location.href },
        replace: true,
      })
    }
  },
  component: AuthedLayout,
})

const NAV_ITEMS = [
  { to: '/anime', label: 'Anime', icon: Tv },
  { to: '/addons', label: 'Addons', icon: Puzzle },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

function AuthedLayout() {
  const router = useRouter()

  React.useEffect(() => {
    void router.preloadRoute({ to: '/anime' })
  }, [router])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <HeaderSearch />
          <ModeToggle />
        </header>
        <div className="flex-1">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center px-3">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <BrandMark className="size-7 shrink-0" />
          <span className="text-sm font-medium tracking-tight group-data-[collapsible=icon]:hidden">
            typenx
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <SidebarMenuItem key={to}>
                <SidebarNavLink to={to} label={label} icon={Icon} />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}

function SidebarNavLink({
  to,
  label,
  icon: Icon,
}: {
  to: '/anime' | '/addons' | '/settings'
  label: string
  icon: React.ComponentType
}) {
  return (
    <Link to={to}>
      {({ isActive }) => (
        <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
          <span>
            <Icon />
            <span>{label}</span>
          </span>
        </SidebarMenuButton>
      )}
    </Link>
  )
}

function HeaderSearch() {
  const navigate = useNavigate()
  const animeMatch = useMatch({ from: '/_authed/anime', shouldThrow: false })
  const showMatch = useMatch({ from: '/_authed/show/$id', shouldThrow: false })
  const initialQuery = animeMatch?.search.q ?? ''
  const [value, setValue] = React.useState(initialQuery)
  const debounceRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    setValue(initialQuery)
  }, [initialQuery])

  React.useEffect(
    () => () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
    },
    [],
  )

  if (!animeMatch && !showMatch) return <div className="ml-auto" />

  return (
    <InputGroup className="ml-auto h-9 w-full max-w-md">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        placeholder="Search anime..."
        aria-label="Search anime"
        value={value}
        onChange={(event) => {
          const next = event.target.value
          setValue(next)
          if (debounceRef.current !== null)
            window.clearTimeout(debounceRef.current)
          debounceRef.current = window.setTimeout(() => {
            void navigate({
              to: '/anime',
              search: next.trim() ? { q: next } : {},
              replace: true,
            })
          }, 200)
        }}
      />
    </InputGroup>
  )
}

function UserMenu() {
  const { user, isGuest } = Route.useRouteContext()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    void navigate({ to: '/', replace: true })
  }

  const handleExitGuest = () => {
    setGuestMode(false)
    void navigate({ to: '/', replace: true })
  }

  const username = isGuest ? 'Guest' : user?.display_name ?? 'Typenx user'
  const initial = username.charAt(0).toUpperCase()
  const subtitle = isGuest ? 'Local only' : 'Signed in'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-7 rounded-md">
                {user?.avatar_url ? (
                  <AvatarImage
                    src={user.avatar_url}
                    alt={username}
                    className="rounded-md"
                  />
                ) : null}
                <AvatarFallback className="rounded-md text-xs">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{username}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {subtitle}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="end"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-44"
          >
            <DropdownMenuItem disabled className="opacity-100">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isGuest ? 'No account linked' : 'Local session'}
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isGuest ? (
              <DropdownMenuItem onClick={handleExitGuest}>
                <LogOut /> Sign in
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => void handleSignOut()}
                variant="destructive"
              >
                <LogOut /> Log out
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
