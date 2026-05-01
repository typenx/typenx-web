import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTheme } from 'next-themes'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import { typenx } from '#/sdk'
import type { AddonRegistration, AuthProvider, ProviderAccount } from '#/sdk'

export const Route = createFileRoute('/_authed/settings')({
  component: SettingsPage,
})

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const

function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [addons, setAddons] = React.useState<AddonRegistration[]>([])
  const [addonsError, setAddonsError] = React.useState<string | null>(null)
  const [providers, setProviders] = React.useState<ProviderAccount[]>([])
  const [providersError, setProvidersError] = React.useState<string | null>(
    null,
  )

  const loadAddons = React.useCallback(async () => {
    try {
      const next = await typenx.addons.list()
      setAddons(next)
      setAddonsError(null)
    } catch (err) {
      setAddonsError(
        err instanceof Error ? err.message : 'Unable to load addons',
      )
    }
  }, [])

  React.useEffect(() => {
    void loadAddons()
  }, [loadAddons])

  const loadProviders = React.useCallback(async () => {
    try {
      const next = await typenx.me.providers()
      setProviders(next)
      setProvidersError(null)
    } catch (err) {
      setProvidersError(
        err instanceof Error ? err.message : 'Unable to load linked accounts',
      )
    }
  }, [])

  React.useEffect(() => {
    void loadProviders()
  }, [loadProviders])

  const handleConnectProvider = (provider: AuthProvider) => {
    void typenx.auth.redirectToLink(provider)
  }

  const handleDeleteAddon = (addon: AddonRegistration) => {
    if (!addon.deletable) return
    void typenx.addons.delete(addon.id).then(loadAddons)
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Settings
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Preferences</h1>
        <p className="text-sm text-muted-foreground">
          Adjust how typenx looks and feels.
        </p>
      </div>

      <Separator className="my-8" />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-medium">Appearance</h2>
          <p className="text-xs text-muted-foreground">
            Choose a theme for your interface.
          </p>
        </div>
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <Button
              key={t.value}
              variant={theme === t.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-medium">Tracking Accounts</h2>
          <p className="text-xs text-muted-foreground">
            Connect AniList and MyAnimeList to this local account.
          </p>
        </div>

        {providersError && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {providersError}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {TRACKING_PROVIDERS.map((provider) => (
            <ProviderItem
              key={provider.id}
              provider={provider}
              account={providers.find(
                (account) => account.provider === provider.id,
              )}
              onConnect={() => handleConnectProvider(provider.id)}
            />
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-medium">Addons</h2>
          <p className="text-xs text-muted-foreground">
            Built-in addons are configured by the server and stay available.
          </p>
        </div>

        {addonsError && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {addonsError}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {addons.map((addon) => (
            <AddonItem
              key={addon.id}
              addon={addon}
              onDelete={() => handleDeleteAddon(addon)}
            />
          ))}
          {addons.length === 0 && !addonsError && (
            <p className="text-sm text-muted-foreground">
              No addons are currently configured.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

const TRACKING_PROVIDERS: {
  id: AuthProvider
  name: string
  description: string
}[] = [
  {
    id: 'anilist',
    name: 'AniList',
    description: 'Sync your AniList anime account.',
  },
  {
    id: 'my_anime_list',
    name: 'MyAnimeList',
    description: 'Sync your MAL anime account.',
  },
]

function ProviderItem({
  provider,
  account,
  onConnect,
}: {
  provider: (typeof TRACKING_PROVIDERS)[number]
  account?: ProviderAccount
  onConnect: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium">{provider.name}</h3>
          {account ? <Badge variant="secondary">Connected</Badge> : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {account
            ? `Linked as ${account.provider_username}`
            : provider.description}
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant={account ? 'outline' : 'default'}
        disabled={!!account}
        onClick={onConnect}
      >
        {account ? 'Connected' : 'Connect'}
      </Button>
    </div>
  )
}

function AddonItem({
  addon,
  onDelete,
}: {
  addon: AddonRegistration
  onDelete: () => void
}) {
  const manifest = addon.manifest
  const name = manifest?.name ?? addon.base_url
  const description = manifest?.description ?? 'No description provided.'

  return (
    <div className="flex items-center gap-3 rounded-md border p-3">
      <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-muted">
        {manifest?.icon ? (
          <img
            src={manifest.icon}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-sm font-medium">{name.charAt(0)}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium">{name}</h3>
          {addon.source === 'built_in' && (
            <Badge variant="secondary">Built-in</Badge>
          )}
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {description}
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!addon.deletable}
        onClick={onDelete}
      >
        Delete
      </Button>
    </div>
  )
}
