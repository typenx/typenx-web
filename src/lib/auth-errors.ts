const MESSAGES: Record<string, string> = {
  provider_already_linked:
    'That AniList or MyAnimeList account is already connected to another Typenx user.',
}

export function friendlyAuthError(
  code: string | undefined | null,
): string | undefined {
  if (!code) return undefined
  return MESSAGES[code] ?? `Something went wrong (${code}). Please try again.`
}
