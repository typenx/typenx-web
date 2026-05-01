import * as React from 'react'
import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
  useNavigate,
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
  beforeLoad: async ({ location }) => {
    if (typeof window === 'undefined') return

    try {
      return await typenx.me.current()
    } catch {
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
  const { isAuthenticated, isReady } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (isReady && !isAuthenticated) {
      navigate({ to: '/', replace: true })
    }
  }, [isReady, isAuthenticated, navigate])

  if (!isReady || !isAuthenticated) {
    return null
  }

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
  const { pathname } = useLocation()

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
                <SidebarMenuButton
                  asChild
                  isActive={pathname === to}
                  tooltip={label}
                >
                  <Link to={to}>
                    <Icon />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
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

function HeaderSearch() {
  const navigate = useNavigate()
  const [value, setValue] = React.useState('')

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
          void navigate({
            to: '/anime',
            search: next.trim() ? { q: next } : {},
            replace: true,
          })
        }}
      />
    </InputGroup>
  )
}

function UserMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    void signOut()
    navigate({ to: '/', replace: true })
  }

  const username = user?.display_name ?? 'Typenx user'
  const initial = username.charAt(0).toUpperCase()

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
                  Signed in
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
                  Local session
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} variant="destructive">
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
