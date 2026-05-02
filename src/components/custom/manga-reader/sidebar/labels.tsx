import * as React from 'react'
import {
  BookOpen,
  Eye,
  EyeOff,
  FileText,
  Minus,
  StretchHorizontal,
  StretchVertical,
} from 'lucide-react'

import type { PageDisplayStyle, ProgressBarStyle } from '../settings'

export function pageDisplayLabel(value: PageDisplayStyle): string {
  switch (value) {
    case 'single':
      return 'Single Page'
    case 'double':
      return 'Double Page'
    case 'long-strip':
      return 'Long Strip'
    case 'wide-strip':
      return 'Wide Strip'
  }
}

export function pageDisplayIcon(value: PageDisplayStyle): React.ReactNode {
  switch (value) {
    case 'single':
      return <FileText className="size-4" />
    case 'double':
      return <BookOpen className="size-4" />
    case 'long-strip':
      return <StretchVertical className="size-4" />
    case 'wide-strip':
      return <StretchHorizontal className="size-4" />
  }
}

export function progressLabel(value: ProgressBarStyle): string {
  switch (value) {
    case 'hidden':
      return 'Progress Hidden'
    case 'lightbar':
      return 'Progress Lightbar'
    case 'normal':
      return 'Normal Progress'
  }
}

export function progressIcon(value: ProgressBarStyle): React.ReactNode {
  switch (value) {
    case 'hidden':
      return <EyeOff className="size-4" />
    case 'lightbar':
      return <Minus className="size-4" />
    case 'normal':
      return <Eye className="size-4" />
  }
}
