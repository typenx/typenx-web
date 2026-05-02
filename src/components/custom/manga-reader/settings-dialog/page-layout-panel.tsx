import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Crosshair,
  EyeOff,
  FileText,
  MoreHorizontal,
  MousePointer,
  PanelLeftClose,
  PanelTopClose,
  PanelTopOpen,
  Square,
  StretchHorizontal,
  StretchVertical,
} from 'lucide-react'

import { Slider } from '#/components/ui/slider'
import { CheckboxRow, Section, SegmentedGroup } from './atoms'
import type {
  ProgressBarPosition,
  ProgressBarStyle,
  ReaderSettingsHandle,
} from '../settings'

export function PageLayoutPanel({ handle }: { handle: ReaderSettingsHandle }) {
  const { settings, update, patchExtras } = handle
  return (
    <div className="flex flex-col gap-6">
      <Section title="Page Display Style">
        <SegmentedGroup
          value={settings.pageDisplay}
          onChange={(value) => update({ pageDisplay: value })}
          options={[
            { value: 'single', label: 'Single Page', icon: <FileText /> },
            { value: 'double', label: 'Double Page', icon: <BookOpen /> },
            {
              value: 'long-strip',
              label: 'Long Strip',
              icon: <StretchVertical />,
            },
            {
              value: 'wide-strip',
              label: 'Wide Strip',
              icon: <StretchHorizontal />,
            },
          ]}
        />
      </Section>
      <Section title="Reading Direction">
        <SegmentedGroup
          value={settings.readingDirection}
          onChange={(value) => update({ readingDirection: value })}
          options={[
            { value: 'ltr', label: 'Left To Right', icon: <ArrowRight /> },
            { value: 'rtl', label: 'Right To Left', icon: <ArrowLeft /> },
          ]}
        />
      </Section>
      <Section title="Header Visibility">
        <SegmentedGroup
          value={settings.headerVisibility}
          onChange={(value) => update({ headerVisibility: value })}
          options={[
            { value: 'hidden', label: 'Header Hidden', icon: <PanelTopClose /> },
            { value: 'shown', label: 'Header Shown', icon: <PanelTopOpen /> },
          ]}
        />
      </Section>
      <Section title="Progress Bar Style">
        <SegmentedGroup
          value={settings.progressStyle}
          onChange={(value: ProgressBarStyle) => update({ progressStyle: value })}
          options={[
            { value: 'hidden', label: 'Progress Hidden', icon: <EyeOff /> },
            {
              value: 'lightbar',
              label: 'Progress Lightbar',
              icon: <MoreHorizontal />,
            },
            {
              value: 'normal',
              label: 'Normal Progress',
              icon: <PanelLeftClose className="rotate-90" />,
            },
          ]}
        />
      </Section>
      <Section title="Progress Bar Position">
        <SegmentedGroup
          value={settings.progressPosition}
          onChange={(value: ProgressBarPosition) =>
            update({ progressPosition: value })
          }
          options={[
            { value: 'bottom', label: 'Bottom', icon: <ChevronUp /> },
            { value: 'left', label: 'Left', icon: <ChevronRight /> },
            { value: 'right', label: 'Right', icon: <ChevronLeft /> },
          ]}
        />
      </Section>
      <Section title={`Progress Size: ${settings.progressSize} pixels`}>
        <Slider
          value={[settings.progressSize]}
          min={1}
          max={16}
          step={1}
          onValueChange={([v]) => update({ progressSize: v })}
          aria-label="Progress size"
          className="w-64"
        />
      </Section>
      <Section title="Cursor action hints">
        <SegmentedGroup
          value={settings.cursorHints}
          onChange={(value) => update({ cursorHints: value })}
          options={[
            { value: 'none', label: 'None', icon: <Square /> },
            { value: 'overlay', label: 'Overlay', icon: <Crosshair /> },
            { value: 'cursor', label: 'Cursor', icon: <MousePointer /> },
          ]}
        />
      </Section>
      <Section title="Reader extras">
        <div className="flex flex-col gap-2">
          <CheckboxRow
            label="Show menu button when the menu is pinned and the header is hidden"
            checked={settings.extras.showMenuButtonWhenPinned}
            onChange={(v) => patchExtras({ showMenuButtonWhenPinned: v })}
          />
          <CheckboxRow
            label="Show page number when progress bar is hidden"
            checked={settings.extras.showPageNumberWhenHidden}
            onChange={(v) => patchExtras({ showPageNumberWhenHidden: v })}
          />
          <CheckboxRow
            label="Greyscale pages"
            checked={settings.extras.greyscale}
            onChange={(v) => patchExtras({ greyscale: v })}
          />
          <CheckboxRow
            label="Dim pages"
            checked={settings.extras.dimPages}
            onChange={(v) => patchExtras({ dimPages: v })}
          />
        </div>
      </Section>
      <Section title="Reader Background Color">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-4 rounded-full border border-border bg-background"
          />
          <SegmentedGroup
            value={settings.background}
            onChange={(value) => update({ background: value })}
            options={[
              { value: 'theme', label: 'Use Theme' },
              { value: 'white', label: 'White' },
              { value: 'black', label: 'Black' },
            ]}
          />
        </div>
      </Section>
    </div>
  )
}
