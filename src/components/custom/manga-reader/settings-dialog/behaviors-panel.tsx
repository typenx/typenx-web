import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { CheckboxRow, RadioRow, Section, SegmentedGroup } from './atoms'
import type { ReaderSettingsHandle } from '../settings'

export function BehaviorsPanel({ handle }: { handle: ReaderSettingsHandle }) {
  const { settings, patchBehaviors } = handle
  const b = settings.behaviors

  return (
    <div className="flex flex-col gap-6">
      <Section title="Automatically advance chapter on last page">
        <SegmentedGroup
          value={b.autoAdvanceChapter ? 'enabled' : 'disabled'}
          onChange={(value) =>
            patchBehaviors({ autoAdvanceChapter: value === 'enabled' })
          }
          options={[
            { value: 'disabled', label: 'Disabled' },
            { value: 'enabled', label: 'Enabled' },
          ]}
        />
      </Section>
      <Section title="Reader history mode">
        <div className="flex flex-col gap-1.5">
          <RadioRow
            label="Page URL and title won't update"
            checked={b.historyMode === 'page-url-stable'}
            onSelect={() => patchBehaviors({ historyMode: 'page-url-stable' })}
          />
          <RadioRow
            label="Page URL and title both update"
            checked={b.historyMode === 'page-url-updates'}
            onSelect={() =>
              patchBehaviors({ historyMode: 'page-url-updates' })
            }
          />
          <RadioRow
            label="Page URL and title update, and browser buttons work"
            checked={b.historyMode === 'page-url-updates-history'}
            onSelect={() =>
              patchBehaviors({ historyMode: 'page-url-updates-history' })
            }
          />
        </div>
      </Section>
      <Section title="Turn pages by tapping">
        <SegmentedGroup
          value={b.tapTurn}
          onChange={(value) => patchBehaviors({ tapTurn: value })}
          options={[
            { value: 'directional', label: 'Directional' },
            { value: 'always-forward', label: 'Always turn forward' },
            { value: 'never', label: 'Never' },
          ]}
        />
      </Section>
      <Section title="Turn pages by scrolling">
        <SegmentedGroup
          value={b.scrollTurn}
          onChange={(value) => patchBehaviors({ scrollTurn: value })}
          options={[
            { value: 'disabled', label: 'Disabled' },
            { value: 'mouse-wheel', label: 'Mouse wheel' },
            { value: 'keyboard', label: 'Keyboard' },
            { value: 'both', label: 'Both' },
          ]}
        />
      </Section>
      <Section title="Double click to toggle fullscreen">
        <SegmentedGroup
          value={b.doubleClickFullscreen ? 'enabled' : 'disabled'}
          onChange={(value) =>
            patchBehaviors({ doubleClickFullscreen: value === 'enabled' })
          }
          options={[
            { value: 'disabled', label: 'Disabled' },
            { value: 'enabled', label: 'Enabled' },
          ]}
        />
      </Section>
      <Section title="Auto scroll up on image fit:">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <CheckboxRow
              label="Width"
              checked={b.autoScrollLocks.width}
              onChange={(v) =>
                patchBehaviors({
                  autoScrollLocks: { ...b.autoScrollLocks, width: v },
                })
              }
            />
            <CheckboxRow
              label="Height"
              checked={b.autoScrollLocks.height}
              onChange={(v) =>
                patchBehaviors({
                  autoScrollLocks: { ...b.autoScrollLocks, height: v },
                })
              }
            />
            <CheckboxRow
              label="None"
              checked={b.autoScrollLocks.none}
              onChange={(v) =>
                patchBehaviors({
                  autoScrollLocks: { ...b.autoScrollLocks, none: v },
                })
              }
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              patchBehaviors({
                autoScrollLocks: { width: true, height: true, none: true },
              })
            }
          >
            Reset Locks
          </Button>
        </div>
      </Section>
      <Section title="Auto scroll offset">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={String(b.autoScrollOffset)}
            onChange={(e) =>
              patchBehaviors({
                autoScrollOffset: Number(e.currentTarget.value) || 0,
              })
            }
            className="w-32"
          />
          <Button
            size="sm"
            variant="secondary"
            disabled={b.autoScrollOffset === 0}
            onClick={() => patchBehaviors({ autoScrollOffset: 0 })}
          >
            Reset Offset
          </Button>
        </div>
      </Section>
    </div>
  )
}
