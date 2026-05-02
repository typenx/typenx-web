import { CheckboxRow, Section } from './atoms'
import type { ReaderSettingsHandle } from '../settings'

export function ImageFitPanel({ handle }: { handle: ReaderSettingsHandle }) {
  const { settings, patchImageFit } = handle
  return (
    <div className="flex flex-col gap-6">
      <Section title="Image Sizing">
        <div className="flex flex-col gap-2">
          <CheckboxRow
            label="Contain to width"
            checked={settings.imageFit.containWidth}
            onChange={(v) => patchImageFit({ containWidth: v })}
          />
          <CheckboxRow
            label="Contain to height"
            checked={settings.imageFit.containHeight}
            onChange={(v) => patchImageFit({ containHeight: v })}
          />
          <CheckboxRow
            label="Stretch small pages"
            checked={settings.imageFit.stretchSmall}
            onChange={(v) => patchImageFit({ stretchSmall: v })}
          />
        </div>
      </Section>
      <hr className="border-border/60" />
      <Section title="Maximum Bounds">
        <div className="flex flex-col gap-2">
          <CheckboxRow
            label="Limit max width"
            checked={settings.imageFit.limitMaxWidth}
            onChange={(v) => patchImageFit({ limitMaxWidth: v })}
          />
          <CheckboxRow
            label="Limit max height"
            checked={settings.imageFit.limitMaxHeight}
            onChange={(v) => patchImageFit({ limitMaxHeight: v })}
          />
        </div>
      </Section>
    </div>
  )
}
