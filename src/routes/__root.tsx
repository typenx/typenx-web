import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { ThemeProvider } from '#/components/theme-provider'
import appCss from '../styles.css?url'

const noFlashScript = `(function(){try{var s=localStorage.getItem('typenx-theme')||'system';var d=s==='dark'||(s==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'typenx' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
    scripts: [{ children: noFlashScript }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
