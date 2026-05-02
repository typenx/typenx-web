import * as React from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { BehaviorsPanel } from './behaviors-panel'
import { ImageFitPanel } from './image-fit-panel'
import { KeybindsPanel } from './keybinds-panel'
import { PageLayoutPanel } from './page-layout-panel'
import type { ReaderSettingsHandle } from '../settings'

export type SettingsTab = 'page-layout' | 'image-fit' | 'keybinds' | 'behaviors'

export function ReaderSettingsDialog({
  open,
  onOpenChange,
  defaultTab = 'page-layout',
  handle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: SettingsTab
  handle: ReaderSettingsHandle
}) {
  const [tab, setTab] = React.useState<SettingsTab>(defaultTab)

  React.useEffect(() => {
    if (open) setTab(defaultTab)
  }, [open, defaultTab])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0 sm:max-w-3xl">
        <DialogHeader className="px-5 py-4">
          <DialogTitle>Reader Settings</DialogTitle>
        </DialogHeader>
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as SettingsTab)}
          orientation="vertical"
          className="flex flex-row gap-0 border-t border-border/60"
        >
          <TabsList
            variant="line"
            className="w-44 shrink-0 flex-col items-stretch gap-0 rounded-none border-r border-border/60 bg-transparent p-2"
          >
            <TabsTrigger value="page-layout" className="justify-start px-3">
              Page Layout
            </TabsTrigger>
            <TabsTrigger value="image-fit" className="justify-start px-3">
              Image fit
            </TabsTrigger>
            <TabsTrigger value="keybinds" className="justify-start px-3">
              Keybinds
            </TabsTrigger>
            <TabsTrigger value="behaviors" className="justify-start px-3">
              Behaviors
            </TabsTrigger>
          </TabsList>
          <div className="max-h-[70vh] flex-1 overflow-y-auto">
            <TabsContent value="page-layout" className="p-5">
              <PageLayoutPanel handle={handle} />
            </TabsContent>
            <TabsContent value="image-fit" className="p-5">
              <ImageFitPanel handle={handle} />
            </TabsContent>
            <TabsContent value="keybinds" className="p-5">
              <KeybindsPanel handle={handle} />
            </TabsContent>
            <TabsContent value="behaviors" className="p-5">
              <BehaviorsPanel handle={handle} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
