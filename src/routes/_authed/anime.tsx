import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

import { useAuth } from '#/components/auth-provider'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_authed/anime')({ component: AnimePage })

type Show = {
  id: string
  title: string
  episodes: number
}

type Section = {
  id: string
  title: string
  caption: string
  shows: Show[]
}

const SECTIONS: Section[] = [
  {
    id: 'watching',
    title: 'Currently Watching',
    caption: 'Pick up where you left off.',
    shows: [
      { id: 'w1', title: 'Crimson Sky', episodes: 24 },
      { id: 'w2', title: 'Silver Tide', episodes: 12 },
      { id: 'w3', title: 'Hollow Crown', episodes: 26 },
      { id: 'w4', title: 'Drift Heart', episodes: 13 },
      { id: 'w5', title: 'Last Petal', episodes: 24 },
      { id: 'w6', title: 'Midnight Bloom', episodes: 12 },
      { id: 'w7', title: 'Bound Echo', episodes: 11 },
      { id: 'w8', title: 'Solar Refrain', episodes: 24 },
      { id: 'w9', title: 'Ember Trail', episodes: 25 },
      { id: 'w10', title: 'Dusk Theory', episodes: 12 },
    ],
  },
  {
    id: 'rated',
    title: 'Top Rated',
    caption: 'What viewers are loving this season.',
    shows: [
      { id: 'r1', title: 'Iron Lotus', episodes: 24 },
      { id: 'r2', title: 'Velvet Hour', episodes: 12 },
      { id: 'r3', title: 'Ghost Engine', episodes: 13 },
      { id: 'r4', title: 'Star Refrain', episodes: 24 },
      { id: 'r5', title: 'Moonbound', episodes: 26 },
      { id: 'r6', title: 'Echoes of Dusk', episodes: 11 },
      { id: 'r7', title: 'Quiet Storm', episodes: 13 },
      { id: 'r8', title: 'Paper Tigers', episodes: 24 },
      { id: 'r9', title: 'Neon Spectre', episodes: 12 },
      { id: 'r10', title: 'Halcyon Days', episodes: 25 },
    ],
  },
  {
    id: 'recommended',
    title: 'Recommended for You',
    caption: 'Based on your watch history.',
    shows: [
      { id: 'rc1', title: 'Hollow Tide', episodes: 24 },
      { id: 'rc2', title: 'Bright Nadir', episodes: 12 },
      { id: 'rc3', title: 'Coral Mirage', episodes: 13 },
      { id: 'rc4', title: 'Shutter Halo', episodes: 26 },
      { id: 'rc5', title: 'Last Light', episodes: 24 },
      { id: 'rc6', title: 'Vagrant Bloom', episodes: 12 },
      { id: 'rc7', title: 'Scarlet Notebook', episodes: 11 },
      { id: 'rc8', title: 'Quiet Continent', episodes: 24 },
      { id: 'rc9', title: 'Floating City', episodes: 13 },
      { id: 'rc10', title: 'Glass Symphony', episodes: 25 },
    ],
  },
  {
    id: 'new',
    title: 'New Releases',
    caption: 'Fresh this season.',
    shows: [
      { id: 'n1', title: 'First Frost', episodes: 12 },
      { id: 'n2', title: 'Sleeping Pulse', episodes: 13 },
      { id: 'n3', title: 'Wandering Sun', episodes: 24 },
      { id: 'n4', title: 'Ash Capital', episodes: 11 },
      { id: 'n5', title: 'Idle Tides', episodes: 12 },
      { id: 'n6', title: 'Open Sky Theory', episodes: 13 },
      { id: 'n7', title: 'The Long Hum', episodes: 24 },
      { id: 'n8', title: 'Salt Garden', episodes: 12 },
      { id: 'n9', title: 'Hidden Coda', episodes: 13 },
      { id: 'n10', title: 'Final Cipher', episodes: 24 },
    ],
  },
]

function AnimePage() {
  const { user } = useAuth()
  const display = user?.display_name ?? 'guest'

  return (
    <div className="px-6 py-8">
      <div className="mb-10 flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Dashboard
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {display}
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse what's airing, top rated, and picks for you.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {SECTIONS.map((section) => (
          <ShowRow key={section.id} section={section} />
        ))}
      </div>
    </div>
  )
}

function ShowRow({ section }: { section: Section }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {section.title}
          </h2>
          <p className="text-xs text-muted-foreground">{section.caption}</p>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          See all
          <ChevronRight />
        </Button>
      </div>

      <div className="-mx-6 overflow-x-auto px-6 pb-3 [scrollbar-width:thin]">
        <div className="flex gap-4">
          {section.shows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ShowCard({ show }: { show: Show }) {
  const src = `https://picsum.photos/seed/typenx-${show.id}/240/360`

  return (
    <button
      type="button"
      className="group flex w-40 shrink-0 flex-col text-left transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
        <img
          src={src}
          alt={show.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <p className="mt-2 truncate text-sm font-medium">{show.title}</p>
      <p className="text-xs text-muted-foreground">EP {show.episodes}</p>
    </button>
  )
}
