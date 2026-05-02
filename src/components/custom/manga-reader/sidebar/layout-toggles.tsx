import {
  ArrowLeft,
  ArrowRight,
  FileText,
  PanelTopClose,
  PanelTopOpen,
  Settings,
} from 'lucide-react'

import { CycleButton } from './cycle-button'
import {
  pageDisplayIcon,
  pageDisplayLabel,
  progressIcon,
  progressLabel,
} from './labels'
import { cycle } from './utils'
import type {
  HeaderVisibility,
  PageDisplayStyle,
  ProgressBarStyle,
  ReaderSettingsHandle,
  ReadingDirection,
} from '../settings'
import type { SettingsShortcut } from './types'

export function LayoutToggles({
  handle,
  onOpenSettings,
}: {
  handle: ReaderSettingsHandle
  onOpenSettings: (tab?: SettingsShortcut) => void
}) {
  const { settings } = handle
  const fitBoth =
    settings.imageFit.containWidth && settings.imageFit.containHeight
  return (
    <div className="flex flex-col gap-1.5">
      <CycleButton
        label={pageDisplayLabel(settings.pageDisplay)}
        icon={pageDisplayIcon(settings.pageDisplay)}
        onClick={() =>
          handle.update({
            pageDisplay: cycle<PageDisplayStyle>(settings.pageDisplay, [
              'single',
              'double',
              'long-strip',
              'wide-strip',
            ]),
          })
        }
        onSettings={() => onOpenSettings('page-layout')}
      />
      <CycleButton
        label="Fit Both"
        icon={<FileText className="size-4 rotate-90" />}
        onClick={() =>
          handle.patchImageFit({
            containWidth: !fitBoth,
            containHeight: !fitBoth,
          })
        }
        onSettings={() => onOpenSettings('image-fit')}
      />
      <CycleButton
        label={
          settings.readingDirection === 'ltr' ? 'Left To Right' : 'Right To Left'
        }
        icon={
          settings.readingDirection === 'ltr' ? (
            <ArrowRight className="size-4" />
          ) : (
            <ArrowLeft className="size-4" />
          )
        }
        onClick={() =>
          handle.update({
            readingDirection: cycle<ReadingDirection>(
              settings.readingDirection,
              ['ltr', 'rtl'],
            ),
          })
        }
      />
      <CycleButton
        label={
          settings.headerVisibility === 'hidden'
            ? 'Header Hidden'
            : 'Header Shown'
        }
        icon={
          settings.headerVisibility === 'hidden' ? (
            <PanelTopClose className="size-4" />
          ) : (
            <PanelTopOpen className="size-4" />
          )
        }
        onClick={() =>
          handle.update({
            headerVisibility: cycle<HeaderVisibility>(
              settings.headerVisibility,
              ['shown', 'hidden'],
            ),
          })
        }
      />
      <CycleButton
        label={progressLabel(settings.progressStyle)}
        icon={progressIcon(settings.progressStyle)}
        onClick={() =>
          handle.update({
            progressStyle: cycle<ProgressBarStyle>(settings.progressStyle, [
              'hidden',
              'lightbar',
              'normal',
            ]),
          })
        }
        onSettings={() => onOpenSettings('page-layout')}
      />
      <CycleButton
        label="Reader Settings"
        icon={<Settings className="size-4" />}
        onClick={() => onOpenSettings('page-layout')}
      />
    </div>
  )
}
